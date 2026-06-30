// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { storeReducer } from './slices/store';
import { postsReducer } from './slices/posts';
import profileReducer from './slices/profile';
import { authReducer } from './slices/auth';
import getmeReducer from './slices/getme';
import playerReducer from './playerSlice.js';
import commentsReducer from './slices/comments';
import { uiReducer } from './slices/store';

const store = configureStore({
  reducer: {
    store: storeReducer,
    posts: postsReducer,
    profile: profileReducer,
    auth: authReducer,
    user: getmeReducer,
    player: playerReducer,
    ui: uiReducer,
    comments: commentsReducer,
  },
});

export default store;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/