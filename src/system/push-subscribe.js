import axios from './axios';

const publicVapidKey = 'BDniXnUtpUSNDKVj71eAuoZyWSeUEghAhTd1UoG-a2ZgFi39hjuZN9kwg-q2HpELU2E52fwE7MvNzWH_Z0Mhd08';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const subscribeUserToPush = async () => {
    if (!('serviceWorker' in navigator) || Notification.permission === 'denied') return;

    setTimeout(async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log('Пользователь уже подписан');
                return; 
            }

            const serviceWorkerReady = await navigator.serviceWorker.ready;
            
            const subscription = await serviceWorkerReady.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            axios.post('/auth/save-push', subscription).catch(e => console.error('Ошибка сохранения на бэк'));
            
            console.log('Уведомления успешно включены!');
        } catch (err) {
            console.warn('Push Notification skipped or failed:', err.name);
        }
    }, 2000); 
};



/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/