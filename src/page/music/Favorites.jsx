import React, { useState, useEffect } from "react";
import axios from "../../system/axios";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Favorite as FavoriteIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../system/redux/slices/getme";
import { setTrack } from "../../system/redux/playerSlice";
import TrackItem from "./TrackItem";

const Favorites = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { currentIndex, activePlaylist } = useSelector((state) => state.player);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return setLoading(false);
      try {
        setLoading(true);
        const { data } = await axios.get("/music/liked");
        // Предполагаем, что бэкенд отдает populate объекты треков. Отфильтруем на всякий случай
        const validTracks = data.reverse().filter(t => typeof t === "object");
        setFavorites(validTracks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  const handlePlay = (track, index) => {
    dispatch(setTrack({ playlist: favorites, index: index }));
  };

  const handleUnlike = async (e, trackId) => {
    e.stopPropagation();
    try {
      setFavorites(prev => prev.filter(t => t._id !== trackId));
      await axios.post(`/music/like/${trackId}`);
    } catch (err) {
      console.error("Failed to unlike", err);
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 4, color: '#fff', textAlign: 'center' }}>
        <Typography variant="h6">Войдите, чтобы просматривать избранное</Typography>
      </Box>
    );
  }

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "rgb(237,93,25)" }} /></Box>;

  return (
    <Box sx={{ px: 2, py: 2, pb: currentIndex !== null ? 14 : 4, overflowY: "auto", color: '#fff', width: '750px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ 
          width: 80, height: 80, borderRadius: 3, 
          background: 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          <FavoriteIcon sx={{ fontSize: 40, color: '#fff' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="bold">Избранное</Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.7 }}>{favorites.length} треков</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {favorites.length === 0 ? (
           <Typography sx={{ opacity: 0.5 }}>У вас пока нет любимых треков.</Typography>
        ) : (
          favorites.map((track, idx) => (
            <TrackItem 
              key={track._id} track={track} isAuth={true} isLiked={true} 
              onPlay={() => handlePlay(track, idx)} 
              onLike={(e) => handleUnlike(e, track._id)} 
              isActive={activePlaylist === favorites && currentIndex === idx} 
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default Favorites;


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/