import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { checkSubscription, purchaseSubscription, getSubscriptionDaysLeft } from '../../utils/subscription';
import SubscriptionPurchase from '../../components/SubscriptionPurchase';
import { useIsland } from '../../components/DynamicIslandProvider'; 

const SubscriptionPage = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const navigate = useNavigate();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const showIsland = useIsland();

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    setLoading(true);
    try {
      const info = await checkSubscription();
      setSubscriptionInfo(info);
      showIsland('Информация о подписке загружена', 'CheckCircle', '#4caf50');
    } catch (err) {
      console.error('Ошибка загрузки информации о подписке:', err);
      showIsland('Ошибка загрузки информации о подписке', 'Error', '#f44336');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: '700px' }}>
        <CircularProgress sx={{ color: "rgb(237,93,25)" }} />
      </Box>
    );
  }

  const isActive = Boolean(
    subscriptionInfo?.isActive === true ||
    subscriptionInfo?.isActive === 'true' ||
    subscriptionInfo?.atomProPlus?.isActive === true ||
    subscriptionInfo?.atomProPlus?.isActive === 'true' ||
    (subscriptionInfo?.expiresAt && new Date(subscriptionInfo.expiresAt) > new Date()) ||
    (subscriptionInfo?.atomProPlus?.expiresAt && new Date(subscriptionInfo.atomProPlus.expiresAt) > new Date())
  );

  const rawExpiresAt = subscriptionInfo?.expiresAt || subscriptionInfo?.atomProPlus?.expiresAt;
  const expiresAt = rawExpiresAt ? new Date(rawExpiresAt) : null;
  const daysLeft = expiresAt ? getSubscriptionDaysLeft(expiresAt) : null;

  return (
    <Box
      sx={{
        width: '700px',
        height: isMobile ? 'calc(100vh - 60px)' : '100vh',
        flex: isMobile ? 1 : 'none',
        overflowY: 'auto',
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none', 
        '&::-webkit-scrollbar': {
          width: '0px', 
          background: 'transparent',
        },
        paddingBottom: isMobile ? '70px' : 0, 
        px: 1.5,
        mt: 2
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'rgb(237,93,25)' }}>
        AtomPro+ Подписка
      </Typography>



      <Card sx={{ bgcolor: '#1a1a1ac5', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
            Преимущества AtomPro+
          </Typography>
          <Box component="ul" sx={{ pl: 2, color: 'rgba(255,255,255,0.8)' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Загрузка музыки до 50MB</strong> (обычные пользователи: 10MB)
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Значок премиум</strong> в профиле и постах
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Дополнительные возможности</strong> платформы
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Премиум‑посты</strong> с расширенными настройками
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Atom Journal+ </strong> Платные статьи и эксклюзивный контент от создателей
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Загрузка музыки в высоком битрейте</strong> (Hi‑Quality)
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Загрузка видео до 1 минуты</strong>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Неограниченные истории</strong>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Неограниченные фотографии в посте</strong>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Помощь проекту на оплату CDN</strong>
            </li>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ bgcolor: '#1a1a1ac7' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, color: 'white' }}>
            Тарифы
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <Card sx={{ flex: 1, border: '2px solid rgb(237,93,25)' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1, color: 'rgb(237,93,25)', fontWeight: 'bold' }}>
                  Неделя
                </Typography>
                <Typography variant="h4" sx={{ mb: 2, color: 'white' }}>
                  300 ATM
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                  Получите все преимущества AtomPro+ на 7 дней
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setPurchaseDialogOpen(true)}
                  sx={{ bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: 'rgb(200,80,20)' } }}
                >
                  Купить
                </Button>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'rgba(255,255,255,0.6)' }}>
                  Оплата валютой: ATM 
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, bgcolor: '#272727', border: '2px solid rgb(237,93,25)' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1, color: 'rgb(237,93,25)', fontWeight: 'bold' }}>
                  Месяц
                </Typography>
                <Typography variant="h4" sx={{ mb: 2, color: 'white' }}>
                  $1,99
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                  Получите все преимущества AtomPro+ на 30 дней
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    showIsland('Покупка через Telegram', 'Info', '#2196f3');
                    window.open('https://t.me/jpegweb', '_blank');
                  }}
                  sx={{ bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: 'rgb(200,80,20)' } }}
                >
                  Связаться в Telegram
                </Button>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'rgba(255,255,255,0.6)' }}>
                  Свяжитесь с @jpegweb для покупки
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mt: 1 }}>
            <Card sx={{ flex: 1, bgcolor: '#272727', border: '2px solid rgb(237,93,25)' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1, color: 'rgb(237,93,25)', fontWeight: 'bold' }}>
                  Кооперативный Аккаунт
                </Typography>
                <Typography variant="h4" sx={{ mb: 2, color: 'white' }}>
                  50$
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                  50$ в месяц
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    showIsland('Покупка через Telegram', 'Info', '#2196f3');
                    window.open('https://t.me/jpegweb', '_blank');
                  }}
                  sx={{ bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: 'rgb(200,80,20)' } }}
                >
                  Связаться в Telegram
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, bgcolor: '#272727', border: '2px solid rgb(237,93,25)' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1, color: 'rgb(237,93,25)', fontWeight: 'bold' }}>
                  Месяц (для РБ) 
                </Typography>
                <Typography variant="h4" sx={{ mb: 2, color: 'white' }}>
                  3 BYN
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                  Получите все преимущества AtomPro+ на 30 дней
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    showIsland('Покупка через Telegram', 'Info', '#2196f3');
                    window.open('https://t.me/jpegweb', '_blank');
                  }}
                  sx={{ bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: 'rgb(200,80,20)' } }}
                >
                  Связаться в Telegram
                </Button>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'rgba(255,255,255,0.6)' }}>
                  Свяжитесь с @jpegweb для покупки
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>

      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}>
        <strong>AtomPro+</strong> — это внутренняя премиум-подписка экосистемы AtomGlide, расширяющая технические лимиты вашего аккаунта. Владельцы подписки получают возможность загружать аудиофайлы объемом до <strong>50 МБ</strong> (51 200 КБ), уникальный значок в профиле, подтверждающий статус, а также эксклюзивный доступ к просмотру постов, созданных специально для участников AtomPro+.
      </Typography>

      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}>
        Привилегии включают приоритетную обратную связь от разработчика проекта в Telegram, право на участие в закрытых бета-тестах новых функций и доступ к уникальным товарам в <strong>AtomStore</strong> по сниженным ценам. Подписка может быть приобретена как за внутреннюю валюту <strong>ATM</strong>, так и за доллары США или белорусские рубли. Иные валюты в настоящее время не поддерживаются.
      </Typography>

      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}>
        Обращаем ваше внимание, что оплата криптовалютой недоступна в связи с ограничениями вывода средств на территории РБ и РФ. Согласно обновленной политике <strong>AtomGlide</strong> от октября 2025 года, покупка цифровых товаров и услуг за реальные деньги официально разрешена и не нарушает внутренний кодекс проекта о защите средств пользователей.
      </Typography>

      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}>
        Средства, полученные от реализации подписок, не направляются на личные нужды разработчика или команды. Все финансовые поступления идут строго на поддержание инфраструктуры проекта: оплату серверных мощностей, обеспечение работы <strong>CDN-хранилищ</strong> и развитие технической базы AtomGlide Network.
      </Typography>

      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 30 }}>
        © Проект компании AtomGlide. Все права защищены. Для получения дополнительной информации о подписке и условиях использования, пожалуйста, свяжитесь с нами через Telegram: @jpegweb.
      </Typography>

      {subscriptionInfo?.balance !== undefined && (
        <Card sx={{ bgcolor: '#1a1a1a' }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Ваш баланс: <strong style={{ color: 'rgb(237,93,25)' }}>{subscriptionInfo.balance} ATM</strong>
            </Typography>
          </CardContent>
        </Card>
      )}

      <SubscriptionPurchase
        open={purchaseDialogOpen}
        onClose={() => {
          setPurchaseDialogOpen(false);
          loadSubscriptionInfo();
        }}
      />
    </Box>
  );
};

export default SubscriptionPage;