import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

// Thunk to create an election
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

// Thunk to fetch locations
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

const electionSlice = createSlice({
  name: "election",
  initialState: {
    name: "",
    district_name: "",
    location_name: "",
    location_type: "",
    ward: "",
    start_date: "",
    end_date: "",
    status: "",
    description: "",
    locations: {},
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createElection.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(createElection.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(createElection.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "An error occurred";
      })
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
      });
  },
});

export default electionSlice.reducer;
