import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "@/api/baseApi";

export const addCandidates = createAsyncThunk(
  "candidates/addCandidates",
  async (candidates, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("admin/add_candidate.php", {
        body: JSON.stringify(candidates),
      });

      const data = response.data; 

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.errors); 
      }
    } catch (error) {
      return rejectWithValue(error.message || "Server error"); 
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
