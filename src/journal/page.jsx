import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from "../system/axios.js";
import { 
  Box, Typography, CircularProgress, useMediaQuery, 
  Avatar, Skeleton, Menu, MenuItem, IconButton 
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const NO_IMAGE_URL = 'https://placehold.co/600x400/1a1a1a/666666?text=Atom+Journal';

const JournalList = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [activeTopic, setActiveTopic] = useState('Все');
  
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const fetchJournals = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const { data } = await axios.get('/dev/Journal/all');
      const journalsData = Array.isArray(data) ? data : [];
      setJournals(journalsData);
      
      if (activeTopic !== 'Все' && !journalsData.some(j => j.topic === activeTopic)) {
        setActiveTopic('Все');
      }
    } catch (err) {
      console.error('Ошибка при получении журналов:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [activeTopic]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchJournals(true); 
    setTimeout(() => setIsRefreshing(false), 600);
  };

  
  const uniqueTopics = useMemo(() => {
    const topics = journals.map(j => j.topic).filter(Boolean);
    return ['Все', ...new Set(topics)];
  }, [journals]);

  const { visibleTopics, hiddenTopics } = useMemo(() => {
    if (uniqueTopics.length <= 6) { // 'Все' + 5 тем
      return { visibleTopics: uniqueTopics, hiddenTopics: [] };
    }
    return {
      visibleTopics: uniqueTopics.slice(0, 6),
      hiddenTopics: uniqueTopics.slice(6)
    };
  }, [uniqueTopics]);

  const isCurrentTopicHidden = useMemo(() => {
    return hiddenTopics.includes(activeTopic);
  }, [activeTopic, hiddenTopics]);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  
  const handleSelectHiddenTopic = (topic) => {
    setActiveTopic(topic);
    handleCloseMenu();
  };

  const filteredJournals = useMemo(() => {
    if (activeTopic === 'Все') return journals;
    return journals.filter(j => j.topic === activeTopic);
  }, [journals, activeTopic]);

  const getFirstImageUrl = (textBlocks) => {
    if (!Array.isArray(textBlocks)) return null;
    
    const imageBlock = textBlocks.find(block => 
      block.type === 'image' && block.data && block.data.file && block.data.file.url
    );
    
    return imageBlock ? imageBlock.data.file.url : null;
  };

  const RenderSkeleton = () => (
    <Box sx={{ p: 1 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '24px', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={30} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="text" width={60} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '16px', mb: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Skeleton variant="text" width="40%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{
      width: isMobile ? '100%' : '700px',
      height: '100vh',
      overflowY: 'auto',
      px: isMobile ? 1 : 2,
      mt: 2,
      '&::-webkit-scrollbar': { display: 'none' } // Прячем скроллбар
    }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: isMobile ? 2 : 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
          Atom <span style={{ color: 'rgba(255,255,255,0.5)' }}>Journal</span>
        </Typography>

        <Box
          onClick={handleRefresh}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 2, py: 0.8, fontSize: '14px', fontWeight: 600, cursor: 'pointer', borderRadius: '20px',
            bgcolor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', color: '#fff',
            transition: 'all 0.2s ease-in-out', border: '1px solid rgba(255, 255, 255, 0.03)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
            opacity: isRefreshing ? 0.7 : 1
          }}
        >
          <AutorenewIcon sx={{
            fontSize: '18px',
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }
          }} />
          {!isMobile && <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Обновить</Typography>}
        </Box>
      </Box>

      {uniqueTopics.length > 1 && (
        <Box sx={{
          display: 'flex', alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)',
          borderRadius: '20px', p: 0.5, border: '1px solid rgba(255, 255, 255, 0.03)', mb: 3,
          position: 'relative', overflow: 'visible'
        }}>
          {/* Ползунок (только для видимых тем) */}
          {!isCurrentTopicHidden && visibleTopics.includes(activeTopic) && (
            <Box sx={{
              position: 'absolute', top: 4, bottom: 4,
              width: hiddenTopics.length > 0 ? 'calc(14.28% - 6px)' : `calc(${100 / visibleTopics.length}% - 6px)`,
              left: `calc(${visibleTopics.indexOf(activeTopic) * (hiddenTopics.length > 0 ? 14.28 : (100 / visibleTopics.length))}% + 3px)`,
              bgcolor: '#fff', borderRadius: '16px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 0, pointerEvents: 'none'
            }} />
          )}

          {visibleTopics.map((topic) => {
            const isActive = activeTopic === topic;
            return (
              <Box key={topic} onClick={() => setActiveTopic(topic)} sx={{
                flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
                py: 1, cursor: 'pointer', position: 'relative', zIndex: 2, minWidth: 0
              }}>
                <Typography noWrap sx={{
                  fontSize: isMobile ? '12px' : '13px', fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#000' : 'rgba(255,255,255,0.7)',
                  transition: 'color 0.2s ease', px: 1
                }}>
                  {topic}
                </Typography>
              </Box>
            );
          })}

          {hiddenTopics.length > 0 && (
            <Box sx={{ width: '14.28%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
              <IconButton onClick={handleOpenMenu} size="small" sx={{
                color: isCurrentTopicHidden ? '#00f2ff' : 'rgba(255,255,255,0.5)',
                bgcolor: isCurrentTopicHidden ? 'rgba(0,242,255,0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: {
                bgcolor: 'rgb(20, 20, 20)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                mt: 1, minWidth: '150px',
                '& .MuiMenuItem-root': {
                  fontSize: '13px', color: 'rgba(255,255,255,0.8)',
                  margin: '2px 6px', borderRadius: '8px',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600 },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                }
              }
            }}
          >
            {hiddenTopics.map(topic => (
              <MenuItem key={topic} selected={activeTopic === topic} onClick={() => handleSelectHiddenTopic(topic)}>
                {topic}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}

      {loading ? (
        <RenderSkeleton />
      ) : filteredJournals.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 10, gap: 2, opacity: 0.5 }}>
          <Typography variant="h6" color="textSecondary">В этой рубрике пока нет статей</Typography>
          {activeTopic !== 'Все' && (
            <Typography onClick={() => setActiveTopic('Все')} sx={{ color: '#00f2ff', cursor: 'pointer' }}>
              Показать все
            </Typography>
          )}
        </Box>
      ) : (
        filteredJournals.map(item => {
          const authorData = item.author || {};
          const avatarUrl = authorData.avatarUrl;
          const fullName = authorData.fullName || authorData.username || 'Аноним';
          
          const coverImage = getFirstImageUrl(item.text);

          return (
            <Link key={item._id} to={`/journal/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{
                p: isMobile ? 2 : 2.5, mb: 1, borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{
                    px: 1.5, py: 0.5, borderRadius: '8px',
                    bgcolor: 'rgba(0, 242, 255, 0.08)', border: '1px solid rgba(0, 242, 255, 0.15)'
                  }}>
                    <Typography sx={{ fontSize: '11px', color: '#00f2ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.topic}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                    {new Date(item.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                </Box>                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 800, color: '#fff',
                    lineHeight: 1.3, fontSize: isMobile ? '20px' : '20px',mt:2,
                    display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
                  }}>
                    {item.title}
                  </Typography>

                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    flexShrink: 0, bgcolor: 'rgba(0,0,0,0.2)', px: 1, py: 0.5, borderRadius: '12px'
                  }}>
                    <Typography sx={{
                      fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500,
                      maxWidth: isMobile ? '60px' : '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {fullName}
                    </Typography>
                    <Avatar
                      src={avatarUrl}
                      alt={fullName}
                      variant="rounded"
                      sx={{
                        width: 28, height: 28, borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        bgcolor: 'rgba(255,255,255,0.05)', fontSize: '14px'
                      }}
                    >
                      {fullName[0].toUpperCase()}
                    </Avatar>
                  </Box>
                </Box>

                {coverImage && (
                  <Box sx={{
                    width: '100%', height: isMobile ? '180px' : '240px',
                    borderRadius: '16px', overflow: 'hidden', mb: 2,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <Box
                      component="img"
                      src={coverImage}
                      alt={item.title}
                      loading="lazy"
                      sx={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', 
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.03)' }
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </Box>
                )}

          
              </Box>
            </Link>
          );
        })
      )}

      <Box sx={{ mb: isMobile ? 12 : 6 }}></Box>
    </Box>
  );
};

export default JournalList;


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/