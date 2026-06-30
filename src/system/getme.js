import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from './axios';

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const fetchUser = createAsyncThunk(
  'user/fetchUser', 
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/auth/me');
      return data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch user');
      }
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async () => {
    await axios.post('/auth/logout');
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        state.isAuthenticated = false;
      })
            .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearUser } = userSlice.actions;
export const selectUser = (state) => state.user.user;
export const selectIsUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

export default userSlice.reducer;
/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/