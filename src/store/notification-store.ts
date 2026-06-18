'use client';

import { create } from 'zustand';

export type NotificationType = 'message' | 'comment' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  time: number; // timestamp
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  isOpen: boolean;
  initialized: boolean;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  unreadCount: () => number;
  initialize: () => void;
}

const STORAGE_KEY = 'notifications_data';
const INITIALIZED_KEY = 'notifications_initialized';

const defaultNotifications: Omit<Notification, 'id' | 'read'>[] = [
  {
    type: 'message',
    titleAr: 'رسالة تواصل جديدة',
    titleEn: 'New Contact Message',
    descriptionAr: 'تلقيت رسالة جديدة من نموذج التواصل',
    descriptionEn: 'You received a new message from the contact form',
    time: Date.now() - 2 * 60 * 1000, // 2 min ago
  },
  {
    type: 'comment',
    titleAr: 'تعليق جديد على المدونة',
    titleEn: 'New Blog Comment',
    descriptionAr: 'تم إضافة تعليق جديد على مقالك',
    descriptionEn: 'A new comment was added to your post',
    time: Date.now() - 15 * 60 * 1000, // 15 min ago
  },
  {
    type: 'system',
    titleAr: 'تحديث النظام',
    titleEn: 'System Update',
    descriptionAr: 'تم تحديث المنصة بنجاح',
    descriptionEn: 'The platform has been updated successfully',
    time: Date.now() - 60 * 60 * 1000, // 1 hour ago
  },
  {
    type: 'message',
    titleAr: 'رسالة تواصل جديدة',
    titleEn: 'New Contact Message',
    descriptionAr: 'تلقيت رسالة جديدة من زائر الموقع',
    descriptionEn: 'You received a new message from a site visitor',
    time: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
  },
];

function loadFromStorage(): Notification[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveToStorage(notifications: Notification[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Ignore
  }
}

function isInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(INITIALIZED_KEY) === 'true';
  } catch {
    return false;
  }
}

function markInitialized() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch {
    // Ignore
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isOpen: false,
  initialized: false,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      saveToStorage(updated);
      return { notifications: updated };
    }),

  markAllAsRead: () =>
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      saveToStorage(updated);
      return { notifications: updated };
    }),

  clearAll: () => {
    saveToStorage([]);
    set({ notifications: [] });
  },

  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        read: false,
      };
      const updated = [newNotification, ...state.notifications];
      saveToStorage(updated);
      return { notifications: updated };
    }),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  initialize: () => {
    if (get().initialized) return;

    const stored = loadFromStorage();
    if (stored) {
      set({ notifications: stored, initialized: true });
      return;
    }

    // First load - add demo notifications
    const initial: Notification[] = defaultNotifications.map((n, i) => ({
      ...n,
      id: `notif-demo-${i}`,
      read: i >= 2, // first 2 are unread
    }));
    saveToStorage(initial);
    markInitialized();
    set({ notifications: initial, initialized: true });
  },
}));
