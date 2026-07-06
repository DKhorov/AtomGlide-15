import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Button, MenuItem, Select,
  useMediaQuery, FormControl, Grow, Fade, Modal, Backdrop, Fade as MuiFade,
  Table, TableBody, TableRow, TableCell
} from '@mui/material';
import axios from '../../system/axios';
import { useIsland } from '../../components/DynamicIslandProvider'; 

const Store = () => {
  const [products, setProducts] = useState([]);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Защита от спам-кликов по кнопке "Купить"
  const isMobile = useMediaQuery('(max-width:900px)');
  const [sortBy, setSortBy] = useState("new");
  const showIsland = useIsland();

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

  // Оптимизируем перерасчет групп с помощью useMemo
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

  // Оптимизируем сортировку групп
  const sortedGroups = useMemo(() => {
    return [...groupedProducts].sort((a, b) => {
      if (sortBy === "expensive") return b.price - a.price;
      if (sortBy === "cheap") return a.price - b.price;
      if (sortBy === "new") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "old") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });
  }, [groupedProducts, sortBy]);

  // Обновление текущей выбранной коллекции, если товары внутри нее изменились (после покупки)
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
      closeConfirmModal(); // Автоматически закрываем модалку при успехе
      await fetchProducts(); // Ждем обновления пула товаров
    } catch (err) {
      showIsland('Ошибка оплаты. Товар недоступен', 'Error', '#f44336');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmModal = (product) => {
    setSelectedProduct(product);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setSelectedProduct(null);
    setConfirmModalOpen(false);
  };

  if (currentCollection) {
    const itemsAvailable = currentCollection.items.filter(item => item.sold < item.quantity);

    return (
      <Box sx={{
        width: isMobile ? '100vw' : '700px',
        height: '100vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { width: '0px' },
        paddingBottom: isMobile ? '70px' : 0,
        px: 1, mt: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ color: 'white', fontSize: '22px', fontWeight: '600' }}>
            {currentCollection.title}
          </Typography>
          <Button 
            sx={{ color: '#be8221ff', textTransform: 'none', fontWeight: 600 }}
            onClick={() => setCurrentCollection(null)}
          >
            [Нажмите чтобы выйти]
          </Button>
        </Box>

        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}>
          {itemsAvailable.length > 0 ? itemsAvailable.map(item => (
            <Grow in key={item._id}>
              <Box sx={{
                flex: isMobile ? '1 1 100%' : '1 1 calc(33.333% - 16px)',
                maxWidth: isMobile ? '100%' : '220px',
                height: '340px',
                borderRadius: '20px',
                backgroundColor: 'rgba(56, 64, 73, 0.42)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2.5,
                textAlign: 'center',
              }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '140px', height: '140px', objectFit: 'contain' }}
                />
                <Typography sx={{ color: 'white', fontSize: '1.1rem', fontWeight: 500, mb: -2 }}>
                  {item.title}
                </Typography>
                <Typography sx={{
                  color: 'white', fontWeight: '700', backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '50px', px: 2, py: 0.5
                }}>
                  {item.price} atm
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    background: '#be8221ff', borderRadius: '50px', textTransform: 'none', px: 3,
                    '&:hover': { background: '#ff9d00ff' }
                  }}
                  onClick={() => openConfirmModal(item)}
                >
                  Купить
                </Button>
              </Box>
            </Grow>
          )) : (
            <Typography sx={{ color: 'gray', textAlign: 'center', width: '100%', mt: 4 }}>
              В этой коллекции временно нет товаров в наличии.
            </Typography>
          )}
        </Box>

        <Modal
          open={confirmModalOpen}
          onClose={closeConfirmModal}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{ backdrop: { timeout: 500 } }}
        >
          <MuiFade in={confirmModalOpen}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '90%' : 400,
              bgcolor: 'rgba(28,28,28,1)',
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
              textAlign: 'center',
            }}>
              {selectedProduct && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: '10px' }}>
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: 'auto', height: '120px', borderRadius: 8 }} />
                  </Box>
                  <Typography sx={{ color: 'white', fontWeight: '600', fontSize: 18 }}>{selectedProduct.title}</Typography>
                  <Typography sx={{ color: 'gray', fontSize: 14, mb: 1 }}>{selectedProduct.description}</Typography>
                  <Table sx={{ color: 'white', mb: 2 }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Цена:</TableCell>
                        <TableCell sx={{ color: 'gold', fontSize: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{selectedProduct.price} atm</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Продавец:</TableCell>
                        <TableCell sx={{ color: 'gray', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{selectedProduct.seller || "AtomGlide"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Владелец:</TableCell>
                        <TableCell sx={{ color: 'gray', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{"AtomGlide"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Налог:</TableCell>
                        <TableCell sx={{ color: 'gray', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>0 atm</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Button
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{ background: '#be8221ff', borderRadius: '8px', mt: 1, '&:hover': { background: '#ff9d00ff' } }}
                    onClick={() => handleBuy(selectedProduct._id)}
                  >
                    {isSubmitting ? 'Обработка...' : 'Подтвердить покупку'}
                  </Button>
                  <Typography sx={{ color: 'gray', fontSize: '12px', mt: 2 }}>Биржа: AtomGlide Network</Typography>
                </>
              )}
            </Box>
          </MuiFade>
        </Modal>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: isMobile ? '100vw' : '700px',
      height: '100vh',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      px: 1, mt: isMobile ? 2 : 0,
    }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1, gap: isMobile ? 1 : 0 }}>
        <Typography sx={{ color: 'white', fontSize: '22px', fontWeight: 600 }}>
          Магазин AtomStore
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ 
              color: 'white', 
              borderRadius: '130px', 
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#be8221ff' },
              '.MuiSvgIcon-root': { color: 'white' }
            }}
          >
            <MenuItem value="expensive">Дорогие → дешёвые</MenuItem>
            <MenuItem value="cheap">Дешёвые → дорогие</MenuItem>
            <MenuItem value="new">Новые → старые</MenuItem>
            <MenuItem value="old">Старые → новые</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {sortedGroups.map(group => (
          <Grow in key={group.title}>
            <Box
              sx={{
                flex: isMobile ? '1 1 100%' : '1 1 calc(33.333% - 16px)',
                maxWidth: isMobile ? '100%' : '220px',
                height: '240px',
                borderRadius: '20px',
                backgroundColor: 'rgba(56, 64, 73, 0.42)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'transform 0.2s, border-color 0.2s',
                border: '1px solid transparent',
                '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(190, 130, 33, 0.4)' },
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', p: 2.5,
              }}
              onClick={() => setCurrentCollection(group)}
            >
              <img src={group.imageUrl} alt={group.title} style={{ width: '140px', height: '140px', objectFit: 'contain' }} />
              <Typography sx={{ color: 'white', fontWeight: '700', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '50px', px: 2.5, py: 0.5 }}>
                от {group.price} atm
              </Typography>
            </Box>
          </Grow>
        ))}
      </Box>

      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 4, mb: 2 }}>
        Все покупки приобретаются за внутреннюю валюту — atm. Цены в магазине регулируются установленными нормативами торговли в сети AtomGlide Network. Все платежи проходят модерацию с целью исключения использования нечестно заработанной валюты. 
      </Typography>
      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 2 }}>
        Товары в магазине не являются офертой. Все покупки носят исключительно развлекательный характер и не являются основанием для возникновения имущественных прав. К каждому товару прилагается свой уникальный номер владельца, при покупке номер продавца переходит к покупателю. После покупки вы являетесь единственным владельцем приобретенного товара. В случае нарушения правил магазина администрация оставляет за собой право аннулировать покупку и изъять товар без компенсации. Магазин не поддерживает возврат средств за приобретенные товары. Товары стоимостью менее 1000 atm проходят особую проверку покупателя на подтверждение легальности средств через админов лс в тг. Товары в магазин поставляются через официальных поставщиков, все продавцы имеют лицензию на торговлю цифровыми товарами. А также прошли проверку администрации AtomGlide.
      </Typography>
      <Typography sx={{ color: 'gray', fontSize: '14px', mt: 2, mb: 10 }}>
        © 2026 Проект компании AtomGlide. Все права защищены.
      </Typography>
    </Box>
  );
};

export default Store;