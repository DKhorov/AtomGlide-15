"use client";
import React, { useState, useEffect, memo } from 'react';
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

import { selectUser } from '../../../system/redux/slices/getme'; 
import PostHeader from './PostHeader';
import PostText from './PostText';
import PostPhoto from './PostPhoto';

const hideScrollbar = { scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };

const CUSTOM_REACTIONS = ['SVG-DOG', 'SVG-CAT', 'SVG-PEPE']; 

const REPORT_REASONS = [
  'Спам', 'Оскорбление', 'Насилие', 'Порнография', 'Мошенничество', 
  'Нарушение авторских прав', 'Ложная информация', 'Продажа запрещенных товаров', 
  'Экстремизм', 'Оскорбление правительства страны', 'Разжигание ненависти к политике',
  'Критика политической ситуации в стране', 'Призывы к свержению власти', 
  'Оскорбление государственных символов', 'Клевета на чиновников',
  'Пропаганда сепаратизма', 'Неуважение к конституции', 'Дискредитация армии',
  'Оправдание терроризма', 'Разглашение гостайны', 'Призывы к массовым беспорядкам',
  'Агитация за запрещенные партии', 'Оскорбление президенты', 'Антигосударственная пропаганда',
  'Разжигание межнациональной розни', 'Разжигание религиозной вражды', 'Оскорбление чувств верующих',
  'Расизм', 'Нацизм', 'Фашизм', 'Сексизм', 'Гомофобия', 'Трансфобия', 'Эйджизм',
  'Дискриминация по языку', 'Дискриминация инвалидов', 'Унижение человеческого достоинства',
  'Кибербуллинг', 'Травля пользователя', 'Сталкинг (преследование)', 'Шантаж',
  'Угроза физической расправой', 'Угроза убийством', 'Доксинг (слив личных данных)',
  'Публикация интимных фото без согласия', 'Вторжение в частную жизнь', 'Скрытая съемка',
  'Фишинг', 'Распространение вирусов', 'Вредоносное ПО', 'Кража аккаунта',
  'Попытка взлома', 'Использование читов', 'Использование ботов', 'Накрутка лайков',
  'Накрутка комментариев', 'Накрутка подписчиков', 'Фейковый аккаунт', 'Выдача себя за другого',
  'Клонирование профиля', 'Выдача себя за администрацию', 'Продажа аккаунта', 'Покупка аккаунта',
  'Передача аккаунта третьим лицам', 'Спам в личные сообщения', 'Спам в комментариях',
  'Массовая рассылка', 'Реклама без разрешения', 'Скрытая реклама', 'Реклама конкурентов',
  'Финансовые пирамиды', 'Скам-проекты', 'Реклама казино', 'Реклама ставок на спорт',
  'Незаконная торговля', 'Продажа наркотиков', 'Продажа оружия', 'Продажа лекарств без рецепта',
  'Продажа краденого', 'Продажа баз данных', 'Торговля людьми', 'Жестокое обращение с животными',
  'Демонстрация убийства', 'Демонстрация самоубийства', 'Призыв к суициду', 'Селфхарм',
  'Пропаганда анорексии', 'Пропаганда наркотиков', 'Пропаганда курения', 'Пропаганда алкоголя',
  'Сцены чрезмерной жестокости', 'Шок-контент', 'Трэш-стрим', 'Педофилия', 'Зоофилия',
  'Некрофилия', 'Эротика', 'Сексуализация несовершеннолетних', 'Нецензурная лексика',
  'Матерные оскорбления', 'Троллинг', 'Флуд', 'Офтоп', 'Капс (злоупотребление заглавными)',
  'Злоупотребление эмодзи', 'Нечитаемый текст', 'Спойлеры', 'Кликбейт', 'Фейк-ньюс',
  'Теории заговора', 'Отрицание исторических фактов', 'Медицинская дезинформация',
  'Отрицание пандемии', 'Антиваксерство', 'Введение в заблуждение', 'Подделка документов',
  'Нарушение NDA', 'Плагиат', 'Пиратский контент', 'Незаконное использование логотипа',
  'Использование чужого товарного знака', 'Призыв к нарушению правил платформы',
  'Оскорбление модератора', 'Оскорбление разработчика', 'Саботаж работы платформы',
  'DDoS-атака', 'Парсинг данных', 'Использование несанкционированного API',
  'Обход блокировки', 'Создание мультиаккаунтов для обхода бана', 'Жалоба ради шутки',
  'Абуз системы репортов', 'Ложный донос', 'Попрошайничество', 'Вымогательство донатов',
  'Организация незаконных сборов', 'Отмывание денег', 'Финансирование экстремизма',
  'Пропаганда криминального образа жизни (АУЕ)', 'Инструкции по созданию оружия',
  'Инструкции по созданию взрывчатки', 'Инструкции по обходу закона', 'Пропаганда уклонения от налогов',
  'Пропаганда коррупции', 'Оправдание коррупции', 'Взятка модератору', 'Торговля игровой валютой',
  'Нарушение правил оформления профиля', 'Запрещенная аватарка', 'Недопустимый никнейм',
  'Запрещенный статус', 'Публикация ссылок на даркнет', 'Опасные челленджи',
  'Вредоносные советы', 'Искажение смысла чужих постов', 'Манипуляция мнением',
  'Астротурфинг', 'Покупка отзывов', 'Заказная травля', 'Сватинг (ложный вызов полиции)',
  'Агрессивное навязывание мнения', 'Оскорбление по профессиональному признаку',
  'Оскорбление по уровню дохода', 'Оскорбление внешности (бодишейминг)', 'Фэтшейминг',
  'Скинишейминг', 'Слатушейминг', 'Виктимблейминг (обвинение жертвы)', 'Газлайтинг',
  'Распространение слухов', 'Клевета на бизнес', 'Черный пиар', 'Нарушение тайны переписки',
  'Нарушение врачебной тайны', 'Нарушение адвокатской тайны', 'Оскорбление умерших',
  'Глумление над трагедией', 'Радость от чужого горя', 'Провокация конфликта',
  'Разжигание холивара', 'Токсичное поведение', 'Пассивная агрессия', 'Необоснованная критика',
  'Переход на личности', 'Оскорбление родственников', 'Угроза расправой в реале',
  'Назначение "стрелок"', 'Подстрекательство к драке', 'Хулиганство', 'Вандализм',
  'Пропаганда вандализма', 'Оправдание домашнего насилия', 'Призыв к отказу от лечения',
  'Реклама сект', 'Пропаганда оккультизма', 'Гадание и привороты (мошенничество)',
  'Продажа "воздуха" (инфоцыганство)', 'Недобросовестная конкуренция', 'Демпинг',
  'Монопольный сговор', 'Нарушение правил конкурса', 'Накрутка голосов в опросе',
  'Обман в розыгрыше', 'Публикация скримеров', 'Использование стробоскопических эффектов без предупреждения',
  'Слишком громкий звук в видео', 'Нарушение эстетики платформы', 'Низкокачественный контент',
  'Автоматически сгенерированный текст (плохой ИИ)', 'Синтез чужого голоса без разрешения',
  'Дипфейки без пометки', 'Кража личности в метавселенной', 'Виртуальное изнасилование',
  'Продажа NFT мошенническим путем', 'Rug pull (скам в крипте)', 'Реклама шиткоинов',
  'Незаконная добыча криптовалюты (скрытый майнинг)', 'Сбор MAC-адресов', 'Сбор IP-адресов',
  'Деанонимизация', 'Превышение лимитов API', 'Загрузка слишком больших файлов',
  'Использование уязвимостей (эксплойты)', 'Распространение багов', 'Скрытие вредоносного кода в картинке',
  'Полинг (чрезмерные запросы к серверу)', 'SQL-инъекция', 'XSS-атака', 'CSRF-атака',
  'Использование iframe для мошенничества', 'Нарушение CORS', 'Подмена заголовков запроса',
  'Создание фиктивных транзакций', 'Нарушение логики приложения', 'Вмешательство в работу базы данных',
  'Попытка доступа к админке', 'Слив исходного кода', 'Нарушение лицензии MIT/GPL',
  'Реверс-инжиниринг платформы', 'Продажа эксплойтов', 'Шаринг платных подписок',
  'Продажа краденых кредиток', 'Кардинг', 'Отмывание скинов', 'Скам в трейде',
  'Нарушение правил торговой площадки', 'Создание искусственного дефицита', 'Памп и дамп',
  'Инсайдерская торговля', 'Нарушение корпоративной этики', 'Харассмент на рабочем месте (в рабочих чатах)',
  'Нецелевое использование платформы', 'Использование как файлообменник', 'Создание дорвеев',
  'Поисковый спам', 'Использование невидимого текста', 'Клоакинг', 'Перенаправление на вредоносные сайты',
  'Использование сокращателей ссылок со спамом', 'Реферальный спам', 'Размещение реферальных ссылок без контента',
  'Продажа мест в друзьях', 'Продажа прав модератора', 'Злоупотребление властью в клане/группе',
  'Несправедливый кик из беседы', 'Удаление чужих сообщений без причины', 'Намеренная порча вики-страниц',
  'Вандализм в совместных документах', 'Публикация пустых постов', 'Массовое создание пустых групп',
  'Резервирование красивых ников для продажи', 'Сквоттинг', 'Имитация системных уведомлений',
  'Использование анимированных аватарок вызывающих эпилепсию', 'Неправильное использование тегов',
  'Спам тегами', 'Уклонение от ответа модератору', 'Отказ предоставить доказательства по жалобе',
  'Публикация переписки с саппортом', 'Шантаж администрации', 'Призыв к бойкоту платформы',
  'Организация рейдов на другие ресурсы', 'Участие в рейдах', 'Нарушение международного права',
  'Призыв к военным преступлениям', 'Оправдание геноцида', 'Пропаганда рабства',
  'Отрицание прав человека', 'Призыв к нарушению свободы слова', 'Цензура',
  'Незаконное использование биометрических данных', 'Слежка', 'Я думаю это плохо'
];

const CDN_URL = 'https://atomglidedev.ru';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#0000005d', 
  zIndex: 99999, 
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modalContentStyle = {
  width: '90%',
  maxWidth: '480px',
  backgroundColor: '#1a1b1e', 
  border: '1px solid #333333',
  borderRadius: '24px',
  padding: '24px',
  boxSizing: 'border-box',
  position: 'relative'
};

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
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isFading, setIsFading] = useState(true);
  const [reportSending, setReportSending] = useState(false);
  const [customReason, setCustomReason] = useState('');

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
  
  // Новая функция хелпер для безопасного вывода даты изменения
  const formatEditDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  const handleToggleComments = async () => {
    if (!userId) { handleOpenAuthModal(); return; }
    if (!isCommentsOpen && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const { data } = await axios.get(`https://atomglidedev.ru/comment/post/${post._id}`);
        if (data.success) setComments(data.comments.reverse());
      } catch (e) { console.error(e); } finally { setIsLoadingComments(false); }
    }
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleSendComment = async () => {
    if (!newCommentText.trim()) return;
    setIsSending(true);
    try {
      const token = window.localStorage.getItem('token');
      const { data } = await axios.post(`https://atomglidedev.ru/comment`, 
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
      const { data } = await axios.post(`https://atomglidedev.ru/posts/${post._id}/reaction`, { emoji }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) setReactions(data.reactions);
    } catch (err) { console.error(err); }
    handleClosePicker();
  };

  const handleSendReport = async (reason) => {
    setReportSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); 
      alert(`Жалоба отправлена: ${reason}`);
      handleCloseReportModal();
    } catch (error) {
      console.error(error);
    } finally {
      setReportSending(false);
    }
  };

  const handleSubmitCustom = () => {
    if (customReason.trim()) {
      handleSendReport(customReason.trim());
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://atomglide.com/posts/${post._id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    if (comments.length === 0 || isCommentsOpen) return;
    const interval = setInterval(() => {
      setIsFading(false);
      setTimeout(() => {
        setPreviewIndex((prev) => (prev + 1) % Math.min(comments.length, 5));
        setIsFading(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [comments, isCommentsOpen]);

  const goToProfile = (userId) => userId && navigate(`/profile/${userId}`);

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
            <InputBase fullWidth value={`https://atomglide.com/posts/${post._id}`} readOnly sx={{ px: 2, color: '#cccccc', fontSize: '0.85rem' }} />
            <Button onClick={handleCopyLink} sx={{ bgcolor: isCopied ? '#4caf50' : '#ffffff', color: isCopied ? '#ffffff' : '#000000', borderRadius: '12px', px: 2, py: 1, fontWeight: 800, textTransform: 'none', minWidth: '140px', '&:hover': { bgcolor: isCopied ? '#45a049' : '#e0e0e0' } }} startIcon={isCopied ? <CheckOutlined /> : <ContentCopyOutlined />}>
              {isCopied ? 'Скопировано' : 'Копировать'}
            </Button>
          </Box>
          
          <Box sx={{ bgcolor: '#25262b', borderRadius: '16px', p: 2, border: '1px solid #333333' }}>
            <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '0.9rem', mb: 0.5 }}>Про поддержку</Typography>
            <Typography sx={{ color: '#888888', fontSize: '0.8rem', lineHeight: 1.4 }}>Каждый ваш репост продвигает проект и помогает автору. Подробнее в AtomGlide.</Typography>
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
        <Box 
          sx={{ 
            ...modalContentStyle, 
            borderRadius: { xs: '16px', sm: '24px' }, 
            width: { xs: '95%', sm: '90%' }, 
            maxWidth: '850px', 
            maxHeight: '90vh', 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }} 
          onClick={(e) => e.stopPropagation()}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid #333' }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Пожаловаться</Typography>
            <IconButton onClick={handleCloseReportModal} sx={{ color: '#888888', bgcolor: '#25262b' }}><CloseOutlined /></IconButton>
          </Stack>
          
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3, 
            p: 3,
            ...hideScrollbar 
          }}>
            <Box sx={{ flex: 1, maxHeight: '60vh', overflowY: 'auto', pr: 1, ...hideScrollbar }}>
              <Typography sx={{ color: '#aaaaaa', mb: 2, fontSize: '0.9rem' }}>Выберите причину из списка:</Typography>
              <Grid container spacing={1.5}>
                {REPORT_REASONS.map((reason) => (
                  <Grid item xs={12} key={reason}>
                    <Button 
                      fullWidth onClick={() => handleSendReport(reason)} disabled={reportSending}
                      sx={{ 
                        justifyContent: 'flex-start', bgcolor: '#25262b', color: '#ffffff', 
                        borderRadius: '12px', py: 1.5, px: 2, textTransform: 'none',
                        border: '1px solid #333333', textAlign: 'left',
                        '&:hover': { bgcolor: '#333333' }
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
                sx={{ bgcolor: '#ffffff', color: '#000', borderRadius: '8px', py: 1.5, fontWeight: 'bold' }}
              >
                Отправить
              </Button>

              <Box sx={{ bgcolor: '#25262b', borderRadius: '16px', p: 2, border: '1px solid #333' }}>
                <Typography sx={{ color: '#ffffff', fontWeight: 800, mb: 0.5 }}>Про систему жалоб</Typography>
                <Typography sx={{ color: '#888888', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  Как только вы отправляете жалобу, запрос моментально улетает модераторам. Срок рассмотрения: от 1 до 5 дней. За ложный донос аккаунт получает отметку. При трёхкратном повторении профиль будет ликвидирован.
                </Typography>
              </Box>
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
        <div style={{ ...modalContentStyle, display: 'flex', flexDirection: 'column', gap: '20px' }} onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Нужен аккаунт</Typography>
            <IconButton onClick={handleCloseAuthModal} sx={{ color: '#888888', bgcolor: '#25262b', '&:hover': { bgcolor: '#333333' } }}>
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Stack>

          <Typography sx={{ color: '#aaaaaa', fontSize: '0.85rem', lineHeight: 1.5 }}>
            Для того чтобы оставлять комментарии, ставить реакции и делиться публикациями, вам необходимо войти в свою учетную запись.
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Button 
              fullWidth variant="contained" onClick={() => { handleCloseAuthModal(); navigate('/login'); }} 
              sx={{ bgcolor: '#ffffff', color: '#000000', borderRadius: '12px', py: 1.5, fontWeight: 900, textTransform: 'none', fontSize: '0.9rem', '&:hover': { bgcolor: '#e0e0e0' } }}
            >
              Войти в профиль
            </Button>
            <Button 
              fullWidth onClick={handleCloseAuthModal} 
              sx={{ color: '#aaaaaa', textTransform: 'none', fontSize: '0.85rem', borderRadius: '12px', py: 1, bgcolor: '#1a1b1e', border: '1px solid #333333', '&:hover': { bgcolor: '#25262b', color: '#ffffff' } }}
            >
              Позже
            </Button>
          </Stack>
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
                  cursor: 'pointer', display: 'flex', gap: 0.5, alignItems: 'center', transition: '0.2s', '&:hover': { bgcolor: '#333333' }
                }}>
                  {renderReaction(r.emoji)}
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>{r.users?.length || 0}</Typography>
                </Box>
              ))}
            </Stack>
          )}

          <Box onClick={handleToggleComments} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.8, borderRadius: '12px', cursor: 'pointer', bgcolor: isCommentsOpen ? '#ffffff' : '#25262b', color: isCommentsOpen ? '#000000' : '#ffffff', transition: '0.2s', ml: 2 }}>
            <ChatBubbleOutline sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 900 }}>
              {post.commentsCount > 0 ? post.commentsCount : comments.length}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <IconButton onClick={handleOpenReportModal} sx={{ bgcolor: '#1a1b1e', color: '#888888', borderRadius: '12px', '&:hover': { bgcolor: '#25262b', color: '#ff4444' } }}>
            <FlagOutlined sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton onClick={handleOpenShareModal} sx={{ bgcolor: '#25262b', color: '#ffffff', borderRadius: '12px', '&:hover': { bgcolor: '#333333' } }}>
            <ShareOutlined sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Stack>

      {post.isEdited && (
        <Box sx={{ mt: 2, pl: 1.5, borderLeft: '2px solid #ffb74d' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: '0.8rem', color: '#ffb74d', fontWeight: 'bold', px: 0.5, borderRadius: '4px' }}>
              Данный пост был изменен: {formatEditDate(post.editedAt)}
            </Typography>
          </Stack>
        </Box>
      )}

      {isCommentsOpen && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #2a2a2a' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
            <InputBase fullWidth placeholder="Что вы думаете об этом?" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} sx={{ bgcolor: '#111111', px: 2, py: 1, borderRadius: '12px', color: '#ffffff', border: '1px solid #2a2a2a' }} />
            <Button onClick={handleSendComment} disabled={!newCommentText.trim() || isSending} sx={{ 
                bgcolor: '#ffffff', color: '#000000', borderRadius: '12px', fontWeight: 900, px: 3, '&:hover': { bgcolor: '#e0e0e0' }, '&.Mui-disabled': { bgcolor: '#333333', color: '#666666' }
              }}>
              {isSending ? <CircularProgress size={20} sx={{ color: '#000000' }} /> : 'ОК'}
            </Button>
          </Stack>

          <Stack spacing={2} sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1, ...hideScrollbar }}>
            {isLoadingComments ? <CircularProgress size={24} sx={{ color: '#ffffff', alignSelf: 'center' }} /> : 
              comments.length === 0 ? <Typography sx={{ color: '#555555', textAlign: 'center', py: 2 }}>Пока нет мнений. Будьте первым!</Typography> :
              comments.map((c) => (
                <Stack key={c._id} direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar src={getAvatarUrl(c.user?.avatarUrl)} onClick={() => goToProfile(c.user?._id)} sx={{ width: 36, height: 36, border: '1px solid #333333', cursor: 'pointer', mt: 0.5 }} />
                  <Box sx={{ flex: 1, bgcolor: '#25262b', px: 2, py: 1.5, borderRadius: '2px 16px 16px 16px', border: '1px solid #2a2a2a' }}>
                    <Typography onClick={() => goToProfile(c.user?._id)} sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffffff', cursor: 'pointer', display: 'inline-block', mb: 0.5 }}>
                      {c.user?.fullName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: '#dddddd', wordBreak: 'break-word', lineHeight: 1.4 }}>
                      {c.text}
                    </Typography>
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
              <IconButton key={item} onClick={() => toggleReaction(item)} disableRipple sx={{ width: 36, height: 36, borderRadius: '50%', transition: 'all 0.15s ease', '&:hover': { bgcolor: '#333333', transform: 'scale(1.1)' } }}>
                {renderReaction(item)}
              </IconButton>
            ))}
          </Box>
        )}
        <EmojiPicker theme="dark" onEmojiClick={(emojiObject) => toggleReaction(emojiObject.emoji)} width={320} height={350} skinTonesDisabled={true} searchDisabled={true} previewConfig={{ showPreview: false }} />
      </Popover>

      {renderShareModal()}
      {renderReportModal()}
      {renderAuthModal()}
    </Paper>
  );
});

PostWithComments.displayName = 'PostWithComments';
export default PostWithComments;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/