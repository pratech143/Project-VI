import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const submitVotes = createAsyncThunk(
  "votes/submitVotes",
  async ({ election_id, votes }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("function/vote.php", {
        election_id,
        votes,
      }, { withCredentials: true }); 

      console.log(response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data;
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
        state.errorMessage = action.payload || "An error occurred";
      });
  },
});

export default votesSlice.reducer;