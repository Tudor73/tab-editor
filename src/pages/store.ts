import { create } from 'zustand'


interface spanState {
    spanIndex: number
    increase: () => void
  }


export const useStore = create<spanState>()((set) => ({
  spanIndex: 0,
  increase: () => set((state) => ({ spanIndex: state.spanIndex + 1 })),
}))
