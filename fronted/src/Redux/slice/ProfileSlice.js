import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi"; // Adjust the path based on your project structure

// Async Thunk for fetching profile photo
export const fetchProfilePicture = createAsyncThunk(
  "profile/fetchProfilePhoto",
  async (user_id, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("public/fetch_photo.php", {
        user_id: user_id,
      });

      const data = await response.json();
      if (data.success && data.profile_photo) {
        return data.profile_photo;
      } else {
        return rejectWithValue(data.message || "Failed to fetch profile photo");
      }
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred");
    }
  }
);

// Profile Slice
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profileImage: null,
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  reducers: {
    clearProfileImage: (state) => {
      state.profileImage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfilePicture.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(fetchProfilePicture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileImage = action.payload;
      })
      .addCase(fetchProfilePicture.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export const { clearProfileImage } = profileSlice.actions;
export default profileSlice.reducer;