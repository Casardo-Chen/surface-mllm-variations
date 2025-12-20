# Surfacing Uncertainty in MLLM-Generated Image Descriptions

A tool to non-visually assess the uncertainty in MLLM-generated image descriptions by generating and presenting variations in text-based summaries.

## Prerequisites

- **Python 3.13** (or compatible version)
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- API keys for one or more of the following services:
  - OpenAI
  - Google Gemini
  - Anthropic Claude

## Project Structure

```
surface-mllm-variations/
├── backend/          # Flask API server
├── frontend/         # Next.js web application
└── README.md
```

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory and set up a Python virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

**Note:** If you encounter issues, you may need to install NLTK data separately:

```bash
python -c "import nltk; nltk.download('punkt')"
```

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Variables

Create a `.env` file in the **backend** of the project:

```bash
# From the root directory
touch .env
```

Add your API keys to the `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
```

**Note:** You only need to provide the API keys for the models you plan to use. The application also supports providing API keys through the frontend interface.

## Running the Application

### Start the Backend Server

1. Activate the virtual environment (if not already activated):

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Run the Flask server:

```bash
python main.py
```

The backend server will start on `http://localhost:8000` by default. You can change the port by setting the `PORT` environment variable.

### Start the Frontend Development Server

In a **new terminal window**, navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` by default.

### Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```


## License

See LICENSE file for details.

