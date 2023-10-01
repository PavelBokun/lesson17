import {Dispatch} from 'redux'
import {authAPI} from '../api/todolists-api'
import {setIsLoggedInAC} from '../features/Login/auth-reducer'
import { register } from './../serviceWorker';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false
}
const slice = createSlice({
    name: "app",
    initialState: initialState,
    reducers: {
    setAppErrorAC:(state, action: PayloadAction<{error: string|null}>)=> {
        state.error= action.payload.error
    },
      setAppStatusAC: (state,action: PayloadAction<{status:RequestStatusType}>)=>{
        state.status = action.payload.status
      },
    setAppInitializedAC :(state,action: PayloadAction <{isInitialized:boolean}>)=>{
        state.isInitialized=action.payload.isInitialized
    },
    }
  })


export const appReducer = slice.reducer

// export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//     switch (action.type) {
//         case 'APP/SET-STATUS':
//             return {...state, status: action.status}
//         case 'APP/SET-ERROR':
//             return {...state, error: action.error}
//         case 'APP/SET-IS-INITIALIED':
//             return {...state, isInitialized: action.value}
//         default:
//             return {...state}
//     }
// }

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
    // происходит ли сейчас взаимодействие с сервером
    status: RequestStatusType
    // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
    error: string | null
    // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
    isInitialized: boolean
}

export const setAppErrorAC = slice.actions.setAppErrorAC

export const setAppStatusAC = slice.actions.setAppStatusAC
export const setAppInitializedAC = slice.actions.setAppInitializedAC

export const initializeAppTC = () => (dispatch: Dispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC({value:true}));
        } else {

        }

        dispatch(setAppInitializedAC({isInitialized:true}));
    })
}

export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>


