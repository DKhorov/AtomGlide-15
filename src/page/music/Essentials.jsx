import React, { useState, useEffect } from "react";
import axios from "../../system/axios";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Essentials = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPlaylists = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/playlists");
        setPlaylists(data);
      } catch (err) {
        console.error("Ошибка при загрузке всех плейлистов:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlaylists();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: "rgb(237,93,25)" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 2,  overflowY: "auto", color: '#fff', width: '750px' }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>Essentials</Typography>
      <Typography variant="subtitle1" sx={{ opacity: 0.6, mb: 4 }}>
        Все плейлисты наших пользователей
      </Typography>
      
      {playlists.length === 0 ? (
        <Typography sx={{ opacity: 0.5 }}>Плейлистов пока нет.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 3 }}>
          {playlists.map((playlist) => (
            <Box 
              key={playlist._id} 
              onClick={() => navigate(`/playlist/${playlist._id}`)}
              sx={{ 
                cursor: 'pointer', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'scale(1.03)' } 
              }}
            >
              <Avatar 
                src={playlist.cover?.startsWith('http') ? playlist.cover : `https://atomglidedev.ru${playlist.cover}`} 
                variant="rounded" 
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  aspectRatio: '1/1', 
                  borderRadius: 3, 
                  mb: 1.5, 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)' 
                }} 
              />
              <Typography noWrap fontWeight="bold" variant="subtitle2">
                {playlist.title}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>
                {playlist.tracks?.length || 0} треков
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Essentials;


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/