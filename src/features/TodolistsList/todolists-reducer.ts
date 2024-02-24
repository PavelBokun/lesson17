import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import { AppThunk } from '../../app/store';
import { createSlice, current } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: "todolists",
    initialState: initialState, 
    reducers: {
        removeTodolistAC(state,action:PayloadAction<{id:string}>){
          const index = state.findIndex(tl=>tl.id===action.payload.id)
          if(index!= -1){
            state.splice(index,1)
          }
        //   return state.filter(tl=>tl.id===action.payload.id)
        },
        addTodolistAC(state,action:PayloadAction<{todolist: TodolistType}>){
                // const a = current(state)
                // debugger
            state.unshift({...action.payload.todolist,filter:'all',entityStatus:"idle"})
        },
        changeTodolistTitleAC(state,action:PayloadAction<{id: string, title: string}>){
            const index = state.findIndex(tl=>tl.id===action.payload.id);
            if (index){
                state[index].title=action.payload.title 
            }
            

                // const todo = state.find(tl=>tl.id===action.payload.id)
                // if(todo){
                //     todo.title=action.payload.title
                // }
             },
        changeTodolistFilterAC(state,action:PayloadAction<{id: string, filter: FilterValuesType}>){
            const index = state.findIndex(tl=>tl.id===action.payload.id);
            state[index].filter=action.payload.filter 
        },
        changeTodolistEntityStatusAC(state,action:PayloadAction<{id: string, status: RequestStatusType}>){
            const index = state.findIndex(tl=>tl.id===action.payload.id);
            state[index].entityStatus=action.payload.status
        },
        setTodolistsAC(state,action:PayloadAction<{todolists: Array<TodolistType>}>){
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
            
        }
      },
    
  });

export const todolistsReducer = slice.reducer
export const{removeTodolistAC,addTodolistAC,changeTodolistTitleAC,changeTodolistFilterAC,changeTodolistEntityStatusAC,setTodolistsAC}=slice.actions


// actions


// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {
        dispatch(setAppStatusAC({status:'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC({todolists: res.data}))
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(setAppStatusAC({status:'loading'}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(changeTodolistEntityStatusAC({id:todolistId,status: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodolistAC({id:todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch ) => {
        dispatch(setAppStatusAC({status:'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodolistAC({todolist: res.data.data.item }))
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
               todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({id:id, title}))
               
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
// type ThunkDispatch = Dispatch< SetAppStatusActionType | SetAppErrorActionType>
