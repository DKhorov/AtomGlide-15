import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow 
} from '@mui/material';

import midper from './mid.png';
import w from './w.png';
import y from './y.png';
import xc from './Frame 363.png';
import fr from './fr.png';



const AppleIcon = ({ width = 24, height = 24, color = "currentColor" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M16.3197 9.17646C16.2922 7.3755 17.7853 6.46743 17.859 6.42145C16.993 5.15852 15.6534 4.9664 15.1768 4.94503C14.043 4.82676 12.9463 5.61483 12.3663 5.61483C11.7862 5.61483 10.8872 4.96541 9.93297 4.98579C8.68817 5.00618 7.53123 5.71447 6.89209 6.82944C5.5843 9.10261 6.55998 12.4636 7.82888 14.3061C8.44964 15.2046 9.18047 16.2166 10.1419 16.1758C11.0664 16.1341 11.4253 15.5683 12.5186 15.5683C13.612 15.5683 13.9315 16.1758 14.9084 16.1555C15.9189 16.1341 16.5492 15.2444 17.1689 14.3449C17.8863 13.3032 18.1824 12.2858 18.1999 12.2359C18.1611 12.2206 16.3472 11.5306 16.3197 9.17646ZM14.9436 3.25056C15.4547 2.63293 15.7958 1.76156 15.7022 0.886108C14.9407 0.916684 14.0041 1.39366 13.4735 2.00008C13.0006 2.53516 12.5902 3.4259 12.7025 4.28096C13.5539 4.34721 14.4326 3.8682 14.9436 3.25056Z" />
  </svg>
);

const AndroidIcon = ({ width = 24, height = 24, color = "currentColor" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.523 15.3414C17.523 16.2084 16.8202 16.9112 15.9532 16.9112H8.0468C7.17978 16.9112 6.477 16.2084 6.477 15.3414V10.6586H17.523V15.3414ZM17.2088 8.4419L18.6653 5.91864C18.7831 5.71448 18.7135 5.45331 18.5093 5.3355C18.3051 5.21769 18.044 5.28728 17.9262 5.49144L16.4388 8.06734C15.1116 7.46059 13.606 7.11475 12 7.11475C10.394 7.11475 8.88842 7.46059 7.56118 8.06734L6.07384 5.49144C5.95603 5.28728 5.69486 5.21769 5.4907 5.3355C5.28654 5.45331 5.21694 5.71448 5.33475 5.91864L6.79124 8.4419C3.89675 10.027 1.954 13.0649 1.636 16.6341H22.364C22.046 13.0649 20.1032 10.027 17.2088 8.4419ZM8.847 13.5686C8.25299 13.5686 7.771 13.0866 7.771 12.4926C7.771 11.8986 8.25299 11.4166 8.847 11.4166C9.441 11.4166 9.923 11.8986 9.923 12.4926C9.923 13.0866 9.441 13.5686 8.847 13.5686ZM15.153 13.5686C14.559 13.5686 14.077 13.0866 14.077 12.4926C14.077 11.8986 14.559 11.4166 15.153 11.4166C15.747 11.4166 16.229 11.8986 16.229 12.4926C16.229 13.0866 15.747 13.5686 15.153 13.5686Z" />
  </svg>
);

const FlutterIcon = ({ width = 24, height = 24, color = "currentColor" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.314 0L2.3 12L5.871 15.571L21.457 0H14.314Z" fill={color}/>
    <path d="M10.871 15.571L6.757 19.686L10.871 23.8H18.014L9.814 15.571L10.871 15.571Z" fill={color}/>
    <path d="M14.314 11.486L10.871 14.929L14.314 18.371H21.457L14.429 11.343L14.314 11.486Z" fill={color}/>
  </svg>
);

const DownloadIcon = ({ width = 24, height = 24, color = "currentColor" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 15L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const featuresData = [
  {
    id: 1,
    title: "Локальная БД",
    description: "Мгновенный доступ к информации. Все данные хранятся на вашем устройстве, обеспечивая максимальную автономность, безопасность и приватность.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPpYnbJTvN4q7WinjryvgtBpR4S3HZ7OkoGg&s"
  },
  {
    id: 2,
    title: "Созданно на Flutter",
    description: "Ваше пространство в виде адаптивных цветных блоков. Наглядная визуализация идей и задач в эстетике Apple Shortcuts.",
    image: "data:image/png;base64,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"
  },
  {
    id: 3,
    title: "Быстрое управление",
    description: "Никаких лишних кликов и запутанных меню. Интуитивные жесты и зажатие элементов для мгновенного администрирования.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2670&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Изоляция и фокус",
    description: "Режим глубокого погружения. Полное отсечение внешнего цифрового шума и дофаминовых ловушек для чистой работы.",
    image: "https://images.unsplash.com/photo-1497215848135-c28a8d1162af?q=80&w=2670&auto=format&fit=crop"
  }
];

const desktopFeaturesData = [
  {
    title: "Мгновенное удаление",
    description: "Зачем тратить время на контекстные меню? Просто зажмите карточку заметки и удалите её в одно действие. Быстро и эффективно."
  },
  {
    title: "Абсолютная автономность",
    description: "Локальная база данных позволяет воркспейсу полноценно функционировать без доступа к сети. Синхронизация запустится автоматически при подключении."
  },
  {
    title: "Эстетика Bento-Grid",
    description: "Заметки структурируются в виде стильных разноцветных кубиков. Знакомый, выверенный дизайн, вдохновленный интерфейсом Apple Shortcuts."
  },
  {
    title: "Оптимизация Impeller",
    description: "Потребление ресурсов сведено к минимуму на уровне графического движка. Midper бережет заряд батареи вашего MacBook или Android-устройства."
  }
];
const techStack = [
  "AtomGlide.com", "AtomGlide Music", "AtomGlide Journal", "AtomGlide Essentials", "AtomGlide Wallet", 
  "AtomGlide Store", "AtomGlide Sea", "AtomGlide Developer", "AtomGlide Workspace", "Geromik", "Midper","DHub Federation", "DHub Копилка"
];

const fonts = ['Times New Roman', 'Inter', 'Courier New', 'Georgia', 'Verdana'];


const StickySection = ({ title, children, bgColor = '#262429', color = '#EFECE3', id }) => (
  <Box id={id} sx={{ 
    display: 'flex', 
    flexDirection: { xs: 'column', md: 'row' }, 
    width: '100%', 
    backgroundColor: bgColor, 
    color: color,
    py: { xs: 8, md: 15 },
    px: { xs: 3, md: 10 },
    borderTop: '1px solid rgba(255,255,255,0.05)',
    position: 'relative'
  }}>
    <Box sx={{ 
      width: { xs: '100%', md: '300px' }, 
      flexShrink: 0,
      mb: { xs: 4, md: 0 }
    }}>
      <Box sx={{ 
        position: 'sticky', 
        top: '100px', 
      }}>
        <Typography sx={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, mb: 1 }}>
          Раздел
        </Typography>
        <Typography sx={{ fontSize: '32px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
          {title}
        </Typography>
      </Box>
    </Box>
    
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {children}
    </Box>
  </Box>
);

const Marquee = () => {
  return (
    <Box sx={{
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#262429',
      py: 2,
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      whiteSpace: 'nowrap',
      alignItems: 'center'
    }}>
      <Box sx={{
        display: 'inline-block',
        animation: 'marquee 40s linear infinite',
        '@keyframes marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }}>
        {[...techStack, ...techStack, ...techStack, ...techStack].map((tech, index) => (
          <Typography 
            key={index} 
            component="span" 
            sx={{ 
              color: 'rgba(239, 236, 227, 0.4)', 
              fontSize: '18px', 
              fontWeight: 600,
              letterSpacing: '0px',
              mx: 2,
              fontFamily: 'Inter, sans-serif',
              transition: 'color 0.3s ease',
              '&:hover': {
                color: '#EFECE3'
              }
            }}
          >
            {tech}
            <Box component="span" sx={{ color: '#ff6b00', ml: 4 }}>/</Box>
          </Typography>
        ))}
      </Box>
    </Box>
  );
};


export const Midper = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [typedText, setTypedText] = useState('');
  const fullText = 'Midper.';
  
  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 250);
    return () => clearInterval(typing);
  }, []);

  const [fontIndex, setFontIndex] = useState(0);
  useEffect(() => {
    const fontCycle = setInterval(() => {
      setFontIndex(prev => (prev + 1) % fonts.length);
    }, 4000);
    return () => clearInterval(fontCycle);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 0, left: 0, 
      width: '100vw', height: '100vh', 
      overflowY: 'auto', overflowX: 'hidden',
      backgroundColor: '#EFECE3', 
      fontFamily: 'Inter, sans-serif',
      zIndex: 10,
      '&::-webkit-scrollbar': { width: '8px' },
      '&::-webkit-scrollbar-track': { background: '#262429' },
      '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '4px' },
      '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.4)' },
    }}>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{
          borderBottom: '1px solid rgba(255,255,255,0.05)', 
          width: '100%', 
          height: '60px', 
          backgroundColor: 'rgba(38, 36, 41, 0.8)', 
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          px: { xs: 2, md: 4 }
        }}>
          <Typography sx={{ color: '#ffffff', fontSize: '20px', fontWeight: 900 }}>
            AtomGlide <span style={{ fontWeight: 100 }}>Workspace</span>
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Button onClick={() => scrollToSection('about')} sx={{ color: '#EFECE3', textTransform: 'none', opacity: 0.7, '&:hover': { opacity: 1 } }}>О проекте</Button>
            <Button onClick={() => scrollToSection('desktop')} sx={{ color: '#EFECE3', textTransform: 'none', opacity: 0.7, '&:hover': { opacity: 1 } }}>Desktop</Button>
            <Button onClick={() => scrollToSection('flutter')} sx={{ color: '#EFECE3', textTransform: 'none', opacity: 0.7, '&:hover': { opacity: 1 } }}>Технологии</Button>
            <Button 
              onClick={() => scrollToSection('download')}
              variant="contained" 
              sx={{ 
                backgroundColor: '#EFECE3', 
                color: '#262429', 
                borderRadius: '8px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#ffffff', boxShadow: 'none' }
              }}
            >
              Скачать
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column',
        pt: { xs: 6, md: 15 }, 
        pb: 10 
      }}>
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ 
            color: '#262429', 
            fontSize: { xs: '60px', md: '120px' }, 
            fontWeight: 200, 
            fontFamily: 'Times New Roman', 
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            letterSpacing: '-0.04em'
          }}>
            {typedText}
            <Box component="span" sx={{
              width: { xs: '4px', md: '6px' }, 
              height: { xs: '50px', md: '90px' },
              backgroundColor: '#ff6b00', 
              ml: 1,
              animation: 'blink 1s step-end infinite',
              '@keyframes blink': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } }
            }} />
          </Typography>
          <Typography sx={{ 
            color: '#262429', 
            fontSize: { xs: '18px', md: '24px' }, 
            fontWeight: 300, 
            fontFamily: 'Inter, sans-serif', 
            textAlign: 'center', 
            mt: 2,
            opacity: 0.8
          }}>Space for your thoughts to breathe.</Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
             <Button 
                onClick={() => scrollToSection('download')}
                sx={{ 
                  backgroundColor: '#262429', color: '#EFECE3', 
                  px: 4, py: 1.5, borderRadius: '12px', 
                  fontSize: '16px', fontWeight: 600, textTransform: 'none',
                  '&:hover': { backgroundColor: '#1a181c' }
                }}
              >
                Установить Midper
              </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 8, position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '60vw', height: '40vh',
            zIndex: -1
          }} />
          <img src={midper} alt="Midper Interface" loading="lazy" decoding="async" style={{ height: "auto", maxHeight: "700px", width: "90vw", objectFit: "contain" }} />
        </Box>
        <Box sx={{ mt: 5 }}>
          <img src={w} alt="W Element" loading="lazy" decoding="async" style={{ height: "auto", maxHeight: "130px", width: "90vw", objectFit: "contain", opacity: 0.7 }} />
        </Box>
      </Box>

      <Marquee />

      <StickySection id="about" title="О проекте" bgColor="#262429" color="#EFECE3">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 5, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: { xs: '36px', md: '50px' }, mb: 4, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Твои мысли всегда в одной ленте
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography sx={{ fontSize: '18px', opacity: 0.8, lineHeight: 1.6, fontWeight: 300 }}>
                В эпоху цифрового перенасыщения и дешевого дофамина способность концентрироваться стала редким ресурсом. Midper создан не как очередная записная книжка, а как инструмент для архитектуры собственного сознания.
              </Typography>
              <Typography sx={{ fontSize: '18px', opacity: 0.8, lineHeight: 1.6, fontWeight: 300 }}>
                Ничего кроме твоих мыслей. Никаких отвлекающих факторов, уведомлений или социальных ловушек. Просто чистое пространство для твоего разума, где каждая идея может развиваться в своем темпе.
              </Typography>
              <Box sx={{ 
                borderLeft: '4px solid #ff6b00', 
                pl: 3, py: 1, mt: 2,
                backgroundColor: 'rgba(255,107,0,0.05)',
                borderRadius: '0 8px 8px 0'
              }}>
                <Typography sx={{ fontSize: '16px', fontStyle: 'italic', opacity: 0.9 }}>
                  Simplicity is the ultimate sophistication. - Leonardo da Vinci
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <img src={y} alt="Midper UI Concept" loading="lazy" decoding="async" style={{ width: '100%', maxWidth: '400px', borderRadius: '24px' }} />
          </Box>
        </Box>
      </StickySection>

    

      <StickySection title="Концепция" bgColor="#EFECE3" color="#262429">
        <Typography sx={{ fontSize: { xs: '36px', md: '50px' }, mb: 4, fontWeight: 600, letterSpacing: '-0.02em' }}>
          Инструмент должен подстраиваться
        </Typography>
        <Box sx={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          minHeight: '40vh', textAlign: 'center', p: { xs: 3, md: 8 },
          backgroundColor: '#ffffff',
          border: '1px solid rgba(38,36,41,0.1)', borderRadius: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
        }}>
          <Typography sx={{ 
            fontSize: { xs: '24px', md: '44px' }, 
            lineHeight: 1.3,
            transition: 'font-family 0.6s ease-in-out',
            fontFamily: fonts[fontIndex],
            color: '#262429',
            maxWidth: '1000px'
          }}>
            Вы можете изменять свои мысли так же легко, как меняется шрифт на этом тексте. 
            Под капотом — мощный редактор, который позволяет вам фокусироваться на содержании. 
            Просто начните писать, и ваши идеи будут готовы к развитию.
          </Typography>
        </Box>
      </StickySection>

      <StickySection id="desktop" title="Среда обитания" bgColor="#262429" color="#EFECE3">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: { xs: '40px', md: '64px' }, fontWeight: 600, letterSpacing: '-0.03em', mb: 2 }}>
              Midper Desktop
            </Typography>
            <Typography sx={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', mx: 'auto', fontWeight: 300 }}>
              Полноценное приложение для вашей ОС. Максимальная производительность, интеграция с системой и работа без подключения к сети.
            </Typography>
          </Box>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <Box sx={{ 
              width: '100%', maxWidth: '1000px', 
              backgroundColor: '#1a181c', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
            }}>
         
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', backgroundColor: '#1E1D21' }}>
                 <img src={fr} alt="Midper Desktop UI" loading="lazy" style={{ width: '100%', height: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mt: 2 }}>
            {desktopFeaturesData.map((item, idx) => (
              <Box key={idx} sx={{ 
                p: 3, 
                backgroundColor: 'rgba(255,255,255,0.02)', 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.05)' 
              }}>
                <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', mb: 1 }}>{item.title}</Typography>
                <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item.description}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </StickySection>

      {/* 6. Блок Скачать (НОВЫЙ) */}
     <StickySection id="download" title="Загрузка" bgColor="#1a181c" color="#EFECE3">
  <Typography sx={{ fontSize: { xs: '28px', sm: '36px', md: '50px' }, mb: { xs: 4, md: 6 }, fontWeight: 600, letterSpacing: '-0.02em' }}>
    Установите на свои устройства
  </Typography>

  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 3, md: 4 } }}>
    
    {/* macOS Карточка */}
    <Box sx={{ 
      p: { xs: 2.5, sm: 4, md: 6 }, 
      backgroundColor: '#262429', 
      borderRadius: '32px', 
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden'
    }}>
      <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.02, pointerEvents: 'none' }}>
        <AppleIcon width={200} height={200} color="#ffffff" />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AppleIcon width={36} height={36} color="#ffffff" />
        <Typography sx={{ fontSize: { xs: '26px', md: '32px' }, fontWeight: 700 }}>macOS</Typography>
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, mb: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Версия</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>1.0.0 </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Архитектура</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>Apple Silicon / Intel 64-bit</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Требования</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>macOS 12.0 Monterey и новее</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>ОЗУ / Память</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>от 4 GB / 150 MB на диске</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Рендеринг холста</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' }, color: '#54C5F8' }}>Impeller (Metal API)</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Протестировано на</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' }, lineHeight: 1.4 }}>MacBook Pro M4 Pro, MacBook Air M2, Mac Pro M3 Max</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Лицензия</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>Proprietary (AtomGlide Essentials)</Typography>
        </Box>
      </Box>

      <Button 
        component="a"
        href="midper.dmg" 
        download="atomglide_midper.dmg" 
        variant="contained" 
        fullWidth
        startIcon={<DownloadIcon />}
        sx={{ 
          backgroundColor: '#ffffff', color: '#000000', 
          py: 2, borderRadius: '16px', fontSize: '16px', fontWeight: 600,
          textTransform: 'none', boxShadow: 'none', mt: 'auto',
          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          '&:hover': { backgroundColor: '#EFECE3', boxShadow: 'none' }
        }}
      >
        Скачать .dmg
      </Button>
    </Box>

    <Box sx={{ 
      p: { xs: 2.5, sm: 4, md: 6 }, 
      backgroundColor: '#262429', 
      borderRadius: '32px', 
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden'
    }}>
      <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.02, pointerEvents: 'none' }}>
        <AndroidIcon width={200} height={200} color="#ffffff" />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AndroidIcon width={36} height={36} color="#3DDC84" />
        <Typography sx={{ fontSize: { xs: '26px', md: '32px' }, fontWeight: 700 }}>Android</Typography>
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, mb: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Версия</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>1.0.0 Beta (APK)</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Архитектура</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>ARM64-v8a / armeabi-v7a</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Требования</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>Android 5.0 (API 21) и новее</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>ОЗУ / Вес APK</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>от 2 GB / ~32 MB</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Локальная база</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>Isar Database (NoSQL, Кэширование)</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Ограничения совместимости</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '13px', sm: '14px' }, color: '#ff6b00', lineHeight: 1.4 }}>
            Samsung S24, S25 FE — по возможности сожгите данное устройство.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Протестировано на</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' }, lineHeight: 1.4 }}>Samsung S23/S24 Ultra, Google Pixel 9 Pro XL</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1.5, gap: 0.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: { xs: '13px', sm: '14px' } }}>Поддерживаемые девайсы</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: { xs: '14px', sm: '15px' } }}>Любые устройства от 2016 года</Typography>
        </Box>
      </Box>

      <Button 
        component="a"
        href="https://github.com/DKhorov/Midper/releases/download/poio/midper.apk" 
        download="atomglide_midper.apk" 
        variant="contained" 
        fullWidth
        startIcon={<DownloadIcon color="#262429" />}
        sx={{ 
          backgroundColor: '#3DDC84', color: '#262429', 
          py: 2, borderRadius: '16px', fontSize: '16px', fontWeight: 600,
          textTransform: 'none', boxShadow: 'none', mt: 'auto',
          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          '&:hover': { backgroundColor: '#2ebc6e', boxShadow: 'none' }
        }}
      >
        Скачать .apk
      </Button>
    </Box>

  </Box>
</StickySection>
  





<StickySection title="Версии" bgColor="#EFECE3" color="#262429">
  <Box sx={{ 
    p: { xs: 2, md: 4 }, 
    border: '1px solid rgba(38,36,41,0.08)', 
    borderRadius: '32px', 
    width: "100%", 
    mx: 'auto' 
  }}>
    <TableContainer>
      <Table sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <TableBody>
          
          <TableRow sx={{ 
            borderBottom: '1px solid rgba(38,36,41,0.08)',
            '&:hover': { backgroundColor: 'rgba(38,36,41,0.02)' },
            transition: 'background-color 0.15s ease'
          }}>
            <TableCell sx={{ pl: 0, py: 2.5, borderBottom: 'none' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#262429' }}>
                Midperfor macOS
              </Typography>
            </TableCell>
            <TableCell sx={{ py: 2.5, borderBottom: 'none', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '15px', color: 'rgba(38,36,41,0.6)', fontWeight: 500 }}>
                                v1.0.0 Beta
              </Typography>
            </TableCell>
            <TableCell sx={{ pr: 0, py: 2.5, borderBottom: 'none', textAlign: 'right' }}>
              <Typography sx={{ fontSize: '14px', color: 'rgba(38,36,41,0.4)' }}>
                Май 2026
              </Typography>
            </TableCell>
          </TableRow>

          <TableRow sx={{ 
            borderBottom: 'none',
            '&:hover': { backgroundColor: 'rgba(38,36,41,0.02)' },
            transition: 'background-color 0.15s ease'
          }}>
            <TableCell sx={{ pl: 0, py: 2.5, borderBottom: 'none' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#262429' }}>
                Midper for Android
              </Typography>
            </TableCell>
            <TableCell sx={{ py: 2.5, borderBottom: 'none', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '15px', color: '#2ebc6e', fontWeight: 500 }}>
                v1.0.0 Beta
              </Typography>
            </TableCell>
            <TableCell sx={{ pr: 0, py: 2.5, borderBottom: 'none', textAlign: 'right' }}>
              <Typography sx={{ fontSize: '14px', color: 'rgba(38,36,41,0.4)' }}>
                Май 2026
              </Typography>
            </TableCell>
          </TableRow>

        </TableBody>
      </Table>
    </TableContainer>
  </Box>
</StickySection>

      <Box id="flutter" sx={{ 
        width: '100%', 
        backgroundColor: '#042B59', 
        color: '#ffffff',
        py: { xs: 8, md: 12 },
        px: { xs: 3, md: 10 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', opacity: 0.05, top: -50, right: -100, transform: 'scale(3)' }}>
          <FlutterIcon width={500} height={500} color="#ffffff" />
        </Box>

        <Box sx={{ zIndex: 2, maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            p: 2, borderRadius: '24px', mb: 4
          }}>
            <FlutterIcon width={60} height={60} color="#54C5F8" />
          </Box>
          
          <Typography sx={{ fontSize: { xs: '32px', md: '48px' }, fontWeight: 700, mb: 3 }}>
            Построено на Flutter
          </Typography>
          
          <Typography sx={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, mb: 6 }}>
            Midper написан на языке Dart с использованием фреймворка Flutter. Это позволяет нам поддерживать единую кодовую базу для всех платформ: macOS, Linux, Windows, iOS и Android. Благодаря движку рендеринга Impeller, приложение работает со стабильными 60-120 FPS, обеспечивая нативную производительность и абсолютный контроль над каждым пикселем интерфейса.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              href="https://flutter.dev" 
              target="_blank"
              variant="outlined" 
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff', 
                py: 1.5, px: 4, borderRadius: '12px', textTransform: 'none',
                '&:hover': { borderColor: '#ffffff', backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Что такое Flutter?
            </Button>
            <Button 
              href="https://dart.dev" 
              target="_blank"
              variant="outlined" 
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff', 
                py: 1.5, px: 4, borderRadius: '12px', textTransform: 'none',
                '&:hover': { borderColor: '#ffffff', backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Документация Dart
            </Button>
          </Box>
        </Box>
      </Box>

      <Box component="footer" sx={{
        width: '100%',
        backgroundColor: '#151417', 
        color: '#EFECE3',
        py: 8,
        px: { xs: 3, md: 10 },
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }, 
          gap: 6,
          mb: 6
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: '24px', fontWeight: 900 }}>
              AtomGlide <span style={{ fontWeight: 100 }}>Workspace</span>
            </Typography>
            <Typography sx={{ fontSize: '14px', opacity: 0.6, maxWidth: '300px', lineHeight: 1.6 }}>
Программное обеспечение для работы и бизнеса. Инструменты нового поколения для архивации мыслей, автоматизации задач и защиты конфиденциальных данных.            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Продукты</Typography>
            <Typography 
              component="a" 
              href="#desktop" 
              sx={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              Midper Desktop
            </Typography>
            <Typography 
              component="a" 
              href="https://atomglide.com/music" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              Atom Music
            </Typography>
            <Typography 
              component="a" 
              href="https://github.com/DKhorov/AtomMusic.git" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              EventsFlow
            </Typography>
            <Typography 
              component="a" 
              href="https://atomglide.com/wallet" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              Atom Wallet
            </Typography>
          </Box>


          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Связь</Typography>
            <Typography 
              component="a" 
              href="https://t.me/jpegweb" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              Telegram
            </Typography>
            <Typography 
              component="a" 
              href="https://t.me/dkdevelop" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              Сообщество
            </Typography>
            <Typography 
              component="a" 
              href="https://t.me/dkdevelop" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '14px', opacity: 0.6, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              Essentials Design
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          pt: 4, 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography sx={{ fontSize: '12px', opacity: 0.4 }}>
            © {new Date().getFullYear()} AtomGlide LLC
          </Typography>
                   <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography 
              component="a"
              href="https://atomglide.com/atomwiki.html"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '12px', opacity: 0.4, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              Политика конфиденциальности
            </Typography>
            <Typography 
              component="a"
              href="https://atomglide.com/atomwiki.html"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '12px', opacity: 0.4, textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { opacity: 1, color: '#ff6b00' } }}
            >
              Условия использования
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};


/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/