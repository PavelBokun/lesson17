import {
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
import { setAppStatusAC } from "../../app/app-reducer";
import {
  handleServerAppError,
  handleServerNetworkError,
} from "../../utils/error-utils";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { type } from './../../api/todolists-api';

const initialState: TasksStateType = {};

export const fetchTasksTC = createAsyncThunk(
  "tasks/fetchTasks",
  async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({ status: "loading" }));
    const res = await todolistsAPI.getTasks(todolistId);
    const tasks = res.data.items;
    thunkAPI.dispatch(setAppStatusAC({ status: "succeeded" }));
    return { tasks, todolistId };
  }
);
export const removeTaskTC = createAsyncThunk(
  "taskc/removeTask",
  async (param: { taskId: string; todolistId: string }, thunkAPI) => {
    const res = await todolistsAPI.deleteTask(param.todolistId, param.taskId);
    return { taskId: param.taskId, todolistId: param.todolistId };
  }
);

// export const _removeTaskTC =
//   (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
//     dispatch(setAppStatusAC({ status: "loading" }));
//     todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
//       const action = removeTaskAC({ taskId, todolistId });
//       dispatch(action);
//       dispatch(setAppStatusAC({ status: "succeeded" }));
//     });
//   };
//  export const _fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
//   dispatch(setAppStatusAC({ status: "loading" }));
//   todolistsAPI.getTasks(todolistId).then((res) => {
//     const tasks = res.data.items;
//     dispatch(setTasksAC({ tasks, todolistId }));
//     dispatch(setAppStatusAC({ status: "succeeded" }));
//   });
// };

const slice = createSlice({
  name: "tasks",
  initialState: initialState,
  reducers: {
    // removeTaskAC(
    //   state,
    //   action: PayloadAction<{ taskId: string; todolistId: string }>
    // ) {
    //   const tasks = state[action.payload.todolistId];
    //   const index: any = tasks.filter((t) => t.id != action.payload.taskId);
    //   if (index !== 1) {
    //     tasks.splice(index, 1);
    //   }
    // },
    addTaskAC(state, action: PayloadAction<{ task: TaskType }>) {
      state[action.payload.task.todoListId].unshift(action.payload.task);

      //
      //  addTaskAC(state, action: PayloadAction<{ task: TaskType }>) {   // так  как один аргумент можно так action: PayloadAction<TaskType>
      //     state[action.payload.todoListId].unshift(action.payload)  свойство task убрали
      //
    },
    updateTaskAC(
      state,
      action: PayloadAction<{
        taskId: string;
        apiModel: UpdateDomainTaskModelType;
        todolistId: string;
      }>
    ) {
      // const tasks = state[action.payload.todolistId];
      // const index: any = tasks.filter((t) => t.id === action.payload.taskId);
      // if (index != 1) {
      //   tasks[index] = { ...tasks[index], ...action.payload.apiModel };
      // }

      const task = state[action.payload.todolistId];
      const index = task.findIndex((task) => task.id === action.payload.taskId);
      if (index !== 1) {
        task[index] = { ...task[index], ...action.payload.apiModel };
      }
    },
    // setTasksAC(
    //   state,
    //   action: PayloadAction<{ tasks: Array<TaskType>; todolistId: string }>
    // ) {
    //   state[action.payload.todolistId] = action.payload.tasks;
    // },
  },

  extraReducers: (builder) => {
    builder.addCase(addTodolistAC, (state, action) => {
      state[action.payload.todolist.id] = [];
    }),
      builder.addCase(removeTodolistAC, (state, action) => {
        delete state[action.payload.id];
      }),
      builder.addCase(setTodolistsAC, (state, action) => {
        action.payload.todolists.forEach((tl: any) => {
          state[tl.id] = [];
        });
      }),
      builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks;
      }),
      builder.addCase(removeTaskTC.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId];
        const index = tasks.findIndex((t) => t.id === action.payload.taskId);
        if (index > -1) {
          tasks.splice(index, 1);
        }
      });
  },
});

export const tasksReducer = slice.reducer;

// actions
export const { addTaskAC, updateTaskAC } = slice.actions;

// thunks

export const addTaskTC =
  (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({ status: "loading" }));
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const task = res.data.data.item;
          const action = addTaskAC({ task });
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
  (dispatch: Dispatch, getState: () => AppRootStateType) => {
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
          const action = updateTaskAC({ taskId, apiModel, todolistId });
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
