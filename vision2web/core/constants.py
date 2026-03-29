"""Constants for Vision2Web"""

# Container settings
CONTAINER_PREFIX = "vision2web-"
CONTAINER_WORKSPACE = "/workspace"
CONTAINER_TMP_WORKSPACE = "/tmp/workspace"
CONTAINER_USER = "root"

# Docker timeouts (seconds)
DOCKER_CREATE_TIMEOUT = 60
DOCKER_START_TIMEOUT = 120
DOCKER_STOP_TIMEOUT = 60
DOCKER_EXEC_TIMEOUT = 7200
DOCKER_COPY_TIMEOUT = 300

# Task types
TASK_TYPES = ["webpage", "frontend", "website"]
