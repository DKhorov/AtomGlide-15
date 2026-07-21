"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  useMediaQuery, Box, TextField, Button, IconButton, Typography, Alert, Avatar, Stack,
  BottomNavigation, BottomNavigationAction, Menu, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import '../fonts/stylesheet.css';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; 
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GeromikModal from '../components/GeromikModal'; 
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'; 
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded'; 
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import PollRoundedIcon from '@mui/icons-material/PollRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { TbMusicPlus } from "react-icons/tb";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useSelector, useDispatch } from 'react-redux';
import axios from "../system/axios";
import { selectUser } from '../system/redux/slices/getme';
import PostCreatorModal from '../page/main/PostCreator';
import { useIsland } from '../components/DynamicIslandProvider'; 
import { togglePlay, stopPlayer, nextTrack } from '../system/redux/playerSlice';
import EditorJS from '@editorjs/editorjs';

const ACCENT_COLOR = 'rgb(237, 93, 25)';

const palette = {
  background: {
    default: '#202020',
    paper: '#2A2A2A',
    Button: '#3e3d3d',
    Border: '#4a4a4a',
  },
  action: {
    hover: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
  }
};

const Editor = ({ onChange, initialData }) => {
  const ejInstance = useRef(null);

  useEffect(() => {
    const initEditor = async () => {
      const [Header, ImageTool, CodeTool] = await Promise.all([
        import('@editorjs/header'),
        import('@editorjs/image'),
        import('@editorjs/code'),
      ]);

      if (!ejInstance.current) {
        const editor = new EditorJS({
          holder: 'editorjs',
          data: initialData,
          placeholder: 'Нажмите Tab или плюс...',
          tools: {
            header: { class: Header.default, inlineToolbar: true },
            image: {
              class: ImageTool.default,
              config: {
                endpoints: { byFile: 'https://atomglidedev.ru/upload' }
              }
            },
            code: CodeTool.default, 
          },
          async onChange() {
            const content = await editor.save();
            onChange(content);
          },
        });
        ejInstance.current = editor;
      }
    };

    initEditor();
    return () => {
      if (ejInstance.current) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, []);

  return (
    <Box id="editorjs" sx={{ 
      minHeight: '300px', 
      color: '#fff',
      '& .ce-block': { color: '#fff' },
      '& .ce-toolbar__plus, & .ce-toolbar__settings-btn': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
      '& .cdx-input': { color: '#fff' },
      '& .ce-inline-toolbar': { color: '#000' },
      
      '& .ce-code__textarea': { 
        backgroundColor: '#1e1e1e !important',
        color: '#9cdcfe !important',
        fontFamily: '"Fira Code", "Monaco", "Menlo", "Consolas", "Courier New", monospace !important',
        fontSize: '14px !important',
        lineHeight: '1.6 !important',
        border: '1px solid rgba(255,255,255,0.15) !important',
        borderRadius: '12px !important',
        padding: '16px !important',
        minHeight: '150px !important',
        outline: 'none !important',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2) !important',
        transition: 'border 0.2s ease',
        resize: 'vertical',
      },
      '& .ce-code__textarea:focus': {
        border: `1px solid ${ACCENT_COLOR} !important`,
      }
    }} />
  );
};

const CustomTextField = ({ label, ...props }) => (
  <TextField
    {...props}
    fullWidth
    label={label}
    variant="standard"
    InputLabelProps={{ 
      shrink: true, 
      sx: { 
        color: ACCENT_COLOR, 
        fontWeight: 600, 
        fontSize: '14px',
        '&.Mui-focused': { color: ACCENT_COLOR }
      } 
    }}
    InputProps={{
      disableUnderline: true,
      sx: {
        color: '#fff',
        bgcolor: '#121212',
        borderRadius: '16px',
        px: 2,
        py: 0.8,
        mt: '22px !important',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { bgcolor: '#1a1a1a' },
        '&.Mui-focused': {
          border: `1px solid ${ACCENT_COLOR}`,
          bgcolor: '#0f0f0f',
          boxShadow: `0 0 0 4px rgba(237, 93, 25, 0.15)`
        }
      }
    }}
  />
);

const Sitebar = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); 
  const user = useSelector(selectUser);
  const showIsland = useIsland();
  
  const { activePlaylist = [], currentIndex = null, isPlaying = false } = useSelector((state) => state.player || {});
  const currentTrack = (currentIndex !== null && activePlaylist[currentIndex]) ? activePlaylist[currentIndex] : null;
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  // Состояния для обучалки (0 = выключено, 1 = фокус на шапке, 2 = фокус на модалке)
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    // Проверка, видел ли пользователь туториал
    const hasSeenTutorial = localStorage.getItem('atom_tutorial_seen');
    if (!hasSeenTutorial && user) {
      setTutorialStep(1);
    }
  }, [user]);

  const skipTutorial = () => {
    setTutorialStep(0);
    localStorage.setItem('atom_tutorial_seen', 'true');
  };

  const openModal = () => {
    if (!isCustomModalOpen) setIsMobileMenuOpen(false);
    setIsCustomModalOpen(prev => !prev);
  };
  const closeModal = () => setIsCustomModalOpen(false);

  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [trackData, setTrackData] = useState({ title: "", genre: "", cover: "" });
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [anchorElCreate, setAnchorElCreate] = useState(null);
  const openCreateMenu = Boolean(anchorElCreate);
  
  const [openPostCreator, setOpenPostCreator] = useState(false);
  const [openArticleCreator, setOpenArticleCreator] = useState(false);
  
  // Состояния для создания Опроса
  const [openPollCreator, setOpenPollCreator] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollOptions, setPollOptions] = useState([{ id: 1, text: '', mediaUrl: '' }, { id: 2, text: '', mediaUrl: '' }]);
  const [isPublishingPoll, setIsPublishingPoll] = useState(false);

  // Состояния для статьи
  const [articleTitle, setArticleTitle] = useState('');
  const [articleTopic, setArticleTopic] = useState('');
  const [articleBlocks, setArticleBlocks] = useState(null);
  const [isPublishingArticle, setIsPublishingArticle] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setShowIntro(true);
      const timer = setTimeout(() => setShowIntro(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentTrack?.title]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleInputChange = (e) => setTrackData({ ...trackData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError("");
    if (file) {
      if (file.size / (1024 * 1024) > 30) {
        showIsland("Файл слишком большой. Лимит 30MB.", 'Error', '#f44336');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCloseUpload = () => {
    setOpenUpload(false);
    setTrackData({ title: "", genre: "", cover: "" });
    setSelectedFile(null);
    setUploading(false);
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !trackData.title.trim() || !trackData.genre.trim()) {
       showIsland("Заполните обязательные поля и выберите файл", 'Error', '#f44336');
       return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("track", selectedFile);
      formData.append("title", trackData.title.trim());
      formData.append("genre", trackData.genre.trim());
      formData.append("album", trackData.album?.trim() || "");
      formData.append("description", trackData.description?.trim() || "");
      formData.append("coverflow", trackData.coverflow?.trim() || "");
      
      const finalCover = trackData.cover?.trim() || "https://r-p-media.ru/images/default-album-art.png";
      formData.append("cover", finalCover);
      
      await axios.post("/PostTrack", formData, { headers: { "Content-Type": "multipart/form-data" } });
      handleCloseUpload();
      showIsland('Успешно! +25atm. Перезагрузите страницу', 'CheckCircle', '#4caf50');
      navigate("/music");
    } catch (err) {
      showIsland(err.response?.data?.message || "Ошибка при загрузке", 'Error', '#f44336');
    } finally { 
      setUploading(false); 
    }
  };

  const handlePublishArticle = async () => {
    if (!articleTitle || !articleTopic || !articleBlocks || !user?._id) return showIsland('Заполните данные', 'Error', '#f44336');
    setIsPublishingArticle(true);
    try {
      const response = await fetch('https://atomglidedev.ru/dev/Journal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: articleTitle, topic: articleTopic, text: articleBlocks, author: user._id }),
      });
      const data = await response.json();
      if (data.success) {
        showIsland('Статья опубликована!', 'CheckCircle', '#4caf50');
        setOpenArticleCreator(false);
        setArticleTitle(''); setArticleTopic(''); setArticleBlocks(null);
      } else {
        showIsland('Ошибка публикации', 'Error', '#f44336');
      }
    } catch (e) { 
      showIsland('Ошибка сети', 'Error', '#f44336');
    } finally { 
      setIsPublishingArticle(false); 
    }
  };

  // Методы для опроса
  const handleAddPollOption = () => {
    if (pollOptions.length >= 10) return showIsland('Максимум 10 вариантов', 'Error', '#f44336');
    setPollOptions([...pollOptions, { id: Date.now(), text: '', mediaUrl: '' }]);
  };

  const handleRemovePollOption = (id) => {
    if (pollOptions.length <= 2) return showIsland('Минимум 2 варианта', 'Error', '#f44336');
    setPollOptions(pollOptions.filter(opt => opt.id !== id));
  };

  const handleUpdatePollOption = (id, field, value) => {
    setPollOptions(pollOptions.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  const handlePublishPoll = async () => {
  const validOptions = pollOptions.filter(o => o.text.trim());
  if (!pollTitle.trim()) return showIsland('Введите вопрос', 'Error', '#f44336');
  if (validOptions.length < 2) return showIsland('Заполните минимум 2 варианта', 'Error', '#f44336');

  setIsPublishingPoll(true);
  try {
    const res = await axios.post('/posts', {
      title: pollTitle, // <-- ДОБАВЛЕНО ОБЯЗАТЕЛЬНОЕ ПОЛЕ
      text: pollTitle,  // для совместимости
      isPoll: true,
      pollSettings: { isMultipleChoice: pollMultiple },
      pollOptions: validOptions.map(o => ({ 
        text: o.text, 
        mediaUrl: o.mediaUrl?.trim() || null 
      }))
    });

    if (res.status === 200 || res.status === 201 || res.data?.success) {
      showIsland('Опрос успешно создан!', 'CheckCircle', '#4caf50');
      setOpenPollCreator(false);
      setPollTitle('');
      setPollOptions([{ id: 1, text: '', mediaUrl: '' }, { id: 2, text: '', mediaUrl: '' }]);
      if (tutorialStep === 2) skipTutorial();
    } else {
      showIsland(res.data?.message || 'Ошибка сервера', 'Error', '#f44336');
    }
  } catch (err) {
    console.error('Poll creation error:', err.response?.data || err.message);
    const serverMessage = err.response?.data?.message || 'Ошибка при создании опроса';
    showIsland(serverMessage, 'Error', '#f44336');
  } finally {
    setIsPublishingPoll(false);
  }
};

  const isMusicRoute = location.pathname.includes('/music');
  const isStoreRoute = location.pathname.includes('/store');

  const menuItems = useMemo(() => {
    if (isMusicRoute) {
      return [
        { label: 'Главная', href: '/' },
        { label: 'Плейлисты', href: '/music/playlists' },
        { label: 'Избранное', href: '/music/favorites' },
        { label: 'Essentials', href: '/music/essentials' },
        { label: 'Авторы', href: '/music/authors' },
        { label: 'Треки', href: '/music/tracks' },
      ];
    }
    
    // Специальные пункты для магазина
    if (isStoreRoute) {
      return [
        { label: 'Главная', href: '/' },
      
      ];
    }

    const items = [
      { label: 'Главная', href: '/' },
      { label: 'Статьи', href: '/jrnl' },
      { label: 'Магазин', href: '/store' },
      { label: 'Музыка', href: '/music' },
      { label: 'Рейтинг', href: '/forbes' },
    ];
    if (user) {
      items.push(
        { label: 'Кошелёк', href: '/wallet' },
        { label: 'Профиль', href: `/account/${user.id || user._id}` },
        { label: 'Настройки', href: '/settings' },
        { label: 'AtomPro+', href: '/subscription' },
              { label: 'Уведомления', href: '/alerts' },

      );
    } else {
      items.push({ label: 'Войти', href: '/login' });
    }
    return items;
  }, [user, isMusicRoute, isStoreRoute]);

  const handleNavigation = (href) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (openUpload || openPollCreator || tutorialStep === 1) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [openUpload, openPollCreator, tutorialStep]);

  const bottomNavValue = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.includes('/music')) return 1;
    if (path.includes('/jrnl')) return 2;
    if (path.includes('/store')) return 3;
    return isMobileMenuOpen ? 4 : -1; 
  }, [location.pathname, isMobileMenuOpen]);

  return (
    <>
      {/* Затемнение для первого шага туториала (под шапкой) */}
      {tutorialStep === 1 && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1350 }} onClick={skipTutorial} />
          <Box sx={{ position: 'fixed', top: 75, right: { xs: '5%', md: 100 }, zIndex: 1401, bgcolor: ACCENT_COLOR, color: '#fff', p: 3, borderRadius: '20px', boxShadow: '0 20px 50px rgba(237,93,25,0.4)', maxWidth: '320px' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', mb: 1 }}>Добро пожаловать в Atom!</Typography>
            <Typography sx={{ fontSize: '0.95rem', mb: 3, lineHeight: 1.4 }}>Чтобы начать, давай создадим твой первый пост, статью или опрос. Нажми на кнопку «Создать» выше.</Typography>
            <Button onClick={skipTutorial} fullWidth sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', py: 1 }}>Понятно, пропустить</Button>
          </Box>
        </>
      )}

      {/* Затемнение для второго шага туториала (поверх модалки поста) */}
      {tutorialStep === 2 && openPostCreator && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Box sx={{ bgcolor: palette.background.paper, p: 4, borderRadius: '24px', border: `1px solid ${ACCENT_COLOR}`, maxWidth: 420, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', mx: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: '#fff' }}>Твой творческий центр</Typography>
              <Typography sx={{ color: palette.text.secondary, mb: 4, fontSize: '0.95rem', lineHeight: 1.5 }}>
                Здесь ты можешь написать текст, прикрепить медиафайлы или добавить крутой трек. Поделись своими мыслями с миром!
              </Typography>
              <Button variant="contained" fullWidth onClick={skipTutorial} sx={{ bgcolor: ACCENT_COLOR, borderRadius: '16px', py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}>
                Поехали!
              </Button>
            </Box>
          </motion.div>
        </div>
      )}

       <Box sx={{
           backgroundColor: palette.background.paper,
           height: '50px',
           width: 'calc(100% - 25px)',
           display: 'flex',
           alignItems: 'center',
           alignSelf: 'stretch',
           borderRadius:'10px',
           ml:1.5,
           mt:1,
           justifyContent: 'space-between',
           position: 'sticky', 
           top: 10, 
           // Поднимаем zIndex шапки во время туториала
           zIndex: tutorialStep === 1 ? 1400 : 1100,
           boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
       }}>
           <Box sx={{display:'flex', cursor: 'pointer'}} onClick={() => navigate('/')}>
             <Box sx={{
                 width:'auto',
                 height:'40px',
                 borderRadius:'13px',
                 ml:1,
                 overflow: 'hidden',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
             }}>
                 <Box component="img" src="/1.png" sx={{ width: '30px', height: '30px', objectFit: 'cover', ml:1 }} />
                 <Typography sx={{fontFamily:'Arial', ml:1, fontWeight:'Bold', fontSize:'20px', color: palette.text.primary}}>Atom</Typography>
             </Box>
           </Box>
           
           {!isMobile && (
             <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                 <Box sx={{
                     display: 'flex', gap: 0.1, ml: 3, flexGrow: 1, overflowX: 'auto', 
                     whiteSpace: 'nowrap', height: '100%', alignItems: 'center', paddingRight: 0.1,
                     '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none',
                 }}>
                     {menuItems.map((item, index) => (
                         <Button
                             key={index} variant="text" size="small" onClick={() => handleNavigation(item.href)} 
                             sx={{
                                 color: palette.text.secondary, textTransform: 'none', fontSize: '14px', fontFamily: 'arial',
                                 borderRadius: '6px', padding: '4px 8px', minWidth: 'auto', fontWeight: 600,
                                 '&:hover': { backgroundColor: palette.action.hover, color: palette.text.primary }
                             }}
                         >
                             {item.label}
                         </Button>
                     ))}
                 </Box>
             </Box>
           )}
           
           {!isMobile && (
            <Box sx={{ flexGrow: 1, maxWidth: '300px', mx: 2.5, position: 'relative' }}>
               <AnimatePresence mode="wait">
                {showIntro ? (
                  <motion.div key="intro" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Typography sx={{ color: ACCENT_COLOR, fontWeight: 700, textAlign: 'center', letterSpacing: '1px' }}>
                      {currentTrack ? `AtomGlide Music` : ''}
                    </Typography>
                  </motion.div>
                ) : currentTrack ? (
                  <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: palette.background.Button, borderRadius: '8px', p: '2px 15px', border: `1px solid ${palette.background.Border}` }}>
                      <Avatar src={currentTrack.cover} sx={{ width: 28, height: 28, mr: 1.5 }} />
                      <Typography noWrap sx={{ color: palette.text.primary, fontSize: '13px', fontWeight: 600, flexGrow: 1 }}>{currentTrack.title}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => dispatch(togglePlay())} sx={{ color: palette.text.primary }}>
                          {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" onClick={() => dispatch(nextTrack())} sx={{ color: palette.text.primary }}>
                          <SkipNextIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => dispatch(stopPlayer())} sx={{ color: palette.text.secondary }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Stack>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div key="search"></motion.div>
                )}
               </AnimatePresence>
            </Box>
           )}

           <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, gap: 0.5 }}>
               {user && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mr: 1 }}>
                    
                    {/* Кнопка корзины для магазина */}
                    {isStoreRoute && (
                       <IconButton onClick={() => navigate('/store/cart')} sx={{ color: palette.text.primary, bgcolor: palette.background.Button, borderRadius: '10px', width: '35px', height: '35px' }}>
                         <ShoppingCartRoundedIcon sx={{ fontSize: 18 }} />
                       </IconButton>
                    )}

                    <Button 
                      onClick={(e) => setAnchorElCreate(e.currentTarget)} 
                      sx={{ 
                        bgcolor: tutorialStep === 1 ? ACCENT_COLOR : palette.background.Button, 
                        color: tutorialStep === 1 ? '#fff' : palette.text.primary, 
                        borderRadius: '10px', height: '35px', textTransform: 'none', px: 2,
                        position: 'relative', zIndex: tutorialStep === 1 ? 1402 : 'auto',
                        boxShadow: tutorialStep === 1 ? '0 0 20px rgba(237, 93, 25, 0.6)' : 'none',
                        '&:hover': { bgcolor: ACCENT_COLOR, color: '#fff' } 
                      }}
                    >
                      <AddIcon sx={{ fontSize: '18px', mr: isMobile ? 0 : 0.5 }} />
                      {!isMobile && <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Создать</Typography>}
                    </Button>
                    
                    <Menu
                      anchorEl={anchorElCreate}
                      open={openCreateMenu}
                      onClose={() => setAnchorElCreate(null)}
                      PaperProps={{
                        sx: {
                          bgcolor: palette.background.paper, color: palette.text.primary, 
                          border: `1px solid ${palette.background.Border}`, borderRadius: '16px', mt: 1,
                          minWidth: '180px', p: 1, zIndex: 1500
                        }
                      }}
                    >
                      <MenuItem onClick={() => { setOpenPostCreator(true); setAnchorElCreate(null); if(tutorialStep === 1) setTutorialStep(2); }} sx={{ borderRadius: '8px', mb: 0.5 }}>
                        <AddIcon sx={{ mr: 1.5, fontSize: 20 }} /> Создать пост
                      </MenuItem>
                      <MenuItem onClick={() => { setOpenArticleCreator(true); setAnchorElCreate(null); }} sx={{ borderRadius: '8px', mb: 0.5 }}>
                        <ArticleRoundedIcon sx={{ mr: 1.5, fontSize: 20 }} /> Создать статью
                      </MenuItem>
                      <MenuItem onClick={() => { setOpenPollCreator(true); setAnchorElCreate(null); }} sx={{ borderRadius: '8px' }}>
                        <PollRoundedIcon sx={{ mr: 1.5, fontSize: 20 }} /> Создать опрос
                      </MenuItem>
                    </Menu>

                    <IconButton onClick={() => setOpenUpload(true)} sx={{ color: palette.text.primary, bgcolor: palette.background.Button, borderRadius: '10px', width: '35px', height: '35px' }}>
                      <TbMusicPlus size={18} />
                    </IconButton>
                 </Box>
               )}
               {!user && <Button onClick={() => navigate('/login')} sx={{ color: ACCENT_COLOR, mr: 1 }}>Войти</Button>}

               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                   <Button sx={{
                       backgroundColor: palette.background.Button, width:'40px', height:'40px', borderRadius:'13px', ml:1,
                       minWidth: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                   }} onClick={openModal}>
                       <Box component="img" src="/2.png" sx={{ height: '14px', objectFit: 'cover' }} />
                   </Button>
               </Box>
           </Box>
       </Box>

      {isMobile && (
        <Box 
          sx={{ 
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: '450px', zIndex: 1200, 
            bgcolor: 'rgba(26, 29, 35, 0.85)', backdropFilter: 'blur(20px) saturate(160%)', 
            borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}
        >
          <BottomNavigation
            showLabels value={bottomNavValue}
            onChange={(event, newValue) => {
              const routes = ['/', '/music', '/jrnl', '/store'];
              if (newValue < 4) { navigate(routes[newValue]); } else if (newValue === 4) { toggleMobileMenu(); }
            }}
            sx={{ 
              bgcolor: 'transparent', height: 65,
              '& .MuiBottomNavigationAction-root': { 
                color: 'rgba(255, 255, 255, 0.5)', minWidth: 'auto', padding: '6px 0',
                '&.Mui-selected': { color: 'rgb(237, 93, 25)' } 
              },
              '& .MuiBottomNavigationAction-label': { fontSize: '10px', marginTop: '4px', fontWeight: 500, '&.Mui-selected': { fontSize: '11px' } }
            }}
          >
            <BottomNavigationAction label="Главная" icon={<HomeRoundedIcon />} />
            <BottomNavigationAction label="Музыка" icon={<GraphicEqRoundedIcon />} />
            <BottomNavigationAction label="Статьи" icon={<ArticleRoundedIcon />} />
            <BottomNavigationAction label="Магазин" icon={<StorefrontRoundedIcon />} />
            <BottomNavigationAction label="Меню" icon={isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />} />
          </BottomNavigation>
        </Box>
      )}

      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            style={{ 
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100dvh', 
              backgroundColor: palette.background.default, zIndex: 1100, padding: '20px', paddingBottom: '100px', boxSizing: 'border-box', overflowY: 'auto' 
            }}
          >
            <Typography variant="h5" sx={{ color: palette.text.primary, fontWeight: 700, mb: 3 }}>Меню</Typography>
            {menuItems.map((item) => (
              <Box key={item.label} onClick={() => handleNavigation(item.href)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: `1px solid ${palette.background.Border}` }}>
                <Typography sx={{ color: palette.text.primary, fontSize: '18px', fontWeight: 600 }}>{item.label}</Typography>
                <PlayArrowIcon sx={{ fontSize: 16, color: palette.text.secondary }}/>
              </Box>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <GeromikModal isOpen={isCustomModalOpen} onClose={closeModal} />

      {/* Модалка загрузки трека */}
      {openUpload && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} 
          onClick={handleCloseUpload}
        >
          <Box sx={{ 
            bgcolor: palette.background.default, borderRadius: { xs: '16px', sm: '24px' }, border: `1px solid ${palette.background.Border}`,
            width: { xs: '95%', sm: '90%' }, maxWidth: '850px', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: palette.text.primary, p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${palette.background.Border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Мастер загрузки трека</Typography>
              <IconButton onClick={handleCloseUpload} sx={{ color: palette.text.secondary }}><CloseIcon /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', gap: { xs: 2, md: 3 }, p: { xs: 2, sm: 3 } }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomTextField label="Название трека" name="title" value={trackData.title} onChange={handleInputChange} placeholder="In the closet" />
                <CustomTextField label="Автор или группа" name="genre" value={trackData.genre} onChange={handleInputChange} placeholder="Michael Jackson" />
                <CustomTextField label="URL Обложки" name="cover" value={trackData.cover} onChange={handleInputChange} placeholder="https://michaeljackson.com/dangerous.jpg" />
                <Button variant="outlined" component="label" sx={{ py: { xs: 2, sm: 3 }, borderRadius: '20px', border: `2px dashed ${selectedFile ? ACCENT_COLOR : palette.background.Border}`, color: selectedFile ? palette.text.primary : palette.text.secondary, display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {selectedFile ? (
                    <>
                      <MusicNoteIcon sx={{ color: ACCENT_COLOR, fontSize: 32 }} />
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, px: 2, textAlign: 'center' }} noWrap>{selectedFile.name}</Typography>
                      <Typography sx={{ fontSize: '11px', color: palette.text.secondary }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</Typography>
                    </>
                  ) : (
                    <><CloudUploadIcon sx={{ fontSize: 32 }} /><Typography sx={{ fontSize: { xs: '14px', sm: '16px' } }}>Выберите MP3 файл</Typography></>
                  )}
                  <input type="file" hidden accept="audio/mpeg, audio/mp3" onChange={handleFileChange} />
                </Button>
                {uploadError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{uploadError}</Alert>}
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomTextField label="Альбом" name="album" value={trackData.album || ""} onChange={handleInputChange} placeholder="Название альбома" />
                <CustomTextField label="Описание" name="description" value={trackData.description || ""} onChange={handleInputChange} placeholder="Краткое описание трека..." multiline rows={3} />
                <CustomTextField label="URL Coverflow (Фон плеера)" name="coverflow" value={trackData.coverflow || ""} onChange={handleInputChange} placeholder="https://example.com/background.jpg" />
              </Box>
            </Box>
            <Box sx={{ p: { xs: 2, sm: 3 }, borderTop: `1px solid ${palette.background.Border}`, mt: 'auto' }}>
              <Button onClick={handleUpload} variant="contained" fullWidth disabled={uploading || !selectedFile} sx={{ bgcolor: ACCENT_COLOR, borderRadius: '50px', py: 1.5, fontWeight: 600 }}>{uploading ? "Загрузка..." : "Опубликовать"}</Button>
            </Box>
          </Box>
        </div>
      )}

      {/* МОДАЛКА СОЗДАНИЯ ОПРОСА (ПРОФЕССИОНАЛЬНАЯ) */}
      {openPollCreator && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1400, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
        }} onClick={() => setOpenPollCreator(false)}>
          <Box sx={{
            width: '90%', maxWidth: '600px', maxHeight: '90vh', bgcolor: palette.background.paper, color: palette.text.primary, 
            borderRadius: '24px', border: `1px solid ${palette.background.Border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: `1px solid ${palette.background.Border}`, bgcolor: '#1e1e1e' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h6" fontWeight={800}>Создать опрос</Typography>
              </Stack>
              <IconButton onClick={() => setOpenPollCreator(false)} sx={{ color: palette.text.secondary,  }}><CloseIcon /></IconButton>
            </Box>
            
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
 <textarea
  placeholder="Задайте вопрос..."
  value={pollTitle}
  onChange={(e) => setPollTitle(e.target.value)}
  rows={1}
  style={{
    width: '100%',
    background: 'transparent',
    // 💡 Настройки рамки и отступов:
    border: '1px solid rgba(255, 255, 255, 0.15)', // Ненавязчивый светлый бордер
    borderRadius: '12px',                         // Закругление углов
    padding: '12px 16px',                         // Внутренние отступы для текста
    boxSizing: 'border-box',                       // Чтобы padding не раздувал ширину
    outline: 'none',
    resize: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 800,
    minHeight:'55px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',         // Плавная смена цвета при фокусе
  }}
  onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'} // Подсветка при клике
  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}  // Возврат цвета
/>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ color: palette.text.secondary, fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Варианты ответа</Typography>
                <AnimatePresence>
                  {pollOptions.map((option, index) => (
                    <motion.div
                      key={option.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
                    >
                      <Box sx={{
                        flex: 1, display: 'flex', alignItems: 'center', bgcolor: palette.background.default, 
                        borderRadius: '16px', border: `1px solid ${palette.background.Border}`, p: 1, transition: '0.2s',
                        '&:focus-within': { borderColor: ACCENT_COLOR, boxShadow: `0 0 0 3px rgba(237, 93, 25, 0.1)` }
                      }}>
                        <TextField
                          fullWidth placeholder={`Вариант ${index + 1}`} variant="standard" value={option.text}
                          onChange={(e) => handleUpdatePollOption(option.id, 'text', e.target.value)}
                          InputProps={{ disableUnderline: true, sx: { color: '#fff', px: 1, fontSize: '1rem', fontWeight: 500 } }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 0.5 }}>
                          {/* Инпут для ссылки на картинку (мини-версия) */}
                          <TextField
                             placeholder="URL фото" variant="standard" value={option.mediaUrl}
                             onChange={(e) => handleUpdatePollOption(option.id, 'mediaUrl', e.target.value)}
                             InputProps={{ disableUnderline: true, sx: { color: ACCENT_COLOR, fontSize: '0.8rem', width: '70px', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px', px: 1 } }}
                          />
                          <ImageOutlinedIcon sx={{ color: palette.text.secondary, fontSize: 18 }} />
                        </Box>
                      </Box>
                      <IconButton onClick={() => handleRemovePollOption(option.id)} disabled={pollOptions.length <= 2} sx={{ color: palette.text.secondary, '&:hover': { color: '#f44336', bgcolor: 'rgba(244, 67, 54, 0.1)' } }}>
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {pollOptions.length < 10 && (
                  <Button onClick={handleAddPollOption} startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start', color: ACCENT_COLOR, fontWeight: 600, textTransform: 'none', borderRadius: '12px', py: 1, px: 2, '&:hover': { bgcolor: 'rgba(237, 93, 25, 0.1)' } }}>
                    Добавить вариант
                  </Button>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: palette.background.default, borderRadius: '16px', border: `1px solid ${palette.background.Border}` }}>
                <FormControlLabel
                  control={<Switch checked={pollMultiple} onChange={(e) => setPollMultiple(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_COLOR }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_COLOR } }} />}
                  label={<Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Разрешить несколько ответов</Typography>}
                />
              </Box>
            </Box>

            <Box sx={{ p: 3, borderTop: `1px solid ${palette.background.Border}`, bgcolor: '#1e1e1e' }}>
              <Button onClick={handlePublishPoll} disabled={isPublishingPoll} variant="contained" fullWidth sx={{ bgcolor: ACCENT_COLOR, borderRadius: '16px', py: 1.8, fontWeight: 800, fontSize: '1rem', '&:hover': { bgcolor: '#d94b12' } }}>
                {isPublishingPoll ? 'Публикация...' : 'Опубликовать опрос'}
              </Button>
            </Box>
          </Box>
        </div>
      )}

      {openPostCreator && <PostCreatorModal open={openPostCreator} onClose={() => setOpenPostCreator(false)} />}

      {openArticleCreator && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'
        }} onClick={() => setOpenArticleCreator(false)}>
          <Box sx={{
            width: isMobile ? '100%' : '90%', maxWidth: isMobile ? '100%' : '900px', height: isMobile ? '100vh' : 'auto', maxHeight: '90vh',
            bgcolor: palette.background.default, color: palette.text.primary, borderRadius: isMobile ? 0 : '24px',
            border: `1px solid ${palette.background.Border}`, overflow: 'auto', display: 'flex', flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${palette.background.Border}`, p: 3, flexShrink: 0 }}>
              <Typography variant="h6" fontWeight={800}>Мастер создания статьи</Typography>
              <IconButton onClick={() => setOpenArticleCreator(false)} sx={{ color: palette.text.primary }}><CloseIcon /></IconButton>
            </Box>
            <Box sx={{ p: isMobile ? 2 : 4, flex: 1, overflow: 'auto' }}>
              <TextField 
                fullWidth placeholder="Заголовок" variant="standard" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} 
                InputProps={{ disableUnderline: true, style: { fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 900, color: palette.text.primary } }} 
              />
              <TextField 
                fullWidth placeholder="Тема" variant="standard" value={articleTopic} onChange={(e) => setArticleTopic(e.target.value)}
                sx={{ mt: 1 }} InputProps={{ disableUnderline: true, style: { fontSize: '1.1rem', color: ACCENT_COLOR, fontWeight: 600 } }}
              />
              <Box sx={{ mt: 4, p: 3, bgcolor: palette.background.paper, borderRadius: '20px', border: `1px solid ${palette.background.Border}` }}>
                <Editor onChange={(data) => setArticleBlocks(data)} />
              </Box>
            </Box>
            <Box sx={{ p: 4, borderTop: `1px solid ${palette.background.Border}`, flexShrink: 0 }}>
              <Button onClick={handlePublishArticle} disabled={isPublishingArticle} variant="contained" sx={{ bgcolor: ACCENT_COLOR, borderRadius: '100px', px: 6, py: 1.5, fontWeight: 700, fontSize: '16px' }}>
                {isPublishingArticle ? 'Публикация...' : 'Опубликовать'}
              </Button>
            </Box>
          </Box>
        </div>
      )}
    </>
  );
};

export default Sitebar;