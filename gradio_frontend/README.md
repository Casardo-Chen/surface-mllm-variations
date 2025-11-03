# Vision-Language Model Variation Analysis - Gradio Frontend


## Features

- **Image Input**: Upload images or provide URLs for analysis
- **Model Selection**: Choose from GPT-4o, Claude 3.7 Sonnet, and Gemini 1.5 Pro
- **Configurable Parameters**: Set number of trials, prompts, and variation types
- **Comprehensive Analysis**: View multiple types of variation analysis including:
  - Model differences
  - Variation-only analysis
  - Percentage-based analysis
  - Natural language summaries
  - Similarity analysis
  - Uniqueness analysis
  - Disagreement analysis
- **Individual Descriptions**: View raw descriptions from each model
- **Data Persistence**: Load previously generated analyses

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure the backend server is running on `http://127.0.0.1:8000`

## Usage

1. Start the Gradio interface:
```bash
python app.py
```

2. Open your browser and navigate to `http://localhost:7860`

3. Use the interface to:
   - Upload an image or provide a URL
   - Configure analysis parameters
   - Generate descriptions and analysis
   - View results in organized tabs

## Backend Integration

This frontend communicates with the Flask backend API. Make sure the backend is running before using the interface. The backend should be accessible at `http://127.0.0.1:8000`.

## API Endpoints Used

- `POST /generate` - Generate new image descriptions and analysis
- `POST /get_descriptions` - Load existing analysis data

## Configuration

You can modify the backend URL in `app.py` if your backend is running on a different host or port:

```python
BACKEND_URL = "http://127.0.0.1:8000"  # Change this if needed
```

## Troubleshooting

- **Connection Error**: Make sure the backend server is running and accessible
- **Image Upload Issues**: Ensure the image format is supported (JPEG, PNG, etc.)
- **Analysis Errors**: Check that all required API keys are configured in the backend


cd /Users/mengchen/Research-Projects/vision-language-variation/gradio_frontend
source venv/bin/activate
python app.py &
