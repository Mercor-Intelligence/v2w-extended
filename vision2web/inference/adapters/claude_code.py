"""Claude Code adapter implementation for Vision2Web"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

from vision2web.inference.adapters.base import BaseAdapter


class ClaudeCodeAdapter(BaseAdapter):
    """Adapter for Claude Code Agent SDK"""

    @property
    def framework_name(self) -> str:
        return "claude_code"

    async def run_task(
        self,
        workspace: Path,
        prompt: str,
        project_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run a task with Claude Code Agent in Docker sandbox.

        Args:
            workspace: Working directory for the agent
            prompt: Task prompt
            project_info: Project metadata

        Returns:
            Result dictionary
        """
        if not self.sandbox_manager:
            raise ValueError("Sandbox manager is required but not provided")

        start_time = datetime.now()
        logs = []
        status = 'failed'
        error_message = None

        try:
            # Ensure container is running
            container_id = self.sandbox_manager.get_container_id(workspace)
            if container_id is None:
                container_id = await self.sandbox_manager.create_container(workspace)
                if container_id is None:
                    raise Exception("Failed to create sandbox container")
                await self.sandbox_manager.start_container(workspace)

            # Prepare environment variables
            env = {
                'ANTHROPIC_BASE_URL': self.base_url,
                'ANTHROPIC_AUTH_TOKEN': self.api_key,
                'IS_SANDBOX': True,
                'CLAUDE_CODE_ATTRIBUTION_HEADER': 0,
                'ANTHROPIC_DEFAULT_HAIKU_MODEL': self.model,
                'ANTHROPIC_DEFAULT_SONNET_MODEL': self.model,
                'ANTHROPIC_DEFAULT_OPUS_MODEL': self.model
            }

            # Create Python code to run the agent
            # Images will be loaded inside the container from /workspace/prototypes/*.jpg
            python_code = f'''import asyncio
import base64
import json
from pathlib import Path
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    # Load prototype images from /workspace/prototypes/*.jpg
    content_parts = []

    prototypes_dir = Path('/workspace/prototypes')
    if prototypes_dir.exists():
        image_paths = sorted(prototypes_dir.glob('*.jpg'))
        print(f"Found {{len(image_paths)}} prototype images", flush=True)

        for image_path in image_paths:
            try:
                with open(image_path, 'rb') as f:
                    image_data = base64.standard_b64encode(f.read()).decode('utf-8')

                content_parts.append({{
                    "type": "image",
                    "source": {{
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_data
                    }}
                }})
                print(f"Loaded image: {{image_path.name}}", flush=True)
            except Exception as e:
                print(f"Failed to load image {{image_path}}: {{e}}", flush=True)

    # Add text prompt
    prompt_text = {json.dumps(prompt)}
    content_parts.append({{
        "type": "text",
        "text": prompt_text
    }})

    # Build message in the format expected by Claude Agent SDK
    messages = [
        {{
            "type": "user",
            "message": {{
                "role": "user",
                "content": content_parts
            }}
        }}
    ]

    # Convert to async generator
    async def async_gen(my_list):
        for item in my_list:
            yield item

    message_stream = async_gen(messages)

    # Run agent
    options = ClaudeAgentOptions(
        permission_mode="bypassPermissions",
        cwd="/workspace",
        disallowed_tools=["EnterPlanMode", "ExitPlanMode", "AskUserQuestion", "Skill", "SlashCommand"],
    )

    def _serialize(msg):
        if hasattr(msg, 'model_dump'):
            return msg.model_dump()
        if hasattr(msg, '__dict__'):
            return msg.__dict__
        return str(msg)

    trajectory = []
    async for msg in query(prompt=message_stream, options=options):
        print(str(msg), flush=True)
        try:
            trajectory.append(_serialize(msg))
        except Exception as e:
            trajectory.append({{"error": str(e), "raw": str(msg)}})

    with open('/workspace/trajectory.json', 'w', encoding='utf-8') as f:
        json.dump(trajectory, f, indent=2, default=str, ensure_ascii=False)

asyncio.run(main())
'''

            # Execute via heredoc (no file creation)
            self.logger.info(f"Running Claude Code Agent for {project_info['name']}...")
            return_code, stdout, stderr = await self.sandbox_manager.exec_command(
                workspace,
                f"python3 << 'EOF'\n{python_code}EOF",
                env=env
            )

            # Collect logs
            logs.extend(stdout.splitlines())
            if stderr:
                logs.extend(stderr.splitlines())

            if return_code == 0:
                # Check if start.sh was created successfully
                check_code, check_stdout, check_stderr = await self.sandbox_manager.exec_command(
                    workspace,
                    "test -f /workspace/start.sh && echo 'EXISTS' || echo 'NOT_FOUND'"
                )

                if 'EXISTS' in check_stdout:
                    status = 'success'
                    self.logger.info(f"Task completed successfully for {project_info['name']}")
                else:
                    status = 'failed'
                    error_message = "Agent completed but start.sh was not generated"
                    self.logger.error(error_message)
            else:
                error_message = f"Agent exited with code {return_code}"
                self.logger.error(error_message)

        except Exception as e:
            error_message = f"Error running Claude Code Agent: {e}"
            self.logger.error(error_message, exc_info=True)
            logs.append(error_message)

            import traceback
            logs.append(traceback.format_exc())

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        return {
            'status': status,
            'logs': logs,
            'error': error_message,
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration': duration,
            'project_info': project_info,
            'framework': self.framework_name,
            'model': self.model,
            'sandbox': True
        }
