import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useLoading } from '../contexts/LoadingContext';

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

const TopLoader = () => {
  const { loading } = useLoading();

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);

  return null;
};

export default TopLoader; 
/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/