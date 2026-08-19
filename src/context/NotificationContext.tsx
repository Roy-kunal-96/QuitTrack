import React, { createContext, useContext, useState, useEffect } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  isOnline: boolean;
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  sendLocalNotification: (title: string, body: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('You are back online. Synchronized with QuitTrack server.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('You are currently offline. Local tracking is active.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported on this browser.', 'warning');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setNotificationsEnabled(granted);
      if (granted) {
        showToast('Daily progress reminders enabled! 🎉', 'success');
        sendLocalNotification('QuitTrack Reminders Active', 'We will help you stay smoke-free and conquer cravings!');
      } else {
        showToast('Notification permission was declined.', 'info');
      }
      return granted;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  };

  const sendLocalNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      } catch (err) {
        console.log('Push notification error:', err);
      }
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        isOnline,
        notificationsEnabled,
        requestNotificationPermission,
        sendLocalNotification
      }}
    >
      {children}
      {/* Toast rendering */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-2 flex items-center justify-between gap-3 ${
              toast.type === 'success'
                ? 'bg-teal-900/90 border-teal-500/50 text-teal-100'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 border-amber-500/50 text-amber-100'
                : toast.type === 'error'
                ? 'bg-rose-900/90 border-rose-500/50 text-rose-100'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-70 hover:opacity-100 px-1 py-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
