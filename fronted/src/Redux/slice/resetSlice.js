import baseApi from "@/api/baseApi";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

// Thunk to request OTP for password reset
export const requestOTP = createAsyncThunk(
  "reset/requestOTP",
  async (email, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("function/forgot-password.php", { email });

      if (response.data.success) {
        toast.success(response.data.message);
        return response.data;
      } else {
        toast.error(response.data.message);
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Try again later.");
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Thunk to reset password with OTP
export const resetPassword = createAsyncThunk(
  "reset/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("function/reset-password.php", {
        email,
        otp,
        new_password: newPassword,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        return response.data;
      } else {
        toast.error(response.data.message);
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Try again later.");
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const resetSlice = createSlice({
  name: "reset",
  initialState: {
    loading: false,
    message: null,
    error: null,
  },
  reducers: {
    clearResetState: (state) => {
      state.loading = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling OTP Request
      .addCase(requestOTP.pending, (state) => {
        state.loading = true;
        state.message = null;
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handling Password Reset
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.message = null;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearResetState } = resetSlice.actions;
export default resetSlice.reducer;
