import os
import json
import time
import base64
import logging
import re
import platform
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
from playwright.async_api import async_playwright, Browser, Page, Playwright
from PIL import Image
import io
from openai import OpenAI

from vision2web.evaluation.prompts import GUI_PROMPT, PROTOTYPE_PROMPT

def _detect_image_mime(base64_str: str) -> str:
    """Detect image MIME type from base64 data magic bytes."""
    try:
        header = base64.b64decode(base64_str[:16])
        if header[:2] == b'\xff\xd8':
            return 'image/jpeg'
        if header[:8] == b'\x89PNG\r\n\x1a\n':
            return 'image/png'
        if header[:4] == b'GIF8':
            return 'image/gif'
        if header[:4] == b'RIFF' and header[8:12] == b'WEBP':
            return 'image/webp'
    except Exception:
        pass
    return 'image/png'


def resize_base64_image(base64_str: str, scale: float = 0.5) -> str:
    """Resize a base64 encoded image

    Args:
        base64_str: Base64 encoded image string
        scale: Scale factor (e.g., 0.5 for half size)

    Returns:
        Resized base64 encoded image string
    """
    try:
        # Decode base64 to bytes
        img_bytes = base64.b64decode(base64_str)

        # Open image with PIL
        img = Image.open(io.BytesIO(img_bytes))

        # Calculate new size
        new_width = int(img.width * scale)
        new_height = int(img.height * scale)

        # Resize image
        resized_img = img.resize((new_width, new_height), Image.LANCZOS)

        # Convert back to base64
        buffered = io.BytesIO()
        resized_img.save(buffered, format=img.format or 'PNG')
        resized_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return resized_b64
    except Exception as e:
        # If resize fails, return original
        logging.warning(f"Failed to resize image: {e}")
        return base64_str

def extract_information(text):
    patterns = {
        "click": r"Click \[?(\d+)\]?",
        "type": r"Type \[?(\d+)\]?[; ]+\[?(.[^\]]*)\]?",
        # "delete_and_type": r"Delete_and_Type \[?(\d+)\]?[; ]+\[?(.[^\]]*)\]?",
        "scroll": r"Scroll \[?(\d+|WINDOW)\]?[; ]+\[?(up|down)\]?",
        "wait": r"^Wait",
        "goback": r"^GoBack",
        "refresh": r"^Refresh",
        "google": r"^Google",
        "answer": r"ANSWER[; ]+\[?(.[^\]]*)\]?"
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            if key in ["click", "wait", "goback", "refresh", "google"]:
                # no content
                return key, match.groups()
            else:
                return key, {"number": match.group(1), "content": match.group(2)} if key in ["type", "scroll"] else {"content": match.group(1)}
    return None, None

async def get_web_element_rect(page: Page):
    """Playwright version of get_web_element_rect

    Args:
        page: Playwright Page object

    Returns:
        Tuple of (labels_count, element_data_list, formatted_element_text)
    """

    # Create custom dropdowns for all select elements
    select_customization_script = r"""
        (() => {
            // Create custom dropdowns for all select elements
            function customizeSelects() {
                var selects = document.querySelectorAll('select:not([data-customized])');

                for (var i = 0; i < selects.length; i++) {
                    (function (originalSelect, index) {
                        // Mark as customized
                        if (originalSelect.hasAttribute('data-customized')) {
                            return;
                        }
                        originalSelect.setAttribute('data-customized', 'true');
                        originalSelect.setAttribute('data-custom-id', 'custom-select-' + index);

                        var originalStyle = window.getComputedStyle(originalSelect);
                        // Save original select dimensions and style information
                        var originalWidth = originalSelect.offsetWidth;
                        var originalHeight = originalSelect.offsetHeight;
                        var originalPaddingLeft = originalStyle.paddingLeft;
                        var originalPaddingRight = originalStyle.paddingRight;
                        var originalFontSize = originalStyle.fontSize;
                        var originalFontFamily = originalStyle.fontFamily;
                        var originalFontWeight = originalStyle.fontWeight;
                        var originalColor = originalStyle.color;
                        var originalBorder = originalStyle.border;
                        var originalBorderRadius = originalStyle.borderRadius;
                        var originalBackgroundColor = originalStyle.backgroundColor;
                        // Create custom dropdown - add directly to end of body to avoid being clipped by container's overflow property
                        var dropdown = document.createElement('div');
                        dropdown.className = 'custom-select-dropdown';
                        dropdown.setAttribute('data-for-select', 'custom-select-' + index);
                        dropdown.style.display = 'none';
                        dropdown.style.position = 'absolute'; // Use absolute positioning
                        dropdown.style.width = originalSelect.offsetWidth + 'px';
                        dropdown.style.overflowY = 'auto';
                        dropdown.style.backgroundColor = '#fff';
                        dropdown.style.border = '1px solid #ddd';
                        dropdown.style.borderRadius = '4px';
                        dropdown.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                        dropdown.style.zIndex = '9999'; // Use high z-index to ensure it's on top layer
                        document.body.appendChild(dropdown); // Add to body

                        // Record association between select and dropdown
                        originalSelect._customDropdown = dropdown;
                        dropdown._originalSelect = originalSelect;

                        // Populate custom dropdown options
                        populateDropdown(originalSelect, dropdown);

                        // Intercept native dropdown behavior
                        originalSelect.addEventListener('mousedown', function (e) {
                            e.preventDefault(); // Prevent native dropdown
                            e.stopPropagation();
                        });

                        // Use click event to show dropdown
                        originalSelect.addEventListener('click', function (e) {
                            e.stopPropagation();
                            var dropdown = this._customDropdown;

                            // If dropdown is already shown, hide it
                            if (dropdown.style.display === 'block') {
                                dropdown.style.display = 'none';
                                return;
                            }

                            // Close all other dropdowns
                            closeAllDropdowns();

                            // Update dropdown options
                            populateDropdown(this, dropdown);

                            // Calculate and set dropdown position
                            positionDropdown(this, dropdown);

                            // Show current dropdown
                            dropdown.style.display = 'block';
                        });

                        // When select value changes
                        originalSelect.addEventListener('change', function () {
                            // If dropdown is visible, update selected state
                            var dropdown = this._customDropdown;
                            if (dropdown.style.display === 'block') {
                                updateSelectedOption(this, dropdown);
                            }
                        });

                        // Reposition all visible dropdowns when window size changes
                        window.addEventListener('resize', function () {
                            var visibleDropdowns = document.querySelectorAll('.custom-select-dropdown[style*="display: block"]');
                            for (var j = 0; j < visibleDropdowns.length; j++) {
                                var select = visibleDropdowns[j]._originalSelect;
                                positionDropdown(select, visibleDropdowns[j]);
                            }
                        });

                        // Reposition all visible dropdowns when page scrolls
                        document.addEventListener('scroll', function () {
                            var visibleDropdowns = document.querySelectorAll('.custom-select-dropdown[style*="display: block"]');
                            for (var j = 0; j < visibleDropdowns.length; j++) {
                                var select = visibleDropdowns[j]._originalSelect;
                                positionDropdown(select, visibleDropdowns[j]);
                            }
                        }, true); // Use capture phase to capture all scroll events

                    })(selects[i], i);
                }

                // Hide all dropdowns when clicking other areas of page
                document.addEventListener('click', closeAllDropdowns);
            }

            // Position dropdown ensuring it won't be clipped by screen edges
            function positionDropdown(select, dropdown) {
                var rect = select.getBoundingClientRect();
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                // Calculate dropdown position
                var top = rect.bottom + scrollTop;
                var left = rect.left + scrollLeft;
                // Check if there's enough space to expand downward
                var spaceBelow = window.innerHeight - rect.bottom;

                // Check if there's enough horizontal space
                var dropdownWidth = dropdown.offsetWidth;
                var rightEdge = left + dropdownWidth;
                var viewportWidth = window.innerWidth + scrollLeft;

                // If it would exceed right boundary, adjust left
                if (rightEdge > viewportWidth) {
                    left = Math.max(scrollLeft, viewportWidth - dropdownWidth);
                }

                // Set dropdown position
                dropdown.style.top = top + 'px';
                dropdown.style.left = left + 'px';
            }

            // Close all dropdowns
            function closeAllDropdowns() {
                var dropdowns = document.querySelectorAll('.custom-select-dropdown');
                for (var i = 0; i < dropdowns.length; i++) {
                    dropdowns[i].style.display = 'none';
                }
            }

            // Populate dropdown
            function populateDropdown(select, dropdown) {
                // Clear dropdown
                dropdown.innerHTML = '';

                // Get computed style of original select element
                var selectStyle = window.getComputedStyle(select);

                // Apply font-related styles to dropdown itself
                dropdown.style.fontSize = selectStyle.fontSize;
                dropdown.style.fontFamily = selectStyle.fontFamily;
                dropdown.style.fontWeight = selectStyle.fontWeight;
                dropdown.style.lineHeight = selectStyle.lineHeight;
                dropdown.style.color = selectStyle.color;

                // Repopulate options
                for (var j = 0; j < select.options.length; j++) {
                    (function (optionIndex) {
                        var option = document.createElement('div');
                        option.className = 'custom-select-option';
                        option.textContent = select.options[optionIndex].text;
                        option.dataset.value = select.options[optionIndex].value;
                        option.style.padding = '0px 2px';
                        option.style.cursor = 'pointer';

                        // Apply same font styles as original select
                        option.style.fontSize = selectStyle.fontSize;
                        option.style.fontFamily = selectStyle.fontFamily;
                        option.style.fontWeight = selectStyle.fontWeight;
                        option.style.lineHeight = selectStyle.lineHeight;

                        // Set hover effect
                        option.onmouseover = function () {
                            this.style.backgroundColor = '#f0f0f0';
                        };

                        option.onmouseout = function () {
                            if (optionIndex !== select.selectedIndex) {
                                this.style.backgroundColor = '#fff';
                            }
                        };

                        // Mark current selected item as active
                        if (optionIndex === select.selectedIndex) {
                            option.style.backgroundColor = '#f0f0f0';
                        }

                        // Set click event
                        option.onclick = function (e) {
                            e.stopPropagation();
                            select.selectedIndex = optionIndex;

                            // Trigger change event of original select
                            var event = new Event('change', {bubbles: true});
                            select.dispatchEvent(event);

                            dropdown.style.display = 'none';
                        };

                        dropdown.appendChild(option);
                    })(j);
                }
            }

            // Update dropdown selected state
            function updateSelectedOption(select, dropdown) {
                var options = dropdown.querySelectorAll('.custom-select-option');
                for (var i = 0; i < options.length; i++) {
                    if (i === select.selectedIndex) {
                        options[i].style.backgroundColor = '#f0f0f0';
                    } else {
                        options[i].style.backgroundColor = '#fff';
                    }
                }
            }

            // Cleanup function - used to clean up corresponding dropdown when element is removed from DOM
            function cleanupDropdowns() {
                var allDropdowns = document.querySelectorAll('.custom-select-dropdown');
                for (var i = 0; i < allDropdowns.length; i++) {
                    var dropdown = allDropdowns[i];
                    var selectId = dropdown.getAttribute('data-for-select');
                    var select = document.querySelector('select[data-custom-id="' + selectId + '"]');

                    // If corresponding select element is not found, remove dropdown
                    if (!select) {
                        dropdown.remove();
                    }
                }
            }

            // Initialize custom dropdowns
            customizeSelects();

            // Periodically clean up orphaned dropdowns
            setInterval(cleanupDropdowns, 5000);

            // Add MutationObserver for dynamically added select elements
            var observer = new MutationObserver(function (mutations) {
                var needsUpdate = false;

                mutations.forEach(function (mutation) {
                    if (mutation.type === 'childList') {
                        needsUpdate = true;
                    }
                });

                if (needsUpdate) {
                    customizeSelects();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        })()
    """

    # Execute select customization script
    await page.evaluate(select_customization_script)

    js_script = r"""
        (() => {
            let labels = [];

            function markPage() {
                var bodyRect = document.body.getBoundingClientRect();

                var items = Array.prototype.slice.call(
                    document.querySelectorAll('*')
                ).map(function(element) {
                    var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                    var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

                    var rects = [...element.getClientRects()].filter(bb => {
                    var center_x = bb.left + bb.width / 2;
                    var center_y = bb.top + bb.height / 2;
                    var elAtCenter = document.elementFromPoint(center_x, center_y);

                    return elAtCenter === element || element.contains(elAtCenter)
                    }).map(bb => {
                    const rect = {
                        left: Math.max(0, bb.left),
                        top: Math.max(0, bb.top),
                        right: Math.min(vw, bb.right),
                        bottom: Math.min(vh, bb.bottom)
                    };
                    return {
                        ...rect,
                        width: rect.right - rect.left,
                        height: rect.bottom - rect.top
                    }
                    });

                    var area = rects.reduce((acc, rect) => acc + rect.width * rect.height, 0);

                    return {
                    element: element,
                    include:
                        (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT") ||
                        (element.tagName === "BUTTON" || element.tagName === "A" || (element.onclick != null) || window.getComputedStyle(element).cursor == "pointer") ||
                        (element.tagName === "IFRAME" || element.tagName === "VIDEO" || element.tagName === "LI" || element.tagName === "TD" || element.tagName === "OPTION")
                    ,
                    area,
                    rects,
                    text: element.textContent.trim().replace(/\s{2,}/g, ' ')
                    };
                }).filter(item =>
                    item.include && (item.area >= 20)
                );

                // Only keep inner clickable items
                const buttons = Array.from(document.querySelectorAll('button, a, input[type="button"], div[role="button"]'));

                items = items.filter(x => !buttons.some(y => items.some(z => z.element === y) && y.contains(x.element) && !(x.element === y) ));
                items = items.filter(x =>
                    !(x.element.parentNode &&
                    x.element.parentNode.tagName === 'SPAN' &&
                    x.element.parentNode.children.length === 1 &&
                    x.element.parentNode.getAttribute('role') &&
                    items.some(y => y.element === x.element.parentNode)));

                items = items.filter(x => !items.some(y => x.element.contains(y.element) && !(x == y)))

                // Function to generate random colors
                function getRandomColor(index) {
                    var letters = '0123456789ABCDEF';
                    var color = '#';
                    for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                    }
                    return color;
                }

                function getFixedColor(index) {
                    var color = '#000000'
                    return color
                }

                // Lets create a floating border on top of these elements that will always be visible
                items.forEach(function(item, index) {
                    item.rects.forEach((bbox) => {
                    newElement = document.createElement("div");
                    var borderColor = getFixedColor(index);
                    newElement.style.outline = `2px dashed ${borderColor}`;
                    newElement.style.position = "fixed";
                    newElement.style.left = bbox.left + "px";
                    newElement.style.top = bbox.top + "px";
                    newElement.style.width = bbox.width + "px";
                    newElement.style.height = bbox.height + "px";
                    newElement.style.pointerEvents = "none";
                    newElement.style.boxSizing = "border-box";
                    newElement.style.zIndex = 2147483647;

                    // Add floating label at the corner
                    var label = document.createElement("span");
                    label.textContent = index;
                    label.style.position = "absolute";
                    label.style.top = Math.max(-19, -bbox.top) + "px";
                    label.style.left = Math.min(Math.floor(bbox.width / 5), 2) + "px";
                    label.style.background = borderColor;
                    label.style.color = "white";
                    label.style.padding = "2px 4px";
                    label.style.fontSize = "12px";
                    label.style.borderRadius = "2px";
                    newElement.appendChild(label);

                    document.body.appendChild(newElement);
                    labels.push(newElement);
                    });
                })

                // Return element information for interaction
                return [labels.length, items.map((item, index) => ({
                    index: index,
                    tagName: item.element.tagName || '',
                    text: item.text || '',
                    id: item.element.id || '',
                    className: String(item.element.className || ''),
                    type: item.element.type || '',
                    ariaLabel: item.element.getAttribute('aria-label') || '',
                    rect: item.rects[0]
                }))]
            }
            return markPage();
        })()"""

    result = await page.evaluate(js_script)
    labels_count, items_data = result

    # Format element text
    format_ele_text = []
    for item in items_data:
        web_ele_id = item['index']
        label_text = item['text']
        ele_tag_name = item['tagName']
        ele_type = item.get('type', '')
        ele_aria_label = item.get('ariaLabel', '')
        input_attr_types = ['text', 'search', 'password', 'email', 'tel']

        if not label_text:
            if (ele_tag_name.lower() == 'input' and ele_type in input_attr_types) or \
               ele_tag_name.lower() == 'textarea' or \
               (ele_tag_name.lower() == 'button' and ele_type in ['submit', 'button']):
                if ele_aria_label:
                    format_ele_text.append(f"[{web_ele_id}]: <{ele_tag_name}> \"{ele_aria_label}\";")
                else:
                    format_ele_text.append(f"[{web_ele_id}]: <{ele_tag_name}> \"{label_text}\";" )

        elif label_text and len(label_text) < 200:
            if not ("<img" in label_text and "src=" in label_text):
                if ele_tag_name in ["BUTTON", "INPUT", "TEXTAREA"]:
                    if ele_aria_label and (ele_aria_label != label_text):
                        format_ele_text.append(f"[{web_ele_id}]: <{ele_tag_name}> \"{label_text}\", \"{ele_aria_label}\";")
                    else:
                        format_ele_text.append(f"[{web_ele_id}]: <{ele_tag_name}> \"{label_text}\";")
                else:
                    if ele_aria_label and (ele_aria_label != label_text):
                        format_ele_text.append(f"[{web_ele_id}]: \"{label_text}\", \"{ele_aria_label}\";")
                    else:
                        format_ele_text.append(f"[{web_ele_id}]: \"{label_text}\";")

    format_ele_text = '\t'.join(format_ele_text)

    return labels_count, items_data, format_ele_text


class GUIAgentTester:
    """GUI Agent Testing Tool using Playwright

    This tool tests GUI applications by executing test sequences and comparing
    prototypes using vision models.
    """

    def __init__(
        self,
        api_key: str,
        base_url: str,
        gui_agent_model: str,
        vlm_judge_model: str,
        headless: bool = False,
        window_width: int = 1920,
        window_height: int = 1080,
        output_dir: str = "test_results",
        log_dir: Optional[str] = None
    ):
        """Initialize the GUI Agent Tester

        Args:
            api_key: OpenAI API key
            base_url: API base URL
            gui_agent_model: Model name for GUI testing agent
            vlm_judge_model: Model name for visual prototype comparison
            headless: Whether to run browser in headless mode
            window_width: Browser window width
            window_height: Browser window height
            output_dir: Directory to save test results
            log_dir: Directory to save conversation logs
        """
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.gui_agent_model = gui_agent_model
        self.vlm_judge_model = vlm_judge_model
        self.headless = headless
        self.window_width = window_width
        self.window_height = window_height
        self.output_dir = output_dir
        self.log_dir = log_dir

        self._setup_logger()

    def _setup_logger(self):
        """Setup logger for the test session"""
        self.logger = logging.getLogger('GUIAgentTester')
        self.logger.handlers = []

        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
        
        # Setup conversation log file handler if log_dir is provided
        self._setup_file_logger()
    
    def _setup_file_logger(self):
        """Setup file logger if log_dir is set"""
        if self.log_dir:
            Path(self.log_dir).mkdir(parents=True, exist_ok=True)
            log_file = Path(self.log_dir) / 'conversation.log'
            # Remove existing file handler if any
            for handler in self.logger.handlers[:]:
                if isinstance(handler, logging.FileHandler) and handler.baseFilename == str(log_file):
                    self.logger.removeHandler(handler)
            file_handler = logging.FileHandler(log_file, encoding='utf-8')
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

    def _parse_prompt_with_images(
        self,
        prompt: str,
        images: Dict[str, str]
    ) -> List[Dict]:
        """Parse a prompt with image placeholders into message content

        Args:
            prompt: Prompt text with placeholders like <|image_name|>
            images: Dictionary mapping placeholder names to base64 encoded images

        Returns:
            List of content items (text and images)
        """
        content = []
        current_text = ""

        # Find all image placeholders in the prompt using <|...|> format
        import re
        parts = re.split(r'(<\|[^|]+\|>)', prompt)

        for part in parts:
            # Check if this is a placeholder
            match = re.match(r'<\|([^|]+)\|>', part)
            if match:
                placeholder = match.group(1)

                # If we have accumulated text, add it first
                if current_text.strip():
                    content.append({
                        'type': 'text',
                        'text': current_text
                    })
                    current_text = ""

                # Check if this placeholder corresponds to an image
                if placeholder in images:
                    content.append({
                        'type': 'image_url',
                        'image_url': {
                            'url': f"data:{_detect_image_mime(images[placeholder])};base64,{images[placeholder]}"
                        }
                    })
                else:
                    # Not an image placeholder, keep it as text
                    current_text += part
            else:
                # Regular text
                current_text += part

        # Add any remaining text
        if current_text.strip():
            content.append({
                'type': 'text',
                'text': current_text
            })

        return content

    def _save_conversation_log(self, step: int, prompt: str, response: str, images: Dict[str, str] = None):
        """Save conversation log to file
        
        Args:
            step: Step number
            prompt: Prompt text
            response: API response
            images: Dictionary of images (for reference, not saved as base64)
        """
        if not self.log_dir:
            return
            
        log_file = Path(self.log_dir) / 'conversation.log'
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"\n{'='*80}\n")
            f.write(f"Step {step}\n")
            f.write(f"{'='*80}\n\n")
            f.write("PROMPT:\n")
            f.write(prompt)
            f.write("\n\n")
            if images:
                f.write(f"IMAGES: {list(images.keys())}\n\n")
            f.write("RESPONSE:\n")
            f.write(response)
            f.write("\n\n")
    
    def _call_api(
        self,
        prompt: str,
        images: Dict[str, str] = None,
        max_tokens: int = 1000,
        messages_history: List[Dict] = None,
        step: int = 0,
        model: str = None
    ) -> Tuple[str, bool]:
        """Call the API with retry logic

        Args:
            prompt: Prompt text with image placeholders
            images: Dictionary mapping placeholder names to base64 images
            max_tokens: Maximum tokens in response
            messages_history: Previous messages in the conversation
            step: Step number for logging
            model: Model to use (if None, uses gui_agent_model)

        Returns:
            Tuple of (response_content, error_occurred)
        """
        retry_times = 0
        max_retries = 5

        # Use gui_agent_model by default
        if model is None:
            model = self.gui_agent_model

        # Build messages
        messages = messages_history or []

        # Parse prompt and images into content
        if images is None:
            images = {}

        content = self._parse_prompt_with_images(prompt, images)

        # Add current message
        messages.append({
            'role': 'user',
            'content': content
        })

        while retry_times < max_retries:
            try:
                self.logger.info(f'Calling API with model {model}...')
                response = self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=max_tokens
                )

                self.logger.info(
                    f'Tokens - Prompt: {response.usage.prompt_tokens}, '
                    f'Completion: {response.usage.completion_tokens}'
                )

                response_content = response.choices[0].message.content
                
                # Save conversation log
                self._save_conversation_log(step, prompt, response_content, images)
                
                return response_content, False

            except Exception as e:
                self.logger.error(f'API call error: {type(e).__name__} - {str(e)}')
                retry_times += 1
                time.sleep(5)

        return None, True

    def _build_context(self, previous_cases: List[str]) -> str:
        """Build context from previous test case objectives

        Args:
            previous_cases: List of previous test cases
        Returns:
            Formatted context string with numbered list
        """
        if not previous_cases:
            return "None"

        context_items = [
            f"Test Case {i+1}:\nTest Objective: {case['objective']}\nReference Actions: \n{ref_actions_str}"
            for i, case in enumerate(previous_cases)
            for ref_actions_str in ['\n'.join(case['actions'])]
        ]
        return "\n\n".join(context_items)

    async def _capture_screenshot(self, page: Page) -> Dict:
        """Capture screenshot and return as base64

        Args:
            page: Playwright Page object

        Returns:
            Dictionary with base64 encoded images and web elements
        """

        # Capture viewport screenshot with labels
        try:
            labels_count, items_data, web_eles_text = await get_web_element_rect(page)
            viewport_png = await page.screenshot(animations='disabled', timeout=60000)

            # Remove the rects
            await page.evaluate("""
                () => {
                    const labels = document.querySelectorAll('div[style*="z-index: 2147483647"]');
                    labels.forEach(label => label.remove());
                }
            """)

        except Exception as e:
            self.logger.error(f'Error adding labels or capturing viewport screenshot: {e}')
            try:
                viewport_png = await page.screenshot(animations='disabled', timeout=60000)
            except Exception as screenshot_error:
                self.logger.error(f'Failed to capture viewport screenshot: {screenshot_error}')
                # Create a blank 1x1 image as fallback
                blank_img = Image.new('RGB', (self.window_width, self.window_height), color='white')
                buffered = io.BytesIO()
                blank_img.save(buffered, format='PNG')
                viewport_png = buffered.getvalue()
            items_data = []
            web_eles_text = ""

        # Capture full page screenshot as base64
        try:
            fullpage_png = await page.screenshot(full_page=True, animations='disabled', timeout=60000)
        except Exception as e:
            self.logger.error(f'Error capturing fullpage screenshot: {e}')
            # Use viewport screenshot as fallback for fullpage
            fullpage_png = viewport_png

        fullpage_b64 = base64.b64encode(fullpage_png).decode('utf-8')
        # Encode viewport image
        viewport_b64 = base64.b64encode(viewport_png).decode('utf-8')

        return {
            'fullpage_b64': fullpage_b64,
            'viewport_b64': viewport_b64,
            'web_eles': items_data,
            'web_eles_text': web_eles_text
        }

    async def _get_element_at_position(self, page: Page, rect: Dict):
        """Get element at a specific position

        Args:
            page: Playwright Page object
            rect: Rectangle with position information

        Returns:
            Element locator
        """
        center_x = rect['left'] + rect['width'] / 2
        center_y = rect['top'] + rect['height'] / 2

        # Use JavaScript to get element at position
        selector = await page.evaluate(f"""
            () => {{
                const element = document.elementFromPoint({center_x}, {center_y});
                if (!element) return null;

                // Generate a selector for this element
                if (element.id) return '#' + element.id;

                const path = [];
                let current = element;
                while (current.parentElement) {{
                    let selector = current.tagName.toLowerCase();
                    if (current.className) {{
                        selector += '.' + current.className.split(' ')[0];
                    }}
                    path.unshift(selector);
                    current = current.parentElement;
                    if (path.length > 5) break;
                }}
                return path.join(' > ');
            }}
        """)

        return selector

    async def _execute_action(
        self,
        action: str,
        page: Page,
        web_eles: List[Dict],
        info: Dict
    ) -> Tuple[bool, str]:
        """Execute a single action using Playwright

        Args:
            action: Action type (click, type, scroll, etc.)
            page: Playwright Page object
            web_eles: List of web element data
            info: Action information

        Returns:
            Tuple of (success, message)
        """
        try:
            if action == 'click':
                element_number = int(info[0])
                if element_number >= len(web_eles):
                    return False, f"Element {element_number} not found"

                element_data = web_eles[element_number]
                rect = element_data['rect']

                # Click at center of element
                x = rect['left'] + rect['width'] / 2
                y = rect['top'] + rect['height'] / 2

                await page.mouse.click(x, y)
                await asyncio.sleep(3)
                return True, f"Clicked element {element_number}"

            elif action == 'type':
                element_number = int(info['number'])
                content = info['content']

                if element_number >= len(web_eles):
                    return False, f"Element {element_number} not found"

                element_data = web_eles[element_number]
                rect = element_data['rect']

                # Click to focus
                x = rect['left'] + rect['width'] / 2
                y = rect['top'] + rect['height'] / 2
                await page.mouse.click(x, y)
                await asyncio.sleep(0.5)

                # Clear existing content
                if platform.system() == 'Darwin':
                    await page.keyboard.press('Meta+A')
                else:
                    await page.keyboard.press('Control+A')

                await page.keyboard.press('Backspace')
                await asyncio.sleep(0.5)

                # Type new content
                await page.keyboard.type(content, delay=50)
                await asyncio.sleep(2)

                return True, f"Typed '{content}' into element {element_number}"

            elif action == 'scroll':
                scroll_target = info['number']
                direction = info['content']

                if scroll_target == "WINDOW":
                    # Scroll the window
                    scroll_amount = self.window_height * 2 // 3
                    if direction == 'down':
                        await page.evaluate(f"window.scrollBy(0, {scroll_amount})")
                    else:
                        await page.evaluate(f"window.scrollBy(0, {-scroll_amount})")
                else:
                    # Scroll a specific element
                    element_number = int(scroll_target)
                    if element_number >= len(web_eles):
                        return False, f"Element {element_number} not found"

                    element_data = web_eles[element_number]
                    rect = element_data['rect']

                    # Focus on element first
                    x = rect['left'] + rect['width'] / 2
                    y = rect['top'] + rect['height'] / 2
                    await page.mouse.click(x, y)

                    # Scroll using keyboard
                    if direction == 'down':
                        await page.keyboard.press('PageDown')
                    else:
                        await page.keyboard.press('PageUp')

                await asyncio.sleep(3)
                return True, f"Scrolled {direction} on {scroll_target}"

            elif action == 'wait':
                await asyncio.sleep(5)
                return True, "Waited 5 seconds"

            elif action == 'goback':
                await page.go_back()
                await asyncio.sleep(2)
                return True, "Navigated back"

            elif action == 'refresh':
                await page.reload()
                await asyncio.sleep(2)
                return True, "Refreshed page"

            elif action == 'key':
                key_name = info['content']
                if key_name.lower() == 'return':
                    await page.keyboard.press('Enter')
                    await asyncio.sleep(2)
                    return True, "Pressed Return key"
                else:
                    return False, f"Key '{key_name}' not supported"

            elif action == 'answer':
                result = info['content']
                return True, f"Test result: {result}"

            else:
                return False, f"Unknown action: {action}"

        except Exception as e:
            self.logger.error(f'Action execution error: {e}')
            return False, str(e)

    def _build_history(self, process_history: List[Dict]) -> str:
        """Build history string with image placeholders

        Args:
            process_history: List of previous steps with screenshots

        Returns:
            history_text
        """
        history_text = ""

        for i, step_data in enumerate(process_history):
            step_num = step_data['step']
            thought = step_data['thought']
            action = step_data['action']

            history_text += f"\nStep {step_num}:\n"
            history_text += f"Thought: {thought}\n"
            history_text += f"Action: {action}\n"

        return history_text

    async def _execute_test_case(
        self,
        test_case: Dict,
        test_case_idx: int,
        url: str,
        context: str,
        page: Page
    ) -> Dict:
        """Execute a single test case

        Args:
            test_case: Test case definition
            test_case_idx: Test case index
            url: Starting URL
            context: Context from previous test cases
            page: Playwright Page object

        Returns:
            Dictionary with test results
        """
        self.logger.info(f'Executing test case {test_case_idx}')

        objective = test_case.get('objective', '')
        actions_list = test_case.get('actions', [])
        validations = test_case.get('validations', [])

        # Build the prompt
        actions_text = "\n".join([f"{i+1}. {action}"
                                 for i, action in enumerate(actions_list)])
        validations_text = "\n".join([f"{i+1}. {validation}"
                                     for i, validation in enumerate(validations)])

        # Initialize conversation
        messages_history = []
        process_history = []

        # Test process record
        process = []
        step = 0
        max_steps = 30
        final_result = "Blocked"

        # Capture initial state screenshot (before any action)
        try:
            initial_fullpage_b64 = base64.b64encode(await page.screenshot(full_page=True, animations='disabled', timeout=60000)).decode('utf-8')
            initial_viewport_b64 = base64.b64encode(await page.screenshot(animations='disabled', timeout=60000)).decode('utf-8')
        except Exception as screenshot_error:
            self.logger.error(f"Failed to capture initial state screenshot: {screenshot_error}")
            # Create blank image fallback
            blank_img = Image.new('RGB', (self.window_width, self.window_height), color='white')
            buffered = io.BytesIO()
            blank_img.save(buffered, format='PNG')
            blank_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            initial_fullpage_b64 = blank_b64
            initial_viewport_b64 = blank_b64

        initial_step_record = {
            'step': 0,
            'screenshot_fullpage_b64': initial_fullpage_b64,
            'screenshot_viewport_b64': initial_viewport_b64,
            'thought': f'Starting test case: {objective}',
            'action': 'Initial State'
        }
        process.append(initial_step_record)

        while step < max_steps:
            step += 1
            self.logger.info(f'Step {step}')

            # Capture screenshot
            screenshot_data = await self._capture_screenshot(page)

            # Build history with images from previous steps
            history_text = self._build_history(process_history)

            # Build prompt with placeholders (using <|...|> format for images)
            beijing_time = datetime.now()
            time = beijing_time.strftime("%Y-%m-%d, %I:00 %p")
            prompt = GUI_PROMPT.format(
                time=time,
                context=context,
                objective=objective,
                actions=actions_text,
                validations=validations_text if validations else "No specific validations defined. Test passes if actions complete successfully.",
                history=history_text if history_text else "None",
                web_text=screenshot_data['web_eles_text'],
                fullpage_screenshot="<|fullpage_screenshot|>",
                viewport_screenshot="<|viewport_screenshot|>"
            )

            # Prepare images dict for current step
            # Resize fullpage_screenshot to 1/2 to reduce prompt size
            current_images = {
                'fullpage_screenshot': resize_base64_image(screenshot_data['fullpage_b64'], scale=0.5),
                'viewport_screenshot': screenshot_data['viewport_b64'],
            }

            # Call API with GUI agent model
            response, error = self._call_api(
                prompt=prompt,
                images=current_images,
                max_tokens=4096,
                messages_history=messages_history.copy(),
                step=step,
                model=self.gui_agent_model
            )

            if error or not response:
                self.logger.error('API call failed')
                final_result = "Blocked"
                break

            self.logger.info(f'Response: {response}')

            # Update messages history
            # We need to rebuild the message for history tracking
            content = self._parse_prompt_with_images(prompt, current_images)
            messages_history.append({'role': 'user', 'content': content})
            messages_history.append({'role': 'assistant', 'content': response})

            # Parse response
            try:
                assert 'Thought:' in response and 'Action:' in response
            except AssertionError:
                self.logger.error('Invalid response format')
                continue

            # Extract action
            pattern = r'Thought:|Action:'
            parts = re.split(pattern, response)
            thought = parts[1].strip() if len(parts) > 1 else ""
            action_text = parts[2].strip() if len(parts) > 2 else ""

            self.logger.info(f'Thought: {thought}')
            self.logger.info(f'Action: {action_text}')

            # Record process for this step
            step_record = {
                'step': step,
                'screenshot_fullpage_b64': screenshot_data['fullpage_b64'],
                'screenshot_viewport_b64': screenshot_data['viewport_b64'],
                'thought': thought,
                'action': action_text
            }

            process.append(step_record)
            process_history.append(step_record)

            # Parse and execute action
            action_key, info = extract_information(action_text)

            if action_key == 'answer':
                final_result = info['content'].strip()
                self.logger.info(f'Test completed with result: {final_result}')
                break

            if action_key:
                success, msg = await self._execute_action(
                    action_key,
                    page,
                    screenshot_data['web_eles'],
                    info
                )

                if not success:
                    self.logger.error(f'Action failed: {msg}')
            else:
                self.logger.error(f'Could not parse action: {action_text}')

        return {
            'test_case': test_case,
            'process': process,
            'result': final_result
        }

    def _compare_prototype(
        self,
        prototype_screenshot_b64: str,
        actual_screenshot_b64: str
    ) -> List[Dict]:
        """Compare prototype with actual implementation

        Args:
            prototype_screenshot_b64: Base64 encoded prototype screenshot
            actual_screenshot_b64: Base64 encoded actual screenshot

        Returns:
            List of component scores
        """
        self.logger.info('Comparing prototype...')

        # Build prompt with placeholders (using <|...|> format for images)
        prompt = PROTOTYPE_PROMPT.format(
            prototype_page="<|prototype_page|>",
            actual_page="<|actual_page|>"
        )

        # Prepare images dict
        images = {
            'prototype_page': prototype_screenshot_b64,
            'actual_page': actual_screenshot_b64
        }

        # Retry mechanism: up to 3 attempts
        max_retries = 3
        for attempt in range(1, max_retries + 1):
            self.logger.info(f'Prototype comparison attempt {attempt}/{max_retries}')

            # Call API with VLM judge model
            response, error = self._call_api(
                prompt=prompt,
                images=images,
                max_tokens=4096,
                step=0,  # Use 0 for prototype comparison
                model=self.vlm_judge_model
            )

            if error or not response:
                self.logger.error(f'Prototype comparison API call failed on attempt {attempt}')
                if attempt < max_retries:
                    self.logger.info(f'Retrying... ({attempt}/{max_retries})')
                    continue
                else:
                    self.logger.error('All retry attempts exhausted for API call')
                    return []

            self.logger.info(f'Prototype comparison response: {response}')

            # Parse JSON response
            try:
                # Extract JSON from markdown code blocks if present
                json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    # Try to find JSON array directly
                    json_match = re.search(r'\[.*\]', response, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(0)
                    else:
                        json_str = response

                scores = json.loads(json_str)

                # Check if the result is empty
                if not scores:
                    self.logger.warning(f'JSON parsed successfully but result is empty on attempt {attempt}')
                    if attempt < max_retries:
                        self.logger.info(f'Retrying due to empty result... ({attempt}/{max_retries})')
                        continue
                    else:
                        self.logger.error('All retry attempts exhausted, returning empty result')
                        return []

                # Success: valid non-empty result
                self.logger.info(f'Successfully parsed prototype comparison with {len(scores)} components')
                return scores

            except json.JSONDecodeError as e:
                self.logger.error(f'Failed to parse JSON response on attempt {attempt}: {e}')
                self.logger.error(f'Response: {response}')
                if attempt < max_retries:
                    self.logger.info(f'Retrying due to JSON parse error... ({attempt}/{max_retries})')
                    continue
                else:
                    self.logger.error('All retry attempts exhausted for JSON parsing')
                    return []

        # This should never be reached, but just in case
        return []

    def _save_test_result_incremental(
        self,
        output_dir: Path,
        workflow_idx: int,
        test_result: Dict,
        test_case_idx: int,
        prototypes: Dict = None
    ):
        """Save test result incrementally as tests complete.

        Args:
            output_dir: Base output directory (e.g., /workspace)
            workflow_idx: Workflow index
            test_result: Test result for a single test case
            test_case_idx: Test case index
            prototypes: Prototypes dictionary (optional, deprecated - use separate method)
        """
        import json
        import shutil
        import copy

        # Create output directory structure: /workspace/test_results/workflow_N/test_case_M/
        test_results_base = output_dir / 'test_results'
        workflow_dir = test_results_base / f'workflow_{workflow_idx}'
        test_case_dir = workflow_dir / f'test_case_{test_case_idx}'
        test_case_dir.mkdir(parents=True, exist_ok=True)

        # Create a copy of test_result without screenshot base64 data
        test_result_for_json = copy.deepcopy(test_result)
        if 'process' in test_result_for_json:
            for step_data in test_result_for_json['process']:
                # Remove base64 screenshot fields to reduce JSON size
                step_data.pop('screenshot_fullpage_b64', None)
                step_data.pop('screenshot_viewport_b64', None)

        # Save test result JSON (without screenshot base64)
        test_result_file = test_case_dir / 'result.json'
        with open(test_result_file, 'w', encoding='utf-8') as f:
            json.dump(test_result_for_json, f, indent=2, ensure_ascii=False)

        # Save process screenshots
        if 'process' in test_result:
            screenshots_dir = test_case_dir / 'screenshots'
            screenshots_dir.mkdir(exist_ok=True)

            for step_data in test_result['process']:
                step_num = step_data.get('step', 0)
                viewport_b64 = step_data.get('screenshot_viewport_b64', '')

                if viewport_b64:
                    screenshot_file = screenshots_dir / f'step_{step_num:03d}.png'
                    try:
                        if isinstance(viewport_b64, str):
                            try:
                                decoded = base64.b64decode(viewport_b64)
                                with open(screenshot_file, 'wb') as f:
                                    f.write(decoded)
                            except:
                                if Path(viewport_b64).exists():
                                    shutil.copy(viewport_b64, screenshot_file)
                        elif isinstance(viewport_b64, bytes):
                            with open(screenshot_file, 'wb') as f:
                                f.write(viewport_b64)
                    except Exception as e:
                        self.logger.warning(f"Failed to save screenshot for step {step_num}: {e}")

    async def run_test(
        self,
        url: str,
        workflow_item: Dict,
        workflow_idx: int = 0,
        dataset_path: str = None,
        output_dir: Path = None,
        framework: str = None,
        model: str = None,
        project_name: str = None
    ) -> Dict:
        """Run the complete test sequence using Playwright

        Args:
            url: Starting URL for the tests
            workflow_item: Workflow item definition with test cases
            workflow_idx: Workflow index for organizing test results
            dataset_path: Path to dataset containing prototypes
            output_dir: Output directory for saving results incrementally
            framework: Framework name (for saving results, deprecated)
            model: Model name (for saving results, deprecated)
            project_name: Project name (for saving results, deprecated)

        Returns:
            Dictionary with complete test results
        """
        test_cases = workflow_item.get('content', [])
        self.logger.info(f'Starting test sequence on {url}')
        self.logger.info(f'Total test cases: {len(test_cases)}')

        results = []
        prototypes = {}
        actual_pages = []
        
        # Use Playwright async context manager
        async with async_playwright() as playwright:
            # Launch browser
            browser = await playwright.chromium.launch(
                headless=self.headless,
                args=['--force-device-scale-factor=1']
            )

            # Create context and page
            context = await browser.new_context(viewport={'width': self.window_width, 'height': self.window_height})

            page = await context.new_page()

            try:
                # Navigate to URL
                await page.goto(url, wait_until='domcontentloaded')
                await asyncio.sleep(5)
                try:
                    actual_pages.append({
                        "fullpage": await page.screenshot(full_page=True, animations='disabled', timeout=60000),
                        "viewport": await page.screenshot(animations='disabled', timeout=60000)
                    })
                except Exception as screenshot_error:
                    self.logger.error(f"Failed to capture initial screenshot: {screenshot_error}")
                    # Add empty placeholder
                    actual_pages.append({
                        "fullpage": b'',
                        "viewport": b''
                    })
                # Execute test cases
                for idx, test_case_data in enumerate(test_cases):
                    try:
                        # Build context from previous test cases
                        context_str = self._build_context(test_cases[:idx])

                        # Execute test case
                        result = await self._execute_test_case(
                            test_case_data,
                            idx,
                            url,
                            context_str,
                            page
                        )

                        results.append(result)
                        actual_pages.append({
                            "fullpage": await page.screenshot(full_page=True, animations='disabled', timeout=60000),
                            "viewport": await page.screenshot(animations='disabled', timeout=60000)
                        })

                        # Save test result incrementally
                        if output_dir:
                            self._save_test_result_incremental(
                                output_dir=output_dir,
                                workflow_idx=workflow_idx,
                                test_result=result,
                                test_case_idx=idx
                            )
                    except Exception as e:
                        self.logger.error(f"Test case {idx} failed with error: {e}", exc_info=True)
                        # Create a failed result record
                        failed_result = {
                            'test_case': test_case_data,
                            'process': [],
                            'result': 'Failed',
                            'error': str(e)
                        }
                        results.append(failed_result)

                        # Try to capture a screenshot even if the test failed
                        try:
                            actual_pages.append({
                                "fullpage": await page.screenshot(full_page=True, animations='disabled', timeout=60000),
                                "viewport": await page.screenshot(animations='disabled', timeout=60000)
                            })
                        except:
                            # If screenshot also fails, use empty placeholder
                            actual_pages.append({
                                "fullpage": b'',
                                "viewport": b''
                            })

                        # Save failed test result incrementally
                        if output_dir:
                            try:
                                self._save_test_result_incremental(
                                    output_dir=output_dir,
                                    workflow_idx=workflow_idx,
                                    test_result=failed_result,
                                    test_case_idx=idx
                                )
                            except Exception as save_error:
                                self.logger.error(f"Failed to save failed test result: {save_error}")

                        # Continue to next test case
                        self.logger.info(f"Continuing to next test case after failure...")
                        continue

                prototype_info = workflow_item['prototype']

                for proto_name, proto_config in prototype_info.items():
                    try:
                        self.logger.info(f'Processing prototype: {proto_name}')

                        proto_idx = proto_config.get('idx')
                        fullpage = proto_config.get('fullpage', False)
                        prototype_screenshot_path = os.path.join(dataset_path, 'prototypes', f'{proto_name}.jpg')

                        if not os.path.exists(prototype_screenshot_path):
                            self.logger.error(f"Prototype screenshot not found: {prototype_screenshot_path}")
                            continue

                        prototype_screenshot_b64 = base64.b64encode(open(prototype_screenshot_path, 'rb').read()).decode('utf-8')

                        # Check if proto_idx is valid
                        if proto_idx >= len(actual_pages):
                            self.logger.error(f"Invalid prototype index {proto_idx}, only {len(actual_pages)} pages available")
                            continue

                        # Convert actual_page bytes to base64 if needed
                        actual_page_data = actual_pages[proto_idx]['fullpage'] if fullpage else actual_pages[proto_idx]['viewport']
                        if isinstance(actual_page_data, bytes):
                            if len(actual_page_data) == 0:
                                self.logger.warning(f"Empty screenshot data for prototype {proto_name}, skipping")
                                continue
                            actual_page_b64 = base64.b64encode(actual_page_data).decode('utf-8')
                        else:
                            actual_page_b64 = actual_page_data

                        scores = self._compare_prototype(
                            prototype_screenshot_b64=prototype_screenshot_b64,
                            actual_screenshot_b64=actual_page_b64
                        )
                        prototypes[proto_name] = {
                            "scores": scores,
                            "actual_page": actual_page_b64
                        }

                        # Save prototype incrementally
                        if output_dir:
                            # Save prototype immediately to test_results/prototypes/
                            test_results_base = Path(output_dir) / 'test_results'
                            prototypes_dir = test_results_base / 'prototypes'
                            prototypes_dir.mkdir(parents=True, exist_ok=True)

                            # Save prototype scores
                            scores_file = prototypes_dir / f'{proto_name}_scores.json'
                            with open(scores_file, 'w', encoding='utf-8') as f:
                                json.dump(scores, f, indent=2, ensure_ascii=False)

                            # Save actual page screenshot
                            actual_page_file = prototypes_dir / f'{proto_name}_actual.png'
                            try:
                                with open(actual_page_file, 'wb') as f:
                                    f.write(base64.b64decode(actual_page_b64))
                            except Exception as e:
                                self.logger.warning(f"Failed to save actual page screenshot for {proto_name}: {e}")

                    except Exception as e:
                        self.logger.error(f"Failed to process prototype {proto_name}: {e}", exc_info=True)
                        # Continue to next prototype
                        continue

            finally:
                # Clean up
                await context.close()
                await browser.close()

        # Build final output
        output = {
            'url': url,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'results': results,
            'prototypes': prototypes
        }

        self.logger.info('Test completed. Results returned in output dictionary.')

        return output


def main():
    """Main entry point for command-line usage"""
    import argparse

    parser = argparse.ArgumentParser(
        description='GUI Agent Testing Tool with Playwright'
    )
    parser.add_argument(
        '--url',
        type=str,
        required=True,
        help='Starting URL for tests'
    )
    parser.add_argument(
        '--test-sequence',
        type=str,
        required=True,
        help='Path to test sequence JSON file'
    )
    parser.add_argument(
        '--dataset-path',
        type=str,
        default=None,
        help='Path to dataset containing prototypes'
    )
    parser.add_argument(
        '--api-key',
        type=str,
        required=True,
        help='OpenAI API key'
    )
    parser.add_argument(
        '--base-url',
        type=str,
        default='https://api-gateway.glm.ai/v1',
        help='API base URL'
    )
    parser.add_argument(
        '--gui-agent-model',
        type=str,
        default='gpt-4o-2024-11-20',
        help='Model name for GUI testing agent'
    )
    parser.add_argument(
        '--vlm-judge-model',
        type=str,
        default='gpt-4o-2024-11-20',
        help='Model name for visual prototype comparison'
    )
    parser.add_argument(
        '--headless',
        action='store_true',
        help='Run browser in headless mode'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='test_results',
        help='Output directory for results'
    )

    args = parser.parse_args()

    # Load test sequence
    with open(args.test_sequence, 'r', encoding='utf-8') as f:
        test_sequence = json.load(f)

    # Create tester
    tester = GUIAgentTester(
        api_key=args.api_key,
        base_url=args.base_url,
        gui_agent_model=args.gui_agent_model,
        vlm_judge_model=args.vlm_judge_model,
        headless=args.headless,
        output_dir=args.output_dir
    )

    # Run tests (async)
    results = asyncio.run(tester.run_test(
        url=args.url,
        workflow_item=test_sequence,
        workflow_idx=0,
        dataset_path=args.dataset_path
    ))

    print(f"Test completed.")
    print(f"Total test cases: {len(results['results'])}")
    print(f"Prototypes compared: {len(results['prototypes'])}")


if __name__ == '__main__':
    main()
