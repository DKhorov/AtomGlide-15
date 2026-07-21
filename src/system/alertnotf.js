import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Stack, 
  Button, 
  CircularProgress, 
  Avatar,
  Divider
} from '@mui/material';
import { 
  NotificationsNoneOutlined, 
  DoneAllOutlined,
  FiberManualRecord
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Добавлен импорт для навигации
const LOCAL_SERVER_URL = 'http://localhost:3001'; 
const PRODUCTION_CDN_URL = 'https://atomglidedev.ru';
const READ_ALERTS_STORAGE_KEY = 'readAlertIds'; // Ключ для хранения прочитанных уведомлений локально

// Получить массив id прочитанных уведомлений из localStorage (всегда строки!)
const getReadIdsFromStorage = () => {
  try {
    const raw = window.localStorage.getItem(READ_ALERTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(id => String(id)); // <-- гарантируем строковый тип
  } catch (err) {
    console.error('Не удалось прочитать список прочитанных уведомлений из localStorage', err);
    return [];
  }
};

// Сохранить массив id прочитанных уведомлений в localStorage (всегда строки!)
const saveReadIdsToStorage = (ids) => {
  try {
    const uniqueStringIds = Array.from(new Set(ids.map(id => String(id))));
    window.localStorage.setItem(READ_ALERTS_STORAGE_KEY, JSON.stringify(uniqueStringIds));
    // Для отладки: раскомментируйте строку ниже, чтобы видеть в консоли, что реально пишется
    // console.log('[alerts] сохранено в localStorage:', uniqueStringIds);
  } catch (err) {
    console.error('Не удалось сохранить список прочитанных уведомлений в localStorage', err);
  }
};

// Гарантированная сортировка: непрочитанные всегда первыми,
// внутри каждой группы — от новых к старым по createdAt.
const sortAlertsByReadStatus = (list) => {
  return [...list].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Инициализация навигации

  const fetchAlerts = async () => {
    try {
      const token = window.localStorage.getItem('token');
      const { data } = await axios.get(`${LOCAL_SERVER_URL}/auth/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Подмешиваем локально сохранённый статус "прочитано" поверх данных с сервера
      const readIds = getReadIdsFromStorage();
      // Для отладки: раскомментируйте, чтобы сверить id из БД с тем, что лежит в localStorage
      // console.log('[alerts] id с сервера:', data.map(a => String(a._id)));
      // console.log('[alerts] id из localStorage:', readIds);
      const merged = data.map(alert => ({
        ...alert,
        isRead: alert.isRead || readIds.includes(String(alert._id)) // <-- сравнение строка со строкой
      }));
      setAlerts(sortAlertsByReadStatus(merged));
    } catch (err) {
      console.error('Не удалось загрузить уведомления', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Отметить все уведомления как прочитанные — полностью локально, без запроса на сервер
  const handleMarkAllAsRead = () => {
    setAlerts(prev => {
      const updated = prev.map(alert => ({ ...alert, isRead: true }));
      const allIds = updated.map(alert => String(alert._id));
      const readIds = getReadIdsFromStorage();
      const mergedIds = Array.from(new Set([...readIds, ...allIds]));
      saveReadIdsToStorage(mergedIds);
      return sortAlertsByReadStatus(updated);
    });
  };

  // Новая функция для обработки клика по конкретному уведомлению
  const handleAlertClick = (alert) => {
    // 1. Отмечаем как прочитанное локально (localStorage), без запроса на сервер
    if (!alert.isRead) {
      setAlerts(prev => 
        sortAlertsByReadStatus(
          prev.map(a => a._id === alert._id ? { ...a, isRead: true } : a)
        )
      );
      const readIds = getReadIdsFromStorage();
      const alertIdStr = String(alert._id);
      if (!readIds.includes(alertIdStr)) {
        saveReadIdsToStorage([...readIds, alertIdStr]);
      }
    }
    // 2. Переход на пост (замените alert.postId на правильное поле из вашей БД, например alert.post._id)
    if (alert.postId) {
      navigate(`/posts/${alert.postId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    });
  };
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return formatDate(dateString);
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m`;
    
    return 'just now';
  };
  const getStatusBadge = (type) => {
    switch (type) {
      case 'comment':
        return { text: 'Comment', color: '#50e3c2', bg: 'rgba(80, 227, 194, 0.1)' };
      case 'reaction':
        return { text: 'Reaction', color: '#f5a623', bg: 'rgba(245, 166, 35, 0.1)' };
      default:
        return { text: 'System', color: '#ff007f', bg: 'rgba(255, 0, 127, 0.1)' };
    }
  };
  const formatAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${PRODUCTION_CDN_URL}${avatarUrl}`;
  };

  // Рендер одной строки уведомления (вынесено, чтобы не дублировать разметку для двух групп)
  const renderAlertRow = (alert, index) => {
    const badge = getStatusBadge(alert.alertType);
    return (
      <Box key={alert._id}>
        {index > 0 && <Divider sx={{ borderColor: '#333333' }} />}
        
        <Stack 
          direction="row" 
          alignItems="flex-start" // Изменено на flex-start, чтобы при переносе строки иконки не уезжали вниз
          justifyContent="space-between"
          spacing={3}
          onClick={() => handleAlertClick(alert)} // Добавлен обработчик клика
          sx={{ 
            p: '14px 24px', 
            transition: 'background-color 0.15s ease',
            bgcolor: alert.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer', // Добавлен курсор pointer
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.04)'
            }
          }}
        >
          {/* Левая часть: Статус-точка + Текст */}
          <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ flex: 1, minWidth: 0, pt: '2px' }}>
            <FiberManualRecord 
              sx={{ 
                fontSize: 10, 
                color: alert.isRead ? '#444444' : badge.color,
                flexShrink: 0,
                mt: '6px' // Небольшой отступ сверху, чтобы точка была на уровне первой строки текста
              }} 
            />
            
            <Typography 
              // noWrap убран для переноса строк
              sx={{ 
                color: '#ffffff', 
                fontSize: '0.875rem',
                fontWeight: alert.isRead ? 400 : 500,
                fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif',
                wordBreak: 'break-word', // Добавлено для корректного переноса слов
                lineHeight: 1.5
              }}
            >
              {alert.text}
            </Typography>
          </Stack>
          {/* Правая часть: Время -> Категория -> Аватар */}
          <Stack direction="row" alignItems="center" spacing={3} sx={{ flexShrink: 0 }}>
            
            <Typography sx={{ color: '#888888', fontSize: '0.875rem', minWidth: '45px', textAlign: 'right' }}>
              {formatTimeAgo(alert.createdAt)}
            </Typography>
            <Box 
              sx={{ 
                px: '10px', 
                py: '3px', 
                borderRadius: '12px', 
                bgcolor: badge.bg, 
                border: `1px solid ${badge.color}33`,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Typography sx={{ color: badge.color, fontSize: '0.75rem', fontWeight: 600 }}>
                {badge.text}
              </Typography>
            </Box>
            <Typography sx={{ color: '#888888', fontSize: '0.875rem', width: '90px', textAlign: 'right' }}>
              {formatDate(alert.createdAt)}
            </Typography>
            <Avatar 
              src={formatAvatarUrl(alert.avatarUrl)} 
              sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: '#111111', 
                border: '1px solid #333333' 
              }}
            />
          </Stack>
        </Stack>
      </Box>
    );
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const readAlerts = alerts.filter(a => a.isRead);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: 6, 
      color: '#ffffff', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      width: '700px', // Ограничение ширины в 700px
    }}>
      <Container disableGutters sx={{ px: 2 }}>
        
        {/* Шапка в стиле Vercel */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 4, pb: 3, borderBottom: '1px solid #333333' }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Уведомления
            </Typography>
            <Typography variant="body2" sx={{ color: '#888888' }}>
              Здесь отображаются ответы на ваши комментарии и активность
            </Typography>
          </Box>
          {alerts.some(a => !a.isRead) && (
            <Button
              variant="outlined"
              startIcon={<DoneAllOutlined sx={{ fontSize: 16 }} />}
              onClick={handleMarkAllAsRead}
              sx={{
                bgcolor: '#1a1b1e',
                color: '#888888',
                borderColor: '#333333',
                textTransform: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 500,
                height: '36px',
                px: 2,
                '&:hover': { 
                  color: '#ffffff', 
                  borderColor: '#ffffff',
                  bgcolor: '#000000'
                }
              }}
            >
              Прочитать все
            </Button>
          )}
        </Stack>
        {/* Сетка списка */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#888888' }} size={28} />
          </Box>
        ) : alerts.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              bgcolor: '#000000', 
              borderRadius: '8px', 
              border: '1px dashed #333333' 
            }}
          >
            <NotificationsNoneOutlined sx={{ fontSize: 32, color: '#444444', mb: 1 }} />
            <Typography sx={{ color: '#888888', fontSize: '0.875rem' }}>
              No notifications available.
            </Typography>
          </Paper>
        ) : (
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: '#1a1b1e', 
              borderRadius: '8px', 
              border: '1px solid #333333',
              overflow: 'hidden'
            }}
          >
            {/* Блок непрочитанных уведомлений */}
            {unreadAlerts.map((alert, index) => renderAlertRow(alert, index))}

            {/* Разделитель между непрочитанными и прочитанными (показывается только если есть и те, и другие) */}
            {unreadAlerts.length > 0 && readAlerts.length > 0 && (
              <Box 
                sx={{ 
                  px: 3, 
                  py: '8px', 
                  bgcolor: '#000000', 
                  borderTop: '1px solid #333333',
                  borderBottom: '1px solid #333333'
                }}
              >
                <Typography 
                  sx={{ 
                    color: '#666666', 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}
                >
                  Прочитанные
                </Typography>
              </Box>
            )}

            {/* Блок прочитанных уведомлений */}
            {readAlerts.map((alert, index) => renderAlertRow(alert, index))}
          </Paper>
        )}
      </Container>
    </Box>
  );
};