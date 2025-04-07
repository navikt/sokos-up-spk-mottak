import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { TaskInfoState, TaskInfoStateRecord } from "../types/TaskInfoState";

type AppState = {
  taskInfoStateRecord: TaskInfoStateRecord;
};

type AppStateActions = {
  resetState: () => void;
  setTaskInfoStateItem: (taskId: string, taskInfoState: TaskInfoState) => void;
  removeTaskInfoStateItem: (taskId: string) => void;
};

const initAppState = {
  taskInfoStateRecord: {},
};

export const useStore = create<AppState & AppStateActions>()(
  devtools(
    persist(
      (set) => ({
        ...initAppState,
        resetState: () => set({ ...initAppState }),
        setTaskInfoStateItem: (taskId: string, taskInfoState: TaskInfoState) =>
          set((state) => ({
            taskInfoStateRecord: {
              ...state.taskInfoStateRecord,
              [taskId]: taskInfoState,
            },
          })),
        removeTaskInfoStateItem: (taskId: string) =>
          set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [taskId]: removed, ...rest } = state.taskInfoStateRecord;
            return { taskInfoStateRecord: rest };
          }),
      }),
      {
        name: "app-state",
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  ),
);
