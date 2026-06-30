import React, { useState, useEffect } from "react";
import axios from "../../system/axios";
import { Box, Typography, Button, Avatar, CircularProgress, TextField, Switch } from "@mui/material";
import { Add as AddIcon, Lock as LockIcon, Public as PublicIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../system/redux/slices/getme";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const Playlists = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const { data: publicData } = await axios.get("/playlists");
        setPublicPlaylists(publicData);

        if (user) {
          const { data: myData } = await axios.get("/playlists/my");
          setMyPlaylists(myData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [user]);

  const handleCreatePlaylist = async () => {
    if (!user) return setIsAuthModalOpen(true);
    if (!newPlaylistName.trim()) return;

    try {
      const { data } = await axios.post("/playlists", { 
        title: newPlaylistName, isPublic: !isPrivate, isPrivate 
      });
      setMyPlaylists((prev) => [data, ...prev]);
      if (!isPrivate) setPublicPlaylists((prev) => [data, ...prev]);
      
      setNewPlaylistName("");
      setIsPrivate(false);
      setIsCreatePlaylistOpen(false);
    } catch (err) {
      alert("Ошибка при создании плейлиста");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "rgb(237,93,25)" }} /></Box>;

  return (
    <Box sx={{ px: 2, py: 2,  overflowY: "auto", color: '#fff', width: '750px' }}>
      
      {user && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">Мои плейлисты</Typography>
            <Button startIcon={<AddIcon />} onClick={() => setIsCreatePlaylistOpen(true)} sx={{ color: "rgb(237,93,25)", fontWeight: "bold" }}>Создать</Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
            {myPlaylists.map((playlist) => (
              <Box key={playlist._id} onClick={() => navigate(`/playlist/${playlist._id}`)} sx={{ cursor: 'pointer' }}>
                <Box sx={{ position: 'relative', width: 140, height: 140, mb: 1 }}>
                  <Avatar src={playlist.cover?.startsWith('http') ? playlist.cover : `https://atomglidedev.ru${playlist.cover}`} variant="rounded" sx={{ width: '100%', height: '100%', borderRadius: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} />
                  {!playlist.isPublic && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', borderRadius: '50%', p: 0.5, display: 'flex' }}>
                      <LockIcon sx={{ fontSize: 14, color: '#fff' }} />
                    </Box>
                  )}
                </Box>
                <Typography noWrap fontWeight="bold" variant="subtitle2">{playlist.title}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.5 }}>{playlist.isPublic ? 'Публичный' : 'Приватный'}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>Все плейлисты</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
          {publicPlaylists.map((playlist) => (
            <Box key={playlist._id} onClick={() => navigate(`/playlist/${playlist._id}`)} sx={{ cursor: 'pointer' }}>
              <Avatar src={playlist.cover?.startsWith('http') ? playlist.cover : `https://atomglidedev.ru${playlist.cover}`} variant="rounded" sx={{ width: 140, height: 140, borderRadius: 1, mb: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} />
              <Typography noWrap fontWeight="bold" variant="subtitle2">{playlist.title}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>{playlist.tracks?.length || 0} треков</Typography>
            </Box>
          ))} 
        </Box>
      </Box>

      {/* Модалка создания плейлиста */}
      {isCreatePlaylistOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setIsCreatePlaylistOpen(false)}>
          <Box sx={{ width: 350, bgcolor: "#181818", p: 3, borderRadius: 4 }} onClick={(e) => e.stopPropagation()}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#fff", mb: 2 }}>Новый плейлист</Typography>
            <TextField fullWidth autoFocus placeholder="Название плейлиста" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} sx={{ input: { color: 'white' }, bgcolor: '#222', borderRadius: 2, mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, bgcolor: 'rgba(255,255,255,0.05)', p: 1.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isPrivate ? <LockIcon fontSize="small" sx={{ color: 'rgb(237,93,25)' }} /> : <PublicIcon fontSize="small" />}
                <Typography variant="body2">{isPrivate ? "Приватный" : "Публичный"}</Typography>
              </Box>
              <Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} color="warning" />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth onClick={() => setIsCreatePlaylistOpen(false)} sx={{ color: 'white' }}>Отмена</Button>
              <Button fullWidth variant="contained" onClick={handleCreatePlaylist} sx={{ bgcolor: 'rgb(237,93,25)' }}>Создать</Button>
            </Box>
          </Box>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Box>
  );
};

export default Playlists;