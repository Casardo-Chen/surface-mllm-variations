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
import AppBar from '../AppBar/AppBar.jsx';


function DescriptionTable({ data }) {
  const models = [...new Set(Object.values(data).map((item) => item.model))];
  const prompts = [...new Set(Object.values(data).map((item) => item.prompt))];
  
  // Use global filter states
  const { selectedModels, setSelectedModels, showColorUncertaintyIndicator } = useSystemStore();
  const [selectedPrompts, setSelectedPrompts] = useState([...prompts]);
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  const filteredData = Object.entries(data).filter(([id, item]) => {
    const modelMatch =
      selectedModels.length === 0 || selectedModels.includes(item.model);
    const promptMatch =
      selectedPrompts.length === 0 || selectedPrompts.includes(item.prompt);
    return modelMatch && promptMatch;
  });

  // For grid view: organize data by trial number (row) and model (column)
  const filteredModels = models.filter(model => 
    selectedModels.length === 0 || selectedModels.includes(model)
  );
  
  // Group entries by model to determine trial numbers
  // Each model's entries are numbered sequentially (1st, 2nd, 3rd, etc.)
  const entriesByModel = {};
  Object.entries(data).forEach(([id, item]) => {
    if (!entriesByModel[item.model]) {
      entriesByModel[item.model] = [];
    }
    entriesByModel[item.model].push({ id, ...item });
  });

  // Sort entries within each model by their ID
  Object.keys(entriesByModel).forEach(model => {
    entriesByModel[model].sort((a, b) => {
      const numA = parseInt(a.id) || 0;
      const numB = parseInt(b.id) || 0;
      return numA - numB;
    });
  });

  // Find the maximum number of trials across all models
  const maxTrials = Math.max(...Object.values(entriesByModel).map(entries => entries.length));

  // Create a map for quick lookup: trialNumber -> model -> description
  // Trial numbers are 1-indexed (1, 2, 3, ...)
  const gridDataMap = {};
  Object.keys(entriesByModel).forEach(model => {
    entriesByModel[model].forEach((entry, index) => {
      const trialNumber = index + 1; // 1-indexed
      if (!gridDataMap[trialNumber]) {
        gridDataMap[trialNumber] = {};
      }
      gridDataMap[trialNumber][model] = entry;
    });
  });

  // Generate array of trial numbers (1, 2, 3, ..., maxTrials)
  const trialNumbers = Array.from({ length: maxTrials }, (_, i) => i + 1);

  const renderListView = () => (
    <table className="description-table">
      <thead>
        <tr>
          <th style={{ width: "5%" }}>ID</th>
          <th style={{ width: "10%" }}>Model</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map(([id, item]) => (
          <tr key={id}>
            <td>{id}</td>
            <td>
              {getModelName(item.model)} 
            </td>
            <td style={{ 
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
  );

  const renderGridView = () => (
    <table className="description-table">
      <thead>
        <tr>
          <th style={{ width: "5%" }}>Trial</th>
          {filteredModels.map((model) => (
            <th 
              key={model}
              style={{ textAlign: "center" }}
            >
              {getModelName(model)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {trialNumbers.map((trialNumber) => {
          // Check if this row has any data matching the filters
          const rowData = gridDataMap[trialNumber] || {};
          const hasMatchingData = filteredModels.some(model => {
            const item = rowData[model];
            if (!item) return false;
            const promptMatch = selectedPrompts.length === 0 || selectedPrompts.includes(item.prompt);
            return promptMatch;
          });
          
          // Only show row if it has matching data or if no filters are applied
          if (!hasMatchingData && (selectedModels.length > 0 || selectedPrompts.length < prompts.length)) {
            return null;
          }
          
          return (
            <tr key={trialNumber}>
              <td style={{ 
                fontWeight: "bold",
                textAlign: "center"
              }}>
                {trialNumber}
              </td>
              {filteredModels.map((model) => {
                const item = rowData[model];
                // Check if item matches filters
                const itemMatches = item && (
                  (selectedPrompts.length === 0 || selectedPrompts.includes(item.prompt))
                );
                
                return (
                  <td 
                    key={model}
                    style={{ 
                      maxHeight: "500px",
                      overflowY: "auto",
                      overflowX: "hidden",
                      wordWrap: "break-word",
                      verticalAlign: "top"
                    }}
                  >
                    {itemMatches ? (
                      <div className="react-markdown">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                          {showColorUncertaintyIndicator ? highlightVariations(item.description) : item.description}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

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
        
        <div style={{ marginTop: "16px" }}>
          <label style={{ marginRight: "12px", fontWeight: "bold" }}>View Mode:</label>
          <div className="representation-type-buttons" style={{ width: "auto", display: "inline-flex" }}>
            <button 
              className={`representation-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => {setViewMode("list");}}
            >
              List View
            </button>
            <button 
              className={`representation-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => {setViewMode("grid");}}
            >
              Grid View
            </button>
          </div>
        </div>
      </div>
      {viewMode === "list" ? renderListView() : renderGridView()}
    </div>
  );
}

function VariationSummary({data}) {
  const { showColorUncertaintyIndicator } = useSystemStore();
  return (
    <div className="variation-description-container">
      <table className="variation-summary-table" style={{ marginBottom: "16px" }}>
        <thead>
          <tr>
            <th style={{ width: "15%" }}>Focus</th>
            <th>Variation Summary</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Agreements</td>
            <td style={{ 
              textAlign: "left",
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word",
            }}>
              <div className="react-markdown">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {showColorUncertaintyIndicator ? highlightVariations(data?.similarity) : data?.similarity}
                </ReactMarkdown>
              </div>
            </td>
          </tr>
          <tr>
            <td>Disagreements</td>
            <td style={{ 
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
            <td>Unique Points</td>
            <td style={{ 
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
      <table className="variation-aware-table">
        <thead>
          <tr>
            <th>Support Indicator</th>
            <th>Variation-aware Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ width: "15%" }}>
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
  const [gridView, setGridView] = useState(true);

  useEffect(() => {
    const targetImage = currentImage || 'map';
    if (!currentImage) {
      setCurrentImage('map');
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
        marginTop: "16px",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingBottom: "16px",
        overflowY: "auto",
        height: "100vh",
        boxSizing: "border-box",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Sticky AppBar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "transparent",
          paddingTop: 0,
        }}
      >
        <AppBar gridView={gridView} setGridView={setGridView} />
      </Box>
      
      <div aria-label='description' style={{ textAlign: "left", marginTop: "12px" }}>
        {showVariationSummary && <VariationSummary data={variationSummary} />}
        {showVariationAwareDescription && <VariationAwareDescription data={variationSummary} />}
        {showDescriptionList && <DescriptionTable data={responses} />}
      </div>
    </Box>
  );
}

export default PerceptionTask;
