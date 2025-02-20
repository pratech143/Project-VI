import baseApi from '@/api/baseApi';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define API URL (adjust based on your backend)
const API_URL = 'http://your-backend-url.com/api/add_candidate.php';

// Async thunk for adding a candidate
export const addCandidate = createAsyncThunk(
  'candidates/addCandidate',
  async (candidateData, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("admin/add_candidate.php", {
        candidateData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add candidate');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const addCandidateSlice = createSlice({
  name: 'candidates',
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCandidate.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(addCandidate.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = addCandidateSlice.actions;
export default addCandidateSlice.reducer;
