import os
import sys
import logging
from pythonjsonlogger import jsonlogger

# Environment variables
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
SERVICE_NAME = "voice-assistant-ai-services"

# Create logger
logger = logging.getLogger(SERVICE_NAME)

# Prevent duplicate handlers
if not logger.handlers:
    logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))

    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)

    # JSON formatter
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s"
    )

    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    # Prevent propagation duplication
    logger.propagate = False


def get_logger(name=None):
    """
    Get child logger
    """
    if name:
        return logger.getChild(name)

    return logger