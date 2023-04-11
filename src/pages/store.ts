import { create } from 'zustand'


interface spanState {
    spanIndex: number
    editMode: boolean
    setSpanIndex: (index: number) => void
    setEditMode: (editMode: boolean) => void
  }


export const useStore = create<spanState>()((set) => ({
  spanIndex: -1,
  editMode: false,
  setSpanIndex: (index: number) => set((state) => ({ spanIndex: state.spanIndex = index })),
  setEditMode: (editMode: boolean) => set((state) => ({ editMode: state.editMode = editMode })),
}))
