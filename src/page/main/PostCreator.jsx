import React, { useEffect, useState, useRef } from "react";
import {
  Box, IconButton, Typography, useMediaQuery, useTheme, Divider, CircularProgress, Button, Tooltip
} from "@mui/material";
import { FiImage, FiX, FiVideo, FiAlertCircle, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../system/axios";
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../system/redux/slices/getme"; 
import { useIsland } from '../../components/DynamicIslandProvider'; 

const BG_DARK = '#0a0a0a';
const BG_PANEL = 'rgba(20, 20, 20, 0.7)';
const BORDER_STYLE = '1px solid rgba(255, 255, 255, 0.08)';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Лимит 5 МБ на файл
const COOLDOWN_TIME = 20 * 1000; // Кулдаун 20 секунд в миллисекундах

const PostCreatorModal = ({ open: externalOpen, onClose: externalOnClose, onPostCreated }) => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { showIsland } = useIsland(); 

  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  
  const [inputText, setInputText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaType, setMediaType] = useState('none'); 
  const [videoDuration, setVideoDuration] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false); 
  const [showPhotoLimitModal, setShowPhotoLimitModal] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Логика таймера обратного отсчета
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (open) {
      const lastPostTime = localStorage.getItem("lastPostCreatedAt");
      if (lastPostTime) {
        const diff = Date.now() - parseInt(lastPostTime);
        if (diff < COOLDOWN_TIME) {
          setTimeLeft(Math.ceil((COOLDOWN_TIME - diff) / 1000));
        }
      }
    }
  }, [open]);

  useEffect(() => {
    return () => {
      mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mediaPreviews]);

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.some(f => f.size > MAX_FILE_SIZE)) {
      setError("Один или несколько файлов превышают лимит 5 МБ");
      return;
    }

    if (mediaType !== 'none' && mediaType !== type) {
      mediaPreviews.forEach(url => URL.revokeObjectURL(url));
      setSelectedMedia([]);
      setMediaPreviews([]);
    }

    setMediaType(type);
    setError("");
    
    if (type === 'video') {
      const file = files[0];
      setSelectedMedia([file]);
      mediaPreviews.forEach(url => URL.revokeObjectURL(url));
      setMediaPreviews([URL.createObjectURL(file)]);
      
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => { setVideoDuration(video.duration); };
      video.src = URL.createObjectURL(file);
    } else {
      const currentPhotosCount = mediaType === 'image' ? selectedMedia.length : 0;
      const totalPhotos = currentPhotosCount + files.length;
      const photoLimit = user?.isPremium ? Infinity : 3;
      
      if (totalPhotos > photoLimit) {
        if (!user?.isPremium) {
          setShowPhotoLimitModal(true);
          return;
        }
      }
      
      setSelectedMedia(prev => [...prev, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
    
    e.target.value = null;
  };

  const handleRemoveMedia = (indexToRemove) => {
    const newMedia = selectedMedia.filter((_, i) => i !== indexToRemove);
    const newPreviews = mediaPreviews.filter((_, i) => i !== indexToRemove);
    
    URL.revokeObjectURL(mediaPreviews[indexToRemove]);
    setSelectedMedia(newMedia);
    setMediaPreviews(newPreviews);
    
    if (newMedia.length === 0) setMediaType('none');
  };

  const handleCorrectText = async () => {
    if (!inputText.trim()) return;
    setIsCorrecting(true);
    setError("");

    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `text=${encodeURIComponent(inputText)}&language=ru-RU`
      });
      const data = await res.json();

      if (data.matches && data.matches.length > 0) {
        let corrected = inputText;
        const matches = data.matches.sort((a, b) => b.offset - a.offset);
        
        matches.forEach(match => {
          if (match.replacements && match.replacements.length > 0) {
            const replacement = match.replacements[0].value;
            corrected = 
              corrected.substring(0, match.offset) + 
              replacement + 
              corrected.substring(match.offset + match.length);
          }
        });
        setInputText(corrected);
        if (showIsland) showIsland("Ошибки исправлены", "CheckCircle", "#4caf50");
      } else {
        if (showIsland) showIsland("Ошибок не найдено!", "Info", "#2196f3");
      }
    } catch (err) {
      console.error("Ошибка автокоррекции:", err);
      setError("Не удалось проверить текст. Попробуйте позже.");
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleClose = () => {
    if (externalOnClose) externalOnClose(); else setInternalOpen(false);
    setInputText("");
    setSelectedMedia([]);
    mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    setMediaPreviews([]);
    setMediaType('none');
    setError("");
  };

  const handleSendPost = async () => {
    if (loading) return; 
    
    const lastPostTime = localStorage.getItem("lastPostCreatedAt");
    if (lastPostTime) {
      const diff = Date.now() - parseInt(lastPostTime);
      if (diff < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - diff) / 1000);
        setTimeLeft(remaining);
        setError(`Подождите еще ${remaining} сек. перед созданием нового поста.`);
        return;
      }
    }

    if (!inputText.trim() && selectedMedia.length === 0) return setError("Напишите текст или добавьте медиа");
    
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("title", inputText.trim() || "Пост");
      
      selectedMedia.forEach(file => {
          formData.append("media", file);
      });
      
      if (mediaType === 'video') {
        formData.append("videoDuration", Math.floor(videoDuration));
      }

      const res = await axios.post("/posts", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("lastPostCreatedAt", Date.now().toString());

      if (onPostCreated) onPostCreated(res.data);
      handleClose();
      
      if (showIsland) showIsland('Успешно! +15atm', 'CheckCircle', '#4caf50');

      const newPostId = res.data._id || res.data.post?._id;
      if (newPostId) navigate(`/post/${newPostId}`);

    } catch (err) {
      if (showIsland) {
        showIsland(err.response?.data?.message || "Ошибка при создании публикации", 'Error', '#f44336');
      } else {
        setError(err.response?.data?.message || "Ошибка при создании публикации");
      }
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <>
      {showPhotoLimitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowPhotoLimitModal(false)}>
          <Box sx={{
            backgroundColor: '#0a0a0a',
            borderRadius: '28px',
            p: 4,
            maxWidth: '380px',
            width: '90%',
            textAlign: 'center',
            border: '1px solid rgba(255, 174, 0, 0.3)',
            boxShadow: '0 20px 60px rgba(255, 174, 0, 0.15)',
          }} onClick={(e) => e.stopPropagation()}>
            <Typography sx={{ fontSize: '32px', mb: 2 }}>Воу!</Typography>
            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#fff', mb: 2 }}>
              Лимит фото исчерпан
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', mb: 3 }}>
              Бесплатные пользователи могут добавить до 3 фотографий. Купи подписку на AtomPro+ для неограниченного количества фото. Всего за 300 ATM! или 1,99$ в месяц.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => setShowPhotoLimitModal(false)} sx={{ 
                flex: 1, py: 1.2, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', fontWeight: 600, fontSize: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>ладно</Button>
              <Button onClick={() => {
                setShowPhotoLimitModal(false);
                navigate('/subscription');
              }} sx={{ 
                flex: 1, py: 1.2, background: 'linear-gradient(135deg, #dcdcdc 0%, #ffffff 100%)', color: '#000', fontWeight: 700, fontSize: '14px', borderRadius: '12px',
              }}>Купить</Button>
            </Box>
          </Box>
        </div>
      )}

      {open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          padding: isMobile ? 0 : '16px'
        }} onClick={handleClose}>
          <Box sx={{
            width: isMobile ? "100%" : "640px",
            height: isMobile ? "100%" : "auto",
            maxHeight: isMobile ? "100%" : "90vh",
            bgcolor: BG_DARK,
            borderRadius: isMobile ? 0 : "32px",
            border: BORDER_STYLE,
            boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>Создание поста</Typography>
              <IconButton onClick={handleClose} sx={{ color: "rgba(255,255,255,0.3)" }}><FiX size={22} /></IconButton>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

            <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
              <textarea
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                placeholder="Поделитесь мыслями или расскажите, как дела..." 
                spellCheck="true"
                disabled={timeLeft > 0}
                style={{ width: '100%', minHeight: '150px', border: 'none', outline: 'none', background: 'transparent', color: timeLeft > 0 ? 'rgba(255,255,255,0.3)' : 'white', fontSize: '18px', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5 }}
              />

              <AnimatePresence>
                {mediaPreviews.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mt: 2, pb: 1 }}>
                    {mediaPreviews.map((url, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                          style={{ position: 'relative', minWidth: '150px', maxWidth: '300px', borderRadius: '16px', overflow: 'hidden', border: BORDER_STYLE, flexShrink: 0 }}
                        >
                          <IconButton
                            onClick={() => handleRemoveMedia(idx)}
                            sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', zIndex: 5, width: 28, height: 28 }}
                          >
                            <FiX size={14} />
                          </IconButton>
                          {mediaType === 'video' ? (
                            <video src={url} style={{ width: '100%', display: 'block' }} controls />
                          ) : (
                            <img src={url} alt="preview" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                          )}
                        </motion.div>
                    ))}
                  </Box>
                )}
              </AnimatePresence>
            </Box>

            <Box sx={{ p: 3, bgcolor: BG_PANEL, borderTop: BORDER_STYLE }}>
              {(error || timeLeft > 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ff5252', mb: 2, bgcolor: 'rgba(255,82,82,0.1)', p: 1.5, borderRadius: '12px' }}>
                  <FiAlertCircle />
                  <Typography sx={{ fontSize: '13px' }}>
                    {timeLeft > 0 ? `Подождите ${timeLeft} сек. прежде чем опубликовать следующий пост.` : error}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <input ref={imageInputRef} type="file" hidden multiple accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} disabled={timeLeft > 0} />
                  <input ref={videoInputRef} type="file" hidden accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} disabled={timeLeft > 0} />
                  
                  <Tooltip title="Добавить фото">
                    <IconButton onClick={() => imageInputRef.current?.click()} disabled={timeLeft > 0} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', width: '48px', height: '48px', border: BORDER_STYLE }}>
                      <FiImage size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Добавить видео">
                    <IconButton onClick={() => videoInputRef.current?.click()} disabled={timeLeft > 0} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', width: '48px', height: '48px', border: BORDER_STYLE }}>
                      <FiVideo size={20} />
                    </IconButton>
                  </Tooltip>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1, mx: 0.5 }} />
                  <Tooltip title="Исправить опечатки">
                    <IconButton 
                      onClick={handleCorrectText} 
                      disabled={isCorrecting || !inputText.trim() || timeLeft > 0}
                      sx={{ 
                        bgcolor: 'rgba(33, 150, 243, 0.1)', 
                        color: '#2196f3', 
                        width: '48px', height: '48px', 
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                        '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.2)' }
                      }}
                    >
                      {isCorrecting ? <CircularProgress size={20} color="inherit" /> : <FiCheck size={20} />}
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <IconButton 
                  onClick={handleSendPost} 
                  disabled={loading || timeLeft > 0} 
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'black', 
                    width: '54px', 
                    height: '54px', 
                    '&:hover': { bgcolor: '#f0f0f0' }, 
                    '&:disabled': { bgcolor: '#444', color: '#888' } 
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : timeLeft > 0 ? (
                    <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>{timeLeft}s</Typography>
                  ) : (
                    <ArrowForwardRoundedIcon sx={{ fontSize: '28px' }} />
                  )}
                </IconButton>
              </Box>
            </Box>
          </Box>
        </div>
      )}
    </>
  );
};

export default PostCreatorModal;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/