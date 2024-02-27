import { Dispatch } from "redux";
import { authAPI, LoginParamsType } from "../../api/todolists-api";
import { setAppStatusAC } from "../../app/app-reducer";
import {
  handleServerAppError,
  handleServerNetworkError,
} from "../../utils/error-utils";

import {
  createAsyncThunk,
  createSlice,
  isRejectedWithValue,
  PayloadAction,
} from "@reduxjs/toolkit"

// add branch
export const loginTC = createAsyncThunk(
  "ayth/login",
  async (param: LoginParamsType, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({ status: "loading" }));
    try {
      const res = await authAPI.login(param);
      if (res.data.resultCode === 0) {
        thunkAPI.dispatch(setAppStatusAC({ status: "succeeded" }));
        return { isLoggedIn: true };
      } else {
        handleServerAppError(res.data, thunkAPI.dispatch);
        return { isLoggedIn: false };
      }
    } catch (error: any) {
      handleServerNetworkError(error, thunkAPI.dispatch);
      return { isLoggedIn: false };
    }
  }
);

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    },
    // setIsLoggedInAC(state, action: PayloadAction<{ isLoggedIn: boolean }>) {
    //   state.isLoggedIn = action.payload.isLoggedIn;
    // },
  },
  extraReducers: (builder) => {
    builder.addCase(loginTC.fulfilled, (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
    });
  },
});
export const authReducer = slice.reducer;

export const setIsLoggedInAC = slice.actions.setIsLoggedIn;

//  (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//     switch (action.type) {
//         case 'login/SET-IS-LOGGED-IN':
//             return {...state, isLoggedIn: action.value}
//         default:
//             return state
//     }
// }

// actions

// export const setIsLoggedInAC = (value: boolean) =>
//   ({ type: "login/SET-IS-LOGGED-IN", value } as const);

// thunks
// export const loginTC =
//   (data: LoginParamsType) =>
//   (
//     dispatch: Dispatch
//   ) => {
//     dispatch(setAppStatusAC({status:"loading"}));
//     authAPI
//       .login(data)
//       .then((res) => {
//         if (res.data.resultCode === 0) {
//           dispatch(setIsLoggedInAC({isLoggedIn:true}));
//           dispatch(setAppStatusAC({status:"succeeded"}));
//         } else {
//           handleServerAppError(res.data, dispatch);
//         }
//       })
//       .catch((error) => {
//         handleServerNetworkError(error, dispatch);
//       });
//   };
export const logoutTC = () => (dispatch: Dispatch) => {
  dispatch(setAppStatusAC({ status: "loading" }));
  authAPI
    .logout()
    .then((res) => {
      if (res.data.resultCode === 0) {
        dispatch(setIsLoggedInAC({ isLoggedIn: false }));
        dispatch(setAppStatusAC({ status: "succeeded" }));
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch);
    });
};

// types

// type ActionsType = ReturnType<typeof setIsLoggedInAC>;
// type InitialStateType = {
//   isLoggedIn: boolean;
// };

// type ThunkDispatch = Dispatch<
//   ActionsType | SetAppStatusActionType | SetAppErrorActionType
// >;
