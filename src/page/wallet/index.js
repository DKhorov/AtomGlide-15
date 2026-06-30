import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, IconButton, TextField, Snackbar, Alert, CircularProgress, Modal, useMediaQuery } from '@mui/material';
import { fontFamily } from '../../system/font';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from '../../system/axios';
import { selectPanelCurve } from '../../system/redux/slices/store';
import { useSelector } from 'react-redux';
import '../../fonts/stylesheet.css';

const Wallet = ({ onBack }) => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState({ userId: '', amount: '', description: '' });
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isMobile = useMediaQuery('(max-width:900px)');
  const panelCurve = useSelector(selectPanelCurve);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [balanceRes, txRes] = await Promise.all([
        axios.get('/auth/balance'),
        axios.get('/auth/transactions'),
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(txRes.data);
    } catch (e) {
      setSnackbar({ open: true, message: 'Ошибка загрузки кошелька', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWalletData();
  
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferLoading(true);
    try {
      if (!transferData.userId) {
        setSnackbar({ open: true, message: 'Введите ID получателя', severity: 'error' });
        setTransferLoading(false);
        return;
      }
      const userRes = await axios.get(`/users/${transferData.userId}`);
      const username = userRes.data.username;
      if (!username) throw new Error('Пользователь не найден');
      await axios.post('/auth/transfer', {
        username,
        amount: Number(transferData.amount),
        description: transferData.description,
      });
      setSnackbar({ open: true, message: 'Перевод выполнен!', severity: 'success' });
      setTransferData({ userId: '', amount: '', description: '' });
      fetchWalletData();
      setTransferModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Ошибка перевода', severity: 'error' });
    }
    setTransferLoading(false);
  };

  return (
    <Box
      sx={{
        width: isMobile ? '100vw' : '700px',
        flex: isMobile ? 1 : 'none',
        overflowY: 'auto',
        scrollbarWidth: 'none', 
        '&::-webkit-scrollbar': { width: '0px', background: 'transparent' },
        paddingBottom: isMobile ? '70px' : 4, 
        px: 2,
        mt: 2
      }}
    >
     
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, mt:1,
          borderRadius: 4, 
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#161618',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px'
        }}
      >
        <Box sx={{ 
          position: 'absolute', top: -50, right: -50, 
          width: 150, height: 150, 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(134,96,35,0.2) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0
        }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <AccountBalanceWalletIcon sx={{ color: '#866023', fontSize: 28 }} />
          <Typography sx={{ fontFamily, fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            Доступный баланс
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {loading ? (
            <CircularProgress size={30} sx={{ color: '#866023' }} />
          ) : (
            <Typography sx={{ 
              fontFamily: 'SF', 
              fontSize: 48, 
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '-1px'
            }}>
              {balance !== null ? Math.floor(balance) : 0} <Box component="span" sx={{ fontSize: 24, color: '#866023', fontWeight: 600 }}>atm</Box>
            </Typography>
          )}
        </Box>
      </Paper>
       
      {/* Кнопка перевода */}
      <Button 
        variant="contained" 
        disableElevation
        sx={{ 
          width: "100%", 
          fontFamily, 
          borderRadius: 3, 
          py: 1.8,
          mb: 4,
          mt: 2,
          fontSize: 16,
          fontWeight: 600,
          color: 'white',
          backgroundColor: '#866023',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#a3752a',
            transform: 'translateY(-1px)'
          },
          '&:active': {
            transform: 'translateY(1px)'
          }
        }} 
        onClick={() => setTransferModalOpen(true)}
      >
        Перевести средства
      </Button>

      <Modal 
        open={transferModalOpen} 
        onClose={() => !transferLoading && setTransferModalOpen(false)}
        sx={{ backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box 
          sx={{ 
            bgcolor: '#121212',
            p: 4, 
            borderRadius: panelCurve === 'rounded' ? '16px' : panelCurve === 'sharp' ? '0px' : panelCurve === 'pill' ? '24px' : '16px',
            width: isMobile ? '90vw' : '400px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
          }}
        >
          <Typography sx={{ fontFamily, fontWeight: 700, fontSize: 20, mb: 3, color: 'white', textAlign: 'center' }}>
            Новый перевод
          </Typography>
          
          <form onSubmit={handleTransfer}>
            <TextField
              label="ID получателя"
              variant="outlined"
              fullWidth
              required
              sx={{ mb: 2, ...textFieldStyle }}
              value={transferData.userId}
              onChange={e => setTransferData({ ...transferData, userId: e.target.value })}
            />
            <TextField
              label="Сумма (atm)"
              variant="outlined"
              type="number"
              fullWidth
              required
              sx={{ mb: 2, ...textFieldStyle }}
              value={transferData.amount}
              onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Комментарий (необязательно)"
              variant="outlined"
              fullWidth
              sx={{ mb: 4, ...textFieldStyle }}
              value={transferData.description}
              onChange={e => setTransferData({ ...transferData, description: e.target.value })}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={() => setTransferModalOpen(false)}
                fullWidth
                disabled={transferLoading}
                sx={{ 
                  fontFamily, borderRadius: 2, fontWeight: 600, color: 'white', bgcolor: 'rgba(255,255,255,0.05)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                fullWidth
                disabled={transferLoading}
                sx={{ 
                  fontFamily, borderRadius: 2, fontWeight: 600, bgcolor: '#866023',
                  '&:hover': { bgcolor: '#a3752a' }
                }}
              >
                {transferLoading ? <CircularProgress size={24} color="inherit" /> : 'Отправить'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <Typography sx={{ fontFamily, fontWeight: 600, fontSize: 18, mb: 2, color: 'white' }}>
        История операций
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 10 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={30} sx={{ color: 'rgba(255,255,255,0.2)' }} />
          </Box>
        ) : transactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#161618', borderRadius: 3, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Typography sx={{ fontFamily, color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
              Транзакций пока нет
            </Typography>
          </Box>
        ) : (
          transactions.map((tx, index) => {
            const isExpense = tx.amount < 0 || tx.type === 'withdrawal' || tx.type === 'transfer_out';
            const isIncome = !isExpense;

            return (
              <Box 
                key={tx.transactionId || tx._id || index} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: '#161618',
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.03)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 40, height: 40, borderRadius: '12px',
                    bgcolor: isIncome ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: isIncome ? '#4caf50' : 'rgba(255,255,255,0.7)'
                  }}>
                    {isIncome ? <CallReceivedIcon fontSize="small" /> : <CallMadeIcon fontSize="small" />}
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily, fontWeight: 600, fontSize: 15, color: '#fff', mb: 0.3 }}>
                      {tx.description || (isIncome ? 'Пополнение' : 'Перевод')}
                    </Typography>
                    <Typography sx={{ fontFamily, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography sx={{ 
                  fontFamily: 'SF', 
                  fontWeight: 700, 
                  fontSize: 16,
                  color: isIncome ? '#4caf50' : '#fff'
                }}>
                  {isIncome ? '+' : '-'}{Math.abs(tx.amount)}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontFamily, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
    '&.Mui-focused fieldset': { borderColor: '#866023' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#866023' },
};

export default Wallet;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/