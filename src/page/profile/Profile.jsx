import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  useMediaQuery, 
  Button, 
  Divider, 
  IconButton, 
  Tooltip,
  CircularProgress,
  Avatar,
  Stack,
  Container
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LinkIcon from '@mui/icons-material/Link';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WcIcon from '@mui/icons-material/Wc';
import CakeIcon from '@mui/icons-material/Cake';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import axios from '../../system/axios';
import userService from '../../system/userService';
import PostPhoto from '../main/post/PostPhoto';
import PostHeaderAcc from '../main/post/PostHeadeAcc';
import PostText from '../main/post/PostText';
import '../../fonts/stylesheet.css';

function formatDateRu(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const VerifiedBadgeSVG = ({ size = 22 }) => (
  <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={size} height={size} style={{ display: 'inline' }}>
      <polygon fill="#42a5f5" points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"/>
      <polygon fill="#fff" points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"/>
    </svg>
  </span>
);

const AdminBadgeSVG = ({ size = 22 }) => (<>
  <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}>
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline' }}>
      <circle cx="20" cy="20" r="20" fill="url(#paint0_linear_25_31)"/>
      <line x1="18" y1="7" x2="18" y2="19" stroke="#FFCC00" strokeWidth="2"/>
      <line x1="23" y1="21" x2="23" y2="33" stroke="#FFE100" strokeWidth="2"/>
      <line x1="34" y1="18" x2="22" y2="18" stroke="#FFCC00" strokeWidth="2"/>
      <line x1="19" y1="22" x2="7" y2="22" stroke="#FFCC00" strokeWidth="2"/>
      <defs>
        <linearGradient id="paint0_linear_25_31" x1="26" y1="1.5" x2="10" y2="37.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F6A800"/>
          <stop offset="1" stopColor="#CC9910"/>
        </linearGradient>
      </defs>
    </svg>
  </span>
</>);

const AtomProPlusBadgeSVG = ({ size = 22 }) => (
  <div 
    className="promo-ad-badge" 
    style={{
      display: "inline-flex", 
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle", 
      marginLeft: "6px",
      color: "orange",
      border: "solid orange 0.7px",
      padding: "2px 8px", 
      borderRadius: "50px",
      fontSize: "10px",
      fontWeight: "400", 
      backgroundColor: "transparent",
      lineHeight: "1",
      whiteSpace: "nowrap"
    }}
  >
    AtomPro+
  </div>
);

const StatusBadge = ({ profile, size = 22 }) => {
  if (!profile) return null;
  const hasAtomProPlus = profile.atomProPlus?.isActive && 
    (!profile.atomProPlus?.expiresAt || new Date(profile.atomProPlus.expiresAt) > new Date());
  
  if (profile.accountType === 'admin') {
    return (
      <>
        <VerifiedBadgeSVG size={size} />
        <AdminBadgeSVG size={size} />
        {hasAtomProPlus && <AtomProPlusBadgeSVG size={size} />}
      </>
    );
  }
  if (profile.accountType === 'verified_user' || profile.verified === 'verified') {
    return (
      <>
        <VerifiedBadgeSVG size={size} />
        {hasAtomProPlus && <AtomProPlusBadgeSVG size={size} />}
      </>
    );
  }
  if (hasAtomProPlus) {
    return <AtomProPlusBadgeSVG size={size} />;
  }
  return null;
};

const Profile = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    user: null,
    posts: [],
    isSubscribed: false,
    followersCount: 0,
    subscriptionsCount: 0,
    isLoading: true,
    error: null,
    loadingPosts: true,
    purchases: [],
    pinnedNfts: [],
    hiddenNfts: []  
  });
  const [copied, setCopied] = useState({ 
    username: false, 
    regdate: false, 
    id: false, 
    about: false,
    birthday: false,
    email: false,
    tgnick: false
  });
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [isBgHidden, setIsBgHidden] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferData, setTransferData] = useState({ userId: '', price: '' });
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("https://atomglidedev.ru/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setMyId(data._id || data.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

   useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const [profileData, postsRes, purchasesRes] = await Promise.all([
          userService.getUserById(id),
          axios.get(`/posts/user/${id}`),
          axios.get(`/${id}/purchases`) 
        ]);

        const userData = profileData;
        let pinnedNftsData = [];
        
        if (Array.isArray(userData.pinnedNfts) && userData.pinnedNfts.length > 0) {
          pinnedNftsData = await Promise.all(
            userData.pinnedNfts.map(nft =>
              axios.get(`/nft/${nft._id || nft}`).then(res => res.data).catch(() => null)
            )
          );
          pinnedNftsData = pinnedNftsData.filter(nft => nft !== null);
        }

        setState(prev => ({
          ...prev,
          user: userData,
          posts: postsRes.data || [],
          purchases: purchasesRes.data || [], 
          pinnedNfts: pinnedNftsData, 
          hiddenNfts: userData.hiddenNfts || [],
          followersCount: Array.isArray(userData.followers) ? userData.followers.length : 0,
          subscriptionsCount: Array.isArray(userData.subscriptions) ? userData.subscriptions.length : 0,
          isLoading: false,
          loadingPosts: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          loadingPosts: false,
          error: err.response?.data?.message || err.message || 'Ошибка загрузки данных'
        }));
      }
    };

    if (id) fetchData();
  }, [id]);
  useEffect(() => {
    if (state.user && myId) {
      const isSub = state.user.followers?.some(f => (f._id || f) === myId) || false;
      setState(prev => ({ ...prev, isSubscribed: isSub }));
    }
  }, [state.user, myId]);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      const token = userService.getToken();
      if (!token) return navigate('/login');
      
      const method = state.isSubscribed ? 'delete' : 'post';
      await axios[method](`/auth/${state.isSubscribed ? 'unsubscribe' : 'subscribe'}/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setState(prev => ({
        ...prev,
        isSubscribed: !prev.isSubscribed,
        followersCount: prev.isSubscribed ? Math.max(0, prev.followersCount - 1) : prev.followersCount + 1
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCopy = (key, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 1500);
    });
  };

  const handlePinNft = async (nft) => {
    if (state.pinnedNfts.length >= 5) return alert("Можно закрепить максимум 5 NFT");
    try {
      const token = userService.getToken();
      await axios.post(`/nft/${nft._id}/pin`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setState(prev => ({ ...prev, pinnedNfts: [...prev.pinnedNfts, nft] }));
      alert("NFT закреплён!");
    } catch (err) {
      alert("Ошибка при закреплении NFT");
    }
  };

  const handleUnpinNft = async (nft) => {
    try {
      const token = userService.getToken();
      await axios.delete(`/nft/${nft._id}/pin`, { headers: { Authorization: `Bearer ${token}` } });
      setState(prev => ({ ...prev, pinnedNfts: prev.pinnedNfts.filter(p => p._id !== nft._id) }));
      alert("NFT убран из закреплённых");
    } catch (err) {
      alert("Ошибка при снятии NFT");
    }
  };

  const handleTransferSubmit = async () => {
    try {
      const token = userService.getToken();
      await axios.post(
        "/transfer",
        { nftId: selectedNft._id, buyerUsername: transferData.userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("NFT успешно передан!");
      setIsTransferOpen(false);
      setSelectedNft(null);
      setTransferData({ userId: "" });
      window.location.reload();
    } catch (err) {
      alert("Ошибка передачи NFT. Внимание, данная функция в долгом бета тестировании.");
    }
  };

  if (!id) return <Navigate to="/" replace />;
  
  if (state.isLoading) return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1117' }}>
      <span className="loader"></span>
    </Box>
  );
  
  if (state.error || !state.user) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2, color: 'white', backgroundColor: '#0d1117' }}>
      <Typography variant="h6">Ошибка: {state.error || 'Пользователь не найден'}</Typography>
      <Button variant="contained" onClick={() => navigate(-1)} sx={{ backgroundColor: 'rgba(56, 64, 73, 1)' }}>
        Назад
      </Button>
    </Box>
  );

  const profile = state.user;
  const userId = profile?._id || profile?.id || "";
  const isCurrentUser = myId && userId && myId === userId;
  const hasAtomProPlus = profile.atomProPlus?.isActive && (!profile.atomProPlus?.expiresAt || new Date(profile.atomProPlus.expiresAt) > new Date());
  
  const username = profile.username || profile.login || '';
  const regdate = profile.regdate || profile.createdAt || '';
  const about = profile.about || '';
  const fullName = profile.fullName || profile.name || username;
  const city = profile.city || '';
  const country = profile.country || '';
  const sex = profile.sex || '';
  const birthday = profile.birthday || '';
  const email = profile.email || '';
  const tgnick = profile.tgnick || '';

  const getMediaUrl = (url) => {
    if (!url || url.includes('undefined')) return '';
    if (url.startsWith('http')) return url;
    return `https://atomglidedev.ru${url}`;
  };

  const avatarUrl = getMediaUrl(profile.avatarUrl);
  const coverUrl = getMediaUrl(profile.coverUrl);
  const awards = profile.awards || [];
  const postsCount = state.posts.length;
  const balance = typeof profile.balance === 'number' ? profile.balance : 0;

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0d1117',
      color: '#c9d1d9',
      pb: isMobile ? '70px' : 0,
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
    }}>
      {coverUrl && !isBgHidden && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: 0
        }} />
      )}

      {coverUrl && !isBgHidden && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(13, 17, 23, 0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 0
        }} />
      )}

      {coverUrl && (
        <Button
          onClick={() => setIsBgHidden(!isBgHidden)}
          startIcon={isBgHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
          sx={{
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 999,
            backgroundColor: 'rgba(33, 38, 45, 0.7)',
            backdropFilter: 'blur(4px)',
            color: '#c9d1d9',
            border: '1px solid #30363d',
            textTransform: 'none',
            fontSize: '12px',
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'rgba(48, 54, 61, 0.9)', borderColor: '#8b949e' }
          }}
        >
          {isBgHidden ? 'Показать фон' : 'Скрыть фон'}
        </Button>
      )}

      {isAvatarModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
          backdropFilter: 'blur(10px)'
        }} onClick={() => setIsAvatarModalOpen(false)}>
          <img 
            src={avatarUrl} 
            alt="User Avatar" 
            style={{ maxWidth: '90%', maxHeight: '70vh', borderRadius: '16px', objectFit: 'contain', border: '1px solid #30363d' }} 
            onClick={e => e.stopPropagation()} 
          />
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button 
              onClick={() => setIsAvatarModalOpen(false)} 
              style={{ padding: '10px 20px', background: 'rgba(33,38,45,0.8)', border: '1px solid #30363d', color: '#c9d1d9', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Закрыть
            </button>
            <a 
              href={avatarUrl} 
              download={`avatar_${username}.jpg`} 
              onClick={e => e.stopPropagation()} 
              style={{ textDecoration: 'none', padding: '10px 20px', background: '#be8221', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Скачать
            </a>
          </div>
        </div>
      )}

      {!!selectedNft && !isTransferOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)'
        }} onClick={() => setSelectedNft(null)}>
          <div style={{
            backgroundColor: 'rgba(28,28,28,1)', borderRadius: '12px', padding: '24px',
            width: isMobile ? '90%' : '400px', textAlign: 'center', border: '1px solid rgba(54,54,54,1)'
          }} onClick={e => e.stopPropagation()}>
            <Box sx={{display:'flex',justifyContent:'center'}} >            <img src={selectedNft?.imageUrl} alt={selectedNft?.title} style={{ width: '120px', height: '120px', borderRadius: '8px', marginBottom: '16px' }} />
</Box>
            <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '18px' }}>{selectedNft?.title}</h3>
            <p style={{ margin: '0 0 16px 0', color: '#8b949e', fontSize: '14px' }}>{selectedNft?.description}</p>
            
            <div style={{ textAlign: 'left', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#8b949e' }}>Цена:</span>
                <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{selectedNft?.price} ATM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#8b949e' }}>Владелец:</span>
                <span style={{ color: '#c9d1d9' }}>{selectedNft?.owner}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8b949e' }}>Налог:</span>
                <span style={{ color: '#c9d1d9' }}>0 ATM</span>
              </div>
            </div>

            {isCurrentUser && (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => handlePinNft(selectedNft)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #be8221', color: '#be8221', borderRadius: '6px', cursor: 'pointer' }}>Закрепить</button>
                <button onClick={() => handleUnpinNft(selectedNft)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #8b611d', color: '#8b611d', borderRadius: '6px', cursor: 'pointer' }}>Убрать</button>
                <button onClick={() => setIsTransferOpen(true)} style={{ flex: 1, padding: '8px', background: '#be8221', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Передать</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isTransferOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)'
        }} onClick={() => setIsTransferOpen(false)}>
          <div style={{
            backgroundColor: 'rgba(28,28,28,1)', borderRadius: '12px', padding: '24px',
            width: isMobile ? '90%' : '400px', border: '1px solid rgba(54,54,54,1)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Передача NFT</h3>
            <input 
              type="text" 
              placeholder="Ник пользователя" 
              value={transferData.userId}
              onChange={(e) => setTransferData({ ...transferData, userId: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#fff', marginBottom: '24px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsTransferOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: '#be8221', cursor: 'pointer' }}>Отмена</button>
              <button onClick={handleTransferSubmit} style={{ padding: '8px 16px', background: '#be8221', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Отправить</button>
            </div>
          </div>
        </div>
      )}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 4 } }}>
          
          <Box sx={{ width: { xs: '100%', md: '280px' }, flexShrink: 0 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Tooltip title="Нажмите, чтобы увеличить" placement="right">
                <Avatar 
                  src={avatarUrl} 
                  onClick={() => setIsAvatarModalOpen(true)}
                  sx={{ 
                    width: { xs: 120, md: 240 }, 
                    height: { xs: 120, md: 240 }, 
                    border: '1px solid #30363d', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    fontSize: '4rem',
                    bgcolor: '#161b22',
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': { opacity: 0.85 }
                  }} 
                >
                  {fullName[0] || username[0] || ''}
                </Avatar>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontSize: { xs: '24px', md: '26px' }, fontWeight: 700, color: '#c9d1d9', lineHeight: 1.2, wordBreak: 'break-word' }}>
                  {fullName}
                </Typography>
                <StatusBadge profile={profile} size={24} />
              </Box>
              <Typography sx={{ fontSize: '20px', color: '#8b949e', fontWeight: 300, mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {username}
                <Tooltip title={copied.username ? 'Скопировано!' : 'Скопировать username'}>
                  <IconButton size="small" onClick={() => handleCopy('username', username)} sx={{ color: '#8b949e', p: 0.5 }}>
                    {copied.username ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Typography>
            </Box>

            {isCurrentUser ? (
              <Button
                fullWidth
                onClick={() => navigate('/setting')}
                startIcon={<EditIcon />}
                sx={{
                  mb: 3,
                  py: 0.8,
                  backgroundColor: '#21262d',
                  color: '#c9d1d9',
                  border: '1px solid rgba(240,246,252,0.1)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#30363d'
                  }
                }}
              >
                Редактировать профиль
              </Button>
            ) : (
              <Button
                fullWidth
                sx={{ 
                  mb: 3,
                  py: 0.8,
                  backgroundColor: state.isSubscribed ? '#21262d' : 'rgb(237,93,25)',
                  color: state.isSubscribed ? '#c9d1d9' : '#fff',
                  border: state.isSubscribed ? '1px solid rgba(240,246,252,0.1)' : 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: state.isSubscribed ? '#30363d' : 'rgb(200,70,15)'
                  }
                }}
                disabled={isSubscribing}
                onClick={handleSubscribe}
              >
                {state.isSubscribed ? 'Отписаться' : 'Подписаться'}
                {isSubscribing && <CircularProgress size={16} color="inherit" sx={{ ml: 1 }} />}
              </Button>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#8b949e', fontSize: '14px', mb: 3 }}>
              <span style={{ fontWeight: 600, color: '#c9d1d9' }}>{state.followersCount}</span> подписчиков
              <span>·</span>
              <span style={{ fontWeight: 600, color: '#c9d1d9' }}>{Math.max(0, state.subscriptionsCount)}</span> подписок
            </Box>

            <Divider sx={{ borderColor: '#30363d', mb: 2 }} />

            <Stack spacing={1.5} sx={{ color: '#c9d1d9', fontSize: '14px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon fontSize="small" sx={{ color: '#8b949e' }} />
                На сайте с: {formatDateRu(regdate)}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon fontSize="small" sx={{ color: '#8b949e' }} />
                ID: {userId}
                <Tooltip title={copied.id ? 'Скопировано!' : 'Скопировать ID'}>
                  <IconButton size="small" onClick={() => handleCopy('id', userId)} sx={{ color: '#8b949e', p: 0, ml: 'auto' }}>
                    {copied.id ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>

              {(country || city) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon fontSize="small" sx={{ color: '#8b949e' }} />
                  {country}{country && city ? ', ' : ''}{city}
                </Box>
              )}

              {sex && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WcIcon fontSize="small" sx={{ color: '#8b949e' }} />
                  Пол: {sex}
                </Box>
              )}

              {birthday && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CakeIcon fontSize="small" sx={{ color: '#8b949e' }} />
                  Дата рождения: {birthday}
                  <Tooltip title={copied.birthday ? 'Скопировано!' : 'Скопировать дату'}>
                    <IconButton size="small" onClick={() => handleCopy('birthday', birthday)} sx={{ color: '#8b949e', p: 0, ml: 'auto' }}>
                      {copied.birthday ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" sx={{ color: '#8b949e' }} />
                  Email: {email}
                  <Tooltip title={copied.email ? 'Скопировано!' : 'Скопировать Email'}>
                    <IconButton size="small" onClick={() => handleCopy('email', email)} sx={{ color: '#8b949e', p: 0, ml: 'auto' }}>
                      {copied.email ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {tgnick && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TelegramIcon fontSize="small" sx={{ color: '#8b949e' }} />
                  TG: {tgnick}
                  <Tooltip title={copied.tgnick ? 'Скопировано!' : 'Скопировать TG'}>
                    <IconButton size="small" onClick={() => handleCopy('tgnick', tgnick)} sx={{ color: '#8b949e', p: 0, ml: 'auto' }}>
                      {copied.tgnick ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {isCurrentUser && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon fontSize="small" sx={{ color: '#8b949e' }} />
                  Баланс: <span style={{ fontWeight: 'bold' }}>{balance} ATM</span>
                </Box>
              )}

              {hasAtomProPlus && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AtomProPlusBadgeSVG size={16} />
                  Статус: <span style={{ color: '#3fb950' }}>Активен</span>
                </Box>
              )}
            </Stack>

            <Divider sx={{ borderColor: '#30363d', my: 3 }} />

            <Typography sx={{ fontWeight: 600, mb: 1.5, color: '#c9d1d9' }}>Награды</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {awards.length > 0 ? awards.map((award, idx) => (
                <Tooltip key={idx} title={`${award.title} - ${award.description}`} placement="top">
                  <img 
                    src={award.image || 'https://www.pngarts.com/files/12/Award-PNG-Pic.png'} 
                    style={{ width: '40px', height: '40px', cursor: 'help' }} 
                    alt={award.title || 'award'} 
                  />
                </Tooltip>
              )) : <Typography sx={{ fontSize: '13px', color: '#8b949e' }}>Наград пока нет</Typography>}
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              borderBottom: '1px solid #30363d', 
              mb: 3, 
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' }
            }}>
              {['overview', 'posts', 'nft'].map((tab) => (
                <Box
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pb: 1.5,
                    cursor: 'pointer',
                    color: activeTab === tab ? '#c9d1d9' : '#8b949e',
                    fontWeight: activeTab === tab ? 600 : 400,
                    borderBottom: activeTab === tab ? '2px solid #f78166' : '2px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderBottom: activeTab !== tab ? '2px solid #8b949e' : '2px solid #f78166',
                      color: '#c9d1d9'
                    }
                  }}
                >
                  {tab === 'overview' && 'Обзор'}
                  {tab === 'posts' && <>Посты <span style={{ background: 'rgba(110,118,129,0.4)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{postsCount}</span></>}
                  {tab === 'nft' && 'Коллекция NFT'}
                </Box>
              ))}
            </Box>

            {(activeTab === 'overview' || activeTab === 'nft') && (
              <Box sx={{ mb: 4 }}>
                
                {activeTab === 'overview' && (
                  <Box sx={{ 
                    mb: 4, 
                    p: 3, 
                    border: '1px solid #30363d', 
                    borderRadius: '6px', 
                    backgroundColor: 'rgba(22, 27, 34, 0.4)',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <Typography sx={{ color: '#c9d1d9', fontSize: '13px', fontWeight: 600, mb: 2, pb: 1, borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between' }}>
                      <span>О себе</span>
                      <Tooltip title={copied.about ? 'Скопировано!' : 'Скопировать текст'}>
                        <IconButton size="small" onClick={() => handleCopy('about', about)} sx={{ p: 0, color: '#8b949e' }}>
                          {copied.about ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Typography>
                    <Typography sx={{ color: '#8b949e', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, fontSize: '15px' }}>
                      {about || 'Пользователь пока не добавил информацию о себе.'}
                    </Typography>
                  </Box>
                )}
  <Box sx={{ mt: 2, px: 2 }}>
        <Typography sx={{ fontWeight: 'Bold', color: 'rgba(196,196,196,1)' }}>Купленные NFT</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
          {state.purchases && state.purchases.length > 0 ? state.purchases.map((item, idx) => (
            <Box 
              key={idx} 
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 1, cursor:'pointer' }}
              onClick={() => setSelectedNft(item)}
            >
              <img 
                src={item.imageUrl || 'https://via.placeholder.com/60'} 
                alt={item.title || 'gift'} 
                style={{ width: '60px', height: '60px', borderRadius: '8px' }} 
              />
              <Typography sx={{ fontSize: '12px', color:'rgba(196, 196, 196, 1)', mt: 0}}>
                {item.title}
              </Typography>
            </Box>
          )) : <Typography sx={{ color: 'rgba(196,196,196,0.7)' }}>Нет купленных nft </Typography>}
        </Box>
      </Box>
                <Typography sx={{ mb: 2, color: '#c9d1d9', fontWeight: 600 }}>Закрепленные NFT</Typography>
                {state.pinnedNfts.length > 0 ? (
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                    gap: 2 
                  }}>
                    {state.pinnedNfts.slice(0, 6).map((nft) => (
                      <Box 
                        key={nft._id} 
                        onClick={() => setSelectedNft(nft)}
                        sx={{ 
                          border: '1px solid #30363d', 
                          borderRadius: '6px', 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          backgroundColor: 'rgba(22, 27, 34, 0.3)',
                          cursor: 'pointer',
                          transition: '0.2s',
                          '&:hover': { borderColor: '#8b949e', backgroundColor: 'rgba(22, 27, 34, 0.7)' }
                        }}
                      >
                        <img 
                          src={nft.imageUrl || nft.image || 'https://via.placeholder.com/50'} 
                          alt={nft.title} 
                          style={{ width: '48px', height: '48px', borderRadius: '10%' }} 
                        />
                        <Box>
                          <Typography sx={{ color: '#58a6ff', fontWeight: 600, fontSize: '14px' }}>{nft.title || nft.name || 'NFT'}</Typography>
                          <Typography sx={{ color: '#8b949e', fontSize: '12px', mt: 0.5 }}>Коллекция: {nft.owner || username}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: '#8b949e', fontSize: '14px', fontStyle: 'italic' }}>Нет закрепленных элементов.</Typography>
                )}

                {isCurrentUser && state.hiddenNfts.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography sx={{ mb: 2, color: '#8b949e', fontWeight: 600 }}>Скрытые NFT</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, opacity: 0.6 }}>
                      {state.hiddenNfts.map((nft) => (
                        <Box key={nft._id} sx={{ cursor: 'pointer' }} onClick={() => setSelectedNft(nft)}>
                          <img src={nft.imageUrl} alt={nft.title} style={{ width: 64, height: 64, borderRadius: 8, filter: 'grayscale(50%)' }} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {(activeTab === 'overview' || activeTab === 'posts') && (
              <Box sx={{ mt: activeTab === 'overview' ? 4 : 0 }}>
                <Typography sx={{ mb: 2, color: '#c9d1d9', fontWeight: 600 }}>
                  Активность ({postsCount})
                  {state.loadingPosts && <CircularProgress size={14} sx={{ ml: 1, color: '#8b949e' }} />}
                </Typography>

                {state.posts.length === 0 && !state.loadingPosts ? (
                  <Box sx={{ border: '1px solid #30363d', borderRadius: '6px', p: 4, textAlign: 'center', backgroundColor: 'rgba(22, 27, 34, 0.4)' }}>
                    <Typography sx={{ color: '#8b949e' }}>У {username} пока нет постов.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', 
                    '&::before': { content: '""', position: 'absolute', top: 0, bottom: 0, left: '20px', width: '2px', backgroundColor: '#30363d', zIndex: 0 } 
                  }}>
                    {state.posts.map((post) => (
                      <Box key={post._id} sx={{ position: 'relative', zIndex: 1, pl: 5, py: 2, borderBottom: '1px solid #21262d' }}>
                        <Box sx={{ position: 'absolute', left: '16px', top: '24px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b949e', border: '2px solid #0d1117' }} />
                        
                        <Box sx={{ backgroundColor: 'rgba(22, 27, 34, 0.6)', backdropFilter: 'blur(5px)', border: '1px solid #30363d', borderRadius: '6px', p: 2 }}>
                          {post.imageUrl && (
                            <Box sx={{ mt: 2 }}>
                              <PostPhoto post={post} />
                            </Box>
                          )}
                          <PostText>
                            <span style={{ fontSize: '1rem', fontWeight: 400, color: '#c9d1d9', display: 'block', marginTop: '12px' }}>
                              {post.title || 'Этот пост не имеет текст :/'}
                            </span>
                          </PostText>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
            
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Profile;