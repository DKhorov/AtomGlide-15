self.onmessage = async function(e) {
  const { type, payload } = e.data;
  if (type === 'getPosts') {
    try {
      const { offset = 0, limit = 1000, userId } = payload || {};
      const base = 'https://atomglidedev.ru';
      let url = `${base}/posts?offset=${offset}&limit=${limit}`;
      if (userId) url = `${base}/posts/user/${userId}?offset=${offset}&limit=${limit}`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      self.postMessage({ type: 'posts', data });
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
}; 
/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/