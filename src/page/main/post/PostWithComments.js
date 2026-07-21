import React, { useState, useEffect, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Box, Paper, Typography, IconButton, Stack, Popover, 
  InputBase, Button, CircularProgress, Avatar, Grid, TextField
} from '@mui/material';
import { 
  AddReactionOutlined, ChatBubbleOutline, ShareOutlined,
  ContentCopyOutlined, CheckOutlined, CloseOutlined, FlagOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { motion } from 'framer-motion';

import { selectUser } from '../../../system/redux/slices/getme'; 
import PostHeader from './PostHeader';
import PostText from './PostText';
import PostPhoto from './PostPhoto';

// Константы
const hideScrollbar = { scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };
const CUSTOM_REACTIONS = ['SVG-DOG', 'SVG-CAT', 'SVG-PEPE']; 
const CDN_URL = 'https://atomglidedev.ru'; 

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: '#0000005d', zIndex: 99999, display: 'flex',
  alignItems: 'center', justifyContent: 'center'
};

const modalContentStyle = {
  width: '90%', maxWidth: '480px', backgroundColor: '#1a1b1e', 
  border: '1px solid #333333', borderRadius: '24px', padding: '24px',
  boxSizing: 'border-box', position: 'relative'
};

const REPORT_REASONS = ['Спам', 'Оскорбление', 'Насилие', 'Мошенничество', 'Я думаю это плохо']; 

const renderReaction = (reactionCode) => {
  if (reactionCode?.startsWith('SVG-')) {
    const iconName = reactionCode.replace('SVG-', '');
    return (
      <Box sx={{ 
        width: 24, height: 24, borderRadius: '50%', bgcolor: '#333333', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', color: '#ffffff', fontWeight: 'bold'
      }}>
        {iconName.substring(0, 3)}
      </Box>
    );
  }
  return <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>{reactionCode}</Typography>;
};

// =========================================================================
// ВНУТРЕННИЙ КОМПОНЕНТ ОПРОСА
// =========================================================================
const PollSection = ({ post, currentUserId, onVote }) => {
  if (!post.isPoll || !post.pollOptions) return null;

  const totalVotes = post.pollOptions.reduce(
    (sum, option) => sum + (option.voters?.length || 0), 
    0
  );

  return (
    <Box sx={{ mt: 2, mb: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {post.pollOptions.map((option) => {
        const voters = option.voters || [];
        const votesCount = voters.length;
        const percentage = totalVotes === 0 ? 0 : Math.round((votesCount / totalVotes) * 100);
        
        // Корректная проверка голоса, учитывающая, что voterId может быть как строкой, так и объектом
        const hasVoted = voters.some(voter => {
          const voterId = typeof voter === 'object' ? voter._id : voter;
          return voterId === currentUserId;
        });

        return (
          <Box
            key={option._id}
            onClick={() => onVote(option._id)}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: hasVoted ? '#ffffff' : '#333333',
              cursor: 'pointer',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              p: 1.5,
              bgcolor: '#141517',
              transition: 'border-color 0.2s ease',
              '&:hover': {
                borderColor: '#555555',
              }
            }}
          >
            {/* Анимированный прогресс-бар */}
            <Box
              component={motion.div}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                backgroundColor: hasVoted ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                zIndex: 0,
              }}
            />

            {/* Медиа варианта ответа (картинка) */}
            {option.mediaUrl && (
              <Box
                component="img"
                src={option.mediaUrl.startsWith('http') ? option.mediaUrl : `${CDN_URL}${option.mediaUrl}`}
                alt="Option media"
                sx={{ width: 40, height: 40, borderRadius: '8px', mr: 1.5, zIndex: 1, objectFit: 'cover' }}
              />
            )}

            {/* Текст варианта и проценты */}
            <Box sx={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: hasVoted ? 800 : 500, 
                  color: hasVoted ? '#ffffff' : '#dddddd',
                  fontSize: '0.9rem' 
                }}
              >
                {option.text}
              </Typography>
              <Typography variant="caption" sx={{ color: '#888888', fontWeight: 700, ml: 1 }}>
                {percentage}% ({votesCount})
              </Typography>
            </Box>
          </Box>
        );
      })}
      
      <Typography variant="caption" sx={{ color: '#777777', fontSize: '0.75rem', px: 0.5 }}>
        Всего голосов: {totalVotes}
      </Typography>
       <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem', px: 0.5,mt:-1 }}>
        Результаты голосования видны всем. Голосование анонимное, вы не можете видеть, кто проголосовал за вариант. Пукнты голосования не могут быть изменены после публикации поста.
      </Typography>
    </Box>
  );
};

// =========================================================================
// ОСНОВНОЙ КОМПОНЕНТ ПОСТА С КОММЕНТАРИЯМИ И ОПРОСОМ
// =========================================================================
const PostWithComments = memo(({ post, onDelete, onPostUpdate, isFullPost }) => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userId = user?._id;

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [reactions, setReactions] = useState(post.reactions || []);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);
  const [reportSending, setReportSending] = useState(false);
  const [customReason, setCustomReason] = useState('');

  // Синхронизация локальных реакций при изменении пропсов поста
  useEffect(() => {
    setReactions(post.reactions || []);
  }, [post.reactions]);

  const reportModalContentStyle = useMemo(() => ({
    ...modalContentStyle,
    borderRadius: { xs: '16px', sm: '24px' }, 
    width: { xs: '95%', sm: '90%' }, 
    maxWidth: '850px', 
    maxHeight: '90vh', 
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  }), []);

  const handleOpenAuthModal = () => setIsAuthModalOpen(true);
  const handleCloseAuthModal = () => setIsAuthModalOpen(false);
  const handleOpenShareModal = () => setIsShareModalOpen(true);
  const handleCloseShareModal = () => setIsShareModalOpen(false);
  const handleOpenReportModal = () => setIsReportModalOpen(true);
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setCustomReason('');
  };

  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${CDN_URL}${url}`) : '';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Недавно';
  const formatEditDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  // Обработчик голосования в опросе
  const handleVote = async (optionId) => {
    if (!userId) { 
      handleOpenAuthModal(); 
      return; 
    }
    
    try {
      const token = window.localStorage.getItem('token');
      const { data } = await axios.patch(
        `${CDN_URL}/posts/${post._id}/vote`, 
        { optionId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Передаем обновленный бэкендом пост с целым объектом `.user`
      if (onPostUpdate && data) {
        onPostUpdate(data);
      }
    } catch (error) {
      console.error('Ошибка при голосовании:', error);
    }
  };

  const handleToggleComments = async () => {
    if (!userId) { handleOpenAuthModal(); return; }
    if (!isCommentsOpen && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const { data } = await axios.get(`${CDN_URL}/comment/post/${post._id}`);
        if (data.success) setComments(data.comments.reverse());
      } catch (e) { console.error(e); } finally { setIsLoadingComments(false); }
    }
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleSendComment = async () => {
    if (!newCommentText.trim() || isSending) return;
    setIsSending(true);
    try {
      const token = window.localStorage.getItem('token');
      const { data } = await axios.post(`${CDN_URL}/comment`, 
        { text: newCommentText.trim(), postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewCommentText('');
        if (onPostUpdate) onPostUpdate({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
      }
    } catch (e) { console.error(e); } finally { setIsSending(false); }
  };

  const handleOpenPicker = (event) => setAnchorEl(event.currentTarget);
  const handleClosePicker = () => setAnchorEl(null);

  const toggleReaction = async (emoji) => {
    if (!userId) { handleOpenAuthModal(); return; }
    try {
      const token = window.localStorage.getItem('token');
      const { data } = await axios.post(`${CDN_URL}/posts/${post._id}/reaction`, { emoji }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) setReactions(data.reactions);
    } catch (err) { console.error(err); }
    handleClosePicker();
  };

  const handleSendReport = async (reason) => {
    if (reportSending) return;
    setReportSending(true);
    try {
      const token = window.localStorage.getItem('token');
      await axios.post(`${CDN_URL}/post/${post._id}/report`, 
        { reason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseReportModal();
    } catch (error) {
      console.error("Ошибка отправки жалобы:", error);
    } finally {
      setReportSending(false);
    }
  };

  const handleSubmitCustom = () => {
    if (customReason.trim()) handleSendReport(customReason.trim());
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://atomglide.com/post/${post._id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const goToProfile = (id) => id && navigate(`/profile/${id}`);

  const renderShareModal = () => {
    if (!isShareModalOpen) return null;
    return createPortal(
      <div style={modalOverlayStyle} onClick={handleCloseShareModal}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Поделиться</Typography>
            <IconButton onClick={handleCloseShareModal} sx={{ color: '#888888', bgcolor: '#25262b', '&:hover': { bgcolor: '#333333' } }}>
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Stack>
          
          <Box sx={{ borderRadius: '16px', mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={getAvatarUrl(post.user?.avatarUrl)} sx={{ width: 44, height: 44, border: '1px solid #333333' }} />
              <Box>
                <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                  {post.user?.fullName || 'Аноним'}
                </Typography>
                <Typography sx={{ color: '#888888', fontSize: '0.8rem' }}>
                  {post.user?.username} • {formatDate(post.createdAt)}
                  {post.isEdited && <span style={{ color: '#ffb74d', marginLeft: '6px', fontWeight: 'bold' }}>(изм.)</span>}
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Box sx={{ bgcolor: '#111111', borderRadius: '16px', display: 'flex', alignItems: 'center', p: 0.5, mb: 2, border: '1px solid #2a2a2a' }}>
            <InputBase fullWidth value={`https://atomglide.com/post/${post._id}`} readOnly sx={{ px: 2, color: '#cccccc', fontSize: '0.85rem' }} />
            <Button onClick={handleCopyLink} sx={{ bgcolor: isCopied ? '#4caf50' : '#ffffff', color: isCopied ? '#ffffff' : '#000000', borderRadius: '12px', px: 2, py: 1, fontWeight: 800, textTransform: 'none', minWidth: '140px', '&:hover': { bgcolor: isCopied ? '#45a049' : '#e0e0e0' } }} startIcon={isCopied ? <CheckOutlined /> : <ContentCopyOutlined />}>
              {isCopied ? 'Скопировано' : 'Копировать'}
            </Button>
          </Box>
        </div>
      </div>,
      document.body
    );
  };

  const renderReportModal = () => {
    if (!isReportModalOpen) return null;
    return createPortal(
      <div style={modalOverlayStyle} onClick={handleCloseReportModal}>
        <Box sx={reportModalContentStyle} onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid #333' }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Пожаловаться</Typography>
            <IconButton onClick={handleCloseReportModal} sx={{ color: '#888888', bgcolor: '#25262b' }}><CloseOutlined /></IconButton>
          </Stack>
          
          <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, p: 3, ...hideScrollbar }}>
            <Box sx={{ flex: 1, maxHeight: '60vh', overflowY: 'auto', pr: 1, ...hideScrollbar }}>
              <Typography sx={{ color: '#aaaaaa', mb: 2, fontSize: '0.9rem' }}>Выберите причину:</Typography>
              <Grid container spacing={1.5}>
                {REPORT_REASONS.map((reason) => (
                  <Grid item xs={12} key={reason}>
                    <Button 
                      fullWidth onClick={() => handleSendReport(reason)} disabled={reportSending}
                      sx={{ 
                        justifyContent: 'flex-start', bgcolor: '#25262b', color: '#ffffff', 
                        borderRadius: '12px', py: 1.5, px: 2, textTransform: 'none',
                        border: '1px solid #333333', textAlign: 'left', '&:hover': { bgcolor: '#333333' }
                      }}
                    >
                      {reason}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Stack spacing={2} sx={{ flex: 1 }}>
              <Typography sx={{ color: '#eeeeee', fontWeight: 600 }}>Другая причина</Typography>
              <TextField
                multiline rows={4} placeholder="Опишите проблему..."
                value={customReason} onChange={(e) => setCustomReason(e.target.value)}
                variant="outlined" fullWidth
                InputProps={{ sx: { color: '#ffffff', bgcolor: '#25262b', borderRadius: '12px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } } }}
              />
              <Button 
                variant="contained" onClick={handleSubmitCustom} disabled={reportSending || !customReason.trim()}
                sx={{ bgcolor: '#ffffff', color: '#00', borderRadius: '8px', py: 1.5, fontWeight: 'bold', '&:disabled': { bgcolor: '#555' } }}
              >
                {reportSending ? 'Отправка...' : 'Отправить'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </div>,
      document.body
    );
  };

  const renderAuthModal = () => {
    if (!isAuthModalOpen) return null;
    return createPortal(
      <div style={modalOverlayStyle} onClick={handleCloseAuthModal}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Нужен аккаунт</Typography>
            <IconButton onClick={handleCloseAuthModal} sx={{ color: '#888888', bgcolor: '#25262b' }}><CloseOutlined fontSize="small" /></IconButton>
          </Stack>
          <Typography sx={{ color: '#aaaaaa', fontSize: '0.85rem', mb: 3 }}>Войдите, чтобы оставлять комментарии, участвовать в опросах и ставить реакции.</Typography>
          <Button fullWidth variant="contained" onClick={() => { handleCloseAuthModal(); navigate('/login'); }} sx={{ bgcolor: '#ffffff', color: '#000', borderRadius: '12px', py: 1.5, fontWeight: 900 }}>Войти в профиль</Button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '10px', mb: 1, bgcolor: '#1a1b1e', border: '1px solid #2a2a2a' }}>
      <PostHeader post={post} onDelete={onDelete} onPostUpdate={onPostUpdate} onCommentClick={handleToggleComments} />
      <PostPhoto post={post} isFullPost={isFullPost} />
      <PostText postId={post._id}>{post.title || post.text || 'Без текста'}</PostText>

      {/* ОПРОС ТЕПЕРЬ ТУТ: Рендерится на главной и везде, если у поста выставлен флаг опроса */}
      <PollSection post={post} currentUserId={userId} onVote={handleVote} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleOpenPicker} sx={{ bgcolor: '#25262b', borderRadius: '12px', color: '#ffffff', '&:hover': { bgcolor: '#333333' } }}>
            <AddReactionOutlined sx={{ fontSize: 20 }} />
          </IconButton>
          
          {reactions.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
              {reactions.map((r) => (
                <Box key={r.emoji} onClick={() => toggleReaction(r.emoji)} sx={{ 
                  px: 1, py: 0.5, borderRadius: '12px', bgcolor: '#25262b', border: '1px solid #333333', 
                  cursor: 'pointer', display: 'flex', gap: 0.5, alignItems: 'center', '&:hover': { bgcolor: '#333333' }
                }}>
                  {renderReaction(r.emoji)}
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>{r.users?.length || 0}</Typography>
                </Box>
              ))}
            </Stack>
          )}

          <Box onClick={handleToggleComments} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.8, borderRadius: '12px', cursor: 'pointer', bgcolor: isCommentsOpen ? '#ffffff' : '#25262b', color: isCommentsOpen ? '#000000' : '#ffffff', ml: 2 }}>
            <ChatBubbleOutline sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 900 }}>{post.commentsCount || comments.length}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <IconButton onClick={handleOpenReportModal} sx={{ bgcolor: '#25262b', color: '#888888', borderRadius: '12px', '&:hover': { color: '#ffffff', bgcolor: '#333333' } }}>
            <FlagOutlined sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton onClick={handleOpenShareModal} sx={{ bgcolor: '#25262b', color: '#ffffff', borderRadius: '12px' }}>
            <ShareOutlined sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Stack>

      {post.isEdited && (
        <Box sx={{ mt: 2, pl: 1.5, borderLeft: '2px solid #ffb74d' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#ffb74d', fontWeight: 'bold' }}>
            Данный пост был изменен: {formatEditDate(post.editedAt)}
          </Typography>
        </Box>
      )}

      {isCommentsOpen && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #2a2a2a' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 0
           }}>
            <InputBase fullWidth placeholder="Что вы думаете об этом?" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} sx={{ bgcolor: '#111111', px: 2, py: 1, borderRadius: '12px', color: '#ffffff', border: '1px solid #2a2a2a' }} />
       
            <Button onClick={handleSendComment} disabled={!newCommentText.trim() || isSending} sx={{ bgcolor: '#ffffff', color: '#000', borderRadius: '12px', fontWeight: 900, px: 3, '&:disabled': { bgcolor: '#333', color: '#666' } }}>
              {isSending ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'ОК'}
            </Button>
          </Stack>
        <Typography variant="caption" sx={{ color: '#777777', fontSize: '0.75rem', px: 1}}>
         Автор поста сможет увидеть ваш комментарий в разделе "Уведомления"
      </Typography>
          <Stack spacing={2} sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1, ...hideScrollbar ,mt:1}}>
            {isLoadingComments ? <CircularProgress size={24} sx={{ color: '#ffffff', alignSelf: 'center' }} /> : 
              comments.length === 0 ? <Typography sx={{ color: '#555555', textAlign: 'center', py: 2 }}>Пока нет мнений. Будьте первым!</Typography> :
              comments.map((c) => (
                <Stack key={c._id} direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar src={getAvatarUrl(c.user?.avatarUrl)} onClick={() => goToProfile(c.user?._id)} sx={{ width: 36, height: 36, border: '1px solid #333333', cursor: 'pointer', mt: 0.5 }} />
                  <Box sx={{ flex: 1, bgcolor: '#25262b', px: 2, py: 1.5, borderRadius: '2px 16px 16px 16px', border: '1px solid #2a2a2a' }}>
                    <Typography onClick={() => goToProfile(c.user?._id)} sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffffff', cursor: 'pointer', display: 'inline-block', mb: 0.5 }}>{c.user?.fullName}</Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: '#dddddd', wordBreak: 'break-word', lineHeight: 1.4 }}>{c.text}</Typography>
                  </Box>
                </Stack>
              ))
            }
          </Stack>
        </Box>
      )}

      <Popover 
        open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClosePicker} 
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { bgcolor: '#1a1b1e', borderRadius: '16px', border: '1px solid #333333', boxShadow: '0 8px 32px #000000', mb: 1, overflow: 'hidden' } } }}
      >
        {CUSTOM_REACTIONS.length > 0 && (
          <Box sx={{ p: 1.5, display: 'flex', gap: 1, borderBottom: '1px solid #2a2a2a', bgcolor: '#25262b' }}>
            {CUSTOM_REACTIONS.map((item) => (
              <IconButton key={item} onClick={() => toggleReaction(item)} disableRipple sx={{ width: 36, height: 36, '&:hover': { transform: 'scale(1.1)' } }}>
                {renderReaction(item)}
              </IconButton>
            ))}
          </Box>
        )}
        <EmojiPicker theme="dark" onEmojiClick={(emojiObject) => toggleReaction(emojiObject.emoji)} width={320} height={350} skinTonesDisabled searchDisabled previewConfig={{ showPreview: false }} />
      </Popover>

      {renderShareModal()}
      {renderReportModal()}
      {renderAuthModal()}
    </Paper>
  );
});

PostWithComments.displayName = 'PostWithComments';
export default PostWithComments;