import { words, tips } from './data';

export function getRandomWord() {
  const idx = Math.floor(Math.random() * words.length);
  return words[idx];
}

export function getRandomTip() {
  const idx = Math.floor(Math.random() * tips.length);
  return tips[idx];
} 
/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/