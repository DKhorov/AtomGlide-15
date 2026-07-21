import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Box, 
  Avatar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  FiMoreHorizontal, 
  FiTrash2,
  FiCopy,
  FiEdit2,
  FiX
} from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import axios from '../../../system/axios';
import { ReactComponent as StoreIcon } from './14.svg';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(4px)',
  zIndex: 99999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px'
};

const PostHeaderAcc = ({ 
  post = {
    _id: null,
    user: {},
    likes: { count: 0, users: [] },
    dislikes: { count: 0, users: [] },
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    text: '',
    title: ''
  }, 
  onDelete = () => {},
  onPostUpdate = () => {}
}) => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editText, setEditText] = useState(post.title || post.text || '');
  const [isEditing, setIsEditing] = useState(false);

  const safePost = { ...post, user: post.user || {} };
  const user = safePost.user;
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const { data } = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUserId(data._id);
      } catch (e) {
        console.error("Ошибка проверки юзера", e);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    setEditText(post.title || post.text || '');
  }, [post.title, post.text]);

  const isAuthor = user._id === currentUserId;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${safePost._id}`);
    handleMenuClose();
    alert('Ссылка скопирована!');
  };

  const handleDelete = async () => {
    handleMenuClose();
    try {
      const token = localStorage.getItem('token');
      if (!token || !safePost._id) return;
      
      await axios.delete(`posts/${safePost._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(safePost._id);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении поста');
    }
  };

  const handleOpenEdit = () => {
    handleMenuClose();
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    setIsEditing(true);
    
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch(
        `/posts/${safePost._id}`, 
        { text: editText, title: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onPostUpdate(data);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения');
    } finally {
      setIsEditing(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); 
    if (diff < 60) return "только что";
    if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
    return `${Math.floor(diff / 86400)} дн. назад`;
  };

  const VerifiedBadgeSVG = ({ size = 16 }) => (
    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 3 }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={size} height={size}>
        <polygon fill="#42a5f5" points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"/>
        <polygon fill="#fff" points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"/>
      </svg>
    </span>
  );

  const AdminBadgeSVG = ({ size = 16 }) => (
    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 3 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#paint0_linear)"/>
        <line x1="18" y1="7" x2="18" y2="19" stroke="#FFCC00" strokeWidth="2"/>
        <line x1="23" y1="21" x2="23" y2="33" stroke="#FFE100" strokeWidth="2"/>
        <defs>
          <linearGradient id="paint0_linear" x1="26" y1="1.5" x2="10" y2="37.5">
            <stop stopColor="#F6A800"/><stop offset="1" stopColor="#CC9910"/>
          </linearGradient>
        </defs>
      </svg>
    </span>
  );

  const AtomProPlusBadgeSVG = ({ size = 16 }) => (
    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 3 }}>
      <StoreIcon style={{ width: size, height: size }} />
    </span>
  );

  const StatusBadge = ({ user }) => {
    if (!user) return null;
    const hasAtomProPlus = user.atomProPlus?.isActive && (!user.atomProPlus?.expiresAt || new Date(user.atomProPlus.expiresAt) > new Date());
    return (
      <>
        {user.accountType === 'admin' && <><VerifiedBadgeSVG /><AdminBadgeSVG /></>}
        {(user.accountType === 'verified_user' || user.verified === 'verified') && user.accountType !== 'admin' && <VerifiedBadgeSVG />}
        {hasAtomProPlus && <AtomProPlusBadgeSVG />}
      </>
    );
  };

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return undefined;
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    return `https://atomglidedev.ru${user.avatarUrl}`;
  };

  const renderEditModal = () => {
    if (!isEditModalOpen) return null;
    return createPortal(
      <div style={modalOverlayStyle} onClick={() => setIsEditModalOpen(false)}>
        <Box sx={{
          width: '100%', maxWidth: '640px', bgcolor: '#0a0a0a',
          borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }} onClick={(e) => e.stopPropagation()}>
          
          <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
              Редактировать публикацию
            </Typography>
            <IconButton onClick={() => setIsEditModalOpen(false)} sx={{ color: "rgba(255,255,255,0.3)", '&:hover': { color: '#fff' } }}>
              <FiX size={22} />
            </IconButton>
          </Box>
          
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Box sx={{ flex: 1, p: 3, minHeight: '180px' }}>
            <textarea
              value={editText} 
              onChange={(e) => setEditText(e.target.value)} 
              placeholder="Текст публикации..." 
              spellCheck="true"
              style={{ 
                width: '100%', height: '100%', minHeight: '150px', border: 'none', 
                outline: 'none', background: 'transparent', color: 'white', 
                fontSize: '18px', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5 
              }}
            />
          </Box>

          <Box sx={{ p: 3, bgcolor: 'rgba(20, 20, 20, 0.7)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleEditSubmit} 
              disabled={isEditing || !editText.trim() || editText === (safePost.title || safePost.text)}
              sx={{ 
                bgcolor: '#ffffff', color: '#000000', borderRadius: '12px', fontWeight: 800, px: 4, py: 1.2,
                textTransform: 'none', fontSize: '15px',
                '&:hover': { bgcolor: '#e0e0e0' }, 
                '&.Mui-disabled': { bgcolor: '#333333', color: '#888888' }
              }}
            >
              {isEditing ? <CircularProgress size={24} sx={{ color: '#888' }} /> : 'Сохранить'}
            </Button>
          </Box>
        </Box>
      </div>,
      document.body
    );
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, ml: 1, mt: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar
          src={getAvatarUrl()}
          sx={{ width: 45, height: 45, mr: 1, cursor: 'pointer', backgroundColor: 'rgb(78, 78, 78)', border: 'solid rgba(86, 86, 86, 1px)' }}
          onClick={() => user._id && navigate(`/account/${user._id}`)}
        >
          {!getAvatarUrl() && (user.fullName?.[0]?.toUpperCase() || '?')}
        </Avatar>

        <Box sx={{ ml: 0.2 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontSize: '15px', fontWeight: '700', color: 'rgba(218, 218, 218, 1)', cursor: 'pointer', fontFamily: 'sf' }}
            onClick={() => user._id && navigate(`/account/${user._id}`)}
          >
            {user.fullName || 'Аноним'}
            <StatusBadge user={user} />
          </Typography>
          <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
            {user.username} • {formatTimeAgo(safePost.createdAt)}
          </Typography>
        </Box>
      </Box>

      <Box>
        <IconButton onClick={handleMenuOpen} sx={{ color: 'rgba(218, 218, 218, 0.7)' }}>
          <FiMoreHorizontal />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(25, 25, 25, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              mt: 1,
              minWidth: '220px',
              p: 0.5
            }
          }}
        >
          <MenuItem onClick={handleCopyLink} sx={{ borderRadius: '10px', m: 0.5, py: 1.2 }}>
            <ListItemIcon><FiCopy size={18} color="#e0e0e0" /></ListItemIcon>
            <ListItemText primary="Скопировать ссылку" />
          </MenuItem>

          {isAuthor && (
            <MenuItem onClick={handleOpenEdit} sx={{ borderRadius: '10px', m: 0.5, py: 1.2 }}>
              <ListItemIcon><FiEdit2 size={18} color="#e0e0e0" /></ListItemIcon>
              <ListItemText primary="Изменить текст" />
            </MenuItem>
          )}

          {isAuthor && (
            <MenuItem onClick={handleDelete} sx={{ borderRadius: '10px', m: 0.5, py: 1.2 }}>
              <ListItemIcon><FiTrash2 size={18} color="#ff4444" /></ListItemIcon>
              <ListItemText primary="Удалить пост" sx={{ color: '#ff4444' }} />
            </MenuItem>
          )}
        </Menu>
      </Box>

      {renderEditModal()}
    </Box>
  );
};

export default PostHeaderAcc;