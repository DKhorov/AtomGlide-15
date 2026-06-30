import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { createNormalizedTheme } from './system/normalize';
import App from './App';
import Login from './page/login';
import RegistrationPage from './page/registration';
import './fonts/stylesheet.css';
import './style/global.scss';
import './styles/theme-variables.css';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { setGlobalLoadingSetter } from './system/axios';
import ErrorBoundary from './system/boot';
import { tips } from './system/data';
import initPerformanceOptimizations from './system/performance';
import { Provider } from 'react-redux';
import store from './system/redux/store';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; 
import "@fortawesome/fontawesome-free/css/all.min.css";
import { DynamicIslandProvider } from './components/DynamicIslandProvider';

const EpicLoader = () => {
  const { loading, initialLoading } = useLoading();
  const [tipIndex, setTipIndex] = React.useState(
    () => Math.floor(Math.random() * tips.length)
  );

  React.useEffect(() => {
    if (!initialLoading && !loading) return;
    const timer = setTimeout(() => {
      if (initialLoading || loading) {
        setTipIndex(prev => (prev + 1) % tips.length);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [initialLoading, loading]);

  if (!initialLoading && !loading) return null;
  return <></>;
};

const EpicLoaderInit = ({ children }) => {
  const { setLoading } = useLoading();
  React.useEffect(() => {
    setGlobalLoadingSetter(setLoading);
  }, [setLoading]);
  return <>{children}</>;
};

initPerformanceOptimizations();

const theme = createNormalizedTheme(createTheme());
const token = localStorage.getItem("token");
const isAuth = Boolean(token);

const RootApp = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <HelmetProvider> 
      <Provider store={store}>
        <CustomThemeProvider>
          <LoadingProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <ErrorBoundary>
                <EpicLoaderInit>
                  <EpicLoader />
                   <DynamicIslandProvider>
                      <App />
                   </DynamicIslandProvider>
                </EpicLoaderInit>
              </ErrorBoundary>
            </ThemeProvider>
          </LoadingProvider>
        </CustomThemeProvider>
      </Provider>
    </HelmetProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

if (process.env.NODE_ENV === 'production') {
  import('./serviceWorkerRegistration').then(({ register, promptForUpdate }) => {
    register({
      onSuccess: () => {
        console.log('✅ Service Worker registered successfully');
      },
      onUpdate: (wb) => {
        console.log('🔄 New version available');
        promptForUpdate(wb);
      },
    });
  });
}

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/