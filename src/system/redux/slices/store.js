import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';
import { createSlice as createUiSlice } from '@reduxjs/toolkit';

export const fetchApps = createAsyncThunk('store/fetchApps', async () => {
  const { data } = await axios.get('/store/apps');
  return data;
});

export const fetchCategories = createAsyncThunk('store/fetchCategories', async () => {
  const { data } = await axios.get('/store/categories');
  return data;
});

const initialState = {
  apps: [],
  categories: [],
  loading: false,
  error: null,
  selectedCategory: 'all',
  searchQuery: ''
};

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApps.fulfilled, (state, action) => {
        state.loading = false;
        state.apps = action.payload;
      })
      .addCase(fetchApps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setSelectedCategory, setSearchQuery } = storeSlice.actions;

export const storeReducer = storeSlice.reducer;

// UI Settings Slice

const uiInitialState = {
  panelCurve: typeof window !== 'undefined' ? localStorage.getItem('atomglide_panel_curve') || 'rounded' : 'rounded',
};

const uiSlice = createUiSlice({
  name: 'ui',
  initialState: uiInitialState,
  reducers: {
    setPanelCurve: (state, action) => {
      state.panelCurve = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('atomglide_panel_curve', action.payload);
      }
    },
  },
});

export const { setPanelCurve } = uiSlice.actions;
export const selectPanelCurve = (state) => state.ui.panelCurve;
export const uiReducer = uiSlice.reducer; 
/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/