import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice"
import electionReducer from "./slice/electionSlice"
import userReducer from "./slice/userSlice"
import votesReducer from "./slice/votesSlice"
import resultsReducer from "./slice/resultSlice"
export const store=configureStore({
    reducer:{
        auth:authReducer,
        election:electionReducer, 
        user:userReducer,
        votes:votesReducer,
        results:resultsReducer

    }
});