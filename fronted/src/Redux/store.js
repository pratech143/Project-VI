import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice"
import electionReducer from "./slice/electionSlice"
import userReducer from "./slice/userSlice"
import votesReducer from "./slice/votesSlice"
export const store=configureStore({
    reducer:{
        auth:authReducer,
        election:electionReducer, 
        user:userReducer,
        votes:votesReducer

    }
});