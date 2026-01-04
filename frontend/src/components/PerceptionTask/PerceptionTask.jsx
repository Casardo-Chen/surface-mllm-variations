import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useEffect, useState } from 'react'

import './PerceptionTask.scss';

import {
  Box,
} from "@mui/material";

import useSystemStore from '../../store/use-system-store.tsx';

import { getModelName, highlightVariations } from '../../utils/helper';
import AppBar from '../AppBar/AppBar.jsx';


function DescriptionTable({ data, imageLink }) {
  const models = [...new Set(Object.values(data || {}).map((item) => item.model))];
  const prompts = [...new Set(Object.values(data || {}).map((item) => item.prompt))];
  
  // Use global filter states
  const { 
    selectedModels, 
    setSelectedModels, 
    showColorUncertaintyIndicator,
    setShowColorUncertaintyIndicator,
    showDescriptionList,
    setShowDescriptionList
  } = useSystemStore();
  const [selectedPrompts, setSelectedPrompts] = useState([...prompts]);
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  const filteredData = Object.entries(data || {}).filter(([id, item]) => {
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
  Object.entries(data || {}).forEach(([id, item]) => {
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
  const maxTrials = Object.values(entriesByModel).length > 0 
    ? Math.max(...Object.values(entriesByModel).map(entries => entries.length))
    : 0;

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

  const renderControlTable = () => (
    <table className="description-table" aria-label="description-table-controls">
      <tbody>
        <tr>
          <td style={{ backgroundColor: '#f4f4f4', fontWeight: 600, width: '15%' }}>Filter Models</td>
          <td>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              {models.map((model) => (
                <label key={model} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
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
                    style={{ cursor: "pointer" }}
                  />
                  <span>{getModelName(model)}</span>
                </label>
              ))}
            </div>
          </td>
        </tr>
        <tr>
          <td style={{ backgroundColor: '#f4f4f4', fontWeight: 600, width: '20%' }}>View Mode</td>
          <td>
            <div 
              style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}
              className="view-mode-buttons"
            >
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="viewMode"
                  value="list"
                  checked={viewMode === "list"}
                  onChange={(e) => setViewMode(e.target.value)}
                  style={{ cursor: "pointer" }}
                />
                <span>List View</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="viewMode"
                  value="grid"
                  checked={viewMode === "grid"}
                  onChange={(e) => setViewMode(e.target.value)}
                  style={{ cursor: "pointer" }}
                />
                <span>Grid View</span>
              </label>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const renderListView = () => (
    <table className="description-table">
      <thead>
        <tr>
          <th style={{ width: "5%" }}>ID</th>
          <th style={{ width: "15%" }}>Model</th>
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
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word"
            }}>
              {imageLink ? (
                <div className="react-markdown">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {showColorUncertaintyIndicator ? highlightVariations(item.description) : item.description}
                  </ReactMarkdown>
                </div>
              ) : null}
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
                      maxHeight: "300px",
                      overflowY: "auto",
                      overflowX: "hidden",
                      wordWrap: "break-word",
                      verticalAlign: "top"
                    }}
                  >
                    {itemMatches ? (
                      imageLink ? (
                        <div className="react-markdown">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {showColorUncertaintyIndicator ? highlightVariations(item.description) : item.description}
                          </ReactMarkdown>
                        </div>
                      ) : null
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
      {renderControlTable()}
      {viewMode === "list" ? renderListView() : renderGridView()}
    </div>
  );
}

function VariationSummary({data, imageLink}) {
  const { showColorUncertaintyIndicator } = useSystemStore();
  return (
    <div className="variation-description-container">
      <table className="variation-summary-table" style={{ marginBottom: "16px" }}>
        <thead>
          <tr>
            <th style={{ width: "20%" }}>Focus</th>
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
              {imageLink ? (
                <div className="react-markdown">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {showColorUncertaintyIndicator ? highlightVariations(data?.similarity) : data?.similarity}
                  </ReactMarkdown>
                </div>
              ) : null}
            </td>
          </tr>
          <tr>
            <td>Disagreements</td>
            <td style={{ 
              textAlign: "left",
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word"
            }}>
              {imageLink ? (
                <div className="react-markdown">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {showColorUncertaintyIndicator ? highlightVariations(data?.disagreement) : data?.disagreement}
                  </ReactMarkdown>
                </div>
              ) : null}
            </td>
          </tr>
          <tr>
            <td>Unique Points</td>
            <td style={{ 
              textAlign: "left",
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word"
            }} aria-label='model-specific'>
              {imageLink ? (
                <div className="react-markdown">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {showColorUncertaintyIndicator ? highlightVariations(data?.uniqueness) : data?.uniqueness}
                  </ReactMarkdown>
                </div>
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function VariationAwareDescription({data, imageLink}) {
  const {
    representationType,
    setRepresentationType,
    showColorUncertaintyIndicator
  } = useSystemStore();

  return (
    <div className="variation-description-container">
      <table className="variation-aware-table">
        <thead>
          <tr>
            <th>Support Indicator</th>
            <th>Variation-Aware Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ width: "20%" }}>
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
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "hidden",
              wordWrap: "break-word"
            }} aria-label='variation'>
              {imageLink ? (
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
              ) : null}
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
    imageLink,
    setImageLink,
    showVariationSummary,
    showVariationAwareDescription,
    showDescriptionList
  } = useSystemStore();
  const [gridView, setGridView] = useState(true);

  // Helper function to check if variationSummary has meaningful content
  const hasVariationSummaryContent = (summary) => {
    if (!summary || typeof summary !== 'object') return false;
    const hasSimilarity = summary.similarity && summary.similarity.trim() !== '';
    const hasDisagreement = summary.disagreement && summary.disagreement.trim() !== '';
    const hasUniqueness = summary.uniqueness && summary.uniqueness.trim() !== '';
    return hasSimilarity || hasDisagreement || hasUniqueness;
  };

  // Helper function to check if responses has meaningful content
  const hasResponsesContent = (responses) => {
    if (!responses || typeof responses !== 'object') return false;
    return Object.keys(responses).length > 0;
  };

  useEffect(() => {
    // Only load example data if currentImage is set (i.e., we're viewing an example)
    // Don't load default data when in "Try it out!" mode (when currentImage is empty)
    if (!currentImage) {
      return;
    }

    async function fetchData() {
      try {
        const [metadataRes, descriptionsRes, summaryRes] = await Promise.all([
          fetch(`/examples/${currentImage}/metadata.json`),
          fetch(`/examples/${currentImage}/descriptions.json`),
          fetch(`/examples/${currentImage}/summary.json`)
        ]);

        if (metadataRes.ok) {
          const jsonData = await metadataRes.json();
          setImageLink(jsonData.image || '');
        }

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
  }, [currentImage, setResponses, setVariationSummary, setImageLink]);

  return (
    <Box
      sx={{
        width: "100%",
        top: 0,
        left: 0,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingBottom: "16px",
        overflowY: "auto",
        height: "100vh",
        boxSizing: "border-box",
        overflowX: "hidden",
        position: "relative",
        borderRadius: "16px",
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
      
      <div aria-label='descriptions' style={{ textAlign: "left", marginTop: "12px"}}>
        {imageLink && variationSummary && hasVariationSummaryContent(variationSummary) && showVariationSummary && <VariationSummary data={variationSummary} imageLink={imageLink} />}
        {imageLink && variationSummary && hasVariationSummaryContent(variationSummary) && showVariationAwareDescription && <VariationAwareDescription data={variationSummary} imageLink={imageLink} />}
        {imageLink && responses && hasResponsesContent(responses) && showDescriptionList && <DescriptionTable data={responses} imageLink={imageLink} />}
      </div>
    </Box>
  );
}

export default PerceptionTask;
