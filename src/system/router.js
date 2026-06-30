import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Box, useMediaQuery, Fade, Typography, Button } from '@mui/material';
import { useUser } from '../components/UserProvider';
import { lazyRetry } from '../utils/lazyRetry';
import Sitebar from '../sitebar';
import WidgetMain from '../widget/widget';
import AudioPlayer from '../page/music/play'; 


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Поймана ошибка компонента:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center', color: '#fff', mt: 10 }}>
          <Typography variant="h5" color="error" gutterBottom>Упс! Что-то пошло не так.</Typography>
          <Typography sx={{ opacity: 0.7, mb: 3 }}>Мы уже чиним эту ошибку.</Typography>
          <Button variant="contained" color="warning" onClick={() => window.location.reload()}>Перезагрузить страницу</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};


import PlaylistPage from '../page/music/PlaylistPage'; 
import { Midper } from '../workspace/midper.jsx'; 

const Main = React.lazy(() => lazyRetry(() => import('../page/main/main')));
const Profile = React.lazy(() => lazyRetry(() => import('../page/profile/Profile')));
const FullPost = React.lazy(() => lazyRetry(() => import('../page/main/post/FullPost.jsx')));
const Music = React.lazy(() => lazyRetry(() => import('../page/music/music.jsx')));
const Playlists = React.lazy(() => lazyRetry(() => import('../page/music/Playlists.jsx')));
const Favorites = React.lazy(() => lazyRetry(() => import('../page/music/Favorites.jsx')));
const Essentials = React.lazy(() => lazyRetry(() => import('../page/music/Essentials.jsx')));
const Authors = React.lazy(() => lazyRetry(() => import('../page/music/Authors.jsx')));
const AuthorPage = React.lazy(() => lazyRetry(() => import('../page/music/AuthorPage.jsx')));
const JournalList = React.lazy(() => lazyRetry(() => import('../journal/page.jsx')));
const FullJournal = React.lazy(() => lazyRetry(() => import('../journal/fulljornl.js'))); 
const Store = React.lazy(() => lazyRetry(() => import('../page/apps/store.jsx')));
const AtomsClicker = React.lazy(() => lazyRetry(() => import('../page/apps/game.jsx')));
const MobileSettings = React.lazy(() => lazyRetry(() => import('../widget/setting.jsx')));
const Reting = React.lazy(() => lazyRetry(() => import('../page/reting/index.jsx')));
const Wallet = React.lazy(() => lazyRetry(() => import('../page/wallet')));
const LoginPage = React.lazy(() => lazyRetry(() => import('../page/login')));
const RegistrationPage = React.lazy(() => lazyRetry(() => import('../page/registration')));
const SettingsPage = React.lazy(() => lazyRetry(() => import('../page/settings/SettingsPage.jsx')));
const ThemeSelector = React.lazy(() => lazyRetry(() => import('../page/settings/ThemeSelector.jsx')));
const SubscriptionPage = React.lazy(() => lazyRetry(() => import('../page/subscription/SubscriptionPage.jsx')));

const NotFound = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#fff' }}>
    <Typography variant="h2" fontWeight="bold">404</Typography>
    <Typography variant="h6" sx={{ opacity: 0.6 }}>Страница не найдена</Typography>
  </Box>
);

const LoadingFallback = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Fade in={visible} timeout={800}>
      <Box sx={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          alignItems: "center", backgroundColor: "#000000", color: "#fff", zIndex: 9999, p: 4,
      }}>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src="/1.png" alt="Logo" style={{ width: "120px", height: "120px", objectFit: "contain" }} />
        </Box>
        <Box sx={{ textAlign: "center", fontSize: "25px", fontWeight: 700, opacity: 0.7, pb: 2 }}>
          AtomGlide
        </Box>
      </Box>
    </Fade>
  );
};

const AppRouter = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const location = useLocation();
  const { isLoading } = useUser();
  const baseApiUrl = "https://atomglidedev.ru";
  const isAuthPage = ['/login', '/registration'].includes(location.pathname);

  const WIDGET_HIDDEN_PATHS = useMemo(() => [
    '/create-channel', '/settings', '/account', '/journal', 
    '/setting', '/midper', '/workspace/midper', '/messages'
  ], []);

  const shouldHideWidget = useMemo(() => {
    if (isMobile) return true;
    return WIDGET_HIDDEN_PATHS.some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  }, [location.pathname, isMobile, WIDGET_HIDDEN_PATHS]);

  const shouldHideSidebar = useMemo(() => {
    return location.pathname.startsWith('/gemini');
  }, [location.pathname]);

  if (isLoading) return <LoadingFallback />;

  if (isAuthPage) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />
      {!shouldHideSidebar && <Sitebar />}

      <Box
        sx={{
          display: "flex", gap: shouldHideWidget ? "0px" : "10px", justifyContent: 'center',
          maxWidth: "100%", margin: "0 auto", width: "100%", boxSizing: "border-box",
          minHeight: "100vh", px: 0, transition: "gap 0.2s ease-in-out"
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/post/:id" element={<FullPost />} />
            <Route path="/account/:id" element={<Profile />} />
            <Route path="/music">
              <Route index element={<Music />} />
              <Route path="tracks" element={<Music />} />
              <Route path="playlists" element={<Playlists />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="essentials" element={<Essentials />} />
              <Route path="authors" element={<Authors />} />
              <Route path="authors/:authorName" element={<AuthorPage />} /> 
            </Route>
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/journal/:id" element={<FullJournal />} />
            <Route path="/journal" element={<FullJournal />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/theme" element={<ThemeSelector />} />
            <Route path="/setting" element={<MobileSettings />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/store" element={<Store />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/jrnl" element={<JournalList />} />
            <Route path="/message" element={<AtomsClicker />} />
            <Route path="/forbes" element={<Reting />} />
            <Route path="/workspace/midper" element={<Midper />} />
            <Route path="/midper" element={<Midper />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <AudioPlayer baseApiUrl={baseApiUrl} />
        {!shouldHideWidget && <WidgetMain />}
      </Box>
    </ErrorBoundary>
  );
};

export default AppRouter;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/