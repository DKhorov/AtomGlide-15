// src/redux/slices/player.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: 0.7,
  audioRef: null
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setAudioRef: (state, action) => {
      state.audioRef = action.payload;
    }
  }
});

// Изменяем экспорт экшенов
export const actions = playerSlice.actions;
export const selectPlayer = (state) => state.player;
export default playerSlice.reducer;
/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/