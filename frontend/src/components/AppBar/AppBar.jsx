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
        setRepresentationType,
        showVariationSummary,
        setShowVariationSummary,
        showVariationAwareDescription,
        setShowVariationAwareDescription,
        showDescriptionList,
        setShowDescriptionList,
        showColorUncertaintyIndicator,
        setShowColorUncertaintyIndicator
    } = useSystemStore();

    const availableModels = ['GPT-4', 'Claude', 'Gemini'];
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
                    <>
                        {/* Display Options Checkboxes */}
                        <div className="control-group">
                            <label className="control-label">Show:</label>
                            <div className="display-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={showVariationSummary}
                                        onChange={(e) => setShowVariationSummary(e.target.checked)}
                                        style={{ marginRight: "6px" }}
                                    />
                                    Variation Summary
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={showVariationAwareDescription}
                                        onChange={(e) => setShowVariationAwareDescription(e.target.checked)}
                                        style={{ marginRight: "6px" }}
                                    />
                                    Variation-Aware Description
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={showDescriptionList}
                                        onChange={(e) => setShowDescriptionList(e.target.checked)}
                                        style={{ marginRight: "6px" }}
                                    />
                                    List of Descriptions
                                </label>
                            </div>
                        </div>
                        {/* Color Uncertainty Indicator Toggle */}
                        {/* <div className="control-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={showColorUncertaintyIndicator}
                                    onChange={(e) => setShowColorUncertaintyIndicator(e.target.checked)}
                                    style={{ marginRight: "6px" }}
                                />
                                Color Uncertainty Claims
                            </label>
                        </div> */}
                    </>
                )}
            </div>
        </div>
    )

};

export default AppBar;