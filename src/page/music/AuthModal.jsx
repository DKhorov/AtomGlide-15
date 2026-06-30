import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <Box sx={{ width: 300, bgcolor: "#121212", p: 4, borderRadius: 4, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <Typography sx={{ color: "#fff", mb: 3 }}>Войдите в аккаунт</Typography>
        <Button fullWidth variant="contained" sx={{bgcolor: 'rgb(237,93,25)'}} onClick={() => navigate("/login")}>
          Войти
        </Button>
      </Box>
    </div>
  );
};

export default AuthModal;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/