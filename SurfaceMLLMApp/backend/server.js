const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PythonShell } = require('python-shell');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Import Python modules (we'll need to copy the Python files)
const PYTHON_SCRIPTS_PATH = path.join(__dirname, '..', '..', 'gradio_frontend');

// Available models configuration
const AVAILABLE_MODELS = [
  { id: 'gpt', name: 'GPT-4o' },
  { id: 'claude', name: 'Claude 3.7 Sonnet' },
  { id: 'gemini', name: 'Gemini 1.5 Pro' }
];

const PROMPT_VARIATIONS = [
  { id: 'original', name: 'Original prompt only' },
  { id: 'paraphrased', name: 'Paraphrased prompts' }
];

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Surface MLLM Backend is running' });
});

// Get available models and configurations
app.get('/config', (req, res) => {
  res.json({
    models: AVAILABLE_MODELS,
    promptVariations: PROMPT_VARIATIONS,
    defaultPrompt: "Describe the image in detail.",
    defaultNumTrials: 3,
    defaultModels: ['gpt', 'claude', 'gemini'],
    defaultPromptVariation: 'original'
  });
});

// Generate descriptions endpoint
app.post('/generate', upload.single('image'), async (req, res) => {
  try {
    const {
      prompt = "Describe the image in detail.",
      numTrials = 3,
      selectedModels = ['gpt', 'claude', 'gemini'],
      promptVariation = 'original',
      userId = 'mobile_user',
      imageUrl
    } = req.body;

    let imagePath = null;
    let imageSource = 'url';

    // Handle image input
    if (req.file) {
      // File upload
      imagePath = req.file.path;
      imageSource = 'file';
    } else if (imageUrl) {
      // URL provided
      imagePath = imageUrl;
      imageSource = 'url';
    } else {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Validate inputs
    if (!selectedModels || selectedModels.length === 0) {
      return res.status(400).json({ error: 'Please select at least one model' });
    }

    // Prepare Python script options
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: PYTHON_SCRIPTS_PATH,
      args: [
        '--image_url', imagePath,
        '--prompt', prompt,
        '--num_trials', numTrials.toString(),
        '--models', selectedModels.join(','),
        '--variation_type', promptVariation,
        '--source', imageSource
      ]
    };

    console.log('Running Python script with options:', options);

    // Run the Python pipeline
    PythonShell.run('pipeline.py', options, (err, results) => {
      if (err) {
        console.error('Python script error:', err);
        return res.status(500).json({ 
          error: 'Failed to generate descriptions',
          details: err.message 
        });
      }

      try {
        // The Python script should output JSON results
        const result = JSON.parse(results[results.length - 1]);
        
        // Clean up uploaded file if it was a file upload
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        res.json({
          success: true,
          descriptions: result.descriptions || {},
          variationSummary: result.summary || {},
          imageId: result.imageId || Date.now().toString()
        });
      } catch (parseError) {
        console.error('Error parsing Python results:', parseError);
        res.status(500).json({ 
          error: 'Failed to parse results',
          details: parseError.message 
        });
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get existing descriptions
app.post('/get_descriptions', async (req, res) => {
  try {
    const { imageName } = req.body;
    
    if (!imageName) {
      return res.status(400).json({ error: 'Image name is required' });
    }

    // Look for existing data in the data directory
    const dataPath = path.join(PYTHON_SCRIPTS_PATH, 'data', imageName);
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'Data not found' });
    }

    const descriptionsPath = path.join(dataPath, 'descriptions.json');
    const summaryPath = path.join(dataPath, 'summary.json');
    const metadataPath = path.join(dataPath, 'metadata.json');

    let descriptions = {};
    let summary = {};
    let metadata = {};

    if (fs.existsSync(descriptionsPath)) {
      descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
    }

    if (fs.existsSync(summaryPath)) {
      summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    }

    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }

    res.json({
      success: true,
      descriptions,
      variation: summary,
      metadata
    });

  } catch (error) {
    console.error('Error loading descriptions:', error);
    res.status(500).json({ 
      error: 'Failed to load descriptions',
      details: error.message 
    });
  }
});

// Get available datasets
app.get('/datasets', (req, res) => {
  try {
    const dataDir = path.join(PYTHON_SCRIPTS_PATH, 'data');
    
    if (!fs.existsSync(dataDir)) {
      return res.json({ datasets: [] });
    }

    const datasets = fs.readdirSync(dataDir)
      .filter(item => fs.statSync(path.join(dataDir, item)).isDirectory())
      .map(item => ({
        id: item,
        name: item.charAt(0).toUpperCase() + item.slice(1)
      }));

    res.json({ datasets });
  } catch (error) {
    console.error('Error getting datasets:', error);
    res.status(500).json({ 
      error: 'Failed to get datasets',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Surface MLLM Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
