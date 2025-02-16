import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi"; // Assuming you are importing baseApi

// Create Election action
export const createElection = createAsyncThunk(
  "election/createElection", // Action type should reflect the slice name
  async ({ name, district_name, location_name, location_type, ward, start_date, end_date, status }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("admin/create_election.php", {
        name,
        district_name,
        location_name,
        location_type,
        ward,
        start_date,
        end_date,
        status,
      });

      const data = response.data;
      console.log(data)
      if (!data.success) {
        throw new Error(data.message || "Election creation failed!");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred");
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
        // Update the state with the data returned from the API
        state.name = action.payload.name;
        state.district_name = action.payload.district_name;
        state.location_name = action.payload.location_name;
        state.location_type = action.payload.location_type;
        state.ward = action.payload.ward;
        state.start_date = action.payload.start_date;
        state.end_date = action.payload.end_date;
        state.status = action.payload.status;
      })
      .addCase(createElection.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        // action.payload could contain the error message
        state.errorMessage = action.payload || "An error occurred";
      });
  },
});

export default electionSlice.reducer;
