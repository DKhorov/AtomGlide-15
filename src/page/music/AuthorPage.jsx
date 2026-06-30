import React, { useState, useEffect } from "react";
import axios from "../../system/axios";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../system/redux/slices/getme";
import { setTrack } from "../../system/redux/playerSlice";
import TrackItem from "./TrackItem.jsx"; 
import AuthModal from "./AuthModal"; 

const AuthorPage = () => {
  const { authorName: urlAuthorName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const user = useSelector(selectUser);
  const { currentIndex, activePlaylist } = useSelector((state) => state.player);
  
  const [tracks, setTracks] = useState([]);
  const [authorAvatar, setAuthorAvatar] = useState(""); // Состояние для правильной аватарки
  const [likedTrackIds, setLikedTrackIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const authorName = urlAuthorName ? decodeURIComponent(urlAuthorName).trim() : "Неизвестный автор";

  useEffect(() => {
    if (!urlAuthorName) {
      setLoading(false);
      return;
    }

    const fetchAuthorData = async () => {
      try {
        setLoading(true);

        const { data: tracksData } = await axios.get(`/music/authors/${encodeURIComponent(authorName)}`);
        const formattedTracks = (Array.isArray(tracksData) ? tracksData : []).map(track => ({
          ...track,
          cover: track.cover || "https://images.unsplash.com/photo-1549492167-27e1f4869c0d?w=800",
          title: track.title || "Без названия",
          genre: track.genre || "Без жанра",
        }));
        setTracks(formattedTracks);

        const { data: authorsList } = await axios.get("/music/authors");
        const currentAuthor = authorsList.find(
          a => a.name && a.name.toLowerCase().trim() === authorName.toLowerCase().trim()
        );

        if (currentAuthor && currentAuthor.avatar) {
          let formattedAvatar = currentAuthor.avatar;
          if (!formattedAvatar.startsWith('http') && !formattedAvatar.startsWith('data:image')) {
            formattedAvatar = `https://atomglidedev.ru${formattedAvatar.startsWith('/') ? '' : '/'}${formattedAvatar}`;
          }
          setAuthorAvatar(formattedAvatar);
        } else {
          setAuthorAvatar(`https://ui-avatars.com/api/?background=333&color=fff&size=256&name=${encodeURIComponent(authorName)}`);
        }

        if (user) {
          const { data: likedData } = await axios.get("/music/liked");
          const ids = likedData.map(t => typeof t === "object" ? t._id : t);
          setLikedTrackIds(new Set(ids));
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных автора:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [authorName, urlAuthorName, user]);

  const handlePlay = (index) => {
    if (!user) return setIsAuthModalOpen(true);
    dispatch(setTrack({ playlist: tracks, index: index }));
  };

  const toggleLike = async (e, trackId) => {
    e.stopPropagation();
    if (!user) return setIsAuthModalOpen(true);
    
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
    await axios.post(`/music/like/${trackId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: "rgb(237,93,25)" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 2, pb: currentIndex !== null ? 14 : 4, overflowY: "auto", color: '#fff', width: '750px' }}>
      <Typography 
        variant="body2" 
        onClick={() => navigate(-1)} 
        sx={{ cursor: 'pointer', mb: 3, opacity: 0.6, '&:hover': { opacity: 1, color: 'rgb(237,93,25)' } }}
      >
        ← Назад
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <Avatar 
          src={authorAvatar} // Используем правильную отформатированную аватарку
          sx={{ width: 150, height: 150, mr: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.6)', bgcolor: '#333' }} 
        />
        <Box>
          <Typography variant="h3" fontWeight="bold">{authorName}</Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.5 }}>
            {tracks.length} {tracks.length === 1 ? 'трек' : (tracks.length > 1 && tracks.length < 5) ? 'трека' : 'треков'}
          </Typography>
        </Box>
      </Box>

      <Typography variant="h5" fontWeight="bold" mb={2}>Треки исполнителя</Typography>
      
      {tracks.length === 0 ? (
        <Typography sx={{ opacity: 0.5 }}>Треков не найдено.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {tracks.map((track, idx) => (
            <TrackItem 
              key={track._id || idx} 
              track={track} 
              isAuth={!!user} 
              isLiked={likedTrackIds.has(track._id)} 
              onPlay={() => handlePlay(idx)} 
              onLike={(e) => toggleLike(e, track._id)} 
              isActive={activePlaylist === tracks && currentIndex === idx} 
            />
          ))}
        </Box>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Box>
  );
};

export default AuthorPage;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/