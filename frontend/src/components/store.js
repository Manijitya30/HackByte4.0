import { create } from "zustand";

export const useCourtStore = create((set) => ({
  activeRole: null,
  text: "",

  speak: (role, text) => set({ activeRole: role, text }),
  clear: () => set({ activeRole: null, text: "" })
}));