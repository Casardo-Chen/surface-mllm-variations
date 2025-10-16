'use client';

import { useEffect, useState } from 'react'
import { Switch, SwitchWrapper, SwitchIndicator } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import useSystemStore from '@/store/use-system-store';

import './AppBar.scss';

const AppBar = ({gridView, setGridView}) => {
    const {
        showVariations,
        setShowVariations,
        selectedModels,
        setSelectedModels,
        confidenceThreshold,
        setConfidenceThreshold,
        representationType,
        setRepresentationType
    } = useSystemStore();

    const availableModels = ['GPT-4', 'Claude', 'Gemini', 'LLaVA'];
    const representationTypes = [
        { value: 'natural', label: 'Language' },
        { value: 'percentage', label: 'Percentage' },
        { value: 'none', label: 'None' },
        { value: 'model', label: 'Models' }
    ];

    const handleModelToggle = (model) => {
        if (selectedModels.includes(model)) {
            setSelectedModels(selectedModels.filter(m => m !== model));
        } else {
            setSelectedModels([...selectedModels, model]);
        }
    };

    return (
        <div className="app-bar">

            
            <div className="app-bar-center">
                {/* Main toggle: All descriptions vs Variations */}
                <div className="control-group">
                    <label className="control-label">View Mode:</label>
                    <SwitchWrapper>
                        <Switch 
                            checked={showVariations} 
                            onCheckedChange={setShowVariations}
                        />
                        <SwitchIndicator state={showVariations ? "on" : "off"}>
                            {showVariations ? "Variations" : "All Descriptions"}
                        </SwitchIndicator>
                    </SwitchWrapper>
                </div>

                {/* Controls for All Descriptions mode */}
                {!showVariations && (
                    <>
                        {/* Confidence Level Control */}
                        <div className="control-group">
                            <label className="control-label">Confidence:</label>
                            <div className="confidence-control">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={confidenceThreshold}
                                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                                    className="confidence-slider"
                                />
                                <span className="confidence-value">
                                    {Math.round(confidenceThreshold * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Model Selection */}
                        <div className="control-group">
                            <label className="control-label">Models:</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="dropdown-trigger">
                                        {selectedModels.length} selected
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {availableModels.map((model) => (
                                        <DropdownMenuCheckboxItem
                                            key={model}
                                            checked={selectedModels.includes(model)}
                                            onCheckedChange={() => handleModelToggle(model)}
                                        >
                                            {model}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </>
                )}

                {/* Controls for Variations mode */}
                {showVariations && (
                    <div className="control-group">
                        <label className="control-label">Display:</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="dropdown-trigger">
                                    {representationTypes.find(rt => rt.value === representationType)?.label || 'Models'}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {representationTypes.map((type) => (
                                    <DropdownMenuItem
                                        key={type.value}
                                        onClick={() => setRepresentationType(type.value)}
                                    >
                                        {type.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </div>
    )

};

export default AppBar;