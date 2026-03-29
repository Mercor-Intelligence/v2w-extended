"""OpenHands adapter implementation"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

from vision2web.inference.adapters.base import BaseAdapter


class OpenHandsAdapter(BaseAdapter):
    """Adapter for OpenHands framework"""

    @property
    def framework_name(self) -> str:
        return "openhands"

    async def run_task(
        self,
        workspace: Path,
        prompt: str,
        project_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run a task with OpenHands in Docker sandbox.

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

            # Create Python code to run the agent
            # Images will be loaded inside the container from /workspace/prototypes/*.jpg
            python_code = f'''import asyncio
import base64
from pathlib import Path
from openhands.sdk import LLM, Agent, Conversation, Tool, Message, TextContent, ImageContent
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.task_tracker import TaskTrackerTool
from openhands.tools.terminal import TerminalTool

async def main():
    llm = LLM(
        model={json.dumps("openai/" + self.model)},
        api_key={json.dumps(self.api_key)},
        base_url={json.dumps(self.base_url)},
    )

    agent = Agent(
        llm=llm,
        tools=[
            Tool(name=TerminalTool.name),
            Tool(name=FileEditorTool.name),
            Tool(name=TaskTrackerTool.name),
        ],
    )

    conversation = Conversation(agent=agent, workspace='/workspace')

    # Load prototype images from /workspace/prototypes/*.jpg
    content_parts = []

    prototypes_dir = Path('/workspace/prototypes')
    if prototypes_dir.exists():
        image_paths = sorted(prototypes_dir.glob('*.jpg'))
        print(f"Found {{len(image_paths)}} prototype images", flush=True)

        for image_path in image_paths:
            try:
                with open(image_path, 'rb') as f:
                    image_base64 = base64.b64encode(f.read()).decode('utf-8')

                # Create ImageContent with base64-encoded data URL
                content_parts.append(
                    ImageContent(image_urls=[f"data:image/jpeg;base64,{{image_base64}}"])
                )
                print(f"Loaded image: {{image_path.name}}", flush=True)
            except Exception as e:
                print(f"Failed to load image {{image_path}}: {{e}}", flush=True)

    # Add text prompt
    content_parts.append(TextContent(text={json.dumps(prompt)}))

    # Create message with images and text
    message = Message(
        role="user",
        content=content_parts
    )

    conversation.send_message(message)
    conversation.run()

asyncio.run(main())
'''

            # Execute via heredoc
            self.logger.info(f"Running OpenHands Agent for {project_info['name']}...")
            return_code, stdout, stderr = await self.sandbox_manager.exec_command(
                workspace,
                f"python3 << 'EOF'\n{python_code}EOF"
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
            error_message = f"Error running OpenHands Agent: {e}"
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
