/**
 * Toast Notification System
 * Simple, clean notifications for user feedback
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface NotificationOptions {
  duration?: number; // milliseconds, 0 = manual dismiss
  id?: string;
}

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
  timestamp: number;
}

// Notification store
const notifications = new Map<string, Notification>();
const listeners = new Set<(notifications: Notification[]) => void>();

// Generate unique ID
function generateId(): string {
  return `notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Notify listeners
function notifyListeners() {
  const notificationList = Array.from(notifications.values()).sort((a, b) => b.timestamp - a.timestamp);
  listeners.forEach(listener => listener(notificationList));
}

// Add notification
function addNotification(type: NotificationType, message: string, options: NotificationOptions = {}): string {
  const id = options.id || generateId();
  const duration = options.duration !== undefined ? options.duration : 5000; // 5s default

  const notification: Notification = {
    id,
    type,
    message,
    duration,
    timestamp: Date.now(),
  };

  notifications.set(id, notification);
  notifyListeners();

  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(() => {
      dismiss(id);
    }, duration);
  }

  return id;
}

// Dismiss notification
function dismiss(id: string) {
  if (notifications.has(id)) {
    notifications.delete(id);
    notifyListeners();
  }
}

// Subscribe to notifications
export function subscribeToNotifications(listener: (notifications: Notification[]) => void) {
  listeners.add(listener);
  
  // Call immediately with current state
  const notificationList = Array.from(notifications.values()).sort((a, b) => b.timestamp - a.timestamp);
  listener(notificationList);

  // Return unsubscribe function
  return () => {
    listeners.delete(listener);
  };
}

// Public API
export const notify = {
  success: (message: string, options?: NotificationOptions) => {
    return addNotification('success', message, options);
  },

  error: (message: string, options?: NotificationOptions) => {
    return addNotification('error', message, { duration: 7000, ...options }); // Longer for errors
  },

  warning: (message: string, options?: NotificationOptions) => {
    return addNotification('warning', message, options);
  },

  info: (message: string, options?: NotificationOptions) => {
    return addNotification('info', message, options);
  },

  loading: (message: string, options?: NotificationOptions) => {
    return addNotification('loading', message, { duration: 0, ...options }); // Manual dismiss
  },

  dismiss: (id: string) => {
    dismiss(id);
  },

  dismissAll: () => {
    notifications.clear();
    notifyListeners();
  },
};

// Export types
export type { Notification };
