self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        console.log('Получены данные для пуша:', data); 

        const title = data.title || 'AtomGlide';
        const options = {
            body: data.body || 'Новое уведомление', 
            icon: data.icon || '/1.png',
            badge: '/1.png',
            data: {
                url: data.data?.url || '/'
            }
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (error) {
        console.error('Ошибка обработки пуша:', error);
    }
});
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/