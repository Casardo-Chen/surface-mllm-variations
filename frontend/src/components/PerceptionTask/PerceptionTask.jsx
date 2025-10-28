import ReactMarkdown from "react-markdown";
import { useEffect, useState } from 'react'

import './PerceptionTask.scss';

import {
  Box,
} from "@mui/material";

import usePerceptionStore from '../../store/use-perception-store';
import useUserStudyStore from '../../store/use-user-study-store';
import useSystemStore from '../../store/use-system-store.tsx';

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
                <div className="react-markdown">
                  <ReactMarkdown>{item.description}</ReactMarkdown>
                </div>
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
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse", 
            overflow: "hidden",
            marginBottom: "16px"
          }}>
              <thead
              style={{ backgroundColor: "#f4f4f4" }}
              >
                  <tr>
                      <th style={{ border: "2px solid #ccc", padding: "8px" }}>Focus</th>
                      <th style={{ border: "2px solid #ccc", padding: "8px" }}>Variation Summary</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td style={{ border: "2px solid #ccc", padding: "8px" }}>Agreements</td>
                      <td style={{ border: "2px solid #ccc", padding: "8px" , textAlign: "left" }}>
                          <div className="react-markdown">
                              <ReactMarkdown>
                                  {data?.similarity}
                              </ReactMarkdown>
                          </div>
                      </td>
                  </tr>
                  <tr>
                      <td style={{ border: "2px solid #ccc", padding: "8px" }}>Disagreements</td>
                      <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }}>
                          <div className="react-markdown">
                              <ReactMarkdown>
                                  {data?.disagreement}
                              </ReactMarkdown>
                          </div>
                      </td>
                  </tr>
                  <tr>
                      <td style={{ border: "2px solid #ccc", padding: "8px" }}>Unique Points</td>
                      <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }} aria-label='model-specific'>
                          <div className="react-markdown">
                              <ReactMarkdown>
                                  {data?.uniqueness}
                              </ReactMarkdown>
                          </div>
                      </td>
                  </tr>
              </tbody>
          </table>
          <table style={{ width: "100%", borderCollapse: "collapse", overflow: "hidden" }}>
              <thead
              style={{ backgroundColor: "#f4f4f4" }}
              >
                  <tr>
                      <th style={{ border: "2px solid #ccc", padding: "8px" }}>Supoort Indicator</th>
                      <th style={{ border: "2px solid #ccc", padding: "8px" }}>Variation-aware Description</th>
                  </tr>
              </thead>
              <tbody>
                  {/* Detail Summary */}
                  <tr>
                      <td style={{ border: "2px solid #ccc", padding: "8px" }}>
                        <div className="detail-summary-header">
                          <div className="representation-type-buttons">
                            <button 
                              className={`representation-btn ${representationType === "none" ? "active" : ""}`}
                              onClick={() => {setRepresentationType("none");}}
                            >
                              Variation Only
                            </button>
                            <button 
                              className={`representation-btn ${representationType === "model" ? "active" : ""}`}
                              onClick={() => {setRepresentationType("model");}}
                            >
                              Model Source 
                            </button>
                            <button 
                              className={`representation-btn ${representationType === "percentage" ? "active" : ""}`}
                              onClick={() => {setRepresentationType("percentage");}}
                            >
                              Percentage
                            </button>
                            <button 
                              className={`representation-btn ${representationType === "natural" ? "active" : ""}`}
                              onClick={() => {setRepresentationType("natural");}}
                            >
                              Language
                            </button>
                          </div>
                        </div>
                      </td>
                      <td style={{ border: "2px solid #ccc", padding: "8px", textAlign: "left" }} aria-label='variation'>
                          <div className="react-markdown">
                              <ReactMarkdown>
                                  { representationType === "model" ? data?.model_diff :
                                    representationType === "none" ? data?.var_only :
                                    representationType === "percentage" ? data?.percentage :
                                    representationType === "natural" && data?.nl
                                  }             
                              </ReactMarkdown>
                          </div>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
  );
}

function PerceptionTask() {
  const [rawDescriptions, setRawDescriptions] = useState({});
  const [variationDescription, setVariationDescription] = useState({});


  useEffect( () => {
    async function fetchData() {

      await fetch(`/data/home/descriptions.json`).then(res => res.json()).then(res => setRawDescriptions(res))
      await fetch(`/data/home/summary.json`).then(res => res.json()).then(res => setVariationDescription(res))
      await fetch(`/data/home/metadata.json`).then(res => res.json()).then(res => setCurrentMetaData(res))
    }
    fetchData();
  }, []);

  return (
      <Box
        sx={{
          // width: "80vw",
          width: "100%",
          // position: "fixed",
          top: 0,
          // left: "20vw",
          left: 0,
          padding: 3,
          overflowY: "auto",
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
          <div aria-label='description' style={{ textAlign: "left" }}>
              <VariationDescriptionCard data={variationDescription} />
              <DescriptionTable data={rawDescriptions} /> 
          </div>
      </Box>

  );
}

export default PerceptionTask;
