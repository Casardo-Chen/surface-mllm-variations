"use client";

import { useEffect, useState } from 'react'
import './App.css'
import InputSection from '@/components/InputSection/InputSection.jsx';
import {  Box } from "@mui/material";
import VariationDescriptionCard from '@/components/VariationDescriptionCard/VariationDescriptionCard.jsx';
import PerceptionTask from '@/components/PerceptionTask/PerceptionTask.jsx';
import AppBar from '@/components/AppBar/AppBar.jsx';


import useSystemStore from '@/store/use-system-store'
import useResponsesStore from '@/store/use-responses-store'

export default function Home() {
  const { responses, setResponses } = useResponsesStore();
  const { 
    currentId,
    viewMode, 
  } = useSystemStore();
  const [gridView, setGridView] = useState(true);

  return (
    <div className="app-container">
      {/* Left Panel: Input Section */}
        <InputSection/>
      <Box sx={{  
        width: "70vw",
        position: "fixed",
        top: 0,
        left: "30vw",
        padding: 0, 
        overflowY: "auto", 
        height: "100vh",
        boxSizing: "border-box",
        }}>
        {/* Top Bar */}
        <AppBar gridView={gridView} setGridView={setGridView} />
        {/* Main Content */}
            <PerceptionTask />
      </Box>
    </div>
  )
}
