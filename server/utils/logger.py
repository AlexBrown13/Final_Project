import logging
from pathlib import Path

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

    log_file_path = Path(__file__).resolve().parents[2] / "status.log"
    file_handler = logging.FileHandler(log_file_path, encoding="utf-8")
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

__all__ = ["logger"]
