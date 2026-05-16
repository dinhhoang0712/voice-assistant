import os
import logging
from pythonjsonlogger import jsonlogger
from loki_logger_handler import LokiLoggerHandler

# Get environment variables
LOKI_URL = os.getenv('LOKI_URL', 'http://loki:3100')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
SERVICE_NAME = 'voice-assistant-ai-services'
ENVIRONMENT = os.getenv('FLASK_ENV', 'development')

# Create logger
logger = logging.getLogger(SERVICE_NAME)
logger.setLevel(getattr(logging, LOG_LEVEL))

# Create JSON formatter
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(name)s %(levelname)s %(message)s'
)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# Loki handler (if Loki URL is configured)
if LOKI_URL:
    try:
        loki_handler = LokiLoggerHandler(
            url=LOKI_URL,
            labels={
                'service': SERVICE_NAME,
                'environment': ENVIRONMENT,
            },
            formatter=formatter,
            batch=True,
            interval=5
        )
        logger.addHandler(loki_handler)
    except Exception as e:
        logger.warning(f"Failed to initialize Loki handler: {e}")

def get_logger(name=None):
    """Get a logger with optional name for specific modules"""
    if name:
        return logger.getChild(name)
    return logger
