import { create } from 'zustand'

const useResponsesStore = create((set) => ({
  responses: {},
  setResponses: (responses) => set({ responses }),

  atomicFact: [],
  setAtomicFact: (atomicFact) => set({ atomicFact }),

  groupedAtomicFacts: {},
  setGroupedAtomicFacts: (groupedAtomicFacts) => set({ groupedAtomicFacts }),


}))

export default useResponsesStore
