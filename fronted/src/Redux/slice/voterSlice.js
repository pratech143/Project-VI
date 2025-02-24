import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "@/api/baseApi";


export const handleVoterAction = createAsyncThunk(
  "voters/handleVoterAction",
  async ({ voterId, action }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post( "admin/approve_voter.php",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session auth
        body: JSON.stringify({
          voter_id: voterId,
          action: action,
        }),
      });

      const result = await response.data;
      console.log(data)

      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return { voterId, action, message: result.message };
    } catch (error) {
      return rejectWithValue("Failed to connect to the server.");
    }
  }
);

// Mock initial voters (replace with API call later if needed)
const initialVoters = [
  {
    voter_id: 1,
    name: "John Doe",
    age: 30,
    email: "johndoe@gmail.com",
    address: "123 Main Street, NY",
    id_card_url: "https://via.placeholder.com/250x150?text=Voter+ID+Card",
  },
  {
    voter_id: 2,
    name: "Jane Smith",
    age: 27,
    email: "janesmith@gmail.com",
    address: "456 Elm Street, CA",
    id_card_url: "https://via.placeholder.com/250x150?text=Voter+ID+Card",
  },
  {
    voter_id: 3,
    name: "Michael Johnson",
    age: 35,
    email: "michaelj@gmail.com",
    address: "789 Oak Avenue, TX",
    id_card_url: "https://via.placeholder.com/250x150?text=Voter+ID+Card",
  },
];

const voterSlice = createSlice({
  name: "voters",
  initialState: {
    voters: initialVoters,
    selectedVoter: null,
    loading: false,
    message: null,
  },
  reducers: {
    setSelectedVoter(state, action) {
      state.selectedVoter = action.payload;
    },
    clearMessage(state) {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleVoterAction.pending, (state) => {
        state.loading = true;
        state.message = null;
      })
      .addCase(handleVoterAction.fulfilled, (state, action) => {
        state.loading = false;
        state.voters = state.voters.filter(
          (voter) => voter.voter_id !== action.payload.voterId
        );
        state.selectedVoter = null;
        state.message = { type: "success", text: action.payload.message };
      })
      .addCase(handleVoterAction.rejected, (state, action) => {
        state.loading = false;
        state.message = { type: "error", text: action.payload };
      });
  },
});

export const { setSelectedVoter, clearMessage } = voterSlice.actions;
export default voterSlice.reducer;