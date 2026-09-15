import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configures structured, secure logging for the application."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    formatter = logging.Formatter(
        fmt="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    logger = logging.getLogger("metrix")
    logger.setLevel(log_level)
    logger.propagate = False

    # Avoid duplicate handlers if setup_logging is called multiple times
    if not logger.handlers:
        logger.addHandler(handler)

    return logger


logger = setup_logging()

