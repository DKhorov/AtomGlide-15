import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';

const IslandContext = createContext();

export const DynamicIslandProvider = ({ children }) => {
  const [island, setIsIsland] = useState({ 
    open: false, 
    text: '', 
    icon: null, 
    color: '#fff' 
  });

  const showIsland = useCallback((text, iconName = 'Info', color = '#fff') => {
    const IconComponent = Icons[iconName] || Icons.Info;
    
    setIsIsland({ 
      open: true, 
      text, 
      icon: <IconComponent sx={{ color }} />, 
      color 
    });
    
    // Закрываем через 5 секунд
    setTimeout(() => {
      setIsIsland(prev => ({ ...prev, open: false }));
    }, 5000);
  }, []);

  useEffect(() => {
    window.showIsland = showIsland;
    return () => { delete window.showIsland; };
  }, [showIsland]);

  return (
    <IslandContext.Provider value={showIsland}>
      {children}
      
      {island.open && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, 
          display: 'flex', justifyContent: 'center', pointerEvents: 'none' 
        }}>
          <Box sx={{
            backgroundColor: '#0a0a0a',
            borderRadius: '50px',
            mt: 2,
            px: 3,
            py: 1.5,
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
            animation: 'drop 5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '@keyframes drop': { 
              '0%': { transform: 'translateY(-100px)', opacity: 0 },
              '10%': { transform: 'translateY(0)', opacity: 1 },
              '90%': { transform: 'translateY(0)', opacity: 1 },
              '100%': { transform: 'translateY(-100px)', opacity: 0 } 
            }
          }}>
            {island.icon}
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
              {island.text}
            </Typography>
          </Box>
        </div>
      )}
    </IslandContext.Provider>
  );
};

export const useIsland = () => useContext(IslandContext);


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/