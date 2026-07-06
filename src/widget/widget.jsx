import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../system/axios'; 
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Grid
} from '@mui/material';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarsIcon from '@mui/icons-material/Stars';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BackspaceIcon from '@mui/icons-material/Backspace';
import RemoveIcon from '@mui/icons-material/Remove';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../system/redux/slices/getme';
import { togglePlay, setTrack } from '../system/redux/playerSlice'; // Добавил setTrack

const ACCENT_COLOR = 'rgb(237, 93, 25)';

const updatesData = [
  "Исправлены баги в работе магазина и покупок",
  "Новые команды в Geromik Logic",
  "Поддержка курсов валют в Geromik Logic",
  "Теперь аватары и фоны можно загружать до 5мб",
  "-----------------------------------",
  "Новые реакции для постов: 3500 штук",
  "Новый дизайн сайдбара",
  "Новые виджеты и меню их редактирования",
  "Новый плеер из Атом Музыки 7",
  "Новый музыкальный раздел «Авторы»",
  "Новый дизайн кошелька",
  "Новый дизайн профиля пользователя",
  "Новое окно входа в аккаунт",
  "Новый раздел «Центр поддержки» (Beta)",
  "Теперь можно кинуть репорт (жалобу) на пост",
  "Теперь при различных операциях на сайте будет показываться Dynamic Island, как на iPhone",
  "Теперь плейлисты и Essentials List находятся в отдельных вкладках",
  "Теперь в поиске контента, а также в управлении сайтом помогает Geromik Logic",
  "Теперь за посты снова начисляются 15 ATM",
  "Теперь за музыку начисляются 20 ATM",
  "Добавлено меню «Поделиться» для постов",
  "Добавлена автокорректировка текста при создании поста",
  "Добавлен автокорректор ошибок в словах при создании поста",
  "Добавлено модальное окно с информацией о треке",
  "Добавлена возможность редактирования текста поста после публикации",
  "Исправлены баги в историях",
  "Исправлен размер картинки в историях (стал стабильным)",
  "Исправлены баги при просмотре фото в постах",
  "Исправлены баги в работе меню на телефоне",
  "Исправлены баги в работе плеера на телефоне",
  "Исправлены ошибки в работе mini-плеера на телефоне",
  "Исправлены баги отображения постов пользователя в профиле",
  "Исправлены баги в работе лайков и их отображения в музыке",
  "Исправлены ошибки в дизайне модальных окон",
  "Исправлены ошибки в работе API",
  "Исправлены ошибки в работе подписок",
  "Исправлены ошибки в работе кошелька и его истории",
  "Поддержка субтитров DR3",
  "Плавные анимации на сайте",
  "Убраны каналы",
  "Убраны некоторые поля в БД пользователя для ускорения загрузки профиля",
  "При создании музыки можно указать не только обложку, но и фон для плеера"
];

const newsData = [
  { id: 1, name: "Washington Router", nick: "@washington", avatar: "https://storage-742.s3hoster.by/test/uploads/1774828913967-754792060.png",url:'/account/69c07345c819ae9141a3b5df' },
  { id: 2, name: "Freedium", nick: "@freedium", avatar: "https://storage-742.s3hoster.by/test/uploads/1781036545627-99400669.jpg",url:'/account/6a2875a6c0488f60222752ba' },
  { id: 3, name: "Dmitry Khorov", nick: "@jpegweb", avatar: "https://storage-742.s3hoster.by/test/uploads/1779920375059-847652766.gif" ,url:'/account/67f839f15baccc5b3248942e'}
];

const recommendedData = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  name: `Пользователь ${i + 1}`,
  nick: `@user_${i + 1}`,
  avatar: `U${i + 1}`
}));

const ALL_AVAILABLE_WIDGETS = [
  { id: 'profile', title: 'Профиль пользователя' },
  { id: 'music', title: 'Плеер Atom Music' },
  { id: 'tracks', title: 'Последние треки' }, // Новый виджет
  { id: 'ranking', title: 'Топ по постам' },
  { id: 'versions', title: 'Что нового в обновлении?' },
  { id: 'news', title: 'Новостные каналы' },
  { id: 'currency', title: 'Курс AtomPro+' },
  { id: 'time', title: 'Текущее время' },
  { id: 'notes', title: 'Быстрые заметки' },
];

const WidgetMain = React.memo(() => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { activePlaylist = [], currentIndex = null, isPlaying = false } = useSelector((state) => state.player || {});
  const [topUsers, setTopUsers] = useState([]);
  const [loadingRating, setLoadingRating] = useState(true);
  const [latestTracks, setLatestTracks] = useState([]); 
  const [panelsOrder, setPanelsOrder] = useState(() => {
    const savedOrder = localStorage.getItem('atom_widget_order');
    return savedOrder ? JSON.parse(savedOrder) : ['profile', 'music', 'ranking', 'versions', 'news', 'currency'];
  });

  useEffect(() => {
    localStorage.setItem('atom_widget_order', JSON.stringify(panelsOrder));
  }, [panelsOrder]);

  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [noteText, setNoteText] = useState(() => {
    return localStorage.getItem('atom_widget_notes') || '';
  });

  useEffect(() => {
    localStorage.setItem('atom_widget_notes', noteText);
  }, [noteText]);

  const [calcDisplay, setCalcDisplay] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data } = await axios.get('/rating/active-users');
        if (Array.isArray(data)) setTopUsers(data.slice(0, 3));
      } catch (err) {
        console.error("Ошибка рейтинга:", err);
      } finally { setLoadingRating(false); }
    };

    const fetchLatestTracks = async () => {
      try {
        const { data } = await axios.get('/tracksq');
        const processed = data.slice(0, 10).map((t) => ({
          ...t,
          cover: t.cover || "https://images.unsplash.com/photo-1549492167-27e1f4869c0d?w=800&auto=format&fit=crop&q=60",
          title: t.title || "Без названия",
          genre: t.genre || "Без жанра"
        }));
        setLatestTracks(processed);
      } catch (err) {
        console.error("Ошибка загрузки треков:", err);
      }
    };

    fetchRating();
    fetchLatestTracks();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTrack = useMemo(() => {
    if (currentIndex !== null && activePlaylist[currentIndex]) return activePlaylist[currentIndex];
    return { title: 'Не проигрывается', artist: 'Atom Music' };
  }, [currentIndex, activePlaylist]);

  const handleDragStart = (index) => (dragItem.current = index);
  const handleDragEnter = (index) => (dragOverItem.current = index);
  const handleDragEnd = () => {
    const newOrder = [...panelsOrder];
    const draggedItem = newOrder[dragItem.current];
    newOrder.splice(dragItem.current, 1);
    newOrder.splice(dragOverItem.current, 0, draggedItem);
    dragItem.current = null;
    dragOverItem.current = null;
    setPanelsOrder(newOrder);
  };

  const toggleWidget = (widgetId) => {
    if (panelsOrder.includes(widgetId)) {
      setPanelsOrder(panelsOrder.filter(id => id !== widgetId));
    } else {
      setPanelsOrder([...panelsOrder, widgetId]);
    }
  };

  const handleCalcClick = (val) => {
    if (val === 'C') {
      setCalcDisplay('');
    } else if (val === '=') {
      try { 
        setCalcDisplay(String(eval(calcDisplay))); 
      } catch (e) { 
        setCalcDisplay('Ошибка'); 
      }
    } else {
      setCalcDisplay(prev => prev === 'Ошибка' ? val : prev + val);
    }
  };

  const renderCalcBtnContent = (btn) => {
    switch(btn) {
      case 'C': return <BackspaceIcon fontSize="small" />;
      case '+': return <AddIcon fontSize="small" />;
      case '-': return <RemoveIcon fontSize="small" />;
      case '*': return <CloseIcon fontSize="small" />; // Крестик для умножения
      case '/': return <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>÷</Typography>;
      case '=': return <Typography sx={{ fontSize: '1.4rem', fontWeight: 'bold' }}>=</Typography>;
      default: return btn;
    }
  };

  const getMediaUrl = (url) => {
    if (!url || url.includes('undefined')) return undefined; 
    return url.startsWith('http') ? url : `https://atomglidedev.ru${url}`;
  };

  const paperStyle = {
    p: 2, position: 'relative', borderRadius: '15px', 
    bgcolor: 'rgb(41,42,46)', border: '2px solid rgba(55, 57, 61)',
  };

  const widgets = {
    profile: (
      <Paper elevation={0} sx={paperStyle}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar src={getMediaUrl(user?.avatarUrl)} sx={{ width: 64, height: 64, border: '3px solid #374151' }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', lineHeight: 1.2 }}>
              {user?.fullName || user?.username || 'Guest'}
            </Typography>
            <Typography sx={{ fontSize: '0.90rem', color: '#9ca3af', mt: 0.2 }}>
              {user?.username || 'login'}
            </Typography>
          </Box>
        </Box>
        <Button 
          fullWidth onClick={() => navigate(`/account/${user?.id || user?._id}`)}
          sx={{ bgcolor: 'rgb(46,50,54)', color: '#fff', textTransform: 'none', fontWeight: 800, borderRadius: '100px', py: 0.8, '&:hover': { bgcolor: '#4b5563' } }}>
          Открыть профиль
        </Button>
      </Paper>
    ),

    music: (
      <Paper elevation={0} sx={{
        position: 'relative', height: currentTrack.cover ? '250px': '80px', borderRadius: '15px', overflow: 'hidden',
        backgroundImage: `url('${currentTrack.cover}')`, backgroundSize: 'cover', backgroundPosition: 'center',
        border: '2px solid rgba(55, 57, 61)', transition: 'background-image 0.5s ease-in-out'
      }}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.5)', zIndex: 10 }} />
        <Box sx={{
          position: 'absolute', bottom: 0, width: '100%', p: 2, boxSizing: 'border-box',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', flexGrow: 1 }}>
            <Avatar variant="rounded" src={currentTrack.cover || '1.png'} sx={{ width: 44, height: 44, borderRadius: '5px' }} />
            <Box sx={{ overflow: 'hidden' }}>
              <Typography noWrap sx={{ color: '#fff', fontWeight:'bold', fontSize: '0.95rem' }} >{currentTrack.title}</Typography>
              <Typography noWrap sx={{ color: '#bbb', fontSize: '0.75rem' }}>AtomGlide Music</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => dispatch(togglePlay())} sx={{ bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: ACCENT_COLOR, color: '#fff' } }}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Box>
      </Paper>
    ),

    tracks: (
      <Paper elevation={0} sx={{ ...paperStyle, maxHeight: '350px', overflowY: 'auto' }}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', mb: 2 }}>Последние треки</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {latestTracks.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
               <CircularProgress size={20} sx={{ color: ACCENT_COLOR }} />
            </Box>
          ) : (
            latestTracks.map((track, idx) => (
              <Box 
                key={track._id || idx} 
                onClick={() => dispatch(setTrack({ playlist: latestTracks, index: idx }))} // Логика Play из твоего кода
                sx={{ 
                  display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
                  p: 1, borderRadius: '10px', transition: 'all 0.2s',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                }}>
                <Avatar variant="rounded" src={track.cover} sx={{ width: 40, height: 40, borderRadius: '8px' }} />
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography noWrap sx={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{track.title}</Typography>
                  <Typography noWrap sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>{track.genre}</Typography>
                </Box>
                <PlayArrowIcon sx={{ color: ACCENT_COLOR, opacity: 0.8 }} />
              </Box>
            ))
          )}
        </Box>
      </Paper>
    ),
 news: (
  <Paper elevation={0} sx={paperStyle}>
    <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', mb: 2 }}>Новостные каналы</Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {newsData.map(item => (
        <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', fontWeight: 'bold' }} src={item.avatar}></Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography noWrap sx={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{item.name}</Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.nick}</Typography>
          </Box>
          {/* Кнопка с переходом по внешней ссылке */}
          <Button 
            onClick={() => {
              if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
            }}
            size="small" 
            sx={{ 
              minWidth: 'auto', 
              bgcolor: 'rgba(255,255,255,0.05)', 
              color: '#fff', 
              borderRadius: '10px', 
              px: 1.5, 
              py: 0.5, 
              fontSize: '0.7rem', 
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
            }}
          >
            Перейти
          </Button>
        </Box>
      ))}
    </Box>
  </Paper>
),
    ranking: (
      <Paper elevation={0} sx={{ ...paperStyle, minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pr: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>Топ по постам</Typography>
          <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
        </Box>
        {loadingRating ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={20} sx={{ color: ACCENT_COLOR }} /></Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 0.5, mt: 'auto' }}>
            {[1, 0, 2].map((posIndex) => {
              const pUser = topUsers[posIndex];
              if (!pUser) return <Box key={posIndex} sx={{ flex: 1 }} />;
              const isFirst = posIndex === 0;
              const color = isFirst ? '#FFD700' : posIndex === 1 ? '#C0C0C0' : '#CD7F32';
              const h = isFirst ? 75 : posIndex === 1 ? 50 : 35;

              return (
                <Box key={pUser._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '90px' }}>
                  <Box sx={{ position: 'relative', mb: 0.5 }}>
                    {isFirst && <StarsIcon sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', color: 'gold', fontSize: 16 }} />}
                    <Avatar src={getMediaUrl(pUser.avatarUrl)} sx={{ width: isFirst ? 40 : 32, height: isFirst ? 40 : 32, border: `2px solid ${color}` }} />
                  </Box>
                  <Typography noWrap sx={{ color: 'white', fontWeight: 700, fontSize: '0.6rem', mb: 0.3 }}>{pUser.username}</Typography>
                  <Box sx={{ width: '100%', height: h, background: `linear-gradient(180deg, ${color}33 0%, rgba(30,30,30,1) 100%)`, borderTopLeftRadius: 8, borderTopRightRadius: 8, border: `1px solid ${color}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                    <Typography sx={{ color: color, fontWeight: 900, fontSize: '0.7rem' }}>{posIndex + 1}</Typography>
                    <Typography sx={{ color: '#9ca3af', fontSize: '0.55rem', mt: 'auto', pb: 0.5 }}>{pUser.postsCount} п.</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    ),

    versions: (
      <Paper elevation={0} sx={paperStyle}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', mb: 2 }}>Обновление 15.1 ( 06.07.26 ) </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {updatesData.map((text, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ACCENT_COLOR, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.3 }}>{text}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    ),

   

    recommended: (
      <Paper elevation={0} sx={{ ...paperStyle, maxHeight: '350px', overflowY: 'auto' }}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', mb: 2 }}>Рекомендуем</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recommendedData.map(item => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }} src={item.avatar}> </Avatar>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Typography noWrap sx={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{item.name}</Typography>
                <Typography noWrap sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.nick}</Typography>
              </Box>
              <Button size="small" sx={{ minWidth: 'auto', bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '10px', px: 1.5, py: 0.5, fontSize: '0.7rem', textTransform: 'none' }}>
                Перейти
              </Button>
            </Box>
          ))}
        </Box>
      </Paper>
    ),

    currency: (
      <Paper elevation={0} sx={paperStyle}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', mb: 2 }}>AtomPro+</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>$ 1.99</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>USD</Typography>
          </Box>
          <Box sx={{ width: '1px', height: '40px', bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>ATM 300</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>ATM</Typography>
          </Box>
        </Box>
      </Paper>
    ),

    time: (
      <Paper elevation={0} sx={{ ...paperStyle, textAlign: 'center', py: 3 }}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <AccessTimeIcon sx={{ color: ACCENT_COLOR, fontSize: 32, mb: 1 }} />
        <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', mt: 1 }}>
          {currentTime.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Typography>
      </Paper>
    ),

    notes: (
      <Paper elevation={0} sx={{ ...paperStyle, pb: 1 }}>
        <DragIndicatorIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#4b5563' }} />
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', mb: 1.5 }}>Заметки</Typography>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Напишите что-нибудь..."
          style={{
            width: '100%', height: '100px', backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff',
            border: 'none', borderRadius: '10px', padding: '12px', boxSizing: 'border-box',
            fontFamily: 'inherit', fontSize: '0.85rem', resize: 'none', outline: 'none'
          }}
        />
      </Paper>
    ),

    calculator: (
     <></>
    )
  };

  if (!user) return null;

  return (
    <Box sx={{ position: 'sticky', top: '150px', width: '350px', display: 'flex', flexDirection: 'column', gap: 2, mt: 3, pb: 4 }}>
      
      {panelsOrder.map((panelKey, index) => (
        <Box
          key={panelKey}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          sx={{ cursor: 'grab', transition: 'transform 0.2s', userSelect: 'none' }}
        >
          {widgets[panelKey]}
        </Box>
      ))}

      {showSettings ? (
        <Paper elevation={0} sx={{
          p: 2, borderRadius: '15px', bgcolor: 'rgb(31,32,36)', border: `2px dashed ${ACCENT_COLOR}`,
          display: 'flex', flexDirection: 'column', gap: 1.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>Управление виджетами</Typography>
            <IconButton onClick={() => setShowSettings(false)} sx={{ color: '#9ca3af', p: 0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ALL_AVAILABLE_WIDGETS.map(widget => {
              const isActive = panelsOrder.includes(widget.id);
              return (
                <Box key={widget.id} sx={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '10px'
                }}>
                  <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{widget.title}</Typography>
                  <Button 
                    onClick={() => toggleWidget(widget.id)}
                    sx={{
                      bgcolor: isActive ? ACCENT_COLOR : 'transparent',
                      color: isActive ? '#fff' : '#9ca3af',
                      border: `1px solid ${isActive ? ACCENT_COLOR : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '20px', px: 1.5, py: 0.2, fontSize: '0.7rem', textTransform: 'none',
                      '&:hover': { bgcolor: isActive ? ACCENT_COLOR : 'rgba(255,255,255,0.08)' }
                    }}
                  >
                    {isActive ? 'Скрыть' : 'Добавить'}
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Paper>
      ) : (
        <Paper 
          onClick={() => setShowSettings(true)}
          elevation={0} 
          sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '60px', cursor: 'pointer', borderRadius: '15px',
            border: '2px dashed #4b5563', bgcolor: 'transparent', transition: 'all 0.3s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', borderColor: '#6b7280' }
          }}
        >
          <AddIcon sx={{ color: '#4b5563', fontSize: 32 }} />
        </Paper>
      )}

    </Box>
  );
});

export default WidgetMain;


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/