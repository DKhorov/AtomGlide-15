import React, { useState } from "react";
import { Box, Typography, Avatar, IconButton, Button, useTheme } from "@mui/material";
import { 
  PlayArrow as PlayArrowIcon, 
  Favorite as FavoriteIcon, 
  FavoriteBorder as FavoriteBorderIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon
} from "@mui/icons-material";

const ACCENT_COLOR = "rgb(237, 93, 25)";

const TrackInfoModal = ({ open, handleClose, track, onPlay }) => {
  const theme = useTheme();
  const palette = theme.palette;

  const borderColor = palette.background?.Border || 'rgba(255, 255, 255, 0.1)';
  const bgColor = palette.background?.default || '#121212';

  if (!open || !track) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 1400, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' 
      }} 
      onClick={handleClose}
    >
      <Box sx={{ 
        bgcolor: bgColor, 
        borderRadius: { xs: '16px', sm: '24px' },
        border: `1px solid ${borderColor}`,
        width: { xs: '95%', sm: '90%' },
        maxWidth: '850px', 
        maxHeight: '90vh', 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: palette.text.primary, 
          p: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${borderColor}` 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Информация о треке
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: palette.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          width: '100%', 
          gap: { xs: 2, md: 4 }, 
          p: { xs: 2, sm: 3 } 
        }}>
          
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={track.cover} 
              variant="rounded" 
              sx={{ 
                width: { xs: 180, sm: 240 }, 
                height: { xs: 180, sm: 240 }, 
                borderRadius: '16px',
                boxShadow: '0px 8px 24px rgba(0,0,0,0.4)',
                border: `1px solid ${borderColor}`
              }} 
            />
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: palette.text.primary, mb: 0.5 }}>
                {track.title}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: palette.text.secondary }}>
                {track.genre || track.genre}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: palette.text.secondary }}>
                <FavoriteIcon sx={{ color: ACCENT_COLOR, fontSize: 20 }} />
                <Typography sx={{ fontWeight: 600 }}>{track.likesCount || 0}</Typography>
              </Box>
              {track.genre && (
                <Typography sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  px: 1.5, py: 0.5, 
                  borderRadius: '8px', 
                  fontSize: '0.85rem',
                  color: palette.text.secondary
                }}>
                  AtomGlide Music
                </Typography>
              )}
            </Box>
          </Box>

          {/* Правая колонка */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, justifyContent: 'center' }}>
            <Box>
              <Typography variant="overline" sx={{ color: palette.text.secondary, letterSpacing: 1 }}>
                Альбом
              </Typography>
              <Typography variant="body1" sx={{ color: palette.text.primary, fontWeight: 500 }}>
                {track.album || "Нет данных о альбоме данного трека. Наверное этот трек был добавлен на сайт раньше когда появилась возможность писать к трекам альбомы. Или просто пользователь не написал ее при публикации ;/"}
              </Typography>
            </Box><Box>
              <Typography variant="overline" sx={{ color: palette.text.secondary, letterSpacing: 1 }}>
                Тип аудио
              </Typography>
              <Typography variant="body1" sx={{ color: palette.text.primary, fontWeight: 500 }}>
                FLAC 24 бита / 96 кГц
              </Typography>
            </Box>
             <Box>
              <Typography variant="overline" sx={{ color: palette.text.secondary, letterSpacing: 1 }}>
                Обработка
              </Typography>
              <Typography variant="body1" sx={{ color: palette.text.primary, fontWeight: 500 }}>
                AtomGlide Digital Remastered 3
              </Typography>
            </Box>
            {track.label && (
              <Box>
                <Typography variant="overline" sx={{ color: palette.text.secondary, letterSpacing: 1 }}>
                  Лейбл
                </Typography>
                <Typography variant="body1" sx={{ color: palette.text.primary, fontWeight: 500 }}>
                  {track.label}
                </Typography>
              </Box>
            )}

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="overline" sx={{ color: palette.text.secondary, letterSpacing: 1 }}>
                Описание
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.03)', 
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                minHeight: '80px',
                mt: 0.5
              }}>
                <Typography variant="body2" sx={{ color: palette.text.primary, whiteSpace: 'pre-wrap' }}>
                  {track.description || "Нет описания для этого трека."}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

       
      </Box>
    </div>
  );
};



const TrackItem = ({ track, isLiked, onPlay, onLike, isActive, isAuth }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenInfo = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <Box 
        onClick={onPlay} 
        sx={{ 
          display: "flex", alignItems: "center", gap: 2, p: 1, 
          borderRadius: '12px', cursor: "pointer", transition: 'background-color 0.2s',
          bgcolor: isActive ? "rgba(237, 93, 25, 0.1)" : "transparent",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" },
          "&:hover .play-icon": { opacity: 1 },
        }}
      >
        <Box sx={{ position: 'relative', width: 48, height: 48, borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
          <Avatar src={track.cover} variant="rounded" sx={{ width: '100%', height: '100%' }} />
          <Box 
            className="play-icon"
            sx={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isActive ? 1 : 0, transition: 'opacity 0.2s'
            }}
          >
            <PlayArrowIcon sx={{ color: isActive ? ACCENT_COLOR : "#fff" }} />
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography noWrap fontWeight="600" sx={{ color: isActive ? ACCENT_COLOR : "#fff", fontSize: '0.95rem', letterSpacing: '-0.2px' }}>
            {track.title}
          </Typography>
          <Typography noWrap variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.2 }}>
            {track.genre} {track.artist && ` • ${track.artist}`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
          
          <IconButton 
            onClick={handleOpenInfo} 
            size="small"
            sx={{ 
              color: "rgba(255,255,255,0.3)",
              '&:hover': { color: '#fff', bgcolor: 'transparent' }
            }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>

          {isAuth && (
            <IconButton 
              onClick={onLike} size="small" 
              sx={{ 
                color: isLiked ? ACCENT_COLOR : "rgba(255,255,255,0.3)",
                '&:hover': { color: isLiked ? ACCENT_COLOR : '#fff', bgcolor: 'transparent' }
              }}
            >
              {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>
      </Box>

      <TrackInfoModal 
        open={isModalOpen} 
        handleClose={() => setIsModalOpen(false)} 
        track={track} 
        onPlay={onPlay} 
      />
    </>
  );
};

export default TrackItem;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/