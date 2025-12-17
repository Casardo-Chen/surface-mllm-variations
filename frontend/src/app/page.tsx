"use client";

import { useEffect, useState } from 'react'
import './App.css'
import InputSection from '@/components/InputSection/InputSection.jsx';
import {  Box, useTheme, useMediaQuery } from "@mui/material";
import PerceptionTask from '@/components/PerceptionTask/PerceptionTask.jsx';
import useSystemStore from '@/store/use-system-store'

export default function Home() {
  const { 
    currentId,
    viewMode, 
  } = useSystemStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(768));

  return (
    <div className="app-container">
      {/* Left Panel: Input Section */}
      <InputSection/>
      {/* Main Content */}
      <Box sx={{  
        width: isMobile ? "100vw" : "70vw",
        position: "fixed",
        top: 0,
        left: isMobile ? 0 : "30vw",
        padding: 0, 
        overflowY: "auto", 
        height: "100vh",
        boxSizing: "border-box",
        marginTop: "1rem",
      }}>
          <PerceptionTask />
      </Box>
    </div>
  )
}
