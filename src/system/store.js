// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { postsReducer } from "./posts";
import { authReducer } from "./auth";
import userReducer from "./getme";

const store = configureStore({
    reducer: {
        posts: postsReducer,
        auth: authReducer,
        user: userReducer,
    }
});

export default store;
/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/