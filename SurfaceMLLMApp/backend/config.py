"""
Configuration file for the Vision-Language Model Variation Analysis Gradio Frontend
"""

# Backend Configuration
BACKEND_URL = "http://127.0.0.1:8000"
BACKEND_TIMEOUT = 300  # seconds

# Gradio Configuration
GRADIO_SERVER_NAME = "0.0.0.0"
GRADIO_SERVER_PORT = 7860
GRADIO_SHARE = False
GRADIO_DEBUG = True

# Default Values
DEFAULT_PROMPT = "Describe the image in detail."
DEFAULT_NUM_TRIALS = 3
DEFAULT_MODELS = ["gpt", "claude", "gemini"]
DEFAULT_PROMPT_VARIATION = "original"
DEFAULT_USER_ID = "gradio_user"

# UI Configuration
MAX_IMAGE_SIZE = (1024, 1024)  # Maximum image dimensions
SUPPORTED_IMAGE_FORMATS = ["JPEG", "PNG", "WEBP", "BMP", "TIFF"]

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Available Models
AVAILABLE_MODELS = [
    ("GPT-4o", "gpt"),
    ("Claude 3.7 Sonnet", "claude"),
    ("Gemini 1.5 Pro", "gemini")
]

# Prompt Variation Options
PROMPT_VARIATIONS = [
    ("Original prompt only", "original"),
    ("Paraphrased prompts", "paraphrased")
]

# Theme Configuration
THEME = "default"  # Options: "default", "soft", "monochrome", "glass"

# Error Messages
ERROR_MESSAGES = {
    "no_image": "Please provide an image",
    "no_models": "Please select at least one model",
    "backend_connection": "Cannot connect to backend server. Please make sure the backend is running.",
    "backend_timeout": "Request timed out. The analysis is taking longer than expected.",
    "backend_error": "Backend error occurred",
    "general_error": "An unexpected error occurred"
}

