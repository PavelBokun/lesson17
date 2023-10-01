import {
  AddTodolistActionType,
  RemoveTodolistActionType,
  SetTodolistsActionType,
  addTodolistAC,
  removeTodolistAC,
  setTodolistsAC,
} from "./todolists-reducer";
import {
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  UpdateTaskModelType,
} from "../../api/todolists-api";
import { Dispatch } from "redux";
import { AppRootStateType } from "../../app/store";
import {
  setAppErrorAC,
  SetAppErrorActionType,
  setAppStatusAC,
  SetAppStatusActionType,
} from "../../app/app-reducer";
import {
  handleServerAppError,
  handleServerNetworkError,
} from "../../utils/error-utils";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
// import { type } from './../../api/todolists-api';

const initialState: TasksStateType = {};

const slice = createSlice({
  name: "tasks",
  initialState: initialState,
  reducers: {
    removeTaskAC(
      state,
      action: PayloadAction<{ taskId: string; todolistId: string }>
    ) {
        const tasks = state[action.payload.todolistId];
        const index:any = tasks.filter((t) => t.id != action.payload.taskId);
        if (index != 1){
            tasks.splice(index,1)
        }

    },
    addTaskAC(state, action: PayloadAction<{ task: TaskType }>) {
     state[action.payload.task.todoListId].unshift(action.payload.task)

    },
    updateTaskAC(
      state,
      action: PayloadAction<{
        taskId: string;
        model: UpdateDomainTaskModelType;
        todolistId: string;
      }>
    ) {
        const tasks = state[action.payload.todolistId];
        const index:any = tasks.filter((t) => t.id != action.payload.taskId);
        if (index != 1){
            tasks[index]= {...tasks[index],...action.payload.model}
        }
    },
    setTasksAC(
      state,
      action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>
    ) {
        state[action.payload.todolistId]=action.payload.tasks
        
    },
  },
});

export const tasksReducer = slice.reducer;

export const _tasksReducer = (
  state: TasksStateType = initialState,
  action: any
): TasksStateType => {
  switch (action.type) {
   
   
    case addTodolistAC.type:
      return { ...state, [action.payload.todolist.id]: [] };
    case removeTodolistAC.type:
      const copyState = { ...state };
      delete copyState[action.payload.id];
      return copyState;
    case setTodolistsAC.type: {
      const copyState = { ...state };
      action.payload.todolists.forEach((tl: any) => {
        copyState[tl.id] = [];
      });
      return copyState;
    }
    
    default:
      return state;
  }
};

// actions
export const {removeTaskAC,addTaskAC,updateTaskAC,setTasksAC}= slice.actions


// thunks
export const fetchTasksTC =
  (todolistId: string) =>
  (dispatch: Dispatch<ActionsType | SetAppStatusActionType>) => {
    dispatch(setAppStatusAC({ status: "loading" }));
    todolistsAPI.getTasks(todolistId).then((res) => {
      const tasks = res.data.items;
      dispatch(setTasksAC(tasks, todolistId));
      dispatch(setAppStatusAC({ status: "succeeded" }));
    });
  };
export const removeTaskTC =
  (taskId: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
      const action = removeTaskAC(taskId, todolistId);
      dispatch(action);
    });
  };
export const addTaskTC =
  (title: string, todolistId: string) =>
  (
    dispatch: Dispatch<
      ActionsType | SetAppErrorActionType | SetAppStatusActionType
    >
  ) => {
    dispatch(setAppStatusAC({ status: "loading" }));
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const task = res.data.data.item;
          const action = addTaskAC(task);
          dispatch(action);
          dispatch(setAppStatusAC({ status: "succeeded" }));
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };
export const updateTaskTC =
  (
    taskId: string,
    domainModel: UpdateDomainTaskModelType,
    todolistId: string
  ) =>
  (dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
    const state = getState();
    const task = state.tasks[todolistId].find((t) => t.id === taskId);
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state");
      return;
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    };

    todolistsAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const action = updateTaskAC(taskId, domainModel, todolistId);
          dispatch(action);
        } else {
          handleServerAppError(res.data, dispatch);
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch);
      });
  };

// types
export type UpdateDomainTaskModelType = {
  title?: string;
  description?: string;
  status?: TaskStatuses;
  priority?: TaskPriorities;
  startDate?: string;
  deadline?: string;
};
export type TasksStateType = {
  [key: string]: Array<TaskType>;
};
type ActionsType =
  | ReturnType<typeof removeTaskAC>
  | ReturnType<typeof addTaskAC>
  | ReturnType<typeof updateTaskAC>
  | AddTodolistActionType
  | RemoveTodolistActionType
  | SetTodolistsActionType
  | ReturnType<typeof setTasksAC>;
type ThunkDispatch = Dispatch<
  ActionsType | SetAppStatusActionType | SetAppErrorActionType
>;