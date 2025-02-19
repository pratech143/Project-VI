import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

// Async thunk for submitting votes
export const submitVotes = createAsyncThunk(
  "votes/submitVotes",
  async ({ voter_id, election_id, votes }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("function/vote.php", {
        voter_id,
        election_id,
        votes,
      });
      console.log(response)

      if (!response.success) {
        throw new Error(response.data.message);
      }

      return response;  // Response will contain success or failure with details
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const votesSlice = createSlice({
  name: "votes",
  initialState: {
    successful_votes: [],
    failed_votes: [],
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitVotes.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(submitVotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successful_votes = action.payload.successful_votes || [];
        state.failed_votes = action.payload.failed_votes || [];
      })
      .addCase(submitVotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload.errorMessage|| "An error occurred";
      });
  },
});

export default votesSlice.reducer;
