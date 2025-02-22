import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "@/api/baseApi";

export const addCandidates = createAsyncThunk(
  "candidates/addCandidates",
  async (candidates, { rejectWithValue }) => {
    try {
      // Directly sending the candidates object (without wrapping it in a "candidates" key)
      const response = await baseApi.post("admin/add_candidate.php", candidates, {
        headers: {
          "Content-Type": "application/json",  // Ensure this header is set for proper JSON processing
        },
      });

      const data = response.data;

      // Check if the API response was successful
      if (data.success) {
        return data;  // Return success data
      } else {
        return rejectWithValue(data.errors); // Reject if there are errors
      }
    } catch (error) {
      return rejectWithValue(error.message || "Server error"); // Handle any network or server errors
    }
  }
);



const candidatesSlice = createSlice({
  name: "candidates",
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
      .addCase(addCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(addCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = candidatesSlice.actions;
export default candidatesSlice.reducer;
