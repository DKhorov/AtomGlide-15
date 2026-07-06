import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../system/axios';
import { setTrack, nextTrack, prevTrack, togglePlay } from '../system/redux/playerSlice'; 
import { selectUser } from '../system/redux/slices/getme';

const COVER = "https://images.unsplash.com/photo-1549492167-27e1f4869c0d?w=800&auto=format&fit=crop&q=60";

const parseIntent = (input) => {
  const text = input.toLowerCase().trim();

  if (/(исправ|провер|ошибк|грамот|опечат|текст)/i.test(text)) {
    const payload = input.replace(/(исправь|ошибки|проверь|текст|в словах|опечатки|грамотность)/gi, '').trim();
    return { type: 'FIX_TEXT', payload: payload || input };
  }

  if (/(созда|напиш|опублик|сдела)/i.test(text) && /(пост|публикац)/i.test(text)) {
    const payload = input.replace(/(создай|напиши|опубликуй|сделай|пост|публикацию)/gi, '').trim();
    return { type: 'CREATE_POST', payload };
  }

  if (/(курс|валют|доллар|евро|переведи|конвертируй|byn|rub|usd|eur)/i.test(text) && !/(текст)/i.test(text)) {
    return { type: 'CURRENCY_RATE', payload: text };
  }

  if (/(стоп|пауз|останов|хватит|тормоз)/i.test(text)) {
    return { type: 'STOP_TRACK' };
  }

  if (/(включ|вруб|сыгра|плей|слушат)/i.test(text) && /(избран|любим|мои трек|мой трек)/i.test(text)) {
    return { type: 'PLAY_FAVORITES' };
  }

  if (/(след|следующ|дальше|скип|next|предыдущ|назад|prev)/i.test(text)) {
    if (/(предыдущ|назад|prev)/i.test(text)) {
      return { type: 'PREV_TRACK' };
    }
    return { type: 'NEXT_TRACK' };
  }

  if (/(включ|вруб|сыгра|музык|песн|трек|плей|слушат)/i.test(text)) {
    const payload = input.replace(/(включи|врубай|сыграй|музыку|песню|трек|пожалуйста|плей|вруби)/gi, '').trim();
    return { type: 'PLAY_MUSIC', payload };
  }

  return { type: 'SEARCH_POST', payload: input };
};

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const GeromikModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { id: 'initial-bot-msg-1', sender: 'bot', text: 'Дарова, ну че хочешь? Например спроси: включи музыку и я открою. Создать пост? Без проблем! Напиши мне создать пост и текст поста. Но я немного тупой, но скоро вроде буду умнее' },
    { id: 'initial-bot-msg-2', sender: 'bot', text: 'А я еще умный поиск постов. Просто напиши что тебе нужно, и я тебе найду посты под твой запрос.' }
  ]);

  const [apiRequestsLog, setApiRequestsLog] = useState([]);
  const messagesEndRef = useRef(null);
  const shortcutsRef = useRef(null);

  const shortcuts = [
    'Включи музыку', 
    'Останови музыку', 
    'Включить избранное', 
    'Курс доллара', 
    'Переведи 100 бел рублей в рос'
  ];

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => setIsRendered(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const logApiRequest = (url, method = 'GET') => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:3001${url}`;
    const timestamp = new Date().toLocaleTimeString();
    setApiRequestsLog(prev => [...prev, `[${timestamp}] ${method} -> ${fullUrl}`]);
  };

  const handleGoToPost = (postId) => {
    if (!postId) return;
    window.location.href = `/post/${postId}`;
    if (onClose) onClose();
  };

  const scrollShortcuts = (direction) => {
    if (shortcutsRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      shortcutsRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const parseBotResponseText = (text) => {
    if (!text.includes('--- Источник')) {
      return [{ type: 'text', content: text }];
    }

    const parts = text.split(/--- Источник \[ID: ([a-f0-9]+)\] ---/i);
    const result = [];
    
    if (parts[0] && parts[0].trim()) {
      result.push({ type: 'text', content: parts[0].trim() });
    }

    for (let i = 1; i < parts.length; i += 2) {
      const id = parts[i];
      let content = parts[i + 1] || '';
      
      content = content.split(/--- Источник/i)[0].trim();

      if (id && content) {
        result.push({ type: 'post', id, content });
      }
    }

    return result;
  };

  const processCommand = async (userText) => {
    const intent = parseIntent(userText);
    let botResponse = "";

    switch (intent.type) {
      case 'CURRENCY_RATE': {
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/USD');
          const data = await res.json();
          const rates = data.rates;

          const text = intent.payload;
          const matchVal = text.match(/\d+([\.,]\d+)?/);
          const amount = matchVal ? parseFloat(matchVal[0].replace(',', '.')) : null;

          if (amount) {
            let fromStr = "USD", toStr = "RUB";
            let fromRate = 1, toRate = rates.RUB;

            if (/(бел|byn)/i.test(text)) { fromStr = "BYN"; fromRate = rates.BYN; }
            else if (/(евро|eur)/i.test(text)) { fromStr = "EUR"; fromRate = rates.EUR; }
            else if (/(рос|rub)/i.test(text) || (/(руб)/i.test(text) && !/(бел)/i.test(text))) { fromStr = "RUB"; fromRate = rates.RUB; }

            if (/(в рос|в руб|в rub)/i.test(text) && !/(в бел)/i.test(text)) { toStr = "RUB"; toRate = rates.RUB; }
            else if (/(в дол|в usd|в бакс)/i.test(text)) { toStr = "USD"; toRate = 1; }
            else if (/(в евро|в eur)/i.test(text)) { toStr = "EUR"; toRate = rates.EUR; }
            else if (/(в бел|в byn)/i.test(text)) { toStr = "BYN"; toRate = rates.BYN; }
            else {
              if (fromStr === "RUB") { toStr = "USD"; toRate = 1; }
              else if (fromStr === "BYN") { toStr = "RUB"; toRate = rates.RUB; }
            }

            const result = (amount / fromRate) * toRate;
            botResponse = ` Перевод: ${amount} ${fromStr} ≈ ${result.toFixed(2)} ${toStr}`;
          } else {
            botResponse = ` Актуальный курс валют:\n🇺🇸 1 USD = ${rates.RUB.toFixed(2)} RUB\n🇧🇾 1 USD = ${rates.BYN.toFixed(2)} BYN\n🇪🇺 1 EUR = ${(1 / rates.EUR * rates.RUB).toFixed(2)} RUB\n🇧🇾 1 BYN = ${(1 / rates.BYN * rates.RUB).toFixed(2)} RUB`;
          }
        } catch (err) {
          botResponse = "❌ Ошибка при получении курса валют. Сервер недоступен.";
        }
        break;
      }

      case 'STOP_TRACK': {
        dispatch(togglePlay());
        botResponse = "⏸ Плеер остановлен (или снят с паузы).";
        break;
      }

      case 'NEXT_TRACK': {
        dispatch(nextTrack());
        botResponse = "⏭ Переключаю на следующий трек";
        break;
      }

      case 'PREV_TRACK': {
        dispatch(prevTrack());
        botResponse = "⏮ Включаю предыдущий трек";
        break;
      }

      case 'PLAY_FAVORITES': {
        if (!user) {
          botResponse = "Войди в аккаунт, чтобы просматривать и слушать избранное.";
          break;
        }

        const favoritesEndpoint = '/music/liked';
        logApiRequest(favoritesEndpoint, 'GET');

        try {
          const response = await axios.get(favoritesEndpoint);
          const rawTracks = response.data || [];
          const validTracks = rawTracks.reverse().filter(t => typeof t === "object").map(track => ({
            ...track,
            cover: track.cover || COVER,
            title: track.title || "Без названия",
            genre: track.genre || "Без жанра",
          }));

          if (validTracks.length > 0) {
            dispatch(setTrack({ playlist: validTracks, index: 0 }));
            botResponse = `Включаю твои любимые треки. Всего в избранном: ${validTracks.length} шт.`;
          } else {
            botResponse = "У тебя пока нет любимых треков в избранном.";
          }
        } catch (error) {
          console.error(error);
          botResponse = "❌ Ошибка при загрузке избранных треков.";
        }
        break;
      }

      case 'PLAY_MUSIC': {
        const musicEndpoint = '/tracksq';
        logApiRequest(musicEndpoint, 'GET');

        try {
          const response = await axios.get(musicEndpoint); 
          const rawTracks = response.data || [];
          
          const allTracks = rawTracks.map(track => ({
            ...track,
            cover: track.cover || COVER,
            title: track.title || "Без названия",
            genre: track.genre || "Без жанра",
          }));

          const searchWord = intent.payload.toLowerCase().trim();
          
          let foundIdx = allTracks.findIndex(t => 
            t.title?.toLowerCase().includes(searchWord) || 
            t.author?.toLowerCase().includes(searchWord)
          );

          if (foundIdx === -1 && searchWord.length > 0) {
            botResponse = `Я не нашел ниче по запросу "${intent.payload}". Проверь название или попробуй включить что-то другое.`;
            break;
          }

          if (foundIdx === -1) {
            foundIdx = allTracks.length > 0 ? 0 : -1;
          }

          if (foundIdx !== -1) {
            const currentTrack = allTracks[foundIdx];
            dispatch(setTrack({ playlist: allTracks, index: foundIdx }));
            botResponse = `Включаю ${currentTrack.title}`;
          } else {
            botResponse = `Я не могу найти вообще треки. Я хз че с сервером`;
          }
        } catch (error) {
          console.error(error);
          botResponse = "❌ Ошибка обращения к музыкальному хранилищу на сервере.";
        }
        break;
      }

      case 'CREATE_POST': {
        const postEndpoint = '/posts';
        logApiRequest(postEndpoint, 'POST');

        if (!intent.payload || intent.payload.trim().length < 3) {
          botResponse = "Текст публикации слишком пустой. Напиши суть поста.";
          break;
        }

        try {
          const response = await axios.post(postEndpoint, {
            title: intent.payload,
            text: intent.payload
          });

          if (response.data && response.data._id) {
            botResponse = `Пост успешно опубликован!\n--- Источник [ID: ${response.data._id}] ---\n${intent.payload}`;
          } else {
            botResponse = `Пост успешно передан в AtomGlide Post.`;
          }
        } catch (error) {
          botResponse = `Ошибка при создании поста: ${error.response?.data?.message || error.message} скорее всего ошибка на моей стороне`;
        }
        break;
      }

      case 'FIX_TEXT': {
        const externalApiUrl = 'https://api.languagetool.org/v2/check';
        logApiRequest(externalApiUrl, 'POST');

        try {
          const res = await fetch(externalApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `text=${encodeURIComponent(intent.payload)}&language=ru-RU`
          });
          const data = await res.json();

          if (data.matches && data.matches.length > 0) {
            let corrected = intent.payload;
            const matches = data.matches.sort((a, b) => b.offset - a.offset);
            
            matches.forEach(match => {
              if (match.replacements && match.replacements.length > 0) {
                corrected = corrected.substring(0, match.offset) + match.replacements[0].value + corrected.substring(match.offset + match.length);
              }
            });
            botResponse = `Текст без ошибок:\n"${corrected}"`;
          } else {
            botResponse = "Текст проверен, критических опечаток нет!";
          }
        } catch (err) {
          botResponse = "Сервер проверки орфографии чет недоступен.";
        }
        break;
      }

      case 'SEARCH_POST':
      default: {
        const aiEndpoint = '/ai';
        logApiRequest(aiEndpoint, 'POST');

        try {
          const response = await axios.post(aiEndpoint, {
            ts: intent.payload,
          });

          if (response.data && response.data.sources && response.data.sources.length > 0) {
            botResponse = `Ну вот что я смог найти:\n\n${response.data.answer}`;
          } else {
            botResponse = "Чет я вас не понял вас. Похожих публикаций не найдено.";
          }
        } catch (error) {
          botResponse = "Эм, ну я не понял вас. ";
        }
        break;
      }
    }

    return botResponse;
  };

  const sendText = async (text) => {
    if (!text.trim()) return;

    const userMsgId = generateId();
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text }]);
    setInputValue('');

    const typingId = generateId();
    setMessages((prev) => [...prev, { id: typingId, sender: 'bot', text: 'Запрос обрабатывается...' }]);

    const replyText = await processCommand(text);

    setMessages((prev) => 
      prev.map(msg => msg.id === typingId ? { ...msg, text: replyText } : msg)
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendText(inputValue);
  };

  if (!isRendered) return null;

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pointerEvents: 'none' 
    }}>
      <style>
        {`
          .geromik-modal-container {
            background-color: #0a0a0a;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            pointer-events: auto;
            overflow: hidden;
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            margin-top: 20px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            height: 570px;
            width: 520px;
          }

          .modal-opening {
            animation: dropDownCustom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          .modal-closing {
            animation: dropUpCustom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          @keyframes dropDownCustom {
            0% { transform: translateY(-100px); opacity: 0; height: 50px; width: 100px; border-radius: 100px; }
            100% { transform: translateY(0); opacity: 1; height: 570px; width: 520px; border-radius: 24px; }
          }
          @keyframes dropUpCustom {
            0% { transform: translateY(0); opacity: 1; height: 570px; width: 520px; border-radius: 24px; }
            100% { transform: translateY(-100px); opacity: 0; height: 50px; width: 100px; border-radius: 100px; }
          }
          
          .chat-scroll::-webkit-scrollbar { width: 5px; }
          .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          
          .shortcuts-scroll::-webkit-scrollbar { display: none; }
          
          .shortcut-btn {
            padding: 8px 14px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            background-color: rgba(255,255,255,0.03);
            color: #ccc;
            font-size: 13px;
            cursor: pointer;
            flex-shrink: 0;
            transition: all 0.2s ease;
          }
          .shortcut-btn:hover {
            background-color: rgba(255,255,255,0.1);
            color: #fff;
            border-color: rgb(237, 93, 25);
          }

          .scroll-arrow-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: #fff;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            flex-shrink: 0;
          }
          .scroll-arrow-btn:hover {
            background: rgb(237, 93, 25);
            border-color: rgb(237, 93, 25);
          }

          .ai-post-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 12px 16px;
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .post-link-btn {
            align-self: flex-start;
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            background-color: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          .post-link-btn:hover {
            background-color: rgb(237, 93, 25);
            border-color: rgb(237, 93, 25);
          }

          @media (max-width: 768px) {
            .geromik-modal-container {
              margin-top: 0;
              border: none;
              border-radius: 0;
              width: 100%;
              height: 100%;
            }
            @keyframes dropDownCustom {
              0% { transform: translateY(100%); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; height: 100%; width: 100%; border-radius: 0; }
            }
            @keyframes dropUpCustom {
              0% { transform: translateY(0); opacity: 1; height: 100%; width: 100%; border-radius: 0; }
              100% { transform: translateY(100%); opacity: 0; }
            }
            .scroll-arrow-btn {
              display: none;
            }
            .shortcuts-wrapper {
              padding: 0 16px 12px 16px !important;
            }
          }
        `}
      </style>
      
      <div className={`geromik-modal-container ${isClosing ? 'modal-closing' : 'modal-opening'}`}>
        <div style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box', opacity: isClosing ? 0 : 1, transition: isClosing ? 'opacity 0.15s ease-in' : 'opacity 0.25s ease-out',
        }}>
          
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.5px' }}>Geromik Logic</span>
              <span style={{ color: 'rgb(237, 93, 25)', fontSize: '11px' }}>Данный чат еще в бета. Могут быть ошибки</span>
            </div>
            <span onClick={onClose} style={{ color: '#fff', opacity: 0.4, cursor: 'pointer', fontSize: '1.2rem' }}>✕</span>
          </div>

          <div className="chat-scroll" style={{
            flex: 1, padding: '24px', display: 'flex', flexDirection: 'column',
            overflowY: 'auto', gap: '14px', backgroundColor: 'rgba(5,5,5,0.4)'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? 'rgb(237, 93, 25)' : '#141414',
                color: '#fff', padding: '12px 18px', borderRadius: '18px',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '18px',
                border: msg.sender === 'bot' ? '1px solid rgba(255,255,255,0.03)' : 'none',
                maxWidth: '85%', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word', whiteSpace: 'pre-wrap'
              }}>
                {msg.sender === 'user' ? (
                  msg.text
                ) : (
                  parseBotResponseText(msg.text).map((block, idx) => {
                    if (block.type === 'text') {
                      return <div key={idx}>{block.content}</div>;
                    }
                    return (
                      <div key={idx} className="ai-post-card">
                        <div style={{ fontSize: '13px', color: '#aaa' }}>{block.content}</div>
                        <button 
                          className="post-link-btn"
                          onClick={() => handleGoToPost(block.id)}
                        >
                          Перейти к посту
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <div className="shortcuts-wrapper" style={{ display: 'flex', alignItems: 'center', padding: '0 24px 12px 24px', gap: '8px' }}>
              <button onClick={() => scrollShortcuts('left')} className="scroll-arrow-btn">❮</button>
              <div 
                ref={shortcutsRef}
                className="shortcuts-scroll" 
                style={{
                  display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap',
                  WebkitOverflowScrolling: 'touch', flex: 1, scrollbarWidth: 'none'
                }}
              >
                {shortcuts.map(sc => (
                  <button
                    key={sc}
                    onClick={() => sendText(sc)}
                    className="shortcut-btn"
                  >
                    {sc}
                  </button>
                ))}
              </div>
              <button onClick={() => scrollShortcuts('right')} className="scroll-arrow-btn">❯</button>
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '0 24px 20px 24px' }}>
              <div style={{
                display: 'flex', backgroundColor: '#111', borderRadius: '14px',
                padding: '12px 18px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center'
              }}>
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Введи команду или фразу для поиска..."
                  style={{
                    flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff',
                    outline: 'none', fontSize: '14px', fontFamily: 'inherit'
                  }}
                />
                <button type="submit" style={{
                  background: 'none', border: 'none', color: 'rgb(237, 93, 25)', 
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', paddingLeft: '10px'
                }}>
                  ➤
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default GeromikModal;