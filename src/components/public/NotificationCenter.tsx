'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, MessageCircle, Settings, Check, Trash2, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore, type NotificationType } from '@/store/notification-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

// Icon mapper for notification types
function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'message':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-purple-500" />;
    case 'system':
      return <Settings className="w-4 h-4 text-emerald-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
}

// Relative time for notifications
function getNotificationTime(timestamp: number, t: ReturnType<typeof getTranslations>['notifications']): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return t.justNow;
  if (minutes === 1) return t.minuteAgo;
  if (minutes < 60) return t.minutesAgo.replace('{count}', String(minutes));
  if (hours === 1) return t.hourAgo;
  return t.hoursAgo.replace('{count}', String(hours));
}

export function NotificationCenter() {
  const {
    notifications,
    isOpen,
    toggleOpen,
    setOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount,
    initialize,
  } = useNotificationStore();
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isArabic = language === 'ar';
  const count = unreadCount();

  // Initialize notifications on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpen]);

  return (
    <div className="relative" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Bell Button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggleOpen}
        className="relative overflow-hidden text-muted-foreground hover:text-primary"
        aria-label={t.notifications.title}
      >
        <motion.div
          animate={count > 0 ? { rotate: [0, 15, -15, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Bell className="h-5 w-5" />
        </motion.div>
        {/* Badge */}
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -top-0.5 -right-0.5"
            >
              <Badge
                variant="destructive"
                className="h-5 min-w-5 px-1 text-[10px] font-bold flex items-center justify-center p-0 rounded-full bg-emerald-500 hover:bg-emerald-500"
              >
                {count}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full mt-2 end-0 w-80 max-w-[calc(100vw-2rem)] glass-card-lg rounded-xl shadow-2xl shadow-black/20 border border-border/50 backdrop-blur-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{t.notifications.title}</h3>
                {count > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {count}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 px-2 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                  >
                    <Check className="w-3 h-3 me-1" />
                    {t.notifications.markAllRead}
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 me-1" />
                    {t.notifications.clearAll}
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                /* Empty state */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 px-4 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4"
                  >
                    <BellOff className="w-7 h-7 text-muted-foreground/50" />
                  </motion.div>
                  <p className="text-sm font-medium text-muted-foreground">{t.notifications.empty}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{t.notifications.emptyDesc}</p>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: isArabic ? -20 : 20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: isArabic ? 20 : -20, height: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: index * 0.03,
                        ease: 'easeOut',
                      }}
                      className={`flex items-start gap-3 p-3 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/30 ${
                        !notification.read ? 'bg-emerald-500/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        !notification.read ? 'bg-emerald-500/10' : 'bg-muted/50'
                      }`}>
                        <NotificationIcon type={notification.type} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${
                            !notification.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
                          }`}>
                            {isArabic ? notification.titleAr : notification.titleEn}
                          </p>
                          {/* Unread indicator */}
                          {!notification.read && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-2">
                          {isArabic ? notification.descriptionAr : notification.descriptionEn}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          {getNotificationTime(notification.time, t.notifications)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
