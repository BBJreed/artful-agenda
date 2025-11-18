import { useState, useCallback } from 'react';

interface NotificationAction {
  label: string;
  action: () => void;
  icon?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  duration?: number; // in milliseconds
  timestamp: number;
  read: boolean;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actions?: NotificationAction[];
  icon?: string;
  persistent?: boolean;
  groupId?: string;
}

interface UseNotificationOptions {
  maxNotifications?: number;
  defaultDuration?: number;
  enableSound?: boolean;
  enableVibration?: boolean;
  groupNotifications?: boolean;
}

export const useNotification = (options: UseNotificationOptions = {}) => {
  const { 
    maxNotifications = 10, 
    defaultDuration = 5000,
    enableSound = false,
    enableVibration = false,
    groupNotifications = true
  } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Play notification sound based on type
  const playNotificationSound = useCallback((type: Notification['type']) => {
    try {
      // In a real implementation, you would play different sounds based on type
      // For now, we'll just log to console
      console.log(`Playing ${type} notification sound`);
      
      // Example implementation:
      // const audio = new Audio(`/sounds/${type}.mp3`);
      // audio.play().catch(err => console.warn('Failed to play sound:', err));
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, []);
  
  // Vibrate device based on notification type
  const vibrateDevice = useCallback((type: Notification['type']) => {
    try {
      // Vibration patterns based on notification type
      const patterns: Record<Notification['type'], number[]> = {
        info: [100],
        success: [100, 50, 100],
        warning: [200, 100, 200],
        error: [300, 100, 300, 100, 300],
        critical: [500, 100, 500, 100, 500]
      };
      
      if (navigator.vibrate) {
        navigator.vibrate(patterns[type] || patterns.info);
      }
    } catch (error) {
      console.warn('Failed to vibrate device:', error);
    }
  }, []);
  
  // Add a new notification
  const addNotification = useCallback((
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    duration: number = defaultDuration,
    options: Partial<Omit<Notification, 'id' | 'title' | 'message' | 'type' | 'duration'>> = {}
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      title,
      message,
      type,
      duration,
      timestamp: Date.now(),
      read: false,
      ...options
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the most recent notifications
      return updated.length > maxNotifications ? updated.slice(0, maxNotifications) : updated;
    });
    
      // Auto-remove notification after duration (unless persistent)
    if (duration > 0 && !options.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    // Play sound if enabled
    if (enableSound) {
      playNotificationSound(type);
    }
    
    // Vibrate if enabled
    if (enableVibration) {
      vibrateDevice(type);
    }
    
    return id;
  }, [defaultDuration, maxNotifications]);
  
  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);
  
  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);
  
  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);
  
  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(notification => notification.category === category);
  }, [notifications]);
  
  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return notifications.filter(notification => notification.priority === priority);
  }, [notifications]);
  
  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);
  
  // Get read notifications
  const getReadNotifications = useCallback(() => {
    return notifications.filter(notification => notification.read);
  }, [notifications]);
  
  // Remove notifications by type
  const removeNotificationsByType = useCallback((type: Notification['type']) => {
    setNotifications(prev => prev.filter(notification => notification.type !== type));
  }, []);
  
  // Remove notifications by category
  const removeNotificationsByCategory = useCallback((category: string) => {
    setNotifications(prev => prev.filter(notification => notification.category !== category));
  }, []);
  
  // Group notifications by category
  const getGroupedNotifications = useCallback(() => {
    if (!groupNotifications) {
      return { 'all': notifications };
    }
    
    const grouped: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      const group = notification.category || 'uncategorized';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(notification);
    });
    
    return grouped;
  }, [notifications, groupNotifications]);
  
  // Mark notifications as read by type
  const markAsReadByType = useCallback((type: Notification['type']) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.type === type ? { ...notification, read: true } : notification
      )
    );
  }, []);
  
  // Mark notifications as read by category
  const markAsReadByCategory = useCallback((category: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.category === category ? { ...notification, read: true } : notification
      )
    );
  }, []);
  
  // Show info notification
  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return addNotification(title, message, 'info', duration);
  }, [addNotification]);
  
  // Show success notification
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return addNotification(title, message, 'success', duration);
  }, [addNotification]);
  
  // Show warning notification
  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return addNotification(title, message, 'warning', duration);
  }, [addNotification]);
  
  // Show error notification
  const showError = useCallback((title: string, message: string, duration?: number) => {
    return addNotification(title, message, 'error', duration);
  }, [addNotification]);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    getUnreadCount,
    getNotificationsByType,
    getNotificationsByCategory,
    getNotificationsByPriority,
    getUnreadNotifications,
    getReadNotifications,
    getGroupedNotifications,
    removeNotificationsByType,
    removeNotificationsByCategory,
    markAsReadByType,
    markAsReadByCategory,
    showInfo,
    showSuccess,
    showWarning,
    showError
  };
};