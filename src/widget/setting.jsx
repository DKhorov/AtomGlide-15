import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  IconButton, 
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material';
import { ArrowLeft, Camera, Info } from 'phosphor-react';
import axios from '../system/axios';

const MobileSettings = ({ onClose }) => {
  const [profile, setProfile] = useState({
    avatar: '',
    cover: '',
    fullName: '',
    username: '',
    about: '',
    city: '',
    sex: '',
    birthday: '',
    email: '',
    tgnick: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  const BASE_URL = 'https://atomglidedev.ru';

  const cities = [
    'Минск',
    'Могилев',
    'Гомель',
    'Витебск',
    'Гродно',
    'Брест',
    'Москва',
    'Санкт-Петербург'
  ];

  const genders = [
    { value: 'Мужской', label: 'Мужской' },
    { value: 'Женский', label: 'Женский' },
    { value: 'Ламинат', label: 'Ламинат' },
    { value: 'Кварцвинил', label: 'Кварцвинил' },
    { value: 'Паркет', label: 'Паркет' },
    { value: 'Линолеум', label: 'Линолеум' },
    { value: 'Плитка', label: 'Плитка' },
    { value: 'Ковролин', label: 'Ковролин' },
    { value: 'Я не знаю', label: 'Я не знаю' },
    { value: 'Другое', label: 'Другое' }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/auth/me');
        const user = res.data.user || res.data;
        setProfile({
          avatar: user.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${BASE_URL}${user.avatarUrl}`) : '',
          cover: user.coverUrl ? (user.coverUrl.startsWith('http') ? user.coverUrl : `${BASE_URL}${user.coverUrl}`) : '',
          fullName: user.fullName || '',
          username: user.username || '',
          about: user.about || '',
          city: user.city || '',
          sex: user.sex || '',
          birthday: user.birthday || '',
          email: user.email || '',
          tgnick: user.tgnick || ''
        });
      } catch (err) {
        setSnackbar({ open: true, message: 'Ошибка загрузки профиля', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleClick = () => {
    if (onClose) onClose();
    navigate("/");
  };

  const handleLogin = () => {
    if (onClose) onClose();
    navigate("/login");
  };

  const handleFileUpload = async (e, type = 'avatar') => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'image/webp') {
      setSnackbar({ open: true, message: 'Формат WEBP не поддерживается', severity: 'warning' });
      return;
    }

    if (file.size > 1024 * 1024) {
      setSnackbar({ open: true, message: 'Файл слишком тяжелый (макс. 1МБ)', severity: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append(type, file);
      const res = await axios.patch('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedUser = res.data.user || res.data;
      const newUrl = type === 'avatar' ? updatedUser.avatarUrl : updatedUser.coverUrl;
      const fullUrl = newUrl.startsWith('http') ? newUrl : `${BASE_URL}${newUrl}`;

      setProfile(prev => ({ 
        ...prev, 
        [type]: fullUrl 
      }));
      
      setSnackbar({ 
        open: true, 
        message: type === 'avatar' ? 'Аватар обновлен' : 'Фон обновлен', 
        severity: 'success' 
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Ошибка загрузки изображения', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Валидация перед отправкой
    if (profile.fullName && profile.fullName.length > 50) {
      setSnackbar({ open: true, message: 'Имя слишком длинное (максимум 50 символов)', severity: 'warning' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profile.email && !emailRegex.test(profile.email)) {
      setSnackbar({ open: true, message: 'Проверьте правильность ввода email', severity: 'warning' });
      return;
    }

    if (profile.tgnick && !profile.tgnick.startsWith('@')) {
      setSnackbar({ open: true, message: 'Ник Telegram должен начинаться с символа @', severity: 'warning' });
      return;
    }

    if (profile.about && profile.about.length > 300) {
      setSnackbar({ open: true, message: 'Текст "О себе" слишком длинный (максимум 300 символов)', severity: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await axios.patch('/auth/me', {
        fullName: profile.fullName,
        about: profile.about,
        city: profile.city,
        sex: profile.sex,
        birthday: profile.birthday,
        email: profile.email,
        tgnick: profile.tgnick
      });
      setSnackbar({ open: true, message: 'Профиль сохранен', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Ошибка сохранения', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1300,
        overflowY: 'auto',
        backgroundColor: '#121417',
        '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={handleClick}
            sx={{
              color: 'white',
              mr: 1,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ArrowLeft size={24} />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Редактор профиля
          </Typography>
        </Box>

        {loading && !profile.avatar && !profile.cover ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress color="inherit" />
          </Box>
        ) : (
          <>
            <Typography sx={{ mb: 1, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Фоновое изображение <Info size={14} />
            </Typography>
            <Box sx={{ position: 'relative', mb: 5 }}>
              <input
                accept="image/jpeg,image/png,image/gif"
                id="cover-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, 'cover')}
              />
              <label htmlFor="cover-upload" style={{ width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 180,
                    borderRadius: '20px',
                    backgroundColor: 'rgba(34, 40, 47, 0.7)',
                    backgroundImage: profile.cover ? `url(${profile.cover})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': { opacity: 0.9, borderColor: '#866023ff' },
                  }}
                >
                  {!profile.cover && <Camera size={32} color="white" />}
                </Box>
              </label>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: -45,
                  left: 60,
                  zIndex: 2
                }}
              >
                <input
                  accept="image/jpeg,image/png,image/gif"
                  id="avatar-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, 'avatar')}
                />
                <label htmlFor="avatar-upload">
                  <Avatar
                    src={profile.avatar}
                    sx={{
                      width: 100,
                      height: 100,
                      cursor: 'pointer',
                      border: '4px solid #121417',
                      backgroundColor: 'rgba(34, 40, 47, 1)',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  >
                    {!profile.avatar && <Camera size={28} />}
                  </Avatar>
                </label>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                value={profile.fullName}
                placeholder='Ваше имя'
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                fullWidth
                variant="outlined"
                inputProps={{ maxLength: 50 }}
                InputProps={{
                  sx: {
                    borderRadius: '20px',
                    color: 'white', mt: 2.5,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '& .MuiOutlinedInput-notchedOutline': { borderRadius: '20px' },
                  },
                }}
              />

              <TextField
                value={profile.email}
                placeholder='Электронная почта'
                type="email"
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: '20px',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '& .MuiOutlinedInput-notchedOutline': { borderRadius: '20px' },
                  },
                }}
              />

              <TextField
                value={profile.tgnick}
                placeholder='Ник Telegram (например, @username)'
                onChange={(e) => setProfile({ ...profile, tgnick: e.target.value })}
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    borderRadius: '20px',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '& .MuiOutlinedInput-notchedOutline': { borderRadius: '20px' },
                  },
                }}
              />

             

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  value={profile.sex}
                  label="Пол"
                  onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
                  InputProps={{
                    sx: {
                      borderRadius: '20px',
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& .MuiOutlinedInput-notchedOutline': { borderRadius: '20px' },
                      '& .MuiSelect-icon': { color: 'white' }
                    },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          backgroundColor: '#1a1d24',
                          color: 'white',
                          borderRadius: '15px'
                        }
                      }
                    }
                  }}
                >
                  {genders.map((gender) => (
                    <MenuItem 
                      key={gender.value} 
                      value={gender.value}
                      sx={{
                        '&.Mui-selected': { backgroundColor: 'rgba(134, 96, 35, 0.4)' },
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
                      }}
                    >
                      {gender.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  type="date"
                  value={profile.birthday}
                  label="Дата рождения"
                  onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true, style: { color: 'rgba(255,255,255,0.5)' } }}
                  InputProps={{
                    sx: {
                      borderRadius: '20px',
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& .MuiOutlinedInput-notchedOutline': { borderRadius: '20px' },
                      '& input::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)'
                      }
                    },
                  }}
                />
              </Box>

              <TextField
                placeholder="О себе"
                value={profile.about}
                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                inputProps={{ maxLength: 300 }}
                InputProps={{
                  sx: {
                    borderRadius: '20px',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '& .MuiOutlinedInput-notchedOutline': { borderRadius: '20px' },
                  },
                }}
              />

              <Button
                onClick={handleSaveProfile}
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.8,
                  mt: 2,
                  borderRadius: '16px',
                  background: '#866023ff',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': { background: '#be8221ff' },
                  '&.Mui-disabled': { background: 'rgba(134, 96, 35, 0.5)', color: 'rgba(255,255,255,0.5)' }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить изменения'}
              </Button>

              <Box sx={{ mt: 1, mb: 1, p: 2, borderRadius: '15px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  • Форматы: <b>JPG, PNG, GIF</b> (WEBP не поддерживается)<br />
                  • Максимальный вес: <b>5 МБ</b><br />
                  • Аватар: рекомендуем <b>500x500px</b><br />
                  • Фон: рекомендуем от <b>1000px</b> по ширине
                </Typography>
                
                <Typography sx={{ color: 'gray', fontSize: '14px', mt: 3, mb: 1, whiteSpace: 'pre-line' }}>
                  На этой странице вы можете заполнить информацию о себе, которая будет отображаться в вашем профиле:
                  • Имя или псевдоним
                  • Дата рождения
                  • Контактный Email
                  • Никнейм в Telegram
                  • Краткая информация о себе
                  • Аватар и фоновое изображение профиля
                  
                  Конфиденциальность и использование данных
                  
                  Личные данные (дата рождения, город и почта) не используются разработчиками в личных целях. Они указываются исключительно по вашему желанию, чтобы другие пользователи, клиенты или потенциальные бизнес-партнеры могли узнать вас лучше и быстро связаться с вами.
                  
                  Telegram-никнейм необходим как пользователям, так и команде модерации и разработки. Он позволяет оперативно поддерживать с вами связь — например, для экстренного уведомления о технических работах или в случае временной недоступности сайта.
                  
                  Обратите внимание: Мы уважаем вашу конфиденциальность. Заполнение всех вышеперечисленных полей является полностью добровольным. Вы можете оставить их пустыми, если не хотите делиться этой информацией.
                </Typography>
              </Box>

              <Typography 
                sx={{ 
                  textAlign: 'center', 
                  color: 'rgba(255,255,255,0.4)', 
                  mt: 2, 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  '&:hover': { color: 'white' }
                }} 
                onClick={handleLogin}
              >
                Войти в другой аккаунт
              </Typography>
            </Box>
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          variant="filled" 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileSettings;