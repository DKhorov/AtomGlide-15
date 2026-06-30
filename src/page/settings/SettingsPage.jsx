import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Switch,
  Divider,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Grid,
  TextField
} from '@mui/material';
import {
  FiChevronRight,
  FiUser,
  FiBell,     
  FiLock,     
  FiEye,
  FiHelpCircle,
  FiInfo,
  FiLogOut,
  FiVolume2,
  FiLayout,
  FiCpu,
  FiActivity,
  FiSmartphone, 
  FiRefreshCw,
  FiMonitor,
  FiTablet,
  FiX,
  FiMail,
  FiMapPin,
  FiPhone
} from 'react-icons/fi';
import axios from '../../system/axios';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { subscribeUserToPush } from '../../system/push-subscribe';

const SUPPORT_CATEGORIES = [
  'Жалоба на пост',
  'Жалоба на статью',
  'Жалоба на музыку',
  'Жалоба на магазин',
  'Контакты',
  'Оставить заявку',
  'ОБРАТИТЬ ВНИМАНИЕ!'
];

const REPORT_REASONS = [
  'Спам', 'Оскорбление', 'Насилие', 'Порнография', 'Мошенничество', 
  'Нарушение авторских прав', 'Ложная информация', 'Продажа запрещенных товаров', 
  'Экстремизм', 'Оскорбление правительства страны', 'Разжигание ненависти к политике',
  'Критика политической ситуации в стране', 'Призывы к свержению власти', 
  'Оскорбление государственных символов', 'Клевета на чиновников',
  'Пропаганда сепаратизма', 'Неуважение к конституции', 'Дискредитация армии',
  'Оправдание терроризма', 'Разглашение гостайны', 'Призывы к массовым беспорядкам',
  'Агитация за запрещенные партии', 'Оскорбление президента', 'Антигосударственная пропаганда',
  'Разжигание межнациональной розни', 'Разжигание религиозной вражды', 'Оскорбление чувств верующих',
  'Расизм', 'Нацизм', 'Фашизм', 'Сексизм', 'Гомофобия', 'Трансфобия', 'Эйджизм',
  'Дискриминация по языку', 'Дискриминация инвалидов ( кроме Ивана Золо )', 'Унижение человеческого достоинства ( кроме Ивана Золо )',
  'Кибербуллинг', 'Травля пользователя ( кроме Ивана Золо )', 'Сталкинг (преследование)', 'Шантаж',
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
  'Демонстрация убийства', 'Демонстрация самоубийства', 'Призыв к суициду', 'Селфхарм ( Если нет трек монеточки )',
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


const SettingsSection = ({ title, children, isMobile, theme }) => (
  <Box sx={{ mb: 3, maxWidth: isMobile ? '100%' : '800px', mx: 'auto' }}>
    {title && (
      <Typography
        sx={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(154, 153, 153, 1)',
          textTransform: 'uppercase',
          mb: 1.5,
          px: 2,
          letterSpacing: '0.5px'
        }}
      >
        {title}
      </Typography>
    )}
    <Box
      sx={{
        backgroundColor: theme.surface || '#1A1A1A', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      {children}
    </Box>
  </Box>
);

const SettingsItem = ({
  icon: Icon,
  label,
  value,
  onClick,
  showArrow = true,
  showSwitch = false,
  switchValue,
  onToggle,
  color = '#ffffff', 
  noBorder = false,
  isChecked = false, 
  theme
}) => (
  <>
    <Box
      onClick={showSwitch ? null : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: '14px 16px',
        minHeight: '52px',
        cursor: (onClick && !showSwitch) ? 'pointer' : 'default',
        '&:hover': (onClick && !showSwitch)
          ? { backgroundColor: 'rgba(255, 255, 255, 0.03)' }
          : {},
        transition: 'background-color 0.2s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {Icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px', 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} color={color} />
          </Box>
        )}
        <Typography sx={{ color: 'white', fontSize: '15px', fontWeight: 500, ml: Icon ? 0 : 1 }}>
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {value && (
          <Typography
            sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '14px' }}
          >
            {value}
          </Typography>
        )}
        {showSwitch && (
          <Switch
            checked={switchValue}
            onChange={onToggle}
            disableRipple
            sx={{
              width: 40,
              height: 22,
              padding: 0,
              '& .MuiSwitch-switchBase': {
                padding: '2px',
                '&.Mui-checked': {
                  transform: 'translateX(18px)',
                  color: '#fff',
                  '& + .MuiSwitch-track': {
                    backgroundColor: theme?.primary || '#ffffff', 
                    opacity: 1,
                    border: 'none',
                  },
                },
              },
              '& .MuiSwitch-thumb': {
                width: 18,
                height: 18,
                boxShadow: 'none',
                backgroundColor: switchValue ? '#000000' : '#ffffff'
              },
              '& .MuiSwitch-track': {
                borderRadius: 22 / 2,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                opacity: 1,
                transition: 'background-color 0.2s'
              },
            }}
          />
        )}
        {isChecked && <Typography sx={{ color: theme?.primary || '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>✓</Typography>}
        {showArrow && !showSwitch && !isChecked && (
          <FiChevronRight size={18} color="rgba(154, 153, 153, 0.5)" />
        )}
      </Box>
    </Box>
    {!noBorder && (
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', ml: Icon ? 7 : 2 }} />
    )}
  </>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');
  const { theme: activeTheme, themes, currentTheme } = useCustomTheme();
  
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: false, 
    soundEnabled: true,
    dolbyAtmos: true,
    highResCovers: false,
  });
  
  const [modals, setModals] = useState({
    help: false,
    about: false,
    plugins: false,      
    recommendations: false,
    notificationsHelp: false,
    devices: false,
    support: false
  });

  const [activeSupportTab, setActiveSupportTab] = useState(SUPPORT_CATEGORIES[0]);
  const [customReason, setCustomReason] = useState('');
  const [reportSending, setReportSending] = useState(false);

  const activeDevices = [
    { id: 1, name: 'iPhone 16 Pro', os: 'AtomGlide Mobile • Онлайн', icon: FiSmartphone, current: true },
    { id: 2, name: 'MacBook Pro M4 Pro', os: 'macOS • Недавно', icon: FiMonitor, current: false },
    { id: 3, name: 'iPad mini 7', os: 'iPadOS • Вчера', icon: FiTablet, current: false }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data.user || res.data);
        if ('Notification' in window && Notification.permission === 'granted') {
           setSettings(prev => ({ ...prev, notifications: true }));
        }
      } catch (err) {
        console.error('Ошибка загрузки пользователя:', err);
      }
    };
    fetchUser();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationToggle = async () => {
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления.');
      return;
    }
    if (Notification.permission === 'granted') {
      setSettings(prev => ({ ...prev, notifications: !prev.notifications }));
      if (!settings.notifications) await subscribeUserToPush();
      return;
    }
    if (Notification.permission === 'denied') {
      setModals(prev => ({ ...prev, notificationsHelp: true }));
      return;
    }
    try {
        await subscribeUserToPush();
        if (Notification.permission === 'granted') {
           setSettings(prev => ({ ...prev, notifications: true }));
        }
    } catch (error) {
        console.error("Ошибка при включении уведомлений", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти?")) {
      localStorage.removeItem('token');
      window.location.href = '/'; 
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return undefined;
    return user.avatarUrl.startsWith('http') ? user.avatarUrl : `https://atomglidedev.ru${user.avatarUrl}`;
  };

  const toggleModal = (modalName, show) => {
    setModals(prev => ({ ...prev, [modalName]: show }));
  };

  const handleSendReport = (reason) => {
    setReportSending(true);
    setTimeout(() => {
      alert(`Жалоба по причине "${reason}" отправлена!`);
      setReportSending(false);
      toggleModal('support', false);
    }, 800);
  };

  const handleSubmitCustom = () => {
    setReportSending(true);
    setTimeout(() => {
      alert('Ваша заявка успешно отправлена!');
      setCustomReason('');
      setReportSending(false);
      toggleModal('support', false);
    }, 800);
  };

  const handleWikiRedirect = () => {
    window.open('https://atomglide.com/atomwiki.html', '_blank');
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: isMobile ? '100vw' : '100%',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: activeTheme.background || '#000000',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { width: '0px', background: 'transparent' },
        paddingBottom: isMobile ? '70px' : 0,
        px: isMobile ? 2 : 3,
        pt: isMobile ? 4 : 6
      }}
    >
      <Box sx={{ maxWidth: isMobile ? '100%' : '800px', mx: 'auto', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 1, px: 1, letterSpacing: '-0.5px' }}>
          Настройки
        </Typography>
      </Box>

      {user && (
        <SettingsSection isMobile={isMobile} theme={activeTheme}>
          <Box 
            onClick={() => navigate('/setting')} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              p: '20px', 
              cursor: 'pointer', 
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.03)' }, 
              transition: 'background-color 0.2s' 
            }}
          >
            <Avatar src={getAvatarUrl()} sx={{ width: 64, height: 64, bgcolor: 'rgba(237, 93, 25, 1)' }}>
              {user.fullName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: 'white', fontSize: '20px', fontWeight: 600, lineHeight: 1.2 }}>
                {user.fullName || 'Пользователь'}
              </Typography>
              <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '14px', mt: 0.5 }}>
                Управление профилем и безопасность
              </Typography>
            </Box>
            <FiChevronRight size={22} color="rgba(154, 153, 153, 0.5)" />
          </Box>
        </SettingsSection>
      )}

      <SettingsSection title="Система" isMobile={isMobile} theme={activeTheme}>
        <SettingsItem 
          icon={FiLayout} label="Тема оформления" value={themes?.[currentTheme]?.name || 'Темная'} 
          onClick={() => navigate('/settings/theme')} color="#A5A5A5" theme={activeTheme}
        />
     
        <SettingsItem 
          icon={FiCpu} label="Geromik Logic" value="Ver. 26HA48B BETA" 
          onClick={() => toggleModal('plugins', true)} color="#A5A5A5" noBorder theme={activeTheme}
        />
      </SettingsSection>

      <SettingsSection title="Контакт центры" isMobile={isMobile} theme={activeTheme}>
        <SettingsItem 
          icon={FiUser} label="Центр поддержки" value="24/7" 
          onClick={() => toggleModal('support', true)} color="#A5A5A5" noBorder theme={activeTheme}
        />
      </SettingsSection>

      <SettingsSection title="Медиа и Уведомления" isMobile={isMobile} theme={activeTheme}>
        <SettingsItem 
          icon={FiBell} label="Push-уведомления" showSwitch switchValue={settings.notifications} 
          onToggle={handleNotificationToggle} color="#A5A5A5" theme={activeTheme}
        />
        <SettingsItem 
          icon={FiVolume2} label="Высокое качество звука" showSwitch switchValue={settings.soundEnabled} 
          onToggle={() => handleToggle('soundEnabled')} color="#A5A5A5" theme={activeTheme}
        />
        <SettingsItem 
          icon={FiActivity} label="Dolby Atmos" showSwitch switchValue={settings.dolbyAtmos} 
          onToggle={() => handleToggle('dolbyAtmos')} color="#A5A5A5" theme={activeTheme}
        />
        <SettingsItem 
          icon={FiEye} label="High-Res обложки" showSwitch switchValue={settings.highResCovers} 
          onToggle={() => handleToggle('highResCovers')} color="#A5A5A5" noBorder theme={activeTheme}
        />
      </SettingsSection>

      <SettingsSection title="Дополнительно" isMobile={isMobile} theme={activeTheme}>
        <SettingsItem 
          icon={FiHelpCircle} label="Помощь (AtomWiki)" onClick={() => toggleModal('help', true)} color="#A5A5A5" theme={activeTheme}
        />
        <SettingsItem 
          icon={FiInfo} label="О приложении" value="v15.0" onClick={() => toggleModal('about', true)} color="#A5A5A5" theme={activeTheme}
        />
        <SettingsItem 
          icon={FiLogOut} label="Выйти из аккаунта" onClick={handleLogout} showArrow={false} color="#FF3B30" noBorder theme={activeTheme}
        />
      </SettingsSection>

      <Box sx={{ maxWidth: isMobile ? '100%' : '800px', mx: 'auto', mb: 10, mt: 4 }}>
        <Typography sx={{ textAlign: 'center', color: 'rgba(154, 153, 153, 0.4)', fontSize: '13px', lineHeight: 1.6 }}>
          AtomGlide LLC®. Все права защищены. 2025–2026<br />
          Author: Dmiry (tg: @jpegweb AG: jpegweb)
        </Typography>
      </Box>


      <Dialog 
        open={modals.support} 
        onClose={() => toggleModal('support', false)} 
        fullWidth maxWidth="md"
        PaperProps={{ 
          style: { 
            backgroundColor: '#1E1E20', 
            color: 'white', 
            borderRadius: isMobile ? '16px' : '24px',
            width: isMobile ? '95%' : '90%',
            height: isMobile ? '85vh' : '70vh',
            maxHeight: '850px',
            display: 'flex',
            flexDirection: 'column'
          } 
        }}
      >
       
        
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          
          <Box sx={{ 
            width: { xs: '100%', md: '280px' }, 
            borderRight: { xs: 'none', md: '1px solid rgba(255,255,255,0.05)' },
            borderBottom: { xs: '1px solid rgba(255,255,255,0.05)', md: 'none' },
            p: 2,
            overflowY: 'auto'
          }}>
            <Typography sx={{ color: '#aaaaaa', mb: 2, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', px: 1 }}>Категории</Typography>
            <Stack spacing={1}>
              {SUPPORT_CATEGORIES.map((cat) => (
                <Button 
                  key={cat}
                  fullWidth 
                  onClick={() => setActiveSupportTab(cat)} 
                  sx={{ 
                    justifyContent: 'flex-start', 
                    bgcolor: activeSupportTab === cat ? 'rgba(255,255,255,0.1)' : 'transparent', 
                    color: activeSupportTab === cat ? '#ffffff' : '#aaaaaa', 
                    borderRadius: '12px', 
                    py: 1.5, px: 2, 
                    textTransform: 'none',
                    fontWeight: activeSupportTab === cat ? 600 : 400,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#ffffff' }
                  }}
                >
                  {cat}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflowY: 'auto' }}>
            
            {activeSupportTab.startsWith('Жалоба') && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{activeSupportTab}</Typography>
                  <Typography sx={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Выберите причину из частых вариантов или опишите свою.</Typography>
                </Box>
                
                <Grid container spacing={1.5}>
                  {REPORT_REASONS.map((reason) => (
                    <Grid item xs={12} sm={6} key={reason}>
                      <Button 
                        fullWidth onClick={() => handleSendReport(reason)} disabled={reportSending}
                        sx={{ 
                          justifyContent: 'flex-start', bgcolor: 'rgba(255,255,255,0.03)', color: '#ffffff', 
                          borderRadius: '12px', py: 1.5, px: 2, textTransform: 'none',
                          border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                        }}
                      >
                        {reason}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 800, mb: 1 }}>Про систему жалоб</Typography>
                  <Typography sx={{ color: '#888888', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    Как только вы отправляете жалобу, запрос со всеми прикреплёнными материалами моментально улетает модераторам. Срок рассмотрения: от 1 до 3, максимум 5 дней. Если нарушение правил подтвердится — кара последует незамедлительно. Если же вы подали ложный донос, ваш аккаунт получит соответствующую отметку. При трёхкратном повторении подобных действий ваш профиль будет ликвидирован.
                  </Typography>
                </Box>
              </Stack>
            )}

            {activeSupportTab === 'Оставить заявку' && (
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Связь с нами</Typography>
                  <Typography sx={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Опишите вашу проблему, предложение или вопрос максимально подробно.</Typography>
                </Box>
                <TextField
                  multiline rows={8} placeholder="Начните писать здесь..."
                  value={customReason} onChange={(e) => setCustomReason(e.target.value)}
                  variant="outlined" fullWidth
                  InputProps={{ 
                    sx: { 
                      color: '#ffffff', 
                      bgcolor: 'rgba(255,255,255,0.03)', 
                      borderRadius: '16px', 
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' }
                    } 
                  }}
                />
                <Button 
                  variant="contained" onClick={handleSubmitCustom} disabled={reportSending || !customReason.trim()}
                  sx={{ 
                    bgcolor: '#ffffff', color: '#000000', borderRadius: '12px', py: 1.8, fontWeight: 700, fontSize: '1rem',
                    textTransform: 'none', '&:hover': { bgcolor: '#e0e0e0' }, '&.Mui-disabled': { bgcolor: '#333333', color: '#666666' }
                  }}
                >
                  Отправить заявку
                </Button>
                <Box sx={{ bgcolor: '#25262b', borderRadius: '16px', p: 2,mb:1,border: '1px solid #333' }}>
                              <Typography sx={{ color: '#ffffff', fontWeight: 800, mb: 0.5 }}>Про систему жалоб</Typography>
                              <Typography sx={{ color: '#888888', fontSize: '0.8rem' }}>
                                Как только вы отправляете жалобу, запрос со всеми прикреплёнными материалами моментально улетает модераторам. Срок рассмотрения: от 1 до 3, максимум 5 дней.
                Если нарушение правил подтвердится - кара последует незамедлительно. Если же вы подали ложный донос, ваш аккаунт получит соответствующую отметку. При трёхкратном повторении подобных действий ваш профиль будет ликвидирован. Смотреть правила сервиса можно на сайте atomglide.com/atomwiki.html 
                              </Typography>
                            </Box>
              </Stack>
            )}

            {activeSupportTab === 'Контакты' && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Свяжитесь с нами напрямую</Typography>
                  <Typography sx={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Официальные каналы связи AtomGlide.</Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <FiMail size={24} color="#aaaaaa" />
                    <Box>
                      <Typography sx={{ color: '#aaaaaa', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Email поддержки</Typography>
                      <Typography sx={{ color: '#ffffff', fontSize: '1rem', fontWeight: 500 }}>toktybclassic@gmail.com</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <FiPhone size={24} color="#aaaaaa" />
                    <Box>
                      <Typography sx={{ color: '#aaaaaa', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Горячая линия</Typography>
                      <Typography sx={{ color: '#ffffff', fontSize: '1rem', fontWeight: 500 }}>Telegra: @jpegweb</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography sx={{ color: '#aaaaaa', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Время работы линии</Typography>
                      <Typography sx={{ color: '#ffffff', fontSize: '1rem', fontWeight: 500 }}>ПН-СБ 13:00 - 04:00  ВС 13:00 - 03:00</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Stack>
            )}
 {activeSupportTab === 'ОБРАТИТЬ ВНИМАНИЕ!' && (
              <Stack spacing={4}>
               <Box sx={{ bgcolor: '#25262b', borderRadius: '16px', p: 2, border: '1px solid #333' }}>
                             <Typography sx={{ color: '#ffffff', fontWeight: 800, mb: 0.5 }}>Про систему жалоб</Typography>
                             <Typography sx={{ color: '#888888', fontSize: '0.8rem' }}>
                               Как только вы отправляете жалобу, запрос со всеми прикреплёнными материалами моментально улетает модераторам. Срок рассмотрения: от 1 до 3, максимум 5 дней.
               Если нарушение правил подтвердится - кара последует незамедлительно. Если же вы подали ложный донос, ваш аккаунт получит соответствующую отметку. При трёхкратном повторении подобных действий ваш профиль будет ликвидирован. Смотреть правила сервиса можно на сайте atomglide.com/atomwiki.html 
                             </Typography>
                           </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Dialog>


      <Dialog 
        open={modals.devices} 
        onClose={() => toggleModal('devices', false)} 
        fullWidth maxWidth="sm"
        PaperProps={{ style: { backgroundColor: activeTheme.surface || '#1A1A1A', color: 'white', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', fontSize: '18px', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2 }}>
          Ваши устройства
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ pt: 0 }}>
            {activeDevices.map((device, idx) => (
              <React.Fragment key={device.id}>
                <ListItem sx={{ py: 2, px: 3 }}>
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    <device.icon size={24} color={device.current ? "#ffffff" : "rgba(154, 153, 153, 1)"} />
                  </Box>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600, color: 'white', fontSize: '15px' }}>
                        {device.name}
                        {device.current && (
                          <Typography component="span" sx={{ color: '#888888', fontSize: '12px', ml: 1, fontWeight: 400 }}>
                            (Текущее)
                          </Typography>
                        )}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '13px', mt: 0.5 }}>
                        Скоро AtomGlide будет доступен на Android,Windows,macOS,IOS как приложение
                      </Typography>
                    }
                  />
                </ListItem>
                {idx < activeDevices.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', ml: 8 }} />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button onClick={() => toggleModal('devices', false)} fullWidth sx={{ color: '#ffffff', fontWeight: 600, textTransform: 'none', fontSize: '15px', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', py: 1 }}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modals.about} onClose={() => toggleModal('about', false)} maxWidth="xs" fullWidth PaperProps={{ style: { backgroundColor: activeTheme.surface || '#1A1A1A', color: 'white', borderRadius: 24, padding: '10px', border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ width: 120, height: 120, mb: 2, fontSize: 32, bgcolor: '#ffffff00', color: '#000000' }} variant="rounded" src='1.png'>A</Avatar>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>AtomGlide</Typography>
          <Typography sx={{ color: 'rgba(154, 153, 153, 1)', mb: 3, fontSize: '14px' }}>Версия: 15.0</Typography>
          <TableContainer sx={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', boxShadow: 'none' }}>
            <Table size="small">
              <TableBody>
                <TableRow><TableCell sx={{ color: 'rgba(154, 153, 153, 1)', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5, fontSize: '13px' }}>Дата релиза</TableCell><TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 500 }}>1 июля 2026</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: 'rgba(154, 153, 153, 1)', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5, fontSize: '13px' }}>Версия проекта</TableCell><TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 500 }}>15.0.0</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: 'rgba(154, 153, 153, 1)', borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5, fontSize: '13px' }}>Geromik Logic</TableCell><TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 500 }}>26HA48B</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: 'rgba(154, 153, 153, 1)',borderBottom: '1px solid rgba(255,255,255,0.05)', py: 1.5, fontSize: '13px' }}>Engine</TableCell><TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 500 }}>React 18</TableCell></TableRow>
                <TableRow><TableCell sx={{ color: 'rgba(154, 153, 153, 1)', borderBottom: 'none', py: 1.5, fontSize: '13px' }}>Design</TableCell><TableCell align="right" sx={{ color: 'white', borderBottom: 'none', fontSize: '13px', fontWeight: 500 }}>BSI Gen 5</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, px: 3 }}>
          <Button onClick={() => toggleModal('about', false)} fullWidth sx={{ color: '#ffffff', fontWeight: 600, textTransform: 'none', fontSize: '15px', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', py: 1 }}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modals.help} onClose={() => toggleModal('help', false)} PaperProps={{ style: { backgroundColor: activeTheme.surface || '#1A1A1A', color: 'white', borderRadius: 24, minWidth: 320, border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>Перейти в AtomWiki?</Typography>
          <Typography sx={{ color: 'rgba(154, 153, 153, 1)', textAlign: 'center', fontSize: '14px', lineHeight: 1.5 }}>Справочный центр будет открыт в новой вкладке браузера.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, pt: 1, gap: 1 }}>
          <Button fullWidth onClick={() => toggleModal('help', false)} sx={{ color: '#ffffff', textTransform: 'none', fontWeight: 500, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', py: 1.2 }}>Отмена</Button>
          <Button fullWidth onClick={() => { handleWikiRedirect(); toggleModal('help', false); }} sx={{ bgcolor: '#ffffff', color: '#000000', borderRadius: '12px', py: 1.2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#e0e0e0' } }}>Перейти</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modals.notificationsHelp} onClose={() => toggleModal('notificationsHelp', false)} fullWidth maxWidth="sm" PaperProps={{ style: { backgroundColor: activeTheme.surface || '#1A1A1A', color: 'white', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, fontSize: '18px', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2 }}>
            <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', p: 1, borderRadius: '12px', display: 'flex' }}><FiBell size={20} color="#ffffff"/></Box>
            Включение уведомлений
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(154, 153, 153, 1)', mb: 3, fontSize: '14px', lineHeight: 1.6 }}>
                Похоже, вы запретили уведомления для этого сайта. Вот как это исправить:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiLock size={16} /></Box>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>1. Настройки сайта</Typography>
                        <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '13px', mt: 0.5 }}>Нажмите на значок замка слева от адреса сайта.</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiBell size={16} /></Box>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>2. Разрешите доступ</Typography>
                        <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '13px', mt: 0.5 }}>Найдите пункт «Уведомления» и выберите «Разрешить».</Typography>
                    </Box>
                </Box>
                 <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ minWidth: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiRefreshCw size={16} /></Box>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>3. Обновите страницу</Typography>
                        <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '13px', mt: 0.5 }}>После изменения настроек обновите страницу.</Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                     <Box sx={{ minWidth: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiSmartphone size={16} /></Box>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>Для iOS</Typography>
                        <Typography sx={{ color: 'rgba(154, 153, 153, 1)', fontSize: '13px', mt: 0.5 }}>
                            Добавьте сайт на экран «Домой»: Поделиться → На экран «Домой».
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Button onClick={() => toggleModal('notificationsHelp', false)} fullWidth sx={{ color: '#ffffff', fontWeight: 600, textTransform: 'none', fontSize: '15px', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', py: 1.2 }}>Понятно</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/