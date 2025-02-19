import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import baseApi from '../../api/baseApi';  // Assuming your API base setup is already configured

// Async thunk for fetching election results
export const fetchElectionResults = createAsyncThunk(
  'results/fetchElectionResults',
  async (voter_id, { rejectWithValue }) => {
    try {
      const response = await baseApi.post('function/live_results.php', {
        voter_id,
      });
      console.log(response.data)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch election results');
      }
      return response.data.elections;
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred while fetching election results');
    }
  }
);
const resultSlice = createSlice({
  name: 'results',
  initialState: {
    elections: [],     
    isLoading: false, 
    isError: false,     
    errorMessage: '',   
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchElectionResults.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(fetchElectionResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.elections = action.payload; 
      })
      .addCase(fetchElectionResults.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'An error occurred';
      });
  },
});

export default resultSlice.reducer;
