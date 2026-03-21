import logging

# Create global logger
logger = logging.getLogger("app")
logger.setLevel(logging.INFO)

# Avoid duplicate handlers if file is imported multiple times
if not logger.handlers:
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(message)s"
    )

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    logger.addHandler(handler)

__all__ = ["logger"]
