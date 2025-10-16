import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  Divider
} from "@mui/material";
import { verifyAtomicFacts } from "../../utils/data-communicator.js";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useSystemStore from '../../store/use-system-store.tsx'
import useResponsesStore from "../../store/use-responses-store.jsx";

import "./AugmentedRepresentation.scss";
import { getGroupedAtomicFacts } from "../../utils/data-communicator.js";

  
const Sentence = ({ sentence, atomicFacts, atomicFactGroup }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    console.log("atomicFacts", atomicFacts);
    console.log("atomicFactGroup", atomicFactGroup);


    return (
        <Box sx={{ marginBottom: 2 }}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderLeft: "2px solid #ccc",
                    backgroundColor: "#f5f5f5",
                }}
            >
                {sentence}
            </div>
            
            {isExpanded && atomicFacts && (
                <Box sx={{ paddingLeft: 3 }}>
                    {atomicFacts.map((fact, idx) => (
                        <AtomicFact 
                            key={idx} 
                            fact={fact}
                            atomicFactGroup={atomicFactGroup[idx]}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

const AtomicFact = ({ fact, atomicFactGroup }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const {
        representationType,
        showVariations,
        showModelDifferences,
      } = useSystemStore();

    const numToNatural = (num) => {
        if (num > 0.99) {
            return "certainly";
        }
        else if (num > 0.7) {
            return "likely";
        }
        else if (num > 0.5) {
            return "maybe";
        }
        else if (num > 0.3) {
            return "has a chance";
        }
        return "unlikely";
    }

    const getModelDifferences = (source) => {
        let gpt_count = 0;
        let claude_count = 0;
        let gemini_count = 0;
        source.forEach(model => {
            if (model[1] === "gpt") {
                gpt_count++;
            }
            if (model[1] === "claude") {
                claude_count++;
            }
            if (model[1] === "gemini") {
                gemini_count++;
            }
        });
        let result = "(";
        result += gpt_count > 0 ? " GPT: " + gpt_count + "/3" : "";
        result += claude_count > 0 ? " Claude: " + claude_count + "/3" : "";
        result += gemini_count > 0 ? " Gemini: " + gemini_count + "/3" : "";
        result += " )";

        if (result === "()") {
            return "";
        }
        return result;
    }

    const showIndicator = (source) => {
      console.log("source", source);
        if (representationType === "percentage") {
            return Math.round(source.length / 9 * 100) + "%";
        }
        if (representationType === "natural") {
            return numToNatural(source.length / 9);
        }
    }

    return (
        <Box sx={{ marginY: 1 }}>
            <div
                onClick={() => atomicFactGroup && setIsExpanded(!isExpanded)}
                style={{
                    cursor: atomicFactGroup ? "pointer" : "default",
                    padding: "4px",
                    borderLeft: "2px solid #ddd",
                    backgroundColor: "#ffffff",
                }}
            >
                {fact}
            </div>
            {showVariations && atomicFactGroup && (
                <Box sx={{ paddingLeft: 2 }}>
                    {Object.entries(atomicFactGroup).map(([key, value]) => (
                        <Typography key={key}>
                            {showIndicator(value.source)} {" "}
                            {value.value}{" "}
                            {showModelDifferences && getModelDifferences(value.source)}
                          </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
};


const ToolMenu = () => {
  const {
    representationType,
    setRepresentationType,
    showVariations,
    setShowVariations,
    showModelDifferences,
    setShowModelDifferences
  } = useSystemStore();

  return (
    <Box sx={{ 
      padding: "8px 16px",
      borderBottom: "1px solid #ccc",
      display: "flex",
      alignItems: "center",
      gap: 2,
      flexWrap: "wrap",
    }}>
      <ToggleButtonGroup
        value={representationType}
        sx={{
          backgroundColor: "white",
          color: "black",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
        exclusive
        onChange={(e, newValue) => newValue && setRepresentationType(newValue)}
        size="small"
      >
        <ToggleButton value="percentage">Percentage</ToggleButton>
        <ToggleButton value="natural">Natural Language</ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <FormControlLabel
        control={
          <Switch
            checked={showVariations}
            onChange={(e) => setShowVariations(e.target.checked)}
            size="small"
          />
        }
        label="Show Variations"
      />

      {showVariations && (
        <FormControlLabel
          control={
            <Switch
              checked={showModelDifferences}
              onChange={(e) => setShowModelDifferences(e.target.checked)}
              size="small"
            />
          }
          label="Show Model Differences"
        />
      )}

    </Box>
  );
};

// Main DataCard component
const AugmentedRepresentation = () => {

  const {
    currentImage,
    currentId
  } = useSystemStore();

  const { responses, groupedAtomicFacts, setGroupedAtomicFacts } = useResponsesStore();
  const [ currentResponse, seCurrentResponse] = useState(responses[currentId]);

  useEffect( () => {
      const fetchGrouped = async () => {
          try {
              const currentGroupedAtomicFacts = await getGroupedAtomicFacts(currentId, currentImage);
              setGroupedAtomicFacts(currentGroupedAtomicFacts);
              console.log("currentGroupedAtomicFacts", currentGroupedAtomicFacts);
              seCurrentResponse(responses[currentId]);
          } catch (error) {
              console.error("Error fetching aligned description:", error);
              // Handle error appropriately, maybe set an error state
          }
      };
      
      fetchGrouped();
  }
  , [currentId, responses]);


  return (
    <Card sx={{ 
      width: "100%",
      maxHeight: "90vh",
      margin: "16px auto", 
      boxShadow: "none", 
      border: "1px solid #ccc", 
      borderRadius: "4px"  }}>
      <ToolMenu />
      <CardContent
      >

        {/* Render based on mode */}
        <Box sx={{ 
          marginTop: 1,
          overflowY: "auto",
          textAlign: "left",
          maxHeight: "calc(90vh - 150px)",

        }}>
          {currentResponse.descriptive.map((sentence, idx) => (
                        <Sentence 
                            key={idx}
                            sentence={sentence}
                            atomicFacts={currentResponse.atomic_facts[idx]}
                            atomicFactGroup={groupedAtomicFacts[idx]}
                        />
                    ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AugmentedRepresentation;