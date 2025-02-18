import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async ({ email }, { rejectWithValue }) => { 
    try {
      const response = await baseApi.post("public/dashboard.php", { email });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data.data;  
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user_id: "",
    role:"",
    email:"",
    voter_id:"",
    location:"",
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.name=action.payload.user_info.name
        state.user_id=action.payload.user_info.user_id
        state.role=action.payload.role
        state.email=action.payload.user_info.email
        state.dob=action.payload.user_info.dob
        state.gender=action.payload.user_info.gender
        state.location=action.payload.user_info.location
        state.voter_id=action.payload.user_info.voter_id

      
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "An error occurred";
      })
  },
});

export default userSlice.reducer;
