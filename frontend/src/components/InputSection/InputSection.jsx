import React, { useState, useEffect } from 'react';
import { generateImageDescription } from '../../utils/data-communicator.js';
import './InputSection.scss';
import ImageUpload from '../ImageUpload/ImageUpload';
import { Button } from '@/components/ui/button';
import useSystemStore from '../../store/use-system-store';
import useResponsesStore from '../../store/use-responses-store';
import useUserStudyStore from '../../store/use-user-study-store';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/base-tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';



import { imageInfo } from '../../utils/data';


function InputSection() {
  const [prompt, setPrompt] = useState("");
  const [numTrials, setNumTrials] = useState(3);
  const [promptVariation, setPromptVariation] = useState('original');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState('');
  
  // List of available examples
  const examples = [
    'arkansas', 'bottle', 'card', 'dragonfly', 'home', 
    'map', 'medication', 'outfit', 'screen', 'swiftie', 'wm'
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
    setViewMode, } = useSystemStore();

  const [imageSource, setImageSource] = useState('url');
  const [base64Image, setBase64Image] = useState('');
  const [selectedModels, setSelectedModels] = useState(['gpt', 'claude', 'gemini']);
  const { userId } = useUserStudyStore();

  const [mode, setMode] = useState('demo');

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

  const handleExampleSelection = (example) => {
    setSelectedExample(example);
    // Load example data - you can implement this based on your data structure
    // For now, we'll set the image link to a placeholder
    setImageLink(`/examples/${example}.jpg`); // Adjust path as needed
    setImageSource('url');
    setPrompt(`Describe this ${example} image`); // Set a default prompt
  };


  return (
    <>
      {/* Hamburger Menu */}
      <button 
        className="hamburger-menu"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <div className="hamburger-lines">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'overlay-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`input-section ${sidebarOpen ? 'sidebar-open' : ''}`}>
    <Tabs 
      defaultValue="demo"
      className="w-full"
    >
      <TabsList>
        <TabsTrigger value="demo">Demo</TabsTrigger>
        <TabsTrigger value="example">Examples</TabsTrigger>
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
      
                <div className="border border-border rounded-lg overflow-hidden">
      <Table 
        className="w-full "
      >
        <TableBody>
          <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
            <TableCell className="bg-muted/50 py-2 font-medium">Models</TableCell>
            <TableCell className="py-2">

            </TableCell>
          </TableRow>
          <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
            <TableCell className="bg-muted/50 py-2 font-medium">Trials</TableCell>
            <TableCell className="py-2">
              <input 
                type="text" 
                alt='target trial number'
                placeholder="Enter number of trials..."
                className="prompt-input"
                onChange={(e) => setNumTrials(e.target.value)}
                value={numTrials}
              />
            </TableCell>
          </TableRow>
          <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
            <TableCell className="bg-muted/50 py-2 font-medium">Prompts</TableCell>
            <TableCell className="py-2">New York, USA</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
            <div className="checkbox-group">
              <p>Models:</p>
              <div className="checkbox-options" style= {{display: 'flex', flexDirection: 'column'}}>
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
            <div className="radio-group">
              <p>Prompt Variation:</p>
              <div className="radio-options" style= {{display: 'flex', flexDirection: 'column'}}>
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
                {/* <label>
                  <input 
                    type="radio"
                    name="promptVariation"
                    value="various"
                    checked={promptVariation === 'various'}
                    onChange={() => setPromptVariation('various')}
                  />
                  Various prompts
                </label> */}
              </div>
            </div>
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
              <img src={`https://vizwiz.cs.colorado.edu/VizWiz_visualization_img/VizWiz_val_00004263.jpg`} alt={selectedExample} />
              <input 
                type="text" 
                alt='prompt'
                disabled={true}
                className="prompt-input"
                value={`"Describe this ${selectedExample} image"`}
              />

     
            </div>
            
          )}
      </div>

      </TabsContent>
    </Tabs>
    </div>
    </>
  );
}
export default InputSection; 