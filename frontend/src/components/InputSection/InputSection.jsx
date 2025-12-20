import React, { useState, useEffect, useRef } from 'react';
import { generateImageDescription } from '../../utils/data-communicator.js';
import './InputSection.scss';
import ImageUpload from '../ImageUpload/ImageUpload';
import { Button } from '@/components/ui/button';
import useSystemStore from '../../store/use-system-store';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/base-tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';


function InputSection() {
  const [prompt, setPrompt] = useState("");
  const [numTrials, setNumTrials] = useState(3);
  const [promptVariation, setPromptVariation] = useState('original');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState('');
  const promptTextareaRef = useRef(null);
  const dropdownTriggerRef = useRef(null);
  
  // Auto-resize textarea to fit content
  useEffect(() => {
    if (promptTextareaRef.current) {
      promptTextareaRef.current.style.height = 'auto';
      promptTextareaRef.current.style.height = `${promptTextareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Match dropdown content width to trigger
  const updateDropdownWidth = () => {
    if (dropdownTriggerRef.current) {
      const triggerWidth = dropdownTriggerRef.current.offsetWidth;
      // Use setTimeout to ensure the dropdown content is rendered
      setTimeout(() => {
        const dropdownContent = document.querySelector('.example-dropdown-content');
        if (dropdownContent) {
          dropdownContent.style.width = `${triggerWidth}px`;
          dropdownContent.style.minWidth = `${triggerWidth}px`;
          dropdownContent.style.maxWidth = `${triggerWidth}px`;
        }
      }, 0);
    }
  };
  
  // List of available examples
  const examples = [
    'Map', 'Swiftie', 'Washing Machine',
    'Screen', 'Medication', 'Card', 
    'Home', 'Outfit', 'Dragonfly',
  ];

  const { 
    responses,
    setResponses,
    variationSummary,
    setVariationSummary,
    imageLink,
    setImageLink,
    currentImage, 
    setCurrentImage, 
    systemMode, 
    setSystemMode, 
    viewMode, 
    setViewMode, 
    selectedModels,
    setSelectedModels,
    setPrompt: setStorePrompt,
  } = useSystemStore();

  const [imageSource, setImageSource] = useState('url');
  const [base64Image, setBase64Image] = useState('');

  const [mode, setMode] = useState('example');
  
  // API Keys state - load from localStorage on mount
  const [openaiKey, setOpenaiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openai_api_key') || '';
    }
    return '';
  });
  const [geminiKey, setGeminiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });
  const [claudeKey, setClaudeKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('claude_api_key') || '';
    }
    return '';
  });

  // Save API keys to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (openaiKey) {
        localStorage.setItem('openai_api_key', openaiKey);
      } else {
        localStorage.removeItem('openai_api_key');
      }
    }
  }, [openaiKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (geminiKey) {
        localStorage.setItem('gemini_api_key', geminiKey);
      } else {
        localStorage.removeItem('gemini_api_key');
      }
    }
  }, [geminiKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (claudeKey) {
        localStorage.setItem('claude_api_key', claudeKey);
      } else {
        localStorage.removeItem('claude_api_key');
      }
    }
  }, [claudeKey]);

  // Clear all data when switching from examples to demo (especially when there's an image)
  const handleTabChange = (newValue) => {
    if (mode === 'example' && newValue === 'demo') {
      // Clear all data when switching to "Try it out!" tab, especially if there's an image
      // Clear store state (data displayed in tables)
      setResponses({});
      setVariationSummary({});
      setImageLink('');
      setCurrentImage('');
      setStorePrompt('');
      
      // Clear local state
      setPrompt('');
      setSelectedExample('');
      setBase64Image('');
      setImageSource('url');
    // } else if (newValue === 'demo') {
    //   // Also clear when switching to demo from any other tab
    //   setResponses({});
    //   setVariationSummary({});
    //   setImageLink('');
    //   setCurrentImage('');
    //   setStorePrompt('');
    //   setPrompt('');
    //   setBase64Image('');
    //   setImageSource('url');
    }
    setMode(newValue);
  };

  const handleSubmit = async () => {
    // check if the image is a url or a local file
    console.log('imageSource', imageSource);
    console.log('imageLink', imageLink);
    console.log('prompt', prompt);
    console.log('numTrials', numTrials);
    console.log('selectedModels', selectedModels);
    console.log('promptVariation', promptVariation);

    let responses;

    // generate image descriptions
    setIsLoading(true);
    
    // Ensure images are sent as base64 or valid URL (not blob URLs)
    let imageToSend;
    let actualSource = imageSource;
    
    if (imageSource === 'base64') {
      // Use base64 image if available
      if (base64Image) {
        imageToSend = base64Image;
      } else if (imageLink && imageLink.startsWith('data:')) {
        // If imageLink is already base64 data URL, use it
        imageToSend = imageLink;
      } else {
        // If we have a blob URL but no base64, we need to convert it
        console.error('Base64 image not available');
        setIsLoading(false);
        return;
      }
    } else {
      // For URL source, ensure it's a valid URL (not a blob URL)
      if (imageLink && imageLink.startsWith('blob:')) {
        // If it's a blob URL, we should have base64 instead
        if (base64Image) {
          imageToSend = base64Image;
          actualSource = 'base64'; // Update source to base64 since we're sending base64
        } else {
          console.error('Blob URL detected but no base64 available. Cannot send to backend.');
          setIsLoading(false);
          return;
        }
      } else if (imageLink && (imageLink.startsWith('http://') || imageLink.startsWith('https://') || imageLink.startsWith('data:'))) {
        // Valid URL or data URL
        imageToSend = imageLink;
      } else {
        console.error('Invalid image URL');
        setIsLoading(false);
        return;
      }
    }
    
    responses = await generateImageDescription(
      imageToSend, 
      prompt, 
      numTrials, 
      selectedModels, 
      promptVariation, 
      actualSource,
      openaiKey,
      geminiKey,
      claudeKey
    );

    if (!responses.descriptions) {
      setIsLoading(false);
      return;
    }

    console.log('Image Description:', responses.descriptions);

    setIsLoading(false);
    setResponses(responses.descriptions);
    setVariationSummary(responses.variationSummary);
    // setCurrentImage(responses.imageId);

    // use tts to notify the user that the image description has been generated
    const utterance = new SpeechSynthesisUtterance("Image descriptions have been generated successfully.");
    window.speechSynthesis.speak(utterance);

    // generate variation descriptions
    
  };

  const handleModelSelection = (model) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const handleImageUpload = (imageData) => {
    if (imageData.source === 'base64') {
      setBase64Image(imageData.data);
      setImageLink(imageData.preview);
      setImageSource('base64');
    } else if (imageData.source === 'url') {
      setImageLink(imageData.data);
      setImageSource('url');
      setBase64Image('');
    }
  };

  // const handleFileUpload = (event) => {
  //   const file = event.target.files[0];
  
  //   // if the file is an image, send it to backend
  //   if (file.type.includes('image')) {
  //     const reader = new FileReader();
  //     reader.onload = async (e) => {
  //       const base64Image = e.target.result;
  //       // call the upload function
  //     //   const response = await fetch('http://127.0.0.1:5000/upload_image', {
  //     //     method: 'POST',
  //     //     headers: {
  //     //         'Content-Type': 'application/json',
  //     //     },
  //     //     body: JSON.stringify({ 
  //     //         image: base64Image,
  //     //     }),
  //     // });
  //     // const data = await response.json();
  //     // console.log('Image description:', data); 

  //       setBase64Image(base64Image);
  //     };
  //     reader.readAsDataURL(file);
  //     setImageLink(URL.createObjectURL(file));
  //     setImageSource('base64');
  //   } else {
  //     alert('Please upload an image file');
  //   }
  // };

  const examplePathMap = {
    'Washing Machine': 'wm',
    'Map': 'map',
    'Swiftie': 'swiftie',
    'Screen': 'screen',
    'Medication': 'medication',
    'Card': 'card',
    'Home': 'home',
    'Outfit': 'outfit',
    'Dragonfly': 'dragonfly',
  };

  const handleExampleSelection = async (example) => {
    setSelectedExample(example);
    const exampleKey = examplePathMap[example] || example.toLowerCase();
    setCurrentImage(exampleKey);

    try {
      const [metadataRes, descriptionsRes, summaryRes] = await Promise.all([
        fetch(`/examples/${exampleKey}/metadata.json`),
        fetch(`/examples/${exampleKey}/descriptions.json`),
        fetch(`/examples/${exampleKey}/summary.json`),
      ]);

      if (metadataRes.ok) {
        const jsonData = await metadataRes.json();
        setImageLink(jsonData.image || ''); 
        setImageSource(jsonData.source || 'url');
        setPrompt(jsonData.prompt || '');
        setNumTrials(jsonData.numTrials ?? numTrials);
        setSelectedModels(jsonData.selectedModels || ['gpt', 'claude', 'gemini']);
        setPromptVariation(jsonData.promptVariation || 'original');
      }

      if (descriptionsRes.ok) {
        const descriptions = await descriptionsRes.json();
        setResponses(descriptions);
      }

      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        setVariationSummary(summary);
      }
    } catch (error) {
      console.error('Failed to load example data', error);
    }
  };


  return (
    <div className="input-section-wrapper">
      {/* Hamburger Menu */}
      {!sidebarOpen && (
        <button 
          className="hamburger-menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle input sidebar"
        >
          <MenuIcon />
        </button>
      )}

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'overlay-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`input-section ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Hide Sidebar Button - visible on narrow screens when sidebar is open */}
        <button 
          className="hide-sidebar-button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Hide input sidebar"
        >
          <CloseIcon />
          <span>Hide input sidebar</span>
        </button>
        
        <Tabs 
          defaultValue="instructions"
          className="w-full"
          value={mode}
          onValueChange={handleTabChange}
        >
          <TabsList className="input-tabs-list">
            <TabsTrigger className="input-tab-trigger" value="example">Examples</TabsTrigger>
            <TabsTrigger className="input-tab-trigger" value="demo">Try it out!</TabsTrigger>
            <TabsTrigger className="input-tab-trigger" value="instructions">Instructions</TabsTrigger>
            <TabsTrigger className="input-tab-trigger" value="api-keys">API Keys</TabsTrigger>
          </TabsList>
          <TabsContent value="demo">
            <div className="input-controls">
                <ImageUpload 
                  onImageChange={handleImageUpload}
                  currentImage={imageLink}
                />
                <input 
                  type="text" 
                  alt='prompt'
                  placeholder="Enter your prompt..."
                  className="prompt-input"
                  onChange={(e) => setPrompt(e.target.value)}
                  value={prompt}
                />
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  variant="outline"
                  className="action-button"
                >
                  {isLoading ? 'Generating...' : 'Submit'}
                </Button>
                <Button 
                  variant="outline"
                  className="action-button"
                  onClick={() => {
                    setResponses({});
                    setVariationSummary({});
                    setImageLink('');
                    setCurrentImage('');
                    setPrompt('');
                    setNumTrials('3');
                    setBase64Image('');
                    setImageSource('url');
                    setSelectedModels(['gpt', 'claude', 'gemini']);
                    setPromptVariation('original');
                    setIsLoading(false);
                  }
                  }
                >
                  Clear
                </Button>
            <table className="description-table">
              <tbody>
                <tr>
                  <td style={{ backgroundColor: '#f4f4f4', fontWeight: 600 }}>Models</td>
                  <td>
                    <div className="checkbox-group">
                      <div className="checkbox-options" style={{display: 'flex', flexDirection: 'column'}}>
                        <label>
                          <input 
                            type="checkbox" 
                            name="gpt4v" 
                            checked={selectedModels.includes('gpt')}
                            onChange={() => handleModelSelection('gpt')}
                          />
                          GPT
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="claude3" 
                            checked={selectedModels.includes('claude')}
                            onChange={() => handleModelSelection('claude')}
                          />
                          Claude
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="gemini" 
                            checked={selectedModels.includes('gemini')}
                            onChange={() => handleModelSelection('gemini')}
                          />
                          Gemini
                        </label>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ backgroundColor: '#f4f4f4', fontWeight: 600 }}>Trials</td>
                  <td>
                    <input 
                      type="text" 
                      alt='target trial number'
                      placeholder="Enter number of trials..."
                      style={{ width: '100%' }}
                      onChange={(e) => setNumTrials(e.target.value)}
                      value={numTrials}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ backgroundColor: '#f4f4f4', fontWeight: 600 }}>Prompts</td>
                  <td>
                    <div className="radio-group">
                      <div className="radio-options" style={{display: 'flex', flexDirection: 'column'}}>
                        <label>
                          <input 
                            type="radio"
                            name="promptVariation"
                            value="original"
                            checked={promptVariation === 'original'}
                            onChange={() => setPromptVariation('original')}
                          />
                          Original prompt only
                        </label>
                        <label>
                          <input 
                            type="radio"
                            name="promptVariation"
                            value="paraphrased"
                            checked={promptVariation === 'paraphrased'}
                            onChange={() => setPromptVariation('paraphrased')}
                          />
                          Paraphrased prompts
                        </label>
                        <label>
                          <input 
                            type="radio"
                            name="promptVariation"
                            value="various"
                            checked={promptVariation === 'various'}
                            onChange={() => setPromptVariation('various')}
                          />
                          Persona
                        </label>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </TabsContent>
          <TabsContent value="example">
            <div className="example-tab-content">
              <div className="example-dropdown-container">
                  <DropdownMenu onOpenChange={(open) => {
                    if (open) {
                      updateDropdownWidth();
                    }
                  }}>
                    <DropdownMenuTrigger asChild>
                      <button ref={dropdownTriggerRef} className="example-dropdown-trigger">
                        <span>{selectedExample ? selectedExample.charAt(0).toUpperCase() + selectedExample.slice(1) : 'Choose an example...'}</span>
                        <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#999', transition: 'transform 0.2s ease' }} className="dropdown-arrow-icon" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="example-dropdown-content">
                      {examples.map((example) => (
                        <DropdownMenuItem
                          key={example}
                          onClick={() => handleExampleSelection(example)}
                        >
                          {example.charAt(0).toUpperCase() + example.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {selectedExample && (
                    <div className="example-preview">
                      <textarea 
                        ref={promptTextareaRef}
                        readOnly
                        className="prompt-input prompt-display"
                        value={prompt}
                        rows={1}
                      />
                      {imageLink && <img src={imageLink} alt={selectedExample} />}
                    </div>
                    
                  )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="instructions">
            <div className="instructions-content">
              <h3>Getting Started</h3>
              <p>
                This is a tool to non-visually assess the uncertainty in MLLM-generated image descriptions by generating and presenting variations in text-based summaries.
              </p>
              <p>
                <strong>See Examples:</strong> In Examples Tab, you can browse 9 examples with image, prompt, a list of 9 AI generateddescriptions, and variation summary and description.
              </p>
              
              <p>
                <strong>Try it out:</strong> First, go to API Keys to input your API keys for OpenAI, Google Gemini, and Anthropic.
                Then, go to Try it out! Tab, upload your own image or provide an image URL or take a photo, enter a prompt describing what you want to know about the image, and click Submit. Then you can read the descriptions and variation summary and description.
              </p>
              
              <p>
                The variation summary shows you:
              </p>
              <ul>
                <li><strong>Agreements:</strong> Claims that multiple models agree on</li>
                <li><strong>Disagreements:</strong> Claims where models differ</li>
                <li><strong>Unique Mentions:</strong> Information mentioned by only one model</li>
              </ul>
              
              <p>
                You can customize varations by:
              </p>
              <ul>
                <li><strong>Models:</strong> Select which MLLMs to use (GPT, Gemini, Claude)</li>
                <li><strong>Trials:</strong> Set the number of times to query each model (default = 3)</li>
                <li><strong>Prompts:</strong> Choose between using original prompt only, or using paraphrased prompts, or persona-based prompts (default = original prompt only)</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="api-keys">
            <div className="api-keys-content">
              <h3>API Keys Configuration</h3>
              <p>
                Enter your API keys for the multimodal language models. These keys are stored locally in your browser and are not sent to any server except when making API calls to the respective services.
              </p>
              
              <div className="api-key-input-group">
                <label htmlFor="openai-key">
                  <strong>OpenAI API Key</strong>
                </label>
                <input
                  id="openai-key"
                  type="password"
                  className="api-key-input"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </div>

              <div className="api-key-input-group">
                <label htmlFor="gemini-key">
                  <strong>Google Gemini API Key</strong>
                </label>
                <input
                  id="gemini-key"
                  type="password"
                  className="api-key-input"
                  placeholder="AIza..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
              </div>

              <div className="api-key-input-group">
                <label htmlFor="claude-key">
                  <strong>Anthropic API Key</strong>
                </label>
                <input
                  id="claude-key"
                  type="password"
                  className="api-key-input"
                  placeholder="sk-ant-..."
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                />
              </div>

              <div className="api-keys-note">
                <p>
                  <strong>Note:</strong> API keys are stored in your browser's local storage. Make sure to keep them secure and never share them publicly.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {mode !== 'demo' && (
          <div className="input-footer" aria-label="Project attribution">
            <span>Developed by UT HCI Lab. </span>
            <a 
              href="https://meng-chen.com/image-desc-uncertainty/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Learn more about the project.
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
export default InputSection; 