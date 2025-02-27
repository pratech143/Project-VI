import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice"
import electionReducer from "./slice/electionSlice"
import userReducer from "./slice/userSlice"
import votesReducer from "./slice/votesSlice"
import resultsReducer from "./slice/resultSlice"
import addCandidateReducer from"./slice/addCandidateSlice"
import resetReducer from "./slice/resetSlice"
import profileReducer from"./slice/ProfileSlice"
import voterReducer from "./slice/voterSlice"
import removeReducer from "./slice/removeVoterSlice"
import contactReducer from "./slice/contactAdminSlice"
export const store=configureStore({
    reducer:{
        auth:authReducer,
        election:electionReducer, 
        user:userReducer,
        votes:votesReducer,
        results:resultsReducer,
        addCandidate:addCandidateReducer,
        reset:resetReducer,
        profile:profileReducer,
        voters:voterReducer,
        removeVoter:removeReducer,
        contactAdmin:contactReducer,
    }
});