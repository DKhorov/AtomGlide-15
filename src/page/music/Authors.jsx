import React, { useState, useEffect } from "react";
import axios from "../../system/axios";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Authors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const { data } = await axios.get("/music/authors");
        
        const uniqueAuthorsMap = new Map();

        data.forEach(author => {
          if (!author.name) return; // Пропускаем пустых
          
          const normalizedName = author.name.toLowerCase().trim();

          if (uniqueAuthorsMap.has(normalizedName)) {
            const existing = uniqueAuthorsMap.get(normalizedName);
            existing.trackCount += (author.trackCount || 0);
            
            if (!existing.avatar && author.avatar) {
              existing.avatar = author.avatar;
            }
          } else {
            // Если автора еще нет, добавляем его в словарь
            uniqueAuthorsMap.set(normalizedName, { ...author });
          }
        });

        const uniqueAuthorsArray = Array.from(uniqueAuthorsMap.values());
        
        setAuthors(uniqueAuthorsArray);
      } catch (err) {
        console.error("Ошибка при загрузке авторов:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuthors();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: "rgb(237,93,25)" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 2, overflowY: "auto", color: '#fff', width: '750px' }}>
      <Typography variant="h4" fontWeight="bold" mb={1}>Авторы</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 4, mt: 4 }}>
        {authors.map((author) => (
          <Box 
            key={author.name} 
            onClick={() => navigate(`/music/authors/${encodeURIComponent(author.name)}`)}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', '&:hover': { transform: 'scale(1.05)', transition: '0.2s' } }}
          >
            <Avatar 
              src={author.avatar} 
              sx={{ width: 120, height: 120, mb: 1.5, bgcolor: '#333' }} 
            />
            <Typography fontWeight="bold" align="center">{author.name}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              {author.trackCount} {author.trackCount === 1 ? 'трек' : author.trackCount < 5 && author.trackCount > 0 ? 'трека' : 'треков'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Authors;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/