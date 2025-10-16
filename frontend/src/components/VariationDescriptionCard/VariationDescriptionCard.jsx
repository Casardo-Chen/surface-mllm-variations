import ReactMarkdown from "react-markdown";
import { useEffect, useState } from 'react'
import "./VariationDescriptionCard.scss";

import useSystemStore from "../../store/use-system-store";
import useResponsesStore from "../../store/use-responses-store";
import { getVariationDescription } from "../../utils/data-communicator.js";

export default function VariationDescriptionCard() {  
    const {
        currentImage,
        currentId,
        representationType,
        setRepresentationType,
        showVariations,
        setShowVariations,
        showModelDifferences,
        setShowModelDifferences,
      } = useSystemStore();
    
    const { responses } = useResponsesStore();
    
    // Use responses data instead of prop
    const data = responses;
  
    
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
                            Model Differences
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