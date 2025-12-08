import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useEffect, useState } from 'react'

import './PerceptionTask.scss';

import {
  Box,
} from "@mui/material";

import usePerceptionStore from '../../store/use-perception-store';
import useSystemStore from '../../store/use-system-store.tsx';

import { getModelName, highlightVariations } from '../../utils/helper';


function DescriptionTable({ data }) {
  const models = [...new Set(Object.values(data).map((item) => item.model))];
  const prompts = [...new Set(Object.values(data).map((item) => item.prompt))];
  
  // Use global filter states
  const { selectedModels, setSelectedModels, showColorUncertaintyIndicator } = useSystemStore();
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
        <thead
          style={{ backgroundColor: "#f4f4f4" }}
        >
          <tr>
            <th style={{ 
              border: "2px solid #ccc", 
              padding: "8px",
              width: "5%"
            }}>ID</th>
            <th style={{ 
              border: "2px solid #ccc", 
              padding: "8px",
              width: "10%"
            }}>Model</th>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>
              Description
            </th>

            {/* <th style={{ border: "2px solid #ccc", padding: "8px" }}>Prompt</th> */}
          </tr>
        </thead>
        <tbody style={{ fontFamily: "monospace" }}>
          {filteredData.map(([id, item]) => (
            <tr key={id}>
              
              <td style={{ border: "2px solid #ccc", padding: "8px" }}>{id}</td>
              <td style={{ border: "2px solid #ccc", padding: "8px" }}>
                {getModelName(item.model)} 
              </td>
              <td style={{ 
                border: "2px solid #ccc", 
                padding: "8px",
                maxHeight: "500px",
                overflowY: "auto",
                overflowX: "hidden",
                wordWrap: "break-word"
              }}>
                <div className="react-markdown">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {showColorUncertaintyIndicator ? highlightVariations(item.description) : item.description}
                  </ReactMarkdown>
                </div>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VariationSummary({data}) {
  const { showColorUncertaintyIndicator } = useSystemStore();
  return (
    <div className="variation-description-container">
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse", 
        overflow: "hidden",
        marginBottom: "16px"
      }}>
        <thead style={{ backgroundColor: "#f4f4f4" }}>
          <tr>
            <th style={{ 
              border: "2px solid #ccc", 
              padding: "8px",
              width: "15%"
            }}>Focus</th>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>Variation Summary</th>
          </tr>
        </thead>
        <tbody style={{ fontFamily: "monospace" }}>
          <tr>
            <td style={{ border: "2px solid #ccc", padding: "8px" }}>Agreements</td>
            <td style={{ 
              border: "2px solid #ccc", 
              padding: "8px", 
              textAlign: "left",
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word"
            }}>
              <div className="react-markdown">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {showColorUncertaintyIndicator ? highlightVariations(data?.similarity) : data?.similarity}
                </ReactMarkdown>
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ border: "2px solid #ccc", padding: "8px" }}>Disagreements</td>
            <td style={{ 
              border: "2px solid #ccc", 
              padding: "8px", 
              textAlign: "left",
              maxHeight: "500px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word"
            }}>
              <div className="react-markdown">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {showColorUncertaintyIndicator ? highlightVariations(data?.disagreement) : data?.disagreement}
                </ReactMarkdown>
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ border: "2px solid #ccc", padding: "8px" }}>Unique Points</td>
            <td style={{ 
              border: "2px solid #ccc", 
              padding: "8px", 
              textAlign: "left",
              maxHeight: "500px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word"
            }} aria-label='model-specific'>
              <div className="react-markdown">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {showColorUncertaintyIndicator ? highlightVariations(data?.uniqueness) : data?.uniqueness}
                </ReactMarkdown>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function VariationAwareDescription({data}) {
  const {
    representationType,
    setRepresentationType,
  } = usePerceptionStore();
  const { showColorUncertaintyIndicator } = useSystemStore();

  return (
    <div className="variation-description-container">
      <table style={{ width: "100%", borderCollapse: "collapse", overflow: "hidden" }}>
        <thead style={{ backgroundColor: "#f4f4f4" }}>
          <tr>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>Support Indicator</th>
            <th style={{ border: "2px solid #ccc", padding: "8px" }}>Variation-aware Description</th>
          </tr>
        </thead>
        <tbody style={{ fontFamily: "monospace" }}>
          <tr>
            <td style={{ 
              border: "2px solid #ccc", 
              padding: "8px",
              width: "15%"
            }}>
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
            <td style={{ 
              border: "2px solid #ccc", 
              padding: "8px", 
              textAlign: "left",
              maxHeight: "500px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word"
            }} aria-label='variation'>
              <div className="react-markdown">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {showColorUncertaintyIndicator ? highlightVariations(
                    representationType === "model" ? data?.model_diff :
                    representationType === "none" ? data?.var_only :
                    representationType === "percentage" ? data?.percentage :
                    representationType === "natural" && data?.nl
                  ) : (
                    representationType === "model" ? data?.model_diff :
                    representationType === "none" ? data?.var_only :
                    representationType === "percentage" ? data?.percentage :
                    representationType === "natural" && data?.nl
                  )}             
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
  const {
    responses,
    setResponses,
    variationSummary,
    setVariationSummary,
    currentImage,
    setCurrentImage,
    showVariationSummary,
    showVariationAwareDescription,
    showDescriptionList
  } = useSystemStore();

  useEffect(() => {
    const targetImage = currentImage || 'home';
    if (!currentImage) {
      setCurrentImage('home');
    }

    async function fetchData() {
      try {
        const [descriptionsRes, summaryRes] = await Promise.all([
          fetch(`/examples/${targetImage}/descriptions.json`),
          fetch(`/examples/${targetImage}/summary.json`)
        ]);

        if (descriptionsRes.ok) {
          const desc = await descriptionsRes.json();
          setResponses(desc);
        }

        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          setVariationSummary(summary);
        }
      } catch (error) {
        console.error('Failed to load perception data', error);
      }
    }

    fetchData();
  }, [currentImage, setCurrentImage, setResponses, setVariationSummary]);

  return (
    <Box
      sx={{
        width: "100%",
        top: 0,
        left: 0,
        padding: 3,
        overflowY: "auto",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div aria-label='description' style={{ textAlign: "left" }}>
        {showVariationSummary && <VariationSummary data={variationSummary} />}
        {showVariationAwareDescription && <VariationAwareDescription data={variationSummary} />}
        {showDescriptionList && <DescriptionTable data={responses} />}
      </div>
    </Box>
  );
}

export default PerceptionTask;
