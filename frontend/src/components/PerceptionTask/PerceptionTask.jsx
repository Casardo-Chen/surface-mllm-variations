import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from 'react'

import './PerceptionTask.scss';

import {
  Box,
} from "@mui/material";

import usePerceptionStore from '../../store/use-perception-store';
import useUserStudyStore from '../../store/use-user-study-store';
import useSystemStore from '../../store/use-system-store.tsx';

import { getImageDescriptions, getVariationDescription} from '../../utils/data-communicator';
import { imageInfo, participantCondition } from '../../utils/data';
import { getModelName } from '../../utils/helper';


function DescriptionTable({ data }) {
  const models = [...new Set(Object.values(data).map((item) => item.model))];
  const prompts = [...new Set(Object.values(data).map((item) => item.prompt))];
  
  // Use global filter states
  const { selectedModels, setSelectedModels } = useSystemStore();
  const [selectedPrompts, setSelectedPrompts] = useState([...prompts]);

  const filteredData = Object.entries(data).filter(([id, item]) => {
    const modelMatch =
      selectedModels.length === 0 || selectedModels.includes(item.model);
    const promptMatch =
      selectedPrompts.length === 0 || selectedPrompts.includes(item.prompt);
    return modelMatch && promptMatch;
  });

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <label>
          Filter by Model:
          <div>
            {models.map((model) => (
              <label key={model} style={{ marginTop: "8px", marginRight: "8px" }}>
                <input
                  type="checkbox"
                  value={model}
                  checked={selectedModels.includes(model)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModels([...selectedModels, model]);
                    } else {
                      setSelectedModels(selectedModels.filter((m) => m !== model));
                    }
                  }}
                />
                {getModelName(model)}
              </label>
            ))}
          </div>
        </label>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", overflow: "hidden" }}>
        <thead>
          <tr>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>Model</th>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>
              Description
            </th>

            {/* <th style={{ border: "2px solid #ccc", padding: "8px" }}>Prompt</th> */}
          </tr>
        </thead>
        <tbody>
          {filteredData.map(([id, item]) => (
            <tr key={id}>
              
              <td style={{ border: "2px solid #ccc", padding: "8px" }}>{id}</td>
              <td style={{ border: "2px solid #ccc", padding: "8px" }}>
                {getModelName(item.model)} 
              </td>
              <td style={{ border: "2px solid #ccc", padding: "8px" }}>
                <ReactMarkdown>{item.description}</ReactMarkdown>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VariationDescriptionCard({data}) {  
  const {
      currentImage,
      currentId,
      representationType,
      setRepresentationType,
      showVariations,
      setShowVariations,
      showModelDifferences,
      setShowModelDifferences,
    } = usePerceptionStore();

  
  return (
      <div className="variation-description-container">
          <table style={{ width: "100%", borderCollapse: "collapse", overflow: "hidden" }}>
              <thead>
                  <tr>
                      <th style={{ border: "2px solid #ccc", padding: "8px" }}>Type</th>
                      <th style={{ border: "2px solid #ccc", padding: "8px" }}>Description</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td style={{ border: "2px solid #ccc", padding: "8px" }}>Agreements</td>
                      <td style={{ border: "2px solid #ccc", padding: "8px" , textAlign: "left" }}>
                          <ReactMarkdown>
                              {data?.similarity}
                          </ReactMarkdown>
                      </td>
                  </tr>
                  <tr>
                      <td style={{ border: "2px solid #ccc", padding: "8px" }}>Disagreements</td>
                      <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }}>
                          <ReactMarkdown>
                              {data?.disagreement}
                          </ReactMarkdown>
                      </td>
                  </tr>
                  <tr>
                      <td style={{ border: "2px solid #ccc", padding: "8px" }}>Model-Specific Interpretation</td>
                      <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }} aria-label='model-specific'>
                          <ReactMarkdown>
                              {data?.uniqueness}
                          </ReactMarkdown>
                      </td>
                  </tr>
                  <tr>
                      <td style={{ border: "2px solid #ccc", padding: "8px" }}> Detail Summary
                        <button 
                          onClick={() => {setRepresentationType("model");}}
                          >
                          Model Source Indicator
                        </button>
                        <button 
                          onClick={() => {setRepresentationType("percentage");}}
                        >
                          Percentage Indicator
                        </button>
                        <button 
                          onClick={() => {setRepresentationType("natural");}}
                        >
                          Language Indicator
                        </button>
                        <button 
                          onClick={() => {setRepresentationType("none");}}
                        >
                          Variation Only
                        </button>
                      </td>
                      <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }} aria-label='variation'>
                          <ReactMarkdown>
                              { representationType === "model" ? data?.model_diff :
                                representationType === "none" ? data?.var_only :
                                representationType === "percentage" ? data?.percentage :
                                representationType === "natural" && data?.nl
                              }             
                          </ReactMarkdown>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
  );
}

function PerceptionTask() {
  const [condition, setCondition] = useState(0);  // 0: tutorial, 1: group 1, 2: list, 3: variation
  const groupNum = 1; // IMPORTANT: this should be set to the group number of the participant before the study // 0: group 1, 1: group 2, 2: group 3
  const { userId } = useUserStudyStore();
  const [imageOptions, setImageOptions] = useState(imageInfo);
  const [imageIndex, setImageIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(imageOptions[0]);
  const [currentMetaData, setCurrentMetaData] = useState({});
  const [rawDescriptions, setRawDescriptions] = useState({});
  const [variationDescription, setVariationDescription] = useState({});


  const navigate = useNavigate();

  useEffect( () => {
    // randomize the order of the imageInfo

    async function fetchData() {

        const firstImage = imageInfo[0]; // Keep first tutorial image in place 
        // const imagesToShuffle = [...imageInfo.slice(1, 10)]; // Get images 1-9
        
        // // Fisher-Yates shuffle algorithm
        // for (let i = imagesToShuffle.length - 1; i > 0; i--) {
        //   const j = Math.floor(Math.random() * (i + 1));
        //   [imagesToShuffle[i], imagesToShuffle[j]] = [imagesToShuffle[j], imagesToShuffle[i]];
        // }
        
        // // Reassemble the array with first image followed by shuffled images
        // const randomizedImages = [firstImage, ...imagesToShuffle, ...imageInfo.slice(10)];
        console.log("randomizedImages", imageInfo);
        setImageOptions(imageInfo);     
      // const responses = await getImageDescriptions(imageOptions[imageIndex].label.toLocaleLowerCase());

      await fetch(`/data/${imageOptions[imageIndex].label.toLocaleLowerCase()}/descriptions.json`).then(res => res.json()).then(res => setRawDescriptions(res))
      await fetch(`/data/${imageOptions[imageIndex].label.toLocaleLowerCase()}/summary.json`).then(res => res.json()).then(res => setVariationDescription(res))
      await fetch(`/data/${imageOptions[imageIndex].label.toLocaleLowerCase()}/metadata.json`).then(res => res.json()).then(res => setCurrentMetaData(res))
      setCondition(currentImage.condition);
    }

    fetchData();

  }, []);

    

  const handlePreviousImage = async () => {
      const previousOption = imageOptions[imageIndex - 1];
      if (imageIndex === 0) {
        // use tts to say that the task is complete
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance("You are at the first image. Please proceed to the next image.");
        utterThis.rate = 1;
        synth.speak(utterThis);
        return;
      }
      // const responses = await getImageDescriptions(imageOptions[imageIndex - 1].label.toLocaleLowerCase());
      // const responses = {
      //   descriptions: await fetch(`/data/${imageOptions[imageIndex - 1].label.toLocaleLowerCase()}/descriptions.json`).then(res => res.json()),
      //   metadata: await fetch(`/data/${imageOptions[imageIndex - 1].label.toLocaleLowerCase()}/metadata.json`).then(res => res.json()),
      //   variation: await fetch(`/data/${imageOptions[imageIndex - 1].label.toLocaleLowerCase()}/summary.json`).then(res => res.json())
      // };
      // setRawDescriptions(responses.descriptions);
      // setVariationDescription(responses.variation);
      // setCurrentMetaData(responses.metadata);
      await fetch(`/data/${imageOptions[imageIndex-1].label.toLocaleLowerCase()}/descriptions.json`).then(res => res.json()).then(res => setRawDescriptions(res))
      await fetch(`/data/${imageOptions[imageIndex-1].label.toLocaleLowerCase()}/summary.json`).then(res => res.json()).then(res => setVariationDescription(res))
      await fetch(`/data/${imageOptions[imageIndex-1].label.toLocaleLowerCase()}/metadata.json`).then(res => res.json()).then(res => setCurrentMetaData(res))
      setCondition(previousOption.condition);
      setImageIndex(imageIndex - 1);
      setCurrentImage(previousOption);


      // setCondition(participantCondition[groupNum][imageIndex-1]);
    };
    

  const handleNextImage = async () => {
      const nextOption = imageOptions[imageIndex + 1];
      if (!nextOption) {
        // use tts to say that the task is complete
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance("You have completed the task. Please proceed to the exploration task.");
        utterThis.rate = 1;
        synth.speak(utterThis);
        return;
      }

      // const responses = await getImageDescriptions(imageOptions[imageIndex + 1].label.toLocaleLowerCase());
      await fetch(`/data/${imageOptions[imageIndex+1].label.toLocaleLowerCase()}/descriptions.json`).then(res => res.json()).then(res => setRawDescriptions(res))
      await fetch(`/data/${imageOptions[imageIndex+1].label.toLocaleLowerCase()}/summary.json`).then(res => res.json()).then(res => setVariationDescription(res))
      await fetch(`/data/${imageOptions[imageIndex+1].label.toLocaleLowerCase()}/metadata.json`).then(res => res.json()).then(res => setCurrentMetaData(res))
      setCondition(nextOption.condition);
      setImageIndex(imageIndex + 1);
      setCurrentImage(nextOption);

      // setCondition(participantCondition[groupNum][imageIndex+1]);

    };


  return (
    <div className="app-container">
      {/* Left Panel: Input Section */}
      {/* <div
        style={{
          width: "20vw",
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          backgroundColor: "#f3f2ee", 
          borderRight: '2px solid #ccc',
          overflowY: "auto", 
          boxSizing: "border-box",
        }}
      >
        <div className="input-section">
          <h3 className="font-semibold">Participant ID: {userId}</h3>
          <div className="w-full" style={{ flexDirection: "row", display: "flex", width: "100%" }}>
            <div className="flex items-center space-x-2" style={{ flexDirection: "column", display: "flex", width: "100%" }}>
              <button
                onClick={handleNextImage}
                style={{ marginTop: "8px", width: "100%" }}
              >
                Next Image
              </button>
              <button
                onClick={() => {
                  navigate(`/exploration/${userId}`);
                }}
                style={{ marginTop: "8px" }}
              >
                Exploration Task
              </button>
            </div>
          </div>
        </div>
        <div className="image-preview">
          <img src={currentImage.url} 
          alt="Preview"
          />
      </div>
      </div> */}

      {/* Main Content */}
      <Box
        sx={{
          // width: "80vw",
          width: "100%",
          position: "fixed",
          top: 0,
          // left: "20vw",
          left: 0,
          padding: 3,
          overflowY: "auto",
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
         <div className="image-preview">
            <img src={currentMetaData.image}
              alt="Preview"
            />
         </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {/* <tr>
                <td style={{ border: "2px solid #ccc", padding: "8px", fontWeight: "bold" }}>Image</td>
                <td style={{ border: "2px solid #ccc", padding: "8px" }}>{imageIndex+1} {currentImage.label}</td>
              </tr> */}
              <tr>
                <td style={{ border: "2px solid #ccc", padding: "8px", fontWeight: "bold" }}>Scenario</td>
                <td style={{ border: "2px solid #ccc", padding: "8px" }}>{currentMetaData.scenario}</td>
              </tr>
              <tr>
                <td style={{ border: "2px solid #ccc", padding: "8px", fontWeight: "bold" }}>Prompt</td>
                <td style={{ border: "2px solid #ccc", padding: "8px" }}>{currentMetaData.prompt}</td>
              </tr>
            </tbody>
          </table>
          <div aria-label='description' style={{ textAlign: "left" }}>
          { 
          // (condition === 1 || condition === 0)  && 
          (
              <div style={{ marginTop: "8px"}}>
                {(() => {
                    // const randomKey = Object.keys(rawDescriptions)[Math.floor(Math.random() * Object.keys(rawDescriptions).length)];
                    const randomDescription = rawDescriptions[currentImage.baseline];
                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                        <th style={{ border: "2px solid #ccc", padding: "8px" }}>Model</th>
                        <th style={{ border: "2px solid #ccc", padding: "8px" }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                        <td style={{ border: "2px solid #ccc", padding: "8px" }}>{getModelName(randomDescription?.model)}</td>
                        <td style={{ border: "2px solid #ccc", padding: "8px" }}>
                          <ReactMarkdown>{randomDescription?.description}</ReactMarkdown>
                        </td>
                        </tr>
                      </tbody>
                      </table>
                    );
                })()}
              </div>
            )}
            { 
            // (condition === 2 || condition === 0 ) && 
            (
              <DescriptionTable data={rawDescriptions} /> 
            )}
            { 
            // (condition === 3 || condition === 0 || condition === 4) && 
            (
                <VariationDescriptionCard data={variationDescription} />
            )}            
          </div>
        <button
              onClick={handlePreviousImage}
              style={{ marginTop: "8px", width: "100%" }}
            >
              Previous Image
        </button>
        {
          imageIndex === imageOptions.length - 1 ? (
            <button
              onClick={() => {
                navigate(`/exploration`);
              }}
              style={{ marginTop: "8px" , width: "100%" }}
          >
            Exploration Task
          </button>
          ): (
          <>
            
            <button
              onClick={handleNextImage}
              style={{ marginTop: "8px", width: "100%" }}
            >
              Next Image
            </button>
          </>
          
          )
        }
      </Box>
    </div>
  );
}

export default PerceptionTask;
