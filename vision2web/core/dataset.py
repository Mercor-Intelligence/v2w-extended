"""Dataset discovery and management for Vision2Web"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Project:
    """Represents a benchmark project"""
    name: str
    task_type: str  # webpage, frontend, or website
    path: Path
    prototypes_dir: Path
    resources_dir: Optional[Path]
    prd_path: Optional[Path]  # Only for website tasks
    prompt_path: Optional[Path]  # Only for frontend tasks
    workflow_path: Path

    def __post_init__(self):
        """Validate project structure"""
        if not self.prototypes_dir.exists() or not self.prototypes_dir.is_dir():
            raise ValueError(f"Prototypes directory not found: {self.prototypes_dir}")
        if not self.workflow_path.exists():
            raise ValueError(f"Workflow file not found: {self.workflow_path}")
        
        # Validate task-specific files
        if self.task_type == "website" and self.prd_path and not self.prd_path.exists():
            raise ValueError(f"PRD file not found: {self.prd_path}")
        if self.task_type == "frontend" and self.prompt_path and not self.prompt_path.exists():
            raise ValueError(f"Prompt file not found: {self.prompt_path}")

    def to_dict(self) -> Dict[str, Any]:
        """Convert project to dictionary"""
        return {
            'name': self.name,
            'task_type': self.task_type,
            'path': str(self.path),
            'prototypes_dir': str(self.prototypes_dir),
            'resources_dir': str(self.resources_dir) if self.resources_dir else None,
            'prd_path': str(self.prd_path) if self.prd_path else None,
            'prompt_path': str(self.prompt_path) if self.prompt_path else None,
            'workflow_path': str(self.workflow_path),
        }


class DatasetManager:
    """Manages benchmark datasets"""

    def __init__(self, datasets_dir: Path):
        """
        Initialize dataset manager.

        Args:
            datasets_dir: Root directory containing datasets
        """
        self.datasets_dir = Path(datasets_dir)

    def discover_projects(self, task_type: Optional[str] = None) -> List[Project]:
        """
        Discover all projects in the datasets directory.

        Args:
            task_type: Optional filter for specific task type (webpage, frontend, website)

        Returns:
            List of Project instances

        Directory structure expected:
            datasets/
            ├── webpage/
            │   └── project1/
            │       ├── prototypes/
            │       ├── resources/ (optional)
            │       └── workflow.json
            ├── frontend/
            │   └── project2/
            │       ├── prototypes/
            │       ├── prompt.txt
            │       ├── resources/ (optional)
            │       └── workflow.json
            └── website/
                └── project3/
                    ├── prototypes/
                    ├── prd.md
                    ├── resources/ (optional)
                    └── workflow.json
        """
        projects = []

        if not self.datasets_dir.exists():
            return projects

        # Task types to scan
        task_types = [task_type] if task_type else ['webpage', 'frontend', 'website']

        for task in task_types:
            task_dir = self.datasets_dir / task
            if not task_dir.exists() or not task_dir.is_dir():
                continue

            # Iterate through projects in each task directory
            for project_dir in task_dir.iterdir():
                if not project_dir.is_dir() or project_dir.name.startswith('.'):
                    continue

                # Check if this is a valid project
                prototypes_dir = project_dir / 'prototypes'
                workflow_path = project_dir / 'workflow.json'
                resources_dir = project_dir / 'resources'
                prd_path = project_dir / 'prd.md'
                prompt_path = project_dir / 'prompt.txt'

                if not prototypes_dir.exists() or not prototypes_dir.is_dir():
                    continue
                if not workflow_path.exists():
                    continue

                # Create project instance
                try:
                    project = Project(
                        name=project_dir.name,
                        task_type=task,
                        path=project_dir,
                        prototypes_dir=prototypes_dir,
                        resources_dir=resources_dir if resources_dir.exists() else None,
                        prd_path=prd_path if task == "website" and prd_path.exists() else None,
                        prompt_path=prompt_path if task == "frontend" and prompt_path.exists() else None,
                        workflow_path=workflow_path
                    )
                    projects.append(project)
                except ValueError as e:
                    # Skip invalid projects
                    continue

        return projects

    def get_project(self, project_name: str, task_type: Optional[str] = None) -> Optional[Project]:
        """
        Get a specific project by name.

        Args:
            project_name: Name of the project
            task_type: Optional task type filter

        Returns:
            Project instance or None if not found
        """
        projects = self.discover_projects(task_type=task_type)
        for project in projects:
            if project.name == project_name:
                return project
        return None

    def load_workflow(self, project: Project) -> List[Dict[str, Any]]:
        """
        Load workflow from a project.

        Args:
            project: Project instance

        Returns:
            Workflow data as list of test groups
        """
        with open(project.workflow_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def list_projects_by_task(self) -> Dict[str, List[Project]]:
        """
        Get projects grouped by task type.

        Returns:
            Dictionary mapping task types to lists of projects
        """
        projects = self.discover_projects()
        by_task = {}

        for project in projects:
            if project.task_type not in by_task:
                by_task[project.task_type] = []
            by_task[project.task_type].append(project)

        return by_task

    def validate_dataset(self) -> Dict[str, Any]:
        """
        Validate the entire dataset structure.

        Returns:
            Validation report with errors and warnings
        """
        report = {
            'valid': True,
            'projects_found': 0,
            'errors': [],
            'warnings': []
        }

        if not self.datasets_dir.exists():
            report['valid'] = False
            report['errors'].append(f"Datasets directory not found: {self.datasets_dir}")
            return report

        projects = self.discover_projects()
        report['projects_found'] = len(projects)

        for project in projects:
            # Check prototypes
            if not project.prototypes_dir.exists():
                report['errors'].append(f"{project.name}: Prototypes directory not found")
                report['valid'] = False
            else:
                # Check if there are any prototype images
                prototype_files = list(project.prototypes_dir.glob('*.jpg')) + \
                                  list(project.prototypes_dir.glob('*.png'))
                if not prototype_files:
                    report['warnings'].append(f"{project.name}: No prototype images found")

            # Check workflow
            if not project.workflow_path.exists():
                report['errors'].append(f"{project.name}: Workflow file not found")
                report['valid'] = False
            else:
                # Validate workflow JSON
                try:
                    workflow = self.load_workflow(project)
                    if not isinstance(workflow, list):
                        report['errors'].append(f"{project.name}: Workflow must be a list")
                        report['valid'] = False
                except json.JSONDecodeError as e:
                    report['errors'].append(f"{project.name}: Invalid workflow JSON - {e}")
                    report['valid'] = False

            # Check task-specific files
            if project.task_type == "website" and project.prd_path:
                if not project.prd_path.exists():
                    report['errors'].append(f"{project.name}: PRD file not found")
                    report['valid'] = False
            
            if project.task_type == "frontend" and project.prompt_path:
                if not project.prompt_path.exists():
                    report['errors'].append(f"{project.name}: Prompt file not found")
                    report['valid'] = False

            # Check resources (optional)
            if project.resources_dir and not project.resources_dir.exists():
                report['warnings'].append(f"{project.name}: Resources directory listed but not found")

        return report
