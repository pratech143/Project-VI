
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";
import toast from "react-hot-toast";

export const createElection = createAsyncThunk(
  "election/createElection",
  async (
    { name, district_name, location_name, location_type, ward, start_date, end_date, status, description },
    { rejectWithValue }
  ) => {
    try {
      const response = await baseApi.post("admin/create_election.php", {
        name,
        description,
        district_name,
        location_name,
        location_type,
        ward,
        start_date,
        end_date,
        status,
      });

      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || "Election creation failed!");
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred");
    }
  }
);

export const fetchLocations = createAsyncThunk(
  "election/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await baseApi.get("function/export_location.php");
      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch locations!");
      }
      return data.locations;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while fetching locations");
    }
  }
);
export const deleteElection=createAsyncThunk(
  "election/deleteElection",
  async({electionId},{rejectWithValue})=>{
    try {
      const response = await baseApi.delete("admin/remove_election.php", {
        withCredentials: true,
        data: { election_id: electionId }, // Ensure the ID is properly sent
      });
    
      const data = response.data;
    
      if (!data.success) {
        toast.error(data.message)
        throw new Error(data.message || "Failed to delete election!");
        
      }
      else{
        toast.success(data.message)
      }
    
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cannot delete election");
    }
    
  }
)

export const fetchElections = createAsyncThunk(
  "election/fetchElections",
  async ({ voterId }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("function/fetch_election_details.php", {
        withCredentials: true,
        voter_id: voterId, 
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch elections!");
      }

      return data.elections;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred while fetching elections");
    }
  }
);

const electionSlice = createSlice({
  name: "election",
  initialState: {
    elections: [], // Array to hold fetched elections
    locations: [], // Locations will be stored here
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Creating Election
      .addCase(createElection.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(createElection.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createElection.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "An error occurred";
      })

      // Fetching Locations
      .addCase(fetchLocations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to fetch locations";
      })

      // Fetching Elections
      .addCase(fetchElections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchElections.fulfilled, (state, action) => {
        console.log("Fetched Elections Data:", action.payload); // Debugging log
        state.isLoading = false;
        state.elections = action.payload; // Store fetched elections
    })
      .addCase(fetchElections.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "An error occurred while fetching elections";
      });
  },
});

export default electionSlice.reducer;
