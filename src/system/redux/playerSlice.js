import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    activePlaylist: [],
    currentIndex: null,
    isPlaying: false,
  },
  reducers: {
    setTrack: (state, action) => {
      state.activePlaylist = action.payload.playlist;
      state.currentIndex = action.payload.index;
      state.isPlaying = true;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    nextTrack: (state) => {
      if (state.currentIndex < state.activePlaylist.length - 1) {
        state.currentIndex += 1;
      }
    },
    // ДОБАВЛЯЕМ ЭТОТ БЛОК
    prevTrack: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }
    },
    stopPlayer: (state) => {
      state.activePlaylist = [];
      state.currentIndex = null;
      state.isPlaying = false;
    }
  }
});

export const { setTrack, togglePlay, nextTrack, prevTrack, stopPlayer } = playerSlice.actions;
export default playerSlice.reducer;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/