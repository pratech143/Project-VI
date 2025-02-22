import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import baseApi from '@/api/baseApi';

export const addCandidates = createAsyncThunk(
  'candidates/addCandidates', // action type string
  async (candidates, { rejectWithValue }) => {
    try {
      const response = await baseApi.post('admin/add_candidate.php', {
        method: 'POST',
        body: JSON.stringify(candidates),
      });
      const data = await response.json();

      if (data.success) {
        return data; // this will be the `action.payload` in the reducer
      } else {
        return rejectWithValue(data.errors); // this will be the `action.payload` in rejected case
      }
    } catch (error) {
      return rejectWithValue(error.message); // in case of network errors
    }
  }
);

const candidatesSlice = createSlice({
  name: "candidates",
  initialState: { loading: false, error: null, success: null },
  reducers: {},
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