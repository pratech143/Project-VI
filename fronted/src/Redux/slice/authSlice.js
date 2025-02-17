import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi"; // Assuming you are importing baseApi

// Login action
export const fetchLogin = createAsyncThunk(
  "auth/fetchLogin",
  async ({ email, password }, { rejectWithValue }) => {

    try {
      const response = await baseApi.post("public/login.php", { email, password });

      const data = response.data;
      console.log(data)


      if (data.success === false) {
        throw new Error(data.message || "Login failed!");
      }


      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Register action
export const fetchRegister = createAsyncThunk(
  "auth/fetchRegister",
  async ({ email, password, voter_id }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("public/register.php", { email, password, voter_id });

      const data = response.data;
      console.log(data)

      if (data.success === false) {
        throw new Error(data.message || "Registration failed!");

      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOTP = createAsyncThunk(
  "auth/fetchOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("config/verify-otp.php", { email, otp });

      const data = response.data;
      console.log(data)

      if (data.success === false) {
        throw new Error(data.message || "Registration failed!");

      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    data: null,
    email: "",
    password: "",
    isLoading: false,
    isError: false,
    errorMessage: "",
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(fetchLogin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(fetchLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.email = action.payload.email;
      })
      .addCase(fetchLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

      // Register cases
      .addCase(fetchRegister.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(fetchRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })

//verify OTP cases
      .addCase(fetchOTP.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
    .addCase(fetchOTP.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    })
    .addCase(fetchOTP.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload;
    });
},
});

export default authSlice.reducer;
