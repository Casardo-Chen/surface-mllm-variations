import { create } from "zustand";

interface SystemState {
  systemMode: "perception" | "exploration" | string
  setSystemMode: (newMode: "perception" | "exploration" | string ) => void;

  responses: Record<string, unknown>,
  setResponses: (responses: Record<string, unknown>) => void;

  variationSummary: Record<string, unknown>,
  setVariationSummary: (summary: Record<string, unknown>) => void;

  prompt: string;
  setPrompt: (newPrompt: string) => void;

  imageLink: string; // url of the image OR base64 of the image
  setImageLink: (newImageLink: string) => void;

  currentImage: string // the folder link of the current image
  setCurrentImage: (newImage: string) => void;

  currentId: string; // id of the current response. it is a string!!
  setCurrentId: (newId: string) => void;

  viewMode: "all" | "one" | "aggregated" | "augmented";
  setViewMode: (newViewMode: "all" | "one" | "aggregated" | "augmented") => void;

  detailLevel: "response" | "sentence" | "atomic";
  setDetailLevel: (newDetailLevel: "response" | "sentence" | "atomic") => void;

  representationType: "percentage" | "natural" | "none" | "model";
  setRepresentationType: (newType: "percentage" | "natural" | "none" | "model") => void;

  showVariations: boolean;
  setShowVariations: (show: boolean) => void;

  showModelDifferences: boolean;
  setShowModelDifferences: (show: boolean) => void;

  // Filter states
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (threshold: number) => void;

  // Display mode states
  showVariationSummary: boolean;
  setShowVariationSummary: (show: boolean) => void;
  showVariationAwareDescription: boolean;
  setShowVariationAwareDescription: (show: boolean) => void;
  showDescriptionList: boolean;
  setShowDescriptionList: (show: boolean) => void;
  showColorUncertaintyIndicator: boolean;
  setShowColorUncertaintyIndicator: (show: boolean) => void;

}

const useSystemStore = create<SystemState>((set) => ({
  systemMode: "perception",
  setSystemMode: (newMode) => set({ systemMode: newMode }),

  responses: {},
  setResponses: (responses) => set({ responses }),

  variationSummary: {},
  setVariationSummary: (summary) => set({ variationSummary: summary }),

  prompt: "",
  setPrompt: (newPrompt) => set({ prompt: newPrompt }),

  imageLink: "",
  setImageLink: (newImageLink) => set({ imageLink: newImageLink }),

  currentImage: "",
  setCurrentImage: (newImage) => set({ currentImage: newImage }),

  currentId: "1",
  setCurrentId: (newId) => set({ currentId: newId }),

  viewMode: "aggregated",
  setViewMode: (newViewMode) => set({ viewMode: newViewMode }),

  detailLevel: "response",
  setDetailLevel: (newDetailLevel) => set({ detailLevel: newDetailLevel }),

  representationType: "model",
  setRepresentationType: (newType) => set({ representationType: newType }),

  showVariations: true,
  setShowVariations: (show) => set({ showVariations: show }),

  showModelDifferences: true,
  setShowModelDifferences: (show) => set({ showModelDifferences: show }),

  // Filter states
  selectedModels: ['gpt', 'claude', 'gemini'],
  setSelectedModels: (models) => set({ selectedModels: models }),
  confidenceThreshold: 0,
  setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),

  // Display mode states
  showVariationSummary: true,
  setShowVariationSummary: (show) => set({ showVariationSummary: show }),
  showVariationAwareDescription: true,
  setShowVariationAwareDescription: (show) => set({ showVariationAwareDescription: show }),
  showDescriptionList: true,
  setShowDescriptionList: (show) => set({ showDescriptionList: show }),
  showColorUncertaintyIndicator: true,
  setShowColorUncertaintyIndicator: (show) => set({ showColorUncertaintyIndicator: show }),
}));

export default useSystemStore;


