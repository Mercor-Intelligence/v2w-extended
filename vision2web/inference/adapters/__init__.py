"""Agent framework adapters for Vision2Web"""

from vision2web.inference.adapters.base import BaseAdapter
from vision2web.inference.adapters.claude_code import ClaudeCodeAdapter
from vision2web.inference.adapters.openhands import OpenHandsAdapter


def get_adapter(
    framework: str,
    api_key: str,
    model: str,
    base_url: str = None,
    sandbox_manager = None,
    logger = None,
    timeout: int = 3600
) -> BaseAdapter:
    """
    Get an adapter instance for the specified framework.

    Args:
        framework: Framework name ('claude_code' or 'openhands')
        api_key: API key for authentication
        model: Model identifier
        base_url: Optional API base URL
        sandbox_manager: SandboxManager instance
        logger: Optional logger instance

    Returns:
        Adapter instance

    Raises:
        ValueError: If framework is not supported
    """
    adapters = {
        'claude_code': ClaudeCodeAdapter,
        'openhands': OpenHandsAdapter,
    }

    if framework not in adapters:
        raise ValueError(
            f"Unsupported framework: {framework}. "
            f"Supported frameworks: {list(adapters.keys())}"
        )

    adapter_class = adapters[framework]
    return adapter_class(
        api_key=api_key,
        model=model,
        base_url=base_url,
        sandbox_manager=sandbox_manager,
        logger=logger,
        timeout=timeout
    )


__all__ = [
    'BaseAdapter',
    'ClaudeCodeAdapter',
    'OpenHandsAdapter',
    'get_adapter',
]
