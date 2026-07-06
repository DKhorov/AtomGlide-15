import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Box, IconButton, Typography, Skeleton, Dialog } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const getMediaFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://atomglidedev.ru${url.startsWith('/') ? url : `/${url}`}`;
};

const PostPhoto = ({ post, postIndex = 0 }) => {
  const mediaRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loaded, setLoaded] = useState({});
  const [errors, setErrors] = useState({});

  const images = useMemo(() => {
    if (post?.images?.length > 0) return post.images;
    if (post?.imageUrl) return [post.imageUrl];
    return [];
  }, [post]);

  const isVideo = Boolean(post?.videoUrl);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!openModal || images.length <= 1) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setOpenModal(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal, images.length]);

  const handleLoad = (idx) => {
    setLoaded((prev) => ({ ...prev, [idx]: true }));
  };

  const handleError = (idx) => {
    setErrors((prev) => ({ ...prev, [idx]: true }));
  };

  if (!isVideo && images.length === 0) return null;

  const renderMediaItem = (img, idx, isSingle = false) => {
    const url = getMediaFullUrl(img);
    const isImageLoaded = loaded[idx];
    const hasError = errors[idx];

    return (
      <Box
        key={idx}
        onClick={() => {
          setCurrentImageIdx(idx); 
          setOpenModal(true);
        }}
        sx={{
          position: 'relative',
          width: '100%',
          height: isSingle ? 'auto' : '200px',
          minHeight: isSingle ? '250px' : '200px',
          bgcolor: '#1a1a1a',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {/* Скелетон */}
        {!isImageLoaded && !hasError && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ bgcolor: '#222', position: 'absolute', top: 0, left: 0 }}
          />
        )}

        {hasError ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 2 }}>
            <Typography variant="caption" color="grey.600">Ошибка загрузки</Typography>
          </Box>
        ) : (
          <img
            src={url}
            alt={`post-media-${idx}`}
            onLoad={() => handleLoad(idx)}
            onError={() => handleError(idx)}
            loading={postIndex < 2 ? "eager" : "lazy"}
            style={{
              width: '100%',
              height: isSingle ? 'auto' : '100%',
              maxHeight: isSingle ? '600px' : 'none',
              objectFit: 'cover',
              display: 'block',
              opacity: isImageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        )}
      </Box>
    );
  };

  if (isVideo) {
    return (
      <Box sx={{ width: '100%', mt: 1, position: 'relative', borderRadius: '20px', overflow: 'hidden', bgcolor: '#111', height: '440px' }}>
        <video
          ref={mediaRef}
          src={getMediaFullUrl(post.videoUrl)}
          loop
          muted
          playsInline
          autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <IconButton 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (isPlaying) { mediaRef.current.pause(); } else { mediaRef.current.play(); }
            setIsPlaying(!isPlaying);
          }} 
          sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Box>
    );
  }

  const activeImageUrl = getMediaFullUrl(images[currentImageIdx]);

  return (
    <>
      <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
        {images.length === 1 ? (
          <Box sx={{ borderRadius: '5px', overflow: 'hidden' }}>
            {renderMediaItem(images[0], 0, true)}
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gap: 1, 
            gridTemplateColumns: '1fr 1fr', 
            borderRadius: '20px', 
            overflow: 'hidden' 
          }}>
            {/* Рендерим первые 4 фото в сетку */}
            {images.slice(0, 4).map((img, idx) => renderMediaItem(img, idx, false))}
          </Box>
        )}
      </Box>

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth={false}
        scroll="no"
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            boxShadow: 'none',
            backgroundImage: 'none',
            margin: 0,
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }
        }}
      >
        {/* Кнопка закрытия */}
        <IconButton 
          onClick={() => setOpenModal(false)} 
          sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            color: 'white', 
            bgcolor: 'rgba(255,255,255,0.1)',
            zIndex: 10,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>

        {images.length > 1 && (
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <ArrowBackIosNewIcon fontSize="large" />
          </IconButton>
        )}

        {images.length > 1 && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <ArrowForwardIosIcon fontSize="large" />
          </IconButton>
        )}

        {images.length > 1 && (
          <Typography
            variant="body1"
            sx={{
              position: 'absolute',
              top: 25,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontWeight: 'bold',
              zIndex: 10,
              letterSpacing: '1px'
            }}
          >
            {currentImageIdx + 1} / {images.length}
          </Typography>
        )}
        
        <Box
          component="img"
          src={activeImageUrl}
          alt={`Modal view ${currentImageIdx}`}
          sx={{ 
            maxWidth: '95%', 
            maxHeight: '95%', 
            objectFit: 'contain',
            userSelect: 'none',
            // Плавное появление картинки при переключении
            key: currentImageIdx,
            animation: 'fadeIn 0.2s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 }
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </Dialog>
    </>
  );
};

export default PostPhoto;


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/