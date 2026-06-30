 import React, { useState, useEffect } from "react";
import axios from "../../system/axios";
import { Box, Typography, CircularProgress, IconButton, Avatar, Button } from "@mui/material";
import { ViewList as ViewListIcon, ViewModule as ViewModuleIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../system/redux/slices/getme";
import { setTrack } from "../../system/redux/playerSlice";
import TrackItem from "./TrackItem.jsx";
import AuthModal from "./AuthModal.jsx";
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
const COVER = "https://images.unsplash.com/photo-1549492167-27e1f4869c0d?w=800&auto=format&fit=crop&q=60";

const Music = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { currentIndex, activePlaylist } = useSelector((state) => state.player);

  const [allTracks, setAllTracks] = useState([]);
  const [likedTrackIds, setLikedTrackIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const { data: tracksData } = await axios.get("/tracksq");
        const formattedTracks = tracksData.map(track => ({
          ...track,
          cover: track.cover || COVER,
          title: track.title || "Без названия",
          genre: track.genre || "Без жанра",
        }));
        setAllTracks(formattedTracks);

        if (user) {
          const { data: likedData } = await axios.get("/music/liked");
          const ids = likedData.map(t => typeof t === "object" ? t._id : t);
          setLikedTrackIds(new Set(ids));
        }
      } catch (err) {
        console.error("Failed to fetch tracks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [user]);

  const handlePlay = (track, index) => {
    if (!user) return setIsAuthModalOpen(true);
    dispatch(setTrack({ playlist: allTracks, index: index }));
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

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "rgb(237,93,25)" }} /></Box>;

  return (
    <Box sx={{ px: 2, py: 2, pb: currentIndex !== null ? 14 : 4, overflowY: "auto", color: '#fff', width: '750px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Вся музыка</Typography>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, p: 0.5 }}>
          <IconButton onClick={() => setViewMode("list")} size="small" sx={{ color: viewMode === "list" ? "rgb(237,93,25)" : "rgba(255,255,255,0.3)" }}><ViewListIcon /></IconButton>
          <IconButton onClick={() => setViewMode("grid")} size="small" sx={{ color: viewMode === "grid" ? "rgb(237,93,25)" : "rgba(255,255,255,0.3)" }}><ViewModuleIcon /></IconButton>
        </Box>
      </Box>
  

      {viewMode === "list" ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {allTracks.map((track, idx) => (
            <TrackItem 
              key={track._id} track={track} isAuth={!!user} 
              isLiked={likedTrackIds.has(track._id)} 
              onPlay={() => handlePlay(track, idx)} 
              onLike={(e) => toggleLike(e, track._id)} 
              isActive={activePlaylist === allTracks && currentIndex === idx} 
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
          {allTracks.map((track, idx) => (
            <Box key={track._id} onClick={() => handlePlay(track, idx)} sx={{ cursor: 'pointer', textAlign: 'center' }}>
              <Avatar src={track.cover} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1', borderRadius: 4, mb: 1, border: (activePlaylist === allTracks && currentIndex === idx) ? '2px solid rgb(237,93,25)' : 'none' }} />
              <Typography noWrap variant="subtitle2" sx={{ color: (activePlaylist === allTracks && currentIndex === idx) ? 'rgb(237,93,25)' : 'white' }}>{track.title}</Typography>
            </Box>
          ))}
        </Box>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Box>
  );
};

export default Music;


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/