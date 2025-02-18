import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

// Thunk to create an election
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (
    {user_id,role,email,voter_id},
    { rejectWithValue }
  ) => {
    try {
      const response = await baseApi.post("public/dashboard.php", {
        user_id,
        role,
        email,
        voter_id
      });

      const data = response.data;
      if (!data.success) {
        throw new Error(data.message );
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message );
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
        state.user_id = action.payload.user_info.user_id || "";
        state.role = action.payload.role || "";
        state.email = action.payload.user_info.email || "";
        state.voter_id = action.payload.user_info.voter_id || "";
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "An error occurred";
      })
  },
});

export default userSlice.reducer;
