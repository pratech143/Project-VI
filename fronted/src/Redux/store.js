import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice"
import electionReducer from "./slice/electionSlice"
import userSlice from "./slice/userSlice"
export const store=configureStore({
    reducer:{
        auth:authReducer,
        election:electionReducer, 
        user:userSlice

    }
});