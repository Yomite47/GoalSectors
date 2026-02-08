export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon.svg',
      ...options
    });
  }
};

export const scheduleNotification = (title: string, delayMs: number, options?: NotificationOptions) => {
  setTimeout(() => {
    sendNotification(title, options);
  }, delayMs);
};
