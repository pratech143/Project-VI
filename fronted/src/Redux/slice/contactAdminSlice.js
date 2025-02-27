import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "@/api/baseApi";

export const contactAdmin = createAsyncThunk(
  "contact/contactAdmin",
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("function/contact_admin.php", contactData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || "Server error");
    }
  }
);

const contactAdminSlice = createSlice({
  name: "contactAdmin",
  initialState: { loading: false, error: null, success: null },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(contactAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(contactAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(contactAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = contactAdminSlice.actions;
export default contactAdminSlice.reducer;