import { create } from 'zustand'


interface spanState {
    spanIndex: number
    set: (index: number) => void
  }


export const useStore = create<spanState>()((set) => ({
  spanIndex: -1,
  set: (index: number) => set((state) => ({ spanIndex: state.spanIndex = index })),
}))
