# Surface MLLM React Native App

A React Native application for analyzing image descriptions across multiple vision-language models (GPT-4o, Claude 3.7 Sonnet, Gemini 1.5 Pro). This app provides the same functionality as the original Gradio interface but with a mobile-first design.

## Features

- **Image Input**: Upload images from device or provide URLs
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
- **Clean UI**: Simple and clean interface matching the original design

## Prerequisites

- Node.js (>= 20)
- React Native development environment
- Python 3.8+ (for backend)
- iOS Simulator or Android Emulator (for testing)

## Installation

### 1. Install React Native Dependencies

```bash
cd SurfaceMLLMApp
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Set up Python Backend

Copy the Python files from the original Gradio frontend:

```bash
# Copy Python modules to backend directory
cp -r ../../gradio_frontend/*.py backend/
cp -r ../../gradio_frontend/helper.py backend/
cp -r ../../gradio_frontend/prompts.py backend/
cp -r ../../gradio_frontend/generation.py backend/
cp -r ../../gradio_frontend/pipeline.py backend/
```

### 4. Install Python Dependencies

```bash
cd backend
pip install -r ../../gradio_frontend/requirements.txt
pip install python-shell
```

### 5. Set up Environment Variables

Create a `.env` file in the backend directory with your API keys:

```bash
OPENAI_API_KEY=your_openai_api_key
CLAUDE_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:8000`

### 2. Start the React Native App

#### For iOS:
```bash
npx react-native run-ios
```

#### For Android:
```bash
npx react-native run-android
```

### 3. Start Metro Bundler (if not started automatically)

```bash
npx react-native start
```

## Project Structure

```
SurfaceMLLMApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Main app screens
│   ├── services/           # API service layer
│   └── styles/             # Theme and styling
├── backend/                # Node.js backend server
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── uploads/           # Temporary file storage
├── App.tsx                 # Main app component
└── package.json           # React Native dependencies
```

## API Endpoints

The backend provides the following endpoints:

- `GET /health` - Health check
- `GET /config` - Get available models and configurations
- `POST /generate` - Generate image descriptions and analysis
- `POST /get_descriptions` - Load existing analysis data
- `GET /datasets` - Get list of available datasets

## Configuration

You can modify the backend URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000'; // Change this if needed
```

## Troubleshooting

### Backend Issues
- **Connection Error**: Make sure the backend server is running on port 8000
- **Python Script Errors**: Ensure all Python dependencies are installed and API keys are set
- **File Upload Issues**: Check that the uploads directory exists and has proper permissions

### React Native Issues
- **Metro Bundler Issues**: Try clearing the cache with `npx react-native start --reset-cache`
- **iOS Build Issues**: Make sure Xcode is properly installed and configured
- **Android Build Issues**: Ensure Android SDK and emulator are set up correctly

### Network Issues
- **API Connection**: Make sure the device/emulator can reach the backend server
- **CORS Issues**: The backend is configured to allow CORS from all origins in development

## Development

### Adding New Features

1. **New Screens**: Add to `src/screens/` and update navigation in `App.tsx`
2. **New API Endpoints**: Add to `backend/server.js` and update `src/services/api.ts`
3. **New Components**: Add to `src/components/` and import where needed

### Styling

The app uses React Native Paper for consistent Material Design components. The theme is defined in `src/styles/theme.ts` and can be customized to match your preferences.

## License

MIT License - see LICENSE file for details.