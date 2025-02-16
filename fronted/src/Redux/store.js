import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice"
import electionReducer from "./slice/electionSlice"
export const store=configureStore({
    reducer:{
        auth:authReducer,
        election:electionReducer 

    }
});