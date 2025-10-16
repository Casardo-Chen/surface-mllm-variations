import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react'
import InputSection from '../InputSection/InputSection.jsx';
import DataCard from '../DataCard/DataCard.jsx';
import {  Box, 
          TextField
        } from "@mui/material";
import VariationDescriptionCard from '../VariationDescriptionCard/VariationDescriptionCard.jsx';
import OriginalDescriptionCard from '../OriginalDescriptionCard/OriginalDescriptionCard.jsx';
import DescriptionTable from '../DescriptionTable/DescriptionTable.jsx';
import AppBar from '../AppBar/AppBar.jsx';

import './ExplorationTask.scss';

import useSystemStore from '../../store/use-system-store.tsx'
import useUserStudyStore from '../../store/use-user-study-store.tsx';


function ExplorationTask() {
  const [ question, setQuestion ] = useState("");
  const { 
    currentId,
    viewMode, 
    variationSummary,
    responses
  } = useSystemStore();
  const { userId } = useUserStudyStore();
  const navigate = useNavigate();


  return (
    <div className="app-container">
      {/* Left Panel: Input Section */}
      <div
        style={{
          width: "25vw",
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          backgroundColor: "#f4f4f4", 
          borderRight: '2px solid #ccc',
          overflowY: "auto", 
          boxSizing: "border-box",
        }}
      >
        <InputSection/>
        <div>
        <button
            onClick={() => {
              navigate(`/perception`);
            }}
            style={{marginTop: "8px"}}
          >
            Perception Task
        </button>
        </div>
        <button
            onClick={() => {
              navigate(`/`);
            }}
            style={{marginTop: "8px"}}
          >
            Exit
        </button>

      </div>

      <Box sx={{  
        width: "75vw",
        position: "fixed",
        top: 0,
        left: "25vw",
        padding: 1, 
        overflowY: "auto", 
        height: "100vh",
        boxSizing: "border-box",
        }}>
        {/* Top Bar */}
        <VariationDescriptionCard data={variationSummary} />
        {/* <div style={{ marginTop: "16px", border: "2px solid #ccc", padding: "8px" }}>
          <h4>Ask a Question</h4>
          <TextField
            fullWidth
            aria-label="Type your verification question here"
            variant="outlined"
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <button
            onClick={() => {
              console.log("Submit Question");
            }}
            style={{ width: "100%" }}
          >
            Submit Question
          </button>
        </div> */}
        <DescriptionTable data={responses} />

      </Box>
    </div>
  )
}

export default ExplorationTask