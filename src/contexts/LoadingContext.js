import React, { createContext, useContext, useState, useEffect } from 'react';
const LoadingContext = createContext();
export const useLoading = () => useContext(LoadingContext);
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 500); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading, initialLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}; 
/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/