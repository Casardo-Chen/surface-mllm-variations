import { create } from "zustand";

interface PerceptionState {
  responses: Record<string, unknown>,
  setResponses: (responses : Record<string, unknown>) => void;

  prompt: string;
  setPrompt: (newPrompt: string) => void;

  imageLink: string;
  setImageLink: (newImageLink: string) => void;

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
}

const usePerceptionStore = create<PerceptionState>((set) => ({
  responses: {},
  setResponses: (responses) => set({ responses: responses }),

  prompt: "",
  setPrompt: (newPrompt) => set({ prompt: newPrompt }),

  imageLink: "",
  setImageLink: (newImageLink) => set({ imageLink: newImageLink }),

  currentId: "1",
  setCurrentId: (newId) => set({ currentId: newId }),

  viewMode: "all",
  setViewMode: (newViewMode) => set({ viewMode: newViewMode }),

  detailLevel: "response",
  setDetailLevel: (newDetailLevel) => set({ detailLevel: newDetailLevel }),

  representationType: "none",
  setRepresentationType: (newType) => set({ representationType: newType }),

  showVariations: true,
  setShowVariations: (show) => set({ showVariations: show }),

  showModelDifferences: true,
  setShowModelDifferences: (show) => set({ showModelDifferences: show }),
}));

export default usePerceptionStore;


