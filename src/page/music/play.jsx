"use client";
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Stack,
  useTheme,
  useMediaQuery,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar
} from "@mui/material";
import { keyframes } from "@mui/system";
import {
  SkipNext as NextIcon,
  SkipPrevious as PreviousIcon,
  KeyboardArrowDown as DownIcon,
  GraphicEq as LyricsIcon,
  List as QueueIcon,
  Close as CloseIcon,
  FastForward
} from "@mui/icons-material";
import FastForwardIcon from '@mui/icons-material/FastForward';
import { FaPlay, FaPause } from "react-icons/fa"; 
import { SiDolby } from "react-icons/si";
import { FiHeart } from "react-icons/fi";
import { MdReplay10, MdForward10 } from 'react-icons/md';
import axios from "axios";

import { useSelector, useDispatch } from "react-redux";
import { togglePlay, nextTrack, prevTrack } from "../../system/redux/playerSlice";

import { 
  inTheClosetRussian,
  stillStandingLyrics, serovLyrics, doYouWantToKnowASecretLyrics, stepLyrics, nothingSpecialRussian,
  atomLyrics, strawberryFieldsLyrics, gentleLyrics, chuCheloLyrics, helpLyrics, 
  slightlyMadLyrics, europapaLyrics, abbaLyrics, carelessWhisperLyrics, theyDontCareAboutUsLyricsDark,
  dontStopMeNowLyricsRu, darkRedLyricsRu, imagineLyricsRu, championsLyricsRu,alaskaFullLyrics,
  flyDayChinatownLyrics, freeLyrics, loveMeLikeNoTomorrowLyrics, combinationLyrics, 
  andILoveHerLyricsRu, wickedGameLyrics, whoIsSheLyrics, mentholSmokeLyrics,arlekinoPure,
  mzlffLyrics, springSmellLyrics, lastTimeLyrics, moskauLyrics, iInventedYouLyrics,vedmaPure,
  happyNationLyrics, nauLyrics, greatPretenderLyricsRu, bohemianRhapsodyLyricsRu, 
  rocketManLyrics, joyDivisionLyricsRu, youAreNotAloneFullLyricsRU, innuendoLyricsRU,yaBuduDolgoGnatVelosiped,
  lishDoUtraDark,dangerousPure,caramelPure,feelGoodPure,breakFreeRussian,doSvidaniyaPure,
  allesLyrics, heyJudeLyrics, petalsOfTearsLyrics, theSmithsLyrics,bankomatLyrics,
  theyDontCareAboutUsLyricsRU, showMustGoOnLyrics, lilyAllenLyrics, kroshkaMoyaLyrics,iWillSurviveRussian,
  springLyrics, somebodyWatchingMeLyricsRU, kakNaVoyneLyrics, geronimosCadillacLyricsRU,
  sonneLyricsFull, stytsamenLyrics, cheriCheriLadyLyricsRU, lirikaLyrics,dianaOriginal,
  zanovoLyrics, billieJeanLyricsRU, lieblingsfachLyrics, parisLoveLyrics, cooperLyrics,
  earthSongLyricsOriginal,rapGodPure,buratinoPure,letItHappen,
  faceVihodiLyrics, footjobLyrics, maryOnACrossLyrics, polPyatogoLyrics,otel,
  daysOfOurLivesLyricsRU,rayBanPure,mokryeKrossyPure,nezabudkaPure,blindingLights,
  loveOfMyLifeOriginalRU,candleInTheWindOriginal,draculaLyrics,beautifulPure,cigarettes,chicago,
  iWantItAllPurePower,mockingbirdPure,supermanPure,motorolaPure,skylineRyodan,
  bogatyrForceLyrics, rueMontmartreLyricsRu, saveYourTearsLyricsRu, goLive, jerk,
  helpMeDownLyricsRu, faceMneNeNadoLyrics, asphaltLyrics, faceVloneLyrics,flashingLights, 
  face, selfharmLyrics, kissLyrics, zemfiraLyrics,moneyTreesPure,vybiratChudoPure, emalirovannoeSudno,giveInToMe
} from "./lyrics";

const DOLBY_TRACKS = [
  "bohemian rhapsody", "dark red", "save your tears", "imagine",  
  "champions", "don't stop me now", "great pretender", "mary on a cross", 
  "hey jude", "wicked game", "fly-day chinatown", "i was made for lovin you", 
  "ansichtkaart", "moskau", "i invented you", "дыхание", "rocket man",
  "superman", "mockingbird", "i want to break free","blinding lights"
];

const LYRICS_MAP = {
  "bohemian rhapsody": bohemianRhapsodyLyricsRu,
  "great pretender": greatPretenderLyricsRu,
  "no tomorrow": loveMeLikeNoTomorrowLyrics,
  "and i love her": andILoveHerLyricsRu,
  "strawberry": strawberryFieldsLyrics,
  "standing": stillStandingLyrics,
  "дай мне руку и мы убежим": zanovoLyrics,
  "i want it all": iWantItAllPurePower,
  "blinding lights":blindingLights,
  "alaska puffer": alaskaFullLyrics,
  "dirty diana": dianaOriginal,
  "dracula": draculaLyrics,
  "судно": emalirovannoeSudno,
  "букет": yaBuduDolgoGnatVelosiped,
  "cigarette duet": cigarettes,
  "flashing lights": flashingLights,
  "let it happen": letItHappen,
  "give in to me": giveInToMe,
  "skyline ryodan": skylineRyodan,
  "chicago": chicago,
  "с тобой": atomLyrics,
  "быть!": serovLyrics,
  "motorola": motorolaPure,
  "jerk": jerk,
  "карабас": buratinoPure,
  "купер": cooperLyrics,
  "griby": cooperLyrics,
  "нежная": gentleLyrics,
  "gentle": gentleLyrics,
  "step": stepLyrics,
  "brother louie": chuCheloLyrics,
  "чучело": chuCheloLyrics,
  "slightly mad": slightlyMadLyrics,
  "secret": doYouWantToKnowASecretLyrics,
  "отель": otel,
  "лирика": lirikaLyrics,
  "незабудка": nezabudkaPure,
  "help": helpLyrics,
  "банкомат": bankomatLyrics,
  "i want to break free": breakFreeRussian,
  "rap god": rapGodPure,
  "don't stop me now": dontStopMeNowLyricsRu,
  "billie jean": billieJeanLyricsRU,
  "champions": championsLyricsRu,
  "you are not alone": youAreNotAloneFullLyricsRU,
  "the winner takes it all": abbaLyrics,
  "love of my life": loveOfMyLifeOriginalRU,
  "rocket man": rocketManLyrics,
  "parislove": parisLoveLyrics,
  "cheri cheri lady": cheriCheriLadyLyricsRU,
  "i will survive": iWillSurviveRussian,
  "стыцамен": stytsamenLyrics,
  "ход конем": combinationLyrics,
  "imagine": imagineLyricsRu,
  "geronimo cadillac": geronimosCadillacLyricsRU,
  "dark red": darkRedLyricsRu,
  "богатырская сила": bogatyrForceLyrics,
  "24 на 7": face,
  "hit#2": rueMontmartreLyricsRu,
  "go with me": goLive,
  "mockingbird": mockingbirdPure,
  "рэйман": rayBanPure,
  "caramel": caramelPure,
  "asphalt": asphaltLyrics,
  "асфальт": asphaltLyrics,
  "trust me": helpMeDownLyricsRu,
  "как на войне": kakNaVoyneLyrics,
  "earth song": earthSongLyricsOriginal,
  "beautiful": beautifulPure,
  "лишь до утра": lishDoUtraDark,
  "candle in the wind (1997)": candleInTheWindOriginal,
  "sonne": sonneLyricsFull,
  "лабиринт": faceVihodiLyrics,
  "перехожу эту грань (normal)": footjobLyrics,
  "4:30": polPyatogoLyrics,
  "save your tears": saveYourTearsLyricsRu,
  "happy nation": happyNationLyrics,
  "спасательный круг": faceMneNeNadoLyrics,
  "выбирать чудо": vybiratChudoPure,
  "vlone": faceVloneLyrics,
  "mary on a cross": maryOnACrossLyrics,
  "селфхарм": selfharmLyrics,
  "i was made for lovin you": kissLyrics,
  "п. м. м. л.": zemfiraLyrics,
  "the show must go on": showMustGoOnLyrics,
  "крошка моя": kroshkaMoyaLyrics,
  "до свидания": doSvidaniyaPure,
  "superman": supermanPure,
  "in the closet": inTheClosetRussian,
  "мокрые кроссы":  mokryeKrossyPure,
  "jealous": nothingSpecialRussian,
  "back to black": lilyAllenLyrics,
  "somebody's watching me": somebodyWatchingMeLyricsRU,
  "these are the days of our lives": daysOfOurLivesLyricsRU,
  "money trees (feat. jay rock)": moneyTreesPure,
  "not allowed": joyDivisionLyricsRu,
  "fly-day chinatown": flyDayChinatownLyrics,
  "wicked game": wickedGameLyrics,
  "дым сигарет с ментолом": mentholSmokeLyrics,
  "а знаешь, всё ещё будет": allesLyrics,
  "kunst und musik": lieblingsfachLyrics,  
  "hey jude": heyJudeLyrics,
  "innuendo": innuendoLyricsRU,
  "дыхание": nauLyrics,
  "moskau": moskauLyrics,
  "во время дождя": iInventedYouLyrics,
  "there is a light that never goes": theSmithsLyrics,
  "лепестками слёз(slowed)": petalsOfTearsLyrics,
  "в последний раз": lastTimeLyrics,
  "запахло весной": springSmellLyrics,
  "я свободен": freeLyrics,
  "who is she immortal (slowed)": whoIsSheLyrics,
  "щека на щеку": mzlffLyrics,
  "ведьма и осёл":  vedmaPure,
  "чумачечая весна": springLyrics,
  "арлекино": arlekinoPure,
  "they don't care about us": theyDontCareAboutUsLyricsDark
};

const formatTime = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SOLID_BG_TRACKS = [
  { title: "Название Трека 1", color: "#4a148c" }, 
  { title: "Селфхарм", color: "#7E0102" },     
  { title: "Mary on a cross", color: "#000000" },
  { title: "4:30", color: "#000000" },
  { title: "24 на 7", color: "#000000" },  
  { title: "Дыхание", color: "#000000" },  
  { title: "Матерь богов", color: "#000000" },  
  { title: "Innuendo", color: "#ffffff" },
  { title: "ansichtkaart", color: "rgb(2, 10, 255)" },
  { title: "I Was Made For Lovin You", color: "#000000" }
];

const checkIsLight = (color) => {
  if (!color) return false;
  const c = color.toLowerCase().trim();
  return c === "#ffffff" || c === "#fff" || c === "rgb(255, 255, 255)";
};

const getBrightness = (colorStr) => {
  if (!colorStr) return 128;
  const c = colorStr.toLowerCase().trim();
  const rgbMatch = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return (parseInt(rgbMatch[1]) * 299 + parseInt(rgbMatch[2]) * 587 + parseInt(rgbMatch[3]) * 114) / 1000;
  }
  const hexMatch = c.match(/#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
  if (hexMatch) {
    return (parseInt(hexMatch[1], 16) * 299 + parseInt(hexMatch[2], 16) * 587 + parseInt(hexMatch[3], 16) * 114) / 1000;
  }
  return 128;
};

const useImageColors = (src) => {
  const [colors, setColors] = useState(['#454545', '#303030', '#838383']); 
  useEffect(() => {
    if (!src) return;
    let isActive = true;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx || !isActive) return;
          canvas.width = 50; 
          canvas.height = 50;
          ctx.drawImage(img, 0, 0, 50, 50);
          
          const data = ctx.getImageData(0, 0, 50, 50).data;
          const colorMap = new Map();
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]; const g = data[i + 1]; const b = data[i + 2]; const a = data[i + 3];
            if (a < 200 || (r + g + b) < 60) continue;
            sumR += r; sumG += g; sumB += b; count++;
            const key = `${Math.round(r / 10)}_${Math.round(g / 10)}_${Math.round(b / 10)}`;
            colorMap.set(key, (colorMap.get(key) || 0) + 1);
          }
          
          let dominantKey = '';
          let maxCount = 0;
          for (const [key, cnt] of colorMap) {
            if (cnt > maxCount) { maxCount = cnt; dominantKey = key; }
          }
          
          const getRGBFromKey = (key) => {
            const [rStr, gStr, bStr] = key.split('_');
            return `rgb(${parseInt(rStr) * 10}, ${parseInt(gStr) * 10}, ${parseInt(bStr) * 10})`;
          };
          
          const avgColor = `rgb(${Math.round(sumR / count)}, ${Math.round(sumG / count)}, ${Math.round(sumB / count)})`;
          const dominantColor = dominantKey ? getRGBFromKey(dominantKey) : avgColor;
          const centerPixel = ctx.getImageData(25, 25, 1, 1).data;
          
          setColors([dominantColor, avgColor, `rgb(${centerPixel[0]}, ${centerPixel[1]}, ${centerPixel[2]})`]);
        } catch (e) { console.warn("Color extraction error"); }
      }, 50);
    };
    return () => { isActive = false; };
  }, [src]);
  return colors;
};

const BlurredCoverBackground = ({ cover, isLyricsMode, isSolid, solidColor }) => {
  if (isSolid) {
    return <Box sx={{ position: "fixed", inset: 0, zIndex: 0, bgcolor: solidColor, transition: "background 0.6s ease" }} />;
  }
  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", width: "100vw", height: "100vh" }}>
      <Box
        component="img"
        src={cover || "/1.png"}
        sx={{
          position: "absolute", inset: 0, width: "100vw", height: "100vh",
          objectFit: "cover", filter: ` saturate(140%) brightness(0.7)`,
          zIndex: 1, userSelect: "none", pointerEvents: "none"
        }}
      />
      <Box sx={{
        position: 'absolute', inset: 0,
        background: isLyricsMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.2)",
        transition: "background 0.8s ease", zIndex: 2
      }} />
    </Box>
  );
};

const TRACK_STYLES = [
  { title: "Blinding Lights", fontFamily: "'Monoton', cursive" },
  { title: "Bohemian Rhapsody", fontFamily: "'Playfair Display', serif" },
  { title: "back to black", fontFamily: "'Times New Roman', Times, serif" }, 
];

const LyricsView = ({ lyrics, activeIndex, onSeek, isMobile, focusMode, currentTime, isLight, trackTitle }) => {
  const scrollRef = useRef(null);
  const lineRefs = useRef([]);

  const isGlobalSpecial = lyrics[activeIndex]?.special;
  const textColor = isLight ? "#000000" : "#ffffff";
  const passedColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)";
  const upcomingColor = isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)";

  useEffect(() => {
    const activeEl = lineRefs.current[activeIndex];
    const container = scrollRef.current;
    if (activeEl && container) {
      requestAnimationFrame(() => {
        const targetScroll = activeEl.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
        container.scrollTo({ top: targetScroll, behavior: "smooth" });
      });
    }
  }, [activeIndex, focusMode]);

  if (!lyrics || lyrics.length === 0) return null;

  return (
    <Box
      ref={scrollRef}
      sx={{
        width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", position: "relative",
        px: isMobile ? 4 : 0, pr: isMobile ? 4 : 4, 
        "&::-webkit-scrollbar": { display: "none" }, 
        scrollBehavior: "smooth", WebkitOverflowScrolling: "touch",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 15%, #000 65%, transparent 92%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, #000 15%, #000 65%, transparent 92%)",
      }}
    >
      <Box sx={{ height: "45vh" }} />
      {lyrics.map((line, i) => {
        const isActive = i === activeIndex;
        const isRight = line.right; 
        
        let opacityValue = (isGlobalSpecial || focusMode) 
          ? (isActive ? 1 : 0) 
          : (i < activeIndex - 2 ? 0 : isActive ? 1 : i < activeIndex ? 0.35 : 0.45);
        
        return (
          <Box
            key={`${line.time}-${i}`} 
            ref={(el) => { lineRefs.current[i] = el; }} 
            onClick={() => onSeek(line.time)}
            sx={{ 
              width: "100%", minHeight: isMobile ? 60 : 70, display: "flex", alignItems: "center", cursor: "pointer", 
              mb: 3, opacity: opacityValue, transition: "opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)", 
              justifyContent: isRight ? "flex-end" : "flex-start" 
            }}
          >
            <Typography 
              sx={{
                fontFamily: 'Arial', 
                fontSize: isMobile ? "1.8rem" : "2.8rem", 
                fontWeight: 900, color: textColor, lineHeight: 1.2, letterSpacing: "-0.02em", 
                width: "auto", maxWidth: isMobile ? "95%" : "85%", display: "flex", flexWrap: "wrap",
                textAlign: isRight ? "right" : "left", 
                transform: isActive ? "scale(1.08)" : "scale(0.96)",
                transformOrigin: isRight ? "right center" : "left center",
                transition: "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1), filter 0.5s ease",
                filter: isActive ? "none" : "blur(1.9px)",
              }}
            >
              {line.words ? (
                line.words.map((w, wIndex) => {
                  const nextWordStart = line.words && line.words[wIndex + 1] 
                    ? line.words[wIndex + 1].start : (lyrics[i + 1]?.time || Infinity);

                  const isWordActive = isActive && currentTime >= w.start && currentTime < nextWordStart;
                  const isWordPassed = isActive && currentTime >= nextWordStart;
                  
                  return (
                    <Box
                      key={wIndex} component="span"
                      sx={{
                        display: "inline-block", whiteSpace: "pre", 
                        transition: "color 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), filter 0.3s ease", 
                        color: isWordActive ? textColor : isWordPassed ? passedColor : upcomingColor,
                        transform: isWordActive ? "scale(1.05)" : "scale(1)",
                        mr: isMobile ? "0.35rem" : "0.5rem", transformOrigin: "center center", pl: 0.1, pr: 0.1
                      }}
                    >
                      {w.word}
                    </Box>
                  );
                })
              ) : (
                <Box component="span" sx={{ color: isActive ? textColor : "inherit", transition: "color 0.4s ease" }}>{line.text}</Box>
              )}
            </Typography>
          </Box>
        );
      })}
      <Box sx={{ height: "55vh" }} />
    </Box>
  );
};

const QueueModal = ({ open, onClose, queue, removeFromQueue, playTrack, activePlaylist }) => (
  <Dialog 
    open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex: 10000 }}
    PaperProps={{ sx: { bgcolor: '#111', borderRadius: 4, backgroundImage: 'none' } }}
  >    
    <DialogTitle sx={{ bgcolor: '#000', color: '#fff', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      Очередь ({queue.length})
      <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent sx={{ p: 0 }}>
      {queue.length === 0 ? (
        <Typography sx={{ p: 4, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Очередь пуста</Typography>
      ) : (
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {queue.map((t, i) => (
            <Box
              key={t._id || i}
              sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
              onClick={() => { playTrack(t, activePlaylist, { clearQueue: false }); removeFromQueue(t._id); onClose(); }}
            >
              <Avatar src={t.cover || "/1.png"} variant="rounded" sx={{ width: 50, height: 50, mr: 2 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }} noWrap>{t.title}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }} noWrap>{t.genre}</Typography>
              </Box>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeFromQueue(t._id); }} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#ff4d4d' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </DialogContent>
  </Dialog>
);

const CircularPlayButton = ({ isPlaying, togglePlay, progress, primaryColor = "#ffffff" }) => {
  const size = 60;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 0;
  const offset = circumference - (safeProgress * circumference);

  return (
    <Box
      onClick={togglePlay}
      sx={{
        width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", position: "relative", borderRadius: "50%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:active": { transform: "scale(0.92)" },
        "&:hover": { "& .inner-icon-box": { backgroundColor: `${primaryColor}15`, transform: "scale(1.05)" } },
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)", overflow: "visible" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${primaryColor}20`} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={primaryColor} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <Box
        className="inner-icon-box"
        sx={{
          position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center",
          width: size - 24, height: size - 24, borderRadius: "50%", backgroundColor: "transparent",
          backdropFilter: "blur(8px)", transition: "all 0.3s ease",
        }}
      >
        {isPlaying ? <FaPause size={20} color={primaryColor} /> : <FaPlay size={20} color={primaryColor} style={{ marginLeft: "4px" }} />}
      </Box>
    </Box>
  );
};

export const MobileLyrics = ({ currentTime = 0, lyrics }) => {
  const currentLine = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return "";
    const active = lyrics.filter((l) => l.time <= currentTime).pop();
    return active ? active.text : lyrics[0].text;
  }, [currentTime, lyrics]);

  if (!currentLine || currentLine === "Lyrics not available") return null;

  return (
    <Box
      sx={{
        position: "absolute", top: "65%", left: "50%", transform: "translate(-50%, -50%)", width: "85%", textAlign: "center", zIndex: 5, 
        bgcolor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderRadius: "20px", px: 3, py: 2, transition: "all 0.3s ease-in-out", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)", pointerEvents: "none"
      }}
    >
      <Typography
        key={currentLine} 
        sx={{
          color: "#ffffff", fontSize: "22px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.5px", textShadow: "0px 2px 10px rgba(0,0,0,0.5)",
          animation: "fadeIn 0.4s ease-out forwards",
          "@keyframes fadeIn": { from: { opacity: 0, transform: "translateY(5px)" }, to: { opacity: 1, transform: "translateY(0)" } }
        }}
      >
        {currentLine}
      </Typography>
    </Box>
  );
};

export const MobilePlayer = ({ 
  open, track, isPlaying, togglePlay, onNext, onPrev, onClose, currentTime = 0, duration = 1, onSeek, lyrics, likedTrackIds     
}) => {
  const [swipeY, setSwipeY] = useState(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const isCurrentTrackLiked = track && likedTrackIds ? likedTrackIds.has(track._id) : false;
  const [localLiked, setLocalLiked] = useState(isCurrentTrackLiked);

  useEffect(() => { setLocalLiked(isCurrentTrackLiked); }, [track?._id, isCurrentTrackLiked]);

  const handleTouchStart = (e) => {
    if (e.target.closest('.MuiSlider-root')) return;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isSwiping.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) setSwipeY(diff);
  };

  const handleTouchEnd = () => {
    isSwiping.current = false;
    if (swipeY > 140) { onClose(); setTimeout(() => setSwipeY(0), 300); } 
    else { setSwipeY(0); }
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (!track) return;
    const nextLikedState = !localLiked;
    setLocalLiked(nextLikedState);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.post(`https://atomglidedev.ru/music/like/${track._id}`, {}, {
        withCredentials: true,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.error("Ошибка при сохранении лайка:", err);
      setLocalLiked(!nextLikedState);
    }
  };

  const handleRewind10 = (e) => { e.stopPropagation(); onSeek(Math.max(currentTime - 10, 0)); };
  const handleForward10 = (e) => { e.stopPropagation(); onSeek(Math.min(currentTime + 10, duration)); };

  const extractedColors = useImageColors(track?.cover) || ["#BA6D42", "#F5EAE6"];
  const dynamicColor = track?.color || extractedColors[0];
  let gradientTopColor = extractedColors[1];
  
  const colorBrightness = getBrightness(dynamicColor);
  const isDarkCover = colorBrightness < 128; 
  
  if (isDarkCover) { gradientTopColor = "#121212"; } 
  else { gradientTopColor = "rgba(255, 255, 255, 0.95)"; }

  const textColor = isDarkCover ? "#ffffff" : "#111111";
  const subtextColor = isDarkCover ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const buttonBgColor = isDarkCover ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
  const playButtonBg = isDarkCover ? "#ffffff" : "#111111";
  const playButtonText = isDarkCover ? "#111111" : "#ffffff";
  const isDolby = useMemo(() => track && DOLBY_TRACKS.some(t => t.toLowerCase() === track.title?.toLowerCase()), [track]);

  if (!open || !track) return null;

  return (
    <Slide direction="up" in={open} timeout={400}>
      <Box sx={{ position: "fixed", inset: 0, zIndex: 9999 }}>
        <Box 
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          sx={{ 
            height: "100dvh", width: "100%", bgcolor: "#000", overflow: "hidden", userSelect: "none",
            fontFamily: "SF Pro Rounded, -apple-system, BlinkMacSystemFont, sans-serif",
            transform: `translateY(${swipeY}px)`, transition: swipeY === 0 ? "transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)" : "none",
          }}
        >
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "58%", zIndex: 1 }}>
            <IconButton onClick={onClose} sx={{ position: "absolute", top: "calc(env(safe-area-inset-top) + 12px)", left: 16, zIndex: 10, color: "#fff", bgcolor: "rgba(0,0,0,0.4)", backdropFilter: "blur(20px)", "&:hover": { bgcolor: "rgba(0,0,0,0.6)" } }}>
              <DownIcon sx={{ fontSize: 30 }} />
            </IconButton>
            <Box component="img" src={track.cover || "/1.png"} sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }} />
            <MobileLyrics currentTime={currentTime} lyrics={lyrics} />
          </Box>

          <Box sx={{ 
            position: "absolute", bottom: 0, left: 0, right: 0, height: "46%", 
            background: `linear-gradient(180deg, ${dynamicColor} 0%, ${gradientTopColor} 100%)`, 
            borderTopLeftRadius: 32, borderTopRightRadius: 32, zIndex: 2, 
            px: 3, pt: 3, pb: "calc(env(safe-area-inset-bottom) + 16px)", 
            display: "flex", flexDirection: "column", boxShadow: "0px -12px 40px rgba(0,0,0,0.25)", transition: "background 0.6s ease"
          }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ minWidth: 0, flex: 1, pr: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  {isDolby && ( <Box sx={{ display: "flex", alignItems: "center", color: isDarkCover ? "#00FF66" : "#00AA44" }}><SiDolby size={18} /></Box> )}
                  <Typography noWrap sx={{ color: textColor, fontSize: "19px", fontWeight: 500, mt: 0.5 }}>{track.genre || "Unknown Genre"}</Typography>
                </Box>
              </Box>
              <IconButton onClick={handleLikeClick} sx={{ bgcolor: buttonBgColor, color: localLiked ? "#ff2d55" : textColor, width: 48, height: 48, zIndex: 99, transition: "transform 0.2s", "&:active": { transform: "scale(0.9)" } }}>
                <FiHeart fill={localLiked ? "#ff2d55" : "none"} size={22} />
              </IconButton>
            </Box>

            <Box sx={{ mt: "auto" }}>
               <Typography noWrap sx={{ color: subtextColor, fontSize: "14px", fontWeight: 400, mb: 0.5 }}>{isDolby ? "Dolby Atmos" : "Hi-Res Audio"}</Typography>
               <Typography noWrap sx={{ fontWeight: 800, color: textColor, fontSize: "30px", lineHeight: 1.1, letterSpacing: "-0.5px", mb: 2.5 }}>{track.title || "Unknown Title"}</Typography>
               
              <Box sx={{ width: "100%", mt: 1, mb: 2 }}>
                <Slider
                  size="small" value={currentTime} min={0} max={duration || 1} onChange={(_, value) => onSeek(value)}
                  sx={{
                    color: textColor, height: 4, padding: "13px 0",
                    "& .MuiSlider-thumb": { width: 12, height: 12, backgroundColor: textColor, transition: "0.2s", "&::before": { boxShadow: "none" }, "&:hover, &.Mui-active": { width: 14, height: 14 } },
                    "& .MuiSlider-track": { border: "none", opacity: 0.9 }, "& .MuiSlider-rail": { opacity: 0.2, backgroundColor: textColor },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: -0.5 }}>
                  <Typography sx={{ color: subtextColor, fontSize: "12px", fontWeight: 500 }}>{formatTime(currentTime)}</Typography>
                  <Typography sx={{ color: subtextColor, fontSize: "12px", fontWeight: 500 }}>{formatTime(duration)}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 2, mt: "auto" }}>
                <IconButton onClick={handleRewind10} sx={{ color: textColor, bgcolor: buttonBgColor, width: 54, height: 54 }}><MdReplay10 size={28} /></IconButton>
                <Box onClick={togglePlay} sx={{ flex: 1, height: 62, bgcolor: playButtonBg, borderRadius: 31, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.15)", transition: "all 0.2s ease-in-out", "&:active": { opacity: 0.8, transform: "scale(0.97)" } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, zIndex: 1, color: playButtonText }}>
                    {isPlaying ? <FaPause size={18} /> : <FaPlay size={16} style={{ marginLeft: "2px" }} />}
                    <Typography sx={{ fontWeight: 700, fontSize: "16px", letterSpacing: "-0.2px" }}>{isPlaying ? "Пауза" : "Слушать"}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton onClick={handleForward10} sx={{ color: textColor, bgcolor: buttonBgColor, width: 54, height: 54 }}><MdForward10 size={28} /></IconButton>
                  <IconButton onClick={onNext} sx={{ color: textColor, bgcolor: buttonBgColor, width: 54, height: 54 }}><FastForwardIcon sx={{ fontSize: 26 }} /></IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Slide>
  );
};

export const DesktopPlayer = ({ 
  open, onClose, track, isPlaying, togglePlay, currentTime, duration, onSeek, 
  onNext, onPrev, lyrics, activeIndex, queue, removeFromQueue, playTrack, activePlaylist, 
  showQueue, setShowQueue, volume, setVolume, audioRef 
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  
  const hasLyrics = lyrics && lyrics.length > 0 && lyrics[0].text !== "Lyrics not available";
  const isSpecialMode = hasLyrics && lyrics[activeIndex]?.special;

  const solidInfo = useMemo(() => track ? SOLID_BG_TRACKS.find(t => t.title.toLowerCase() === track.title?.toLowerCase()) : null, [track]);
  
  const isSolidBg = !!solidInfo;
  const bgColor = solidInfo?.color || "#000000";

  const isLight = isSolidBg && checkIsLight(bgColor);
  const primaryColor = isLight ? "#000000" : "#ffffff";
  const secondaryColor = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.5)";
  const btnBgColor = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const backgroundUrl = track?.coverflow || track?.cover || "/1.png";
  
  useEffect(() => { if (!isSeeking) setSliderValue(currentTime); }, [currentTime, isSeeking]);

  if (!open || !track) return null;

  return (
    <Slide direction="up" in={open} timeout={500}>
      <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, bgcolor: isSolidBg ? bgColor : "#000", overflow: "hidden", transition: "background-color 0.8s ease" }}>
        
       <Box sx={{ opacity: isSpecialMode ? 0 : 1, transition: "opacity 0.6s ease" }}>
          <BlurredCoverBackground 
            cover={backgroundUrl} 
            isLyricsMode={hasLyrics} 
            focusMode={focusMode} 
            isSolid={isSolidBg} 
            solidColor={bgColor} 
          />
       </Box>
        
        <Box sx={{ position: "absolute", top: 40, right: 40, zIndex: 50, display: "flex", gap: 2, opacity: isSpecialMode ? 0 : 1, pointerEvents: isSpecialMode ? "none" : "auto", transition: "opacity 0.4s ease" }}>
          {queue.length > 0 && (
            <IconButton onClick={() => setShowQueue(!showQueue)} sx={{ color: primaryColor, bgcolor: btnBgColor, position: 'relative' }}>
              <QueueIcon />
              <Typography sx={{ position: 'absolute', top: -2, right: -2, fontSize: 11, color: '#ed5d19', fontWeight: 'bold' }}>{queue.length}</Typography>
            </IconButton>
          )}
          <IconButton onClick={onClose} sx={{ color: primaryColor, bgcolor: btnBgColor, mr: 3 }}><DownIcon /></IconButton>
        </Box>

        {hasLyrics && (
          <Box sx={{ width: "60%", height: "100%", pr: { md: 5, lg: 1 }, pl: 0, display: "flex", alignItems: "center", position: "absolute", left: 0, ml: 11, transition: "all 1s ease", zIndex: 5 }}>
            <LyricsView lyrics={lyrics} activeIndex={activeIndex} onSeek={onSeek} isMobile={false} focusMode={focusMode} currentTime={currentTime} isLight={isLight} trackTitle={track?.title}  />
          </Box>
        )}

        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, height: "100%", display: "flex", alignItems: 'self-end', pointerEvents: "none" }}>
          <QueueModal open={showQueue} onClose={() => setShowQueue(false)} queue={queue} removeFromQueue={removeFromQueue} playTrack={playTrack} activePlaylist={activePlaylist} />
          
          <Box sx={{ width: hasLyrics ? "45%" : "100%", transition: "all 0.6s cubic-bezier(0.33, 1, 0.68, 1)", visibility: isSpecialMode ? "hidden" : "visible", mb: 5, ml: 10, opacity: isSpecialMode ? 0 : (focusMode ? 0.1 : 1), display: 'flex', alignItems: 'center', gap: 3, pointerEvents: "auto" }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box component="img" src={track.cover || "/1.png"} sx={{ height: "110px", aspectRatio: "1/1", borderRadius: isSolidBg ? 0 : 2, mb: 2, transition: "all 0.5s ease", objectFit: "cover" }} />
                <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', ml: 0.5, mt: 9 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: primaryColor, mb: -0.3, transition: "color 0.5s", fontFamily: 'var(--font-sf-rounded), sans-serif' }}>{track.title}</Typography>
                  <Typography variant="body1" sx={{ color: secondaryColor, transition: "color 0.5s", mb: 1, fontFamily: 'var(--font-sf-rounded), sans-serif' }} noWrap>{track.genre}</Typography>
                </Box>
             </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, ml: 'auto', mb: 10, mr: 10, pointerEvents: "auto" }}>
            <CircularPlayButton isPlaying={isPlaying} togglePlay={togglePlay} progress={duration ? currentTime / duration : 0} primaryColor={primaryColor} />
            <FastForward onClick={onNext} sx={{ fontSize: 40, color: primaryColor, cursor: "pointer" }} />
          </Box>
        </Box>
      </Box>
    </Slide>
  );
};


const AudioPlayer = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { activePlaylist, currentIndex, isPlaying } = useSelector((s) => s.player);
  const track = activePlaylist && currentIndex != null ? activePlaylist[currentIndex] : null;
  
  const likedTracksArr = useSelector((s) => s.player.likedTrackIds);
  const likedTrackIds = useMemo(() => new Set(likedTracksArr || []), [likedTracksArr]);

  const queue = [];
  const removeFromQueue = () => {};
  const playTrack = () => {};

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const wetGainRef = useRef(null); 
  const bassBoostNodeRef = useRef(null);
  const masterGainRef = useRef(null); 

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullOpen, setIsFullOpen] = useState(false);
  const [lyricsMode, setLyricsMode] = useState(false); 
  const [volume, setVolume] = useState(1);
  const [showQueue, setShowQueue] = useState(false);
  
  const [bassBoost] = useState(5); 
  const [isSpatial] = useState(true);

  const currentPercentage = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (audioRef.current && !masterGainRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const lyrics = useMemo(() => {
    if (!track) return [];
    const title = track.title?.toLowerCase() || "";
    
    const foundKey = Object.keys(LYRICS_MAP).find(key => title.includes(key));
    if (foundKey) {
      return LYRICS_MAP[foundKey];
    }
    
    return track.lyrics || [];
  }, [track]);

  const activeIndex = useMemo(() => {
    if (!lyrics.length) return 0;
    const offset = 0.2;
    for (let i = 0; i < lyrics.length; i++) {
        const cur = lyrics[i].time, next = lyrics[i+1]?.time || Infinity;
        if ((currentTime + offset) >= cur && (currentTime + offset) < next) return i;
    }
    return 0;
  }, [lyrics, currentTime]);

  useEffect(() => {
    if (!track || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.title,
      artist: track.genre + " - AtomGlide.com" || 'Unknown Artist',
      album: 'AtomGlide Music',
      artwork: [
        { src: track.cover || '/1.png', sizes: '96x96', type: 'image/png' },
        { src: track.cover || '/1.png', sizes: '128x128', type: 'image/png' },
        { src: track.cover || '/1.png', sizes: '512x512', type: 'image/png' },
      ]
    });
    navigator.mediaSession.setActionHandler('play', () => dispatch(togglePlay()));
    navigator.mediaSession.setActionHandler('pause', () => dispatch(togglePlay()));
    navigator.mediaSession.setActionHandler('previoustrack', () => dispatch(prevTrack()));
    navigator.mediaSession.setActionHandler('nexttrack', () => dispatch(nextTrack()));
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (audioRef.current && details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime;
        setCurrentTime(details.seekTime);
      }
    });
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [track, dispatch]);

  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    const ms = navigator.mediaSession;
    if (!ms || !ms.setPositionState || !audioRef.current) return;
    const isVaildNumber = (num) => typeof num === 'number' && Number.isFinite(num) && num >= 0;
    if (isVaildNumber(currentTime) && isVaildNumber(duration) && duration > 0) {
      try {
        const safePosition = Math.min(currentTime, duration);
        ms.setPositionState({ duration: duration, playbackRate: Math.max(audioRef.current.playbackRate || 1, 0), position: safePosition });
      } catch (error) { console.warn("MediaSession setPositionState failed:", error); }
    }
  }, [currentTime, duration]);

  useEffect(() => {
    if (!audioRef.current || audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      
      const source = ctx.createMediaElementSource(audioRef.current);
      
      const bBoost = ctx.createBiquadFilter();
      bBoost.type = "lowshelf"; bBoost.frequency.value = 150; bBoost.gain.value = bassBoost;
      bassBoostNodeRef.current = bBoost;
      
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const delay = ctx.createDelay();
      wetGainRef.current = wetGain;
      
      delay.delayTime.value = 0.025; 
      wetGain.gain.value = isSpatial ? 0.7 : 0;
      
      const masterGain = ctx.createGain();
      masterGainRef.current = masterGain;

      source.connect(bBoost); bBoost.connect(dryGain); bBoost.connect(delay);
      delay.connect(wetGain); 
      
      dryGain.connect(masterGain);
      wetGain.connect(masterGain);
      
      masterGain.connect(ctx.destination);
    } catch (e) { console.error("Audio Context Error:", e); }
  }, [bassBoost, isSpatial]);

  const fadeAudio = useCallback((fadeIn, fadeDuration = 0.5) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const gainNode = masterGainRef.current;
    const now = ctx.currentTime;
    
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    
    if (fadeIn) {
      gainNode.gain.linearRampToValueAtTime(1, now + fadeDuration);
    } else {
      gainNode.gain.linearRampToValueAtTime(0.001, now + fadeDuration); 
    }
  }, []);

  useEffect(() => {
    if (track && audioRef.current) {
      const baseUrl = 'https://atomglidedev.ru';
      const fullSrc = `${baseUrl}/stream/${track.trackname || track.src}`;

      if (audioRef.current.src !== fullSrc) {
        audioRef.current.src = fullSrc;
        audioRef.current.load();
        
        if (isPlaying) {
          audioRef.current.play()
            .then(() => fadeAudio(true, 0.4))
            .catch(console.error);
        }
      }
    }
  }, [track]); 

  useEffect(() => {
    if (!audioRef.current || !audioRef.current.src) return;
    
    if (isPlaying) {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current.play()
        .then(() => fadeAudio(true, 0.4))
        .catch(() => {});
    } else {
      fadeAudio(false, 0.4);
      setTimeout(() => {
        if (audioRef.current && !isPlaying) {
          audioRef.current.pause();
        }
      }, 400); 
    }
  }, [isPlaying, fadeAudio]);

  if (!track) return null;

  const handleAudioError = (e) => {
    const currentSrc = e.currentTarget.src;
    const baseUrlLocal = 'https://atomglidedev.ru';
    const baseUrlProd = 'https://atomglidedev.ru';

    if (currentSrc.includes(baseUrlLocal)) {
      console.warn("Локальный файл не найден, переключаюсь на продакшн...");
      const fallbackSrc = currentSrc.replace(baseUrlLocal, baseUrlProd);
      audioRef.current.src = fallbackSrc;
      if (isPlaying) {
        audioRef.current.play().then(() => fadeAudio(true, 0.4)).catch(console.error);
      }
    } else {
      console.error("Ошибка воспроизведения даже на удаленном сервере:", e);
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} crossOrigin="anonymous" 
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => { 
          fadeAudio(false, 0.1);
          if (audioRef.current) {
            audioRef.current.src = ""; 
          }
          dispatch(nextTrack()); 
        }}
        onError={handleAudioError} 
      />

      <Box sx={{ 
        position: "fixed", 
        bottom: isMobile ? 95 : 30, 
        width: isMobile ? 'calc(100% - 25px)' : '600px',
        pt: 0,
        height: 70, 
        background: "rgba(255, 255, 255, 0.15)", 
        backdropFilter: "blur(25px)", 
        WebkitBackdropFilter: "blur(25px)", 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        borderRadius: "10px", 
        ml: 1.5,
        zIndex: 9000, 
        display: 'flex', 
        alignItems: 'center', 
        overflow: 'hidden',
      }}>
        <Slider 
          value={currentTime} min={0} max={duration || 1} 
          onChange={(_, v) => { if(audioRef.current) audioRef.current.currentTime = v; setCurrentTime(v); }} 
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 1, cursor: 'pointer', '& .MuiSlider-thumb': { display: 'none' } }} 
        />

        <Box 
          onClick={() => setIsFullOpen(true)}
          sx={{ position: 'relative', zIndex: 2, flex: 1, display: "flex", alignItems: "center", px: 2, height: '100%', cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <Stack direction="row" spacing={1} sx={{ position: 'relative', zIndex: 10, pr: 2 }}>
            <IconButton onClick={(e) => { e.stopPropagation(); dispatch(prevTrack()); }} sx={{ color: "white", '&:hover': { background: 'rgba(255,255,255,0.1)' } }}><PreviousIcon /></IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); dispatch(togglePlay()); }} sx={{ color: "white", '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
              {isPlaying ? <FaPause size={20} color="white" /> : <FaPlay size={20} color="white" />}
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); dispatch(nextTrack()); }} sx={{ color: "white", '&:hover': { background: 'rgba(255,255,255,0.1)' } }}><NextIcon /></IconButton>
          </Stack>
          
          <Box sx={{
            bgcolor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', width: '60%', position: 'relative', overflow: 'hidden', p: 1, pr: 2, borderRadius: 2,
            '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, height: '2px', width: `${currentPercentage}%`, backgroundColor: 'rgba(255, 255, 255, 0.8)', transition: 'width 0.1s linear' }
          }}>
            <Box component="img" src={track.cover || "/1.png"} sx={{ width: 38, height: 38, borderRadius: "5px", objectFit: 'cover' }} />
            <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <Typography noWrap fontWeight={600} fontSize="0.75rem" color="white" sx={{ lineHeight: 1.2 }}>{track.title}</Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.6)" noWrap sx={{ lineHeight: 1.2, marginTop: '4px' }}>{track.genre}</Typography>
            </Box>
            {DOLBY_TRACKS.some(t => t.toLowerCase() === track.title?.toLowerCase()) && (
              <SiDolby style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginLeft: '12px', flexShrink: 0 }} />
            )}
          </Box>
          <IconButton onClick={(e) => { e.stopPropagation(); setLyricsMode(true); setIsFullOpen(true); }} sx={{ color: 'white', ml: isMobile ? 1.5 : 3 }}><LyricsIcon /></IconButton>
        </Box>
      </Box>

      {isMobile ? (
        <MobilePlayer 
          open={isFullOpen} 
          onClose={() => setIsFullOpen(false)} 
          track={track} 
          isPlaying={isPlaying} 
          togglePlay={() => dispatch(togglePlay())} 
          currentTime={currentTime} 
          duration={duration} 
          onSeek={(t) => { 
            if (audioRef.current) audioRef.current.currentTime = t; 
            setCurrentTime(t); 
          }} 
          onNext={() => dispatch(nextTrack())} 
          onPrev={() => dispatch(prevTrack())} 
          lyrics={lyrics}
          likedTrackIds={likedTrackIds} 
        />
      ) : (
        <DesktopPlayer 
          open={isFullOpen} 
          onClose={() => setIsFullOpen(false)} 
          track={track} 
          isPlaying={isPlaying} 
          togglePlay={() => dispatch(togglePlay())} 
          currentTime={currentTime} 
          duration={duration} 
          onSeek={(t) => { if(audioRef.current) audioRef.current.currentTime = t; setCurrentTime(t); }} 
          onNext={() => dispatch(nextTrack())} 
          onPrev={() => dispatch(prevTrack())} 
          lyrics={lyrics} 
          activeIndex={activeIndex} 
          queue={queue} 
          removeFromQueue={removeFromQueue} 
          playTrack={playTrack} 
          activePlaylist={activePlaylist}
          showQueue={showQueue} 
          setShowQueue={setShowQueue}
          volume={volume} 
          setVolume={setVolume} 
          audioRef={audioRef}
        />
      )}
    </>
  );
};

export default AudioPlayer;


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/