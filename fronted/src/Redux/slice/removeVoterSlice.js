import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "@/api/baseApi";

export const removeVoter = createAsyncThunk(
  "voters/removeVoter",
  async (voterData, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("admin/remove_voter.php", voterData, {
        headers: {
          "Content-Type": "application/json", 
        },
      });

      const data = response.data;

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || "Server error"); 
    }
  }
);

const removeVoterSlice = createSlice({
  name: "removeVoter",
  initialState: { loading: false, error: null, success: null },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeVoter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null; 
      })
      .addCase(removeVoter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(removeVoter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; 
      });
  },
});

export const { resetState } = removeVoterSlice.actions;
export default removeVoterSlice.reducer;