import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

import { 
  ButtonGroup, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails } from "@mui/material";
import { verifyAtomicFacts } from "../../utils/data-communicator.js";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import useSystemStore from '../../store/use-system-store.tsx'

import "./OriginalDescriptionCard.scss";

const Sentence = ({ text }) => (
  <Typography variant="body2" sx={{ padding: "4px 0" }}>
    {text}
  </Typography>
);

// Component for atomic facts
const AtomicFact = ({ facts, model }) => {
  const {imageLink} = useSystemStore();
  const [verifiedFacts, setVerifiedFacts] = useState([]);

  const handleFactClick = async (fact) => {
    console.log('fact', fact);
    console.log('model', model);
    console.log('imageLink', imageLink);
    const verified = await verifyAtomicFacts(fact, imageLink, model);
    console.log('verified', verified);
    setVerifiedFacts(Array.isArray(verified) ? verified : [verified]);
    // use the browser's tts to read the verified result se
    const synth = window.speechSynthesis;
    verified.forEach((verifiedFact) => {
      const utterThis = new SpeechSynthesisUtterance(`${verifiedFact.model} - ${verifiedFact.verification}`);
      utterThis.rate = 5;
      synth.speak(utterThis);
    }
    );
  };


  return (
    <Box sx={{ paddingLeft: 2 }} className="atomic-fact-container">
      <div>
          {verifiedFacts.map((verifiedFact, index) => (
            <div key={index} style={{ color: verifiedFact.verification.includes("Yes" || "yes") ? "green" : "red" }}>
              {verifiedFact.model} - {verifiedFact.verification}
            </div>
          ))}
      </div>
      {facts.map((fact, index) => (
        <div key={index} 
        className="atomic-fact-item"
        onClick={() => handleFactClick(fact)}>
        {fact}
        </div>
      ))}
      
    </Box>
  );
};

// Main DataCard component
const OriginalDescriptionCard = ({ data, }) => {
  const [mode, setMode] = useState("response"); // "response" | "sentence" | "atomic_fact"
  const { detailLevel, setDetailLevel } = useSystemStore();
  

  // Extract descriptive sentences & atomic facts
  const sentences = data.descriptive;
  const atomicFacts = data.atomic_facts || {};

  useEffect(() => {
    console.log('detailLevel', detailLevel);
    setMode(detailLevel);
  }, [detailLevel]);

  return (
<div className="description-cell">
      <CardContent>
        <div className="data-card-header"
        >
          <Typography variant="h6">{data.model.toUpperCase()}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            ID: {data.id}
          </Typography>
        </div>

        {/* Render based on mode */}
        <Box sx={{ 
          marginTop: 1,
          textAlign: "left",

        }}>
          <Typography variant="subtitle2" color="textSecondary" sx={{ textAlign: "left" , marginTop: 2}}>
            Prompt: {data.prompt}
          </Typography>
          {mode === "response" && <ReactMarkdown>{data.description}</ReactMarkdown>}

          {mode === "sentence" && sentences.map((sentence, idx) => (
            <Sentence key={idx} text={sentence} />
          ))}

          {mode === "atomic" &&
            Object.entries(atomicFacts).map(([sentenceIndex, facts]) => (
              <Accordion key={sentenceIndex} 
                sx={{ 
                  marginTop: 1, 
                  boxShadow: "none", 
                  border: "1.5px solid #ccc",
                  borderRadius: "8px" 
                  }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {sentences[parseInt(sentenceIndex)]}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <AtomicFact facts={facts} model={data.model} />
                </AccordionDetails>
              </Accordion>
            ))}
        </Box>
      </CardContent>
    </div>
  );
};

export default OriginalDescriptionCard;
