import { create } from "zustand";

interface UserStudyState {
    userId: string;
    setUserId: (newId: string) => void;

    newImageIds: string[];
    setNewImageIds: (newIds: string[]) => void;

    task: "perception" | "exploration";
    setTask: (newTask: "perception" | "exploration") => void;

}

const useUserStudyStore = create<UserStudyState>((set) => ({
    userId: "P1",
    setUserId: (newId) => set({ userId: newId }),

    newImageIds: [],
    setNewImageIds: (newIds) => set({ newImageIds: newIds }),

    task: "perception",
    setTask: (newTask) => set({ task: newTask }),
}));

export default useUserStudyStore;



