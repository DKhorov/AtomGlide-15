import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Button, MenuItem, Select,
  useMediaQuery, FormControl, Grow, Table, TableBody, TableRow, TableCell
} from '@mui/material';
import axios from '../../system/axios';
import { useIsland } from '../../components/DynamicIslandProvider';

const BANNERS = [
  "https://storage-742.s3hoster.by/test/uploads/1784571820826-121892989.png",
  "https://storage-742.s3hoster.by/test/uploads/1784571820827-907621790.png",
  "https://storage-742.s3hoster.by/test/uploads/1784571820841-759654427.png"
];

const Store = () => {
  const [products, setProducts] = useState([]);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("new");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpacity, setModalOpacity] = useState(0);

  const isMobile = useMediaQuery('(max-width:900px)');
  const showIsland = useIsland();

  // Автопрокрутка карусели
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/store/products");
      const visibleProducts = res.data.filter(item => item.quantity > 0);
      setProducts(visibleProducts);
    } catch (err) {
      console.error("Ошибка загрузки товаров:", err);
      showIsland('Не удалось загрузить товары', 'Error', '#f44336');
    }
  };

  const groupedProducts = useMemo(() => {
    return Object.values(
      products.reduce((acc, item) => {
        const key = item.title;
        if (!acc[key]) acc[key] = { ...item, quantity: 0, sold: 0, items: [] };
        acc[key].quantity += item.quantity;
        acc[key].sold += item.sold;
        acc[key].items.push(item);
        return acc;
      }, {})
    ).filter(group => (group.quantity - group.sold) > 0);
  }, [products]);

  const sortedGroups = useMemo(() => {
    return [...groupedProducts].sort((a, b) => {
      if (sortBy === "expensive") return b.price - a.price;
      if (sortBy === "cheap") return a.price - b.price;
      if (sortBy === "new") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "old") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });
  }, [groupedProducts, sortBy]);

  useEffect(() => {
    if (currentCollection) {
      const updatedCollection = sortedGroups.find(g => g.title === currentCollection.title);
      setCurrentCollection(updatedCollection || null);
    }
  }, [sortedGroups, currentCollection]);

  const handleBuy = async (productId) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await axios.post(`/store/products/${productId}/buy`, {}, { withCredentials: true });
      showIsland('Оплата прошла успешно!', 'CheckCircle', '#4caf50');
      closeConfirmModal();
      await fetchProducts();
    } catch (err) {
      showIsland('Ошибка оплаты. Товар недоступен', 'Error', '#f44336');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmModal = (product) => {
    setSelectedProduct(product);
    setConfirmModalOpen(true);
    setTimeout(() => setModalOpacity(1), 10); // Для плавной анимации появления
  };

  const closeConfirmModal = () => {
    setModalOpacity(0);
    setTimeout(() => {
      setSelectedProduct(null);
      setConfirmModalOpen(false);
    }, 300); // Ждем окончания CSS-перехода
  };

  // Кастомное модальное окно на чистых DIV
  const CustomModal = () => {
    if (!confirmModalOpen && modalOpacity === 0) return null;
    
    return (
      <div 
        onClick={closeConfirmModal}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: modalOpacity, transition: 'opacity 0.3s ease-in-out',
          pointerEvents: confirmModalOpen ? 'auto' : 'none'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()} // Блокируем закрытие при клике внутри окна
          style={{
            backgroundColor: '#1c1c1c', padding: '30px', borderRadius: '24px',
            width: isMobile ? '90%' : '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            transform: `scale(${modalOpacity === 1 ? 1 : 0.9}) translateY(${modalOpacity === 1 ? 0 : '20px'})`,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          {selectedProduct && (
            <>
              <img 
                src={selectedProduct.imageUrl} 
                alt={selectedProduct.title} 
                style={{ width: '140px', height: '140px', objectFit: 'contain', marginBottom: '15px' }} 
              />
              <Typography sx={{ color: 'white', fontWeight: '700', fontSize: '20px', mb: 1, textAlign: 'center' }}>
                {selectedProduct.title}
              </Typography>
              <Typography sx={{ color: '#aaa', fontSize: '14px', mb: 3, textAlign: 'center' }}>
                {selectedProduct.description || "Лимитированный товар платформы"}
              </Typography>

              <Table sx={{ mb: 3, width: '100%' }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 1.5, px: 0 }}>Цена:</TableCell>
                    <TableCell sx={{ color: '#be8221ff', fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 1.5, px: 0, textAlign: 'right' }}>
                      {selectedProduct.price} atm
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 1.5, px: 0 }}>Продавец:</TableCell>
                    <TableCell sx={{ color: 'white',  borderBottom: '1px solid rgba(255,255,255,0.1)', py: 1.5, px: 0, textAlign: 'right' }}>
                      {"AtomGlide Store"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 1.5, px: 0 }}>Биржа:</TableCell>
                    <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 1.5, px: 0, textAlign: 'right' }}>
                      {"AtomGlide Finance"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Button
                variant="contained"
                disabled={isSubmitting}
                sx={{ 
                  width: '100%', background: '#be8221ff', color: 'white', py: 1.5, borderRadius: '12px',
                  fontWeight: 'bold', fontSize: '16px', textTransform: 'none',
                  transition: 'background 0.2s', '&:hover': { background: '#ff9d00ff' },
                  '&:disabled': { background: '#555', color: '#888' }
                }}
                onClick={() => handleBuy(selectedProduct._id)}
              >
                {isSubmitting ? 'Обработка...' : 'Подтвердить покупку'}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Вид внутри коллекции (Товары)
  if (currentCollection) {
    const itemsAvailable = currentCollection.items.filter(item => item.sold < item.quantity);
    const availableCount = currentCollection.quantity - currentCollection.sold;

    return (
      <Box sx={{
        width: isMobile ? '100vw' : '700px',  overflowY: 'auto',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { width: '0px' }, pb: isMobile ? 10 : 4, px: 2, pt: 2
      }}>
        {/* Баннер выбранного товара */}
        <Box sx={{
          width: '100%', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(56, 64, 73, 0.8) 0%, rgba(28, 30, 34, 0.9) 100%)',
          p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 3, backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <img src={currentCollection.imageUrl} alt={currentCollection.title} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: 'white', fontSize: '24px', fontWeight: '800', lineHeight: 1.2 }}>{currentCollection.title}</Typography>
            <Typography sx={{ color: '#be8221ff', fontSize: '16px', fontWeight: '600', mt: 1 }}>Доступно штук: {availableCount}</Typography>
          </Box>
          <Button 
            sx={{ color: '#aaa', textTransform: 'none', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', px: 2, py: 1, '&:hover': { background: 'rgba(0,0,0,0.5)', color: 'white' } }}
            onClick={() => setCurrentCollection(null)}
          >
            Назад
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 2 }}>
          {itemsAvailable.length > 0 ? itemsAvailable.map((item, index) => (
            <Grow in key={item._id} timeout={(index + 1) * 300}>
              <Box sx={{
                background: '#242529', borderRadius: '16px', p: 2,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }
              }} onClick={() => openConfirmModal(item)}>
                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'contain', marginBottom: '15px' }} />
                <Typography sx={{ color: 'white', fontSize: '20px', fontWeight: '700', width: '100%' }}>{item.price} atm</Typography>
                <Typography sx={{ color: '#aaa', fontSize: '14px', mt: 0.5, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </Typography>
                <Button variant="contained" sx={{ width: '100%', background: '#be8221ff', borderRadius: '10px', textTransform: 'none', '&:hover': { background: '#ff9d00ff' } }}>
                  Купить
                </Button>
              </Box>
            </Grow>
          )) : (
            <Typography sx={{ color: 'gray', gridColumn: '1 / -1', textAlign: 'center', mt: 4 }}>В этой коллекции временно нет товаров.</Typography>
          )}
        </Box>

        <CustomModal />
      </Box>
    );
  }

  // Главный вид (Магазин)
  return (
    <Box sx={{
      width: isMobile ? '100vw' : '700px', overflowY: 'auto',
      scrollbarWidth: 'none', px: isMobile ? 1 : 2, pt: 2, pb: 10
    }}>
      
      {/* 1. Баннер карусель во всю ширину */}
    <Box sx={{ 
  width: '100%', height: isMobile ? '160px' : '240px', borderRadius: '24px', 
  overflow: 'hidden', position: 'relative', mb: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  backgroundColor: '#1a1a1a' // Цвет фона для пустых зон, если пропорции фото не совпадут с баннером
}}>
  {BANNERS.map((src, index) => (
    <Box key={index} sx={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundImage: `url(${src})`, 
      backgroundSize: 'contain', // Изменено с 'cover' на 'contain' — фото помещается целиком
      backgroundRepeat: 'no-repeat', // Чтобы фото не дублировалось
      backgroundPosition: 'center',
      opacity: currentSlide === index ? 1 : 0, transition: 'opacity 0.8s ease-in-out'
    }} />
  ))}
  {/* Индикаторы слайдов */}
  <Box sx={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
    {BANNERS.map((_, i) => (
      <Box key={i} sx={{
        width: currentSlide === i ? '24px' : '8px', height: '8px', borderRadius: '4px',
        background: currentSlide === i ? '#be8221ff' : 'rgba(255,255,255,0.5)',
        transition: 'all 0.3s ease'
      }} />
    ))}
  </Box>
</Box>

      {/* 2. HTML  <Box sx={{
        width: '100%', background: 'linear-gradient(90deg, #be8221ff 0%, #d4a352 100%)',
        borderRadius: '16px', p: isMobile ? 2 : 3, mb: 4, display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', color: 'black'
      }}>
        <Box>
          <Typography sx={{ fontWeight: '800', fontSize: isMobile ? '18px' : '22px', lineHeight: 1.2 }}>Встречайте AtomGlide Marketplace!</Typography>
          <Typography sx={{ fontWeight: '500', fontSize: '14px', mt: 0.5 }}>Скидки на эксклюзивные товары до 20%</Typography>
        </Box>
        <Button sx={{ background: 'black', color: 'white', borderRadius: '10px', px: 3, fontWeight: 'bold', textTransform: 'none', '&:hover': { background: '#222' } }}>
          Подробнее
        </Button>
      </Box>Баннер */}
     

      {/* Заголовок и фильтры */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>Все товары</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ 
              color: 'white', borderRadius: '12px', background: '#242529',
              '.MuiOutlinedInput-notchedOutline': { border: 'none' },
              '.MuiSvgIcon-root': { color: '#be8221ff' }
            }}
          >
            <MenuItem value="expensive">Сначала дорогие</MenuItem>
            <MenuItem value="cheap">Сначала дешёвые</MenuItem>
            <MenuItem value="new">Сначала новые</MenuItem>
            <MenuItem value="old">Сначала старые</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 3. Карточки в стиле маркетплейса (Wildberries style) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 2 }}>
        {sortedGroups.map((group, index) => {
          const available = group.quantity - group.sold;
          return (
            <Grow in key={group.title} timeout={(index + 1) * 200}>
              <Box
                sx={{
                  background: '#242529', borderRadius: '5px', overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(190, 130, 33, 0.15)' },
                  display: 'flex', flexDirection: 'column'
                }}
                onClick={() => setCurrentCollection(group)}
              >
                {/* Фото */}
                <Box sx={{ width: '100%', height: isMobile ? '140px' : '180px', background: '#1c1c1c', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                  <img src={group.imageUrl} alt={group.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
                {/* Инфо */}
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography sx={{ color: 'white', fontWeight: '800', fontSize: '18px', lineHeight: 1 }}>
                    {group.price} <span style={{fontSize: '14px', color: '#be8221ff'}}>atm</span>
                  </Typography>
                  <Typography sx={{ color: '#ccc', fontSize: '14px', mt: 1, fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {group.title}
                  </Typography>
                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', background: available > 5 ? '#4caf50' : '#ff9800' }} />
                    <Typography sx={{ color: '#888', fontSize: '12px' }}>Доступно: {available} шт.</Typography>
                  </Box>
                </Box>
              </Box>
            </Grow>
          );
        })}
      </Box>

      {/* Футер магазина */}
      <Box sx={{ mt: 8, p: 3, borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography sx={{ color: '#888', fontSize: '13px', mb: 2, lineHeight: 1.6 }}>
          Все покупки приобретаются за внутреннюю валюту — atm. Цены регулируются нормативами торговли AtomGlide Network. Платежи проходят модерацию для исключения нечестных средств. 
        </Typography>
        <Typography sx={{ color: '#888', fontSize: '13px', mb: 2, lineHeight: 1.6 }}>
          Товары не являются офертой, носят развлекательный характер. Каждому товару присвоен уникальный номер, переходящий покупателю. Возврат средств не поддерживается.
        </Typography>
        <Typography sx={{ color: '#555', fontSize: '12px', textAlign: 'center', mt: 4 }}>
          © 2026 Проект компании AtomGlide. Все права защищены.
        </Typography>
      </Box>
      
    </Box>
  );
};

export default Store;