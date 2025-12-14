import React, { useState, useEffect, useRef } from 'react';
import { generateImageDescription } from '../../utils/data-communicator.js';
import './InputSection.scss';
import ImageUpload from '../ImageUpload/ImageUpload';
import { Button } from '@/components/ui/button';
import useSystemStore from '../../store/use-system-store';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/base-tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';



import { imageInfo } from '../../utils/data';
import MenuIcon from '@mui/icons-material/Menu';


function InputSection() {
  const [prompt, setPrompt] = useState("");
  const [numTrials, setNumTrials] = useState(3);
  const [promptVariation, setPromptVariation] = useState('original');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState('');
  const promptTextareaRef = useRef(null);
  
  // Auto-resize textarea to fit content
  useEffect(() => {
    if (promptTextareaRef.current) {
      promptTextareaRef.current.style.height = 'auto';
      promptTextareaRef.current.style.height = `${promptTextareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);
  
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

  // Clear all data when switching from examples to demo
  const handleTabChange = (newValue) => {
    if (mode === 'example' && newValue === 'demo') {
      // Clear store state
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
    if (imageSource === 'base64') {
      responses = await generateImageDescription(base64Image, prompt, numTrials, selectedModels, promptVariation, imageSource);
    } else {
      responses = await generateImageDescription(imageLink, prompt, numTrials, selectedModels, promptVariation, imageSource);
    }

    if (!responses.descriptions) {
      setIsLoading(false);
      return;
    }

    console.log('Image Description:', responses.descriptions);

    setIsLoading(false);
    setResponses(responses.descriptions);
    setVariationSummary(responses.variationSummary);
    setCurrentImage(responses.imageId);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
  
    // if the file is an image, send it to backend
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;
        // call the upload function
      //   const response = await fetch('http://127.0.0.1:5000/upload_image', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({ 
      //         image: base64Image,
      //     }),
      // });
      // const data = await response.json();
      // console.log('Image description:', data); 

        setBase64Image(base64Image);
      };
      reader.readAsDataURL(file);
      setImageLink(URL.createObjectURL(file));
      setImageSource('base64');
    } else {
      alert('Please upload an image file');
    }
  };

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
      <button 
        className="hamburger-menu"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <MenuIcon />
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'overlay-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`input-section ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Tabs 
          defaultValue="example"
          className="w-full"
          value={mode}
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="example">Examples</TabsTrigger>
            <TabsTrigger value="demo">Try it out!</TabsTrigger>
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
                >
                  {isLoading ? 'Generating...' : 'Submit'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setResponses({});
                    setImageLink('');
                    setPrompt('');
                    setNumTrials('');
                    setBase64Image('');
                    setImageSource('url');
                    setSelectedModels(['gpt', 'claude', 'gemini']);
                    setPromptVariation('original');
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
                          GPT-4o
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="claude3" 
                            checked={selectedModels.includes('claude')}
                            onChange={() => handleModelSelection('claude')}
                          />
                          Claude 3.7 Sonnet
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            name="gemini" 
                            checked={selectedModels.includes('gemini')}
                            onChange={() => handleModelSelection('gemini')}
                          />
                          Gemini 1.5 pro
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
            <div className="example-dropdown-container">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="example-dropdown-trigger">
                      {selectedExample ? selectedExample.charAt(0).toUpperCase() + selectedExample.slice(1) : 'Choose an example...'}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
                  {imageLink && <img src={imageLink} alt={selectedExample} />}
                  <textarea 
                    ref={promptTextareaRef}
                    readOnly
                    className="prompt-input prompt-display"
                    value={prompt}
                    rows={1}
                  />
                </div>
                
              )}
          </div>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
export default InputSection; 