"""Evaluation engine for GUI testing and prototype comparison in Vision2Web"""

import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from vision2web.core.config import Config
from vision2web.core.logger import get_logger
from vision2web.core.dataset import DatasetManager, Project
from vision2web.core.sandbox import SandboxManager
from vision2web.evaluation.gui_agent_test import GUIAgentTester


class EvaluationEngine:
    """Main evaluation engine for GUI testing"""

    def __init__(self, config: Config):
        """
        Initialize evaluation engine.

        Args:
            config: Configuration instance
        """
        self.config = config
        self.logger = get_logger('vision2web.evaluation')

        # Initialize dataset manager
        self.dataset_manager = DatasetManager(config.datasets_dir)

        # Initialize sandbox manager
        self.sandbox_manager = SandboxManager(
            image_name=config.sandbox.image,
            workspace_dir=config.sandbox.workspace_dir,
            user=config.sandbox.user,
            logger=self.logger
        )

        # Initialize GUI tester
        self.gui_tester = GUIAgentTester(
            api_key=config.evaluation.api_key,
            base_url=config.evaluation.base_url,
            gui_agent_model=config.evaluation.gui_agent_model,
            vlm_judge_model=config.evaluation.vlm_judge_model,
            headless=config.evaluation.headless,
            window_width=config.evaluation.window_width,
            window_height=config.evaluation.window_height,
            output_dir=str(config.results_dir)
        )

    def discover_result_projects(
        self, 
        results_dir: Path,
        task_type: Optional[str] = None,
        framework: Optional[str] = None,
        model: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Discover completed inference results.

        Args:
            results_dir: Results directory to scan
            task_type: Optional task type filter
            framework: Optional framework filter
            model: Optional model filter

        Returns:
            List of project dictionaries

        Directory structure:
            results/
            └── webpage|frontend|website/
                └── framework/
                    └── model/
                        └── project_name/
        """
        projects = []

        # Task types to scan
        task_types = [task_type] if task_type else ['webpage', 'frontend', 'website']

        for task in task_types:
            task_dir = results_dir / task
            if not task_dir.exists() or not task_dir.is_dir():
                continue

            for framework_dir in task_dir.iterdir():
                if not framework_dir.is_dir() or framework_dir.name.startswith('.'):
                    continue
                
                # Filter by framework
                if framework and framework_dir.name != framework:
                    continue

                for model_dir in framework_dir.iterdir():
                    if not model_dir.is_dir() or model_dir.name.startswith('.'):
                        continue
                    
                    # Filter by model
                    if model and model_dir.name != model:
                        continue
                    
                    for project_dir in model_dir.iterdir():
                        if not project_dir.is_dir() or project_dir.name.startswith('.'):
                            continue

                        # Check if evaluation_result.json already exists
                        result_file = project_dir / 'evaluation_result.json'
                        if result_file.exists():
                            self.logger.info(f"Skipping project {project_dir.name}: evaluation_result.json already exists")
                            continue
                        script_file = project_dir / 'start.sh'
                        if not script_file.exists():
                            self.logger.info(f"Skipping project {project_dir.name}: start script not exists")
                            continue

                        # Check if project has necessary files (at least prototypes)
                        if (project_dir / 'prototypes').exists():
                            projects.append({
                                'name': project_dir.name,
                                'task_type': task,
                                'framework': framework_dir.name,
                                'model': model_dir.name,
                                'path': project_dir,
                                'workspace': project_dir
                            })

        self.logger.info(f"Found {len(projects)} inference results")
        return projects

    def _generate_container_name(self, result_project: Dict[str, Any]) -> str:
        """Generate container name based on task, project, framework, and model"""
        task = result_project['task_type']
        project_name = result_project['name']
        framework = result_project['framework']
        model = result_project['model'].replace('/', '_').replace(':', '_')
        return f"{task}_{project_name}_{framework}_{model}"

    async def evaluate_single_project(
        self,
        result_project: Dict[str, Any],
        dataset_project: Project
    ) -> Dict[str, Any]:
        """
        Evaluate a single project.

        Args:
            result_project: Inference result project
            dataset_project: Original dataset project

        Returns:
            Evaluation results
        """
        project_name = result_project['name']
        self.logger.info(f"Evaluating project: {project_name} (task: {result_project['task_type']})")

        start_time = datetime.now()
        result = {
            'project': project_name,
            'task_type': result_project['task_type'],
            'framework': result_project['framework'],
            'model': result_project['model'],
            'start_time': start_time.isoformat(),
        }

        workspace = result_project['workspace']
        container_id = None

        try:
            # Generate container name
            container_name = self._generate_container_name(result_project)
            
            # Create new container for evaluation
            self.logger.info(f"Creating new container: {container_name}")
            container_id = await self.sandbox_manager.create_container(
                workspace,
                container_name=container_name
            )
            if not container_id:
                result['status'] = 'error'
                result['error'] = 'Failed to create container'
                return result

            self.logger.info(f"Created container: {container_id[:12]}")

            # Start container and copy inference results to it
            self.logger.info("Starting container and copying inference results...")
            await self.sandbox_manager.start_container(workspace)

            # Load workflow
            workflow_data = self.dataset_manager.load_workflow(dataset_project)

            # Deploy project and run GUI tests inside container
            await self._run_tests_in_container(
                container_id=container_id,
                workspace=workspace,
                dataset_project=dataset_project,
                workflow_data=workflow_data,
                result_project=result_project
            )
            result['status'] = 'success'

            # Save evaluation result
            self._save_evaluation_result(result)

        except Exception as e:
            self.logger.error(f"Error evaluating {project_name}: {e}", exc_info=True)
            result['status'] = 'error'
            result['error'] = str(e)

        finally:
            # Copy test results from container and stop container
            if container_id:
                try:
                    self.logger.info(f"Copying test results from container for {project_name}...")
                    # Copy only test_results directory from container to host
                    test_results_dir = workspace / 'test_results'
                    await self.sandbox_manager.copy_from_container(
                        workspace=workspace,
                        container_id=container_id,
                        container_path="/workspace/test_results",
                        host_path=test_results_dir
                    )
                    self.logger.info(f"Test results copied successfully.")

                    # Stop and remove container
                    self.logger.info(f"Stopping and removing container for {project_name}...")
                    await self.sandbox_manager.stop_container(workspace)
                    self.logger.info(f"Container stopped and removed.")
                except Exception as e:
                    self.logger.warning(f"Failed to copy test results or stop container: {e}")

        end_time = datetime.now()
        result['end_time'] = end_time.isoformat()
        result['duration'] = (end_time - start_time).total_seconds()

        return result

    async def _wait_for_port(
        self,
        container_id: str,
        port: int = 3000,
        timeout: int = 600,
        interval: float = 5.0
    ) -> bool:
        """
        Wait for a port to become available in the container.

        Args:
            container_id: Container ID
            port: Port to check
            timeout: Maximum wait time in seconds
            interval: Check interval in seconds

        Returns:
            True if port is available, False if timeout
        """
        import time
        start_time = time.time()

        self.logger.info(f"Waiting for port {port} to become available...")

        while time.time() - start_time < timeout:
            try:
                # Check if port is listening by curling and checking for non-empty response
                check_cmd = [
                    "docker", "exec", container_id,
                    "bash", "-c",
                    f"curl -s http://localhost:{port}"
                ]

                proc = await asyncio.create_subprocess_exec(
                    *check_cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )

                stdout, stderr = await proc.communicate()

                if proc.returncode == 0 and stdout and stdout.strip():
                    elapsed = time.time() - start_time
                    self.logger.info(f"Port {port} is available after {elapsed:.1f}s")
                    return True

            except Exception as e:
                self.logger.debug(f"Port check failed: {e}")

            await asyncio.sleep(interval)

        self.logger.error(f"Timeout waiting for port {port} after {timeout}s")
        return False

    async def _run_tests_in_container(
        self,
        container_id: str,
        workspace: Path,
        dataset_project: Project,
        workflow_data: List[Dict],
        result_project: Dict[str, Any]
    ):
        """
        Run GUI tests inside the container.

        Args:
            container_id: Container ID
            workspace: Workspace directory
            dataset_project: Dataset project
            workflow_data: Workflow test data
            result_project: Result project info
        """
        project_name = result_project['name']

        # Deploy project by running start.sh in background
        self.logger.info("Deploying project with start.sh in background...")
        deploy_cmd = [
            "docker", "exec",
            "-d",  # Run in detached mode
            "-w", "/workspace",
            container_id,
            "bash", "start.sh"
        ]

        deploy_proc = await asyncio.create_subprocess_exec(
            *deploy_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        # Wait for the docker exec -d command to complete (this just confirms the background process started)
        await deploy_proc.wait()

        if deploy_proc.returncode != 0:
            self.logger.error(f"Failed to start deployment with return code {deploy_proc.returncode}")
            raise RuntimeError(f"Failed to start deployment in background")

        self.logger.info("Deployment command started in background, waiting for service to be ready...")

        # Wait for the service to be ready by polling port 3000
        port_ready = await self._wait_for_port(container_id, port=3000, timeout=600)

        if not port_ready:
            # Try to get deployment logs for debugging
            logs_cmd = [
                "docker", "logs", "--tail", "50", container_id
            ]
            logs_proc = await asyncio.create_subprocess_exec(
                *logs_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            logs_stdout, logs_stderr = await logs_proc.communicate()
            self.logger.error(f"Container logs:\n{logs_stdout.decode()}")
            self.logger.error(f"Container errors:\n{logs_stderr.decode()}")
            raise RuntimeError("Service failed to start: port 3000 not available")

        self.logger.info("Project deployed successfully and service is ready")

        # Save workflow data as JSON file in workspace
        workflow_json_path = workspace / 'workflow.json'
        with open(workflow_json_path, 'w', encoding='utf-8') as f:
            json.dump(workflow_data, f, indent=2, ensure_ascii=False)
        self.logger.info(f"Saved workflow.json to {workflow_json_path}")

        # Create test script in workspace
        test_script_path = workspace / 'run_gui_test.py'
        test_script_content = self._generate_test_script(project_name=project_name)

        with open(test_script_path, 'w', encoding='utf-8') as f:
            f.write(test_script_content)

        self.logger.info(f"Created test script at {test_script_path}")

        # Copy workflow.json to container
        self.logger.info("Copying workflow.json to container...")
        workflow_copy_cmd = [
            "docker", "cp",
            str(workflow_json_path), f"{container_id}:/workspace/workflow.json"
        ]

        workflow_proc = await asyncio.create_subprocess_exec(
            *workflow_copy_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await workflow_proc.communicate()

        # Copy test script to container
        self.logger.info("Copying test script to container...")
        script_copy_cmd = [
            "docker", "cp",
            str(test_script_path), f"{container_id}:/workspace/run_gui_test.py"
        ]

        script_proc = await asyncio.create_subprocess_exec(
            *script_copy_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await script_proc.communicate()

        # Copy vision2web evaluation module to container
        self.logger.info("Copying evaluation module to container...")
        vision2web_src = Path(__file__).parent.parent  # vision2web package directory
        vision2web_copy_cmd = [
            "docker", "cp",
            str(vision2web_src), f"{container_id}:/tmp/vision2web"
        ]

        vision2web_proc = await asyncio.create_subprocess_exec(
            *vision2web_copy_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await vision2web_proc.communicate()

        # Fix permissions for vision2web directory
        self.logger.info("Fixing permissions for vision2web directory...")
        chmod_cmd = [
            "docker", "exec", "--user", "root", container_id,
            "bash", "-c",
            "chmod -R 755 /tmp/vision2web"
        ]

        chmod_proc = await asyncio.create_subprocess_exec(
            *chmod_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await chmod_proc.communicate()

        # Install required Python dependencies in container
        self.logger.info("Installing required Python dependencies in container...")
        install_deps_cmd = [
            "docker", "exec", container_id,
            "bash", "-c",
            "pip3 install pyyaml openai Pillow"
        ]

        install_proc = await asyncio.create_subprocess_exec(
            *install_deps_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        install_stdout, install_stderr = await install_proc.communicate()

        if install_proc.returncode != 0:
            self.logger.warning(f"Failed to install dependencies: {install_stderr.decode()}")
            # Continue anyway, some dependencies might already be installed
        else:
            self.logger.info("Dependencies installed successfully")
            self.logger.debug(f"Install STDOUT: {install_stdout.decode()}")

        # Run test script in container
        self.logger.info("Running GUI tests in container...")

        # Build test command
        test_cmd = [
            "docker", "exec",
            "-e", f"API_KEY={self.config.evaluation.api_key}",
            "-e", f"BASE_URL={self.config.evaluation.base_url}",
            "-e", f"GUI_AGENT_MODEL={self.config.evaluation.gui_agent_model}",
            "-e", f"VLM_JUDGE_MODEL={self.config.evaluation.vlm_judge_model}",
            container_id,
            "python3", "/workspace/run_gui_test.py"
        ]

        test_proc = await asyncio.create_subprocess_exec(
            *test_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await test_proc.communicate()

        if test_proc.returncode != 0:
            self.logger.error(f"Test script failed with return code {test_proc.returncode}")
            self.logger.error(f"STDERR: {stderr.decode()}")
            raise RuntimeError(f"GUI test failed: {stderr.decode()}")

        self.logger.info("GUI tests completed successfully")
        self.logger.debug(f"STDOUT: {stdout.decode()}")

    def _generate_test_script(
        self,
        project_name: str
    ) -> str:
        """
        Generate Python test script to run inside container.

        Args:
            project_name: Project name

        Returns:
            Python script content
        """
        script = f'''#!/usr/bin/env python3
"""Auto-generated GUI test script"""
import os
import sys
import json
import asyncio
from pathlib import Path

# Add vision2web to Python path
sys.path.insert(0, '/tmp')

# Import test module
from vision2web.evaluation.gui_agent_test import GUIAgentTester

async def main():
    # Get configuration from environment
    api_key = os.environ.get("API_KEY")
    base_url = os.environ.get("BASE_URL")
    gui_agent_model = os.environ.get("GUI_AGENT_MODEL")
    vlm_judge_model = os.environ.get("VLM_JUDGE_MODEL")

    if not all([api_key, base_url, gui_agent_model, vlm_judge_model]):
        print("ERROR: Missing required environment variables", file=sys.stderr)
        sys.exit(1)

    # Load workflow data from file
    workflow_json_path = Path("/workspace/workflow.json")
    if not workflow_json_path.exists():
        print(f"ERROR: workflow.json not found at {{workflow_json_path}}", file=sys.stderr)
        sys.exit(1)

    with open(workflow_json_path, 'r', encoding='utf-8') as f:
        workflow_data = json.load(f)

    print(f"Loaded {{len(workflow_data)}} workflow items from workflow.json")

    # Run tests with DAG-based parallel execution
    test_url = "http://localhost:3000"

    failed_workflows = []
    successful_workflows = []

    # Build done events for each workflow index
    done_events = [asyncio.Event() for _ in workflow_data]

    async def run_workflow(idx, workflow_item):
        # Wait for all dependencies to complete first
        depends_on = workflow_item.get('depends_on', [])
        if depends_on:
            print(f"Workflow {{idx}} waiting for dependencies: {{depends_on}}")
            await asyncio.gather(*[done_events[dep].wait() for dep in depends_on])
            print(f"Workflow {{idx}} dependencies satisfied, starting...")

        try:
            print(f"Running workflow {{idx}}: {{workflow_item.get('summary', 'Unknown')}}")
            resolution = workflow_item.get('resolution', {{}})
            tester = GUIAgentTester(
                api_key=api_key,
                base_url=base_url,
                gui_agent_model=gui_agent_model,
                vlm_judge_model=vlm_judge_model,
                headless=True,
                window_width=resolution.get('width', 1920),
                window_height=resolution.get('height', 1080),
                output_dir="/workspace",
                log_dir="/workspace/logs"
            )

            result = await tester.run_test(
                url=test_url,
                workflow_item=workflow_item,
                workflow_idx=idx,
                dataset_path="/workspace",
                output_dir=Path("/workspace")
            )

            print(f"Workflow {{idx}} completed successfully")
            successful_workflows.append(idx)

        except Exception as e:
            print(f"ERROR in workflow {{idx}}: {{e}}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            failed_workflows.append(idx)
            print(f"Workflow {{idx}} failed, dependents will still be unblocked.")

        finally:
            # Always set the event so dependents are not blocked indefinitely
            done_events[idx].set()

    # Launch all workflow tasks concurrently; dependency ordering is handled inside each task.
    # return_exceptions=True ensures all tasks run to completion so every done_event is set,
    # regardless of whether individual workflows succeed or fail.
    await asyncio.gather(*[
        run_workflow(idx, item) for idx, item in enumerate(workflow_data)
    ], return_exceptions=True)

    # Print summary
    print(f"\\n{'='*60}")
    print(f"Test Summary:")
    print(f"  Total workflows: {{len(workflow_data)}}")
    print(f"  Successful: {{len(successful_workflows)}}")
    print(f"  Failed: {{len(failed_workflows)}}")
    if failed_workflows:
        print(f"  Failed workflow indices: {{failed_workflows}}")
    print(f"{'='*60}\\n")

    if failed_workflows:
        print(f"Some workflows failed, but all workflows were attempted.", file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(main())
'''
        return script

    def _save_evaluation_result(self, result: Dict[str, Any]):
        """Save evaluation result summary"""
        output_path = (
            self.config.results_dir /
            result['task_type'] /
            result['framework'] /
            result['model'] /
            result['project']
        )
        output_path.mkdir(parents=True, exist_ok=True)

        result_file = output_path / 'evaluation_result.json'
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        self.logger.info(f"Saved evaluation result to {result_file}")

    async def evaluate_all_projects(
        self,
        results_dir: Optional[Path] = None,
        task_type: Optional[str] = None,
        framework: Optional[str] = None,
        model: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Evaluate all inference results.

        Args:
            results_dir: Optional results directory (default: from config)
            task_type: Optional task type filter
            framework: Optional framework filter
            model: Optional model filter

        Returns:
            List of evaluation results
        """
        results_dir = results_dir or self.config.results_dir

        # Discover inference results
        result_projects = self.discover_result_projects(
            results_dir,
            task_type=task_type,
            framework=framework,
            model=model
        )

        if not result_projects:
            self.logger.warning("No inference results found")
            return []

        # Check sandbox image
        if not await self.sandbox_manager.check_image():
            self.logger.error("Sandbox image not found")
            return []

        self.logger.info(f"Found {len(result_projects)} projects to evaluate")

        # Create semaphore for concurrency control
        semaphore = asyncio.Semaphore(self.config.evaluation.max_workers)

        async def evaluate_with_semaphore(result_project):
            async with semaphore:
                # Match with dataset project
                dataset_project = self.dataset_manager.get_project(
                    result_project['name'],
                    task_type=result_project['task_type']
                )
                if not dataset_project:
                    self.logger.warning(f"Dataset not found for {result_project['name']}")
                    return None

                return await self.evaluate_single_project(result_project, dataset_project)

        # Create tasks
        tasks = [evaluate_with_semaphore(rp) for rp in result_projects]

        # Run tasks
        start_time = datetime.now()
        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = datetime.now()
        total_duration = (end_time - start_time).total_seconds()

        # Filter results
        valid_results = [r for r in results if isinstance(r, dict) and r is not None]
        successful = sum(1 for r in valid_results if r.get('status') == 'success')
        failed = len(valid_results) - successful

        self.logger.info(
            f"Completed evaluation in {total_duration:.2f}s\n"
            f"  Success: {successful}\n"
            f"  Failed: {failed}\n"
            f"  Total: {len(valid_results)}"
        )
        
        return valid_results
