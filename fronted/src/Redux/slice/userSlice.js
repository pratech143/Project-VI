import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {  
    try {
      const response = await baseApi.post("public/dashboard.php"); 

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data;  
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    name: "",
    user_id: "",
    role: "",
    email: "",
    dob: "",
    gender: "",
    location: "",
    voter_id: "",
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
        state.isError = false;
        
        const payload = action.payload;
        if (!payload || !payload.success || !payload.data || !payload.data.user_info) {
          state.isError = true;
          console.error("Invalid Payload:", payload);
          return;
        }
      
        const userInfo = payload.data.user_info;
        state.name = userInfo.name;
        state.user_id = userInfo.user_id;
        state.role = payload.data.role === 0 ? "Voter" : payload.data.role;
        state.email = userInfo.email;
        state.voter_id = userInfo.voter_id;
        state.dob = userInfo.dob;
        state.gender = userInfo.gender;
        state.location = userInfo.location;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        console.error("Fetch User Data Error:", action.error);
      });
  },
});

export default userSlice.reducer;