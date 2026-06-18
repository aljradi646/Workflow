'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  showSparkle?: boolean;
}

// Typing indicator with 3 bouncing dots
function TypingIndicator({ isArabic }: { isArabic: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex gap-2"
    >
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-foreground" />
      </div>
      <div className="glass-card-sm px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground mr-1">
            {isArabic ? 'يكتب' : 'Typing'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Sparkle effect for bot responses
function SparkleEffect() {
  return (
    <motion.div
      className="absolute -top-1 -left-1 pointer-events-none"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Sparkles className="w-4 h-4 text-emerald-400" />
    </motion.div>
  );
}

// Relative time formatter
function getRelativeTime(timestamp: number, isArabic: boolean): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);

  if (seconds < 60) return isArabic ? 'الآن' : 'Now';
  if (minutes === 1) return isArabic ? 'منذ دقيقة' : '1 min ago';
  if (minutes < 60) return isArabic ? `منذ ${minutes} دقائق` : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return isArabic ? 'منذ ساعة' : '1 hour ago';
  return isArabic ? `منذ ${hours} ساعات` : `${hours} hours ago`;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '', // Will be set after language is available
      timestamp: Date.now(),
      showSparkle: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sendAnimating, setSendAnimating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  const isArabic = language === 'ar';

  // Set welcome message when language changes
  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === 'welcome'
          ? { ...msg, content: t.chat.welcomeMessage }
          : msg
      )
    );
  }, [t.chat.welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const trimmed = (messageText || input).trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);
    setSendAnimating(true);
    setTimeout(() => setSendAnimating(false), 400);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || t.chat.errorMessage,
        timestamp: Date.now(),
        showSparkle: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t.chat.errorMessage,
        timestamp: Date.now(),
        showSparkle: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, t.chat.errorMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    t.chat.suggestedQ1,
    t.chat.suggestedQ2,
    t.chat.suggestedQ3,
    t.chat.suggestedQ4,
  ];

  // Animated gradient border keyframes
  const gradientBorderVariants = {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    },
  };

  return (
    <div className="fixed bottom-24 left-6 z-40" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-16 left-0 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[70vh] glass-card-lg rounded-2xl shadow-2xl shadow-black/20 border border-border/50 backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Animated gradient border at top */}
            <motion.div
              className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-[length:200%_100%]"
              variants={gradientBorderVariants}
              animate="animate"
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-emerald-500/10">
              <div className="flex items-center gap-2.5">
                {/* Bot avatar with breathing animation */}
                <motion.div
                  className="relative"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-9 h-9 rounded-full gradient-emerald flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5 text-white" />
                  </div>
                  {/* Online status dot */}
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sm">{t.chat.title}</h3>
                  <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {t.chat.online}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Sound toggle */}
                <button
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className="w-7 h-7 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
                  aria-label={soundEnabled ? t.chat.soundOn : t.chat.soundOff}
                  title={soundEnabled ? t.chat.soundOn : t.chat.soundOff}
                >
                  <AnimatePresence mode="wait">
                    {soundEnabled ? (
                      <motion.div
                        key="on"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="off"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ duration: 0.15 }}
                      >
                        <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
                  aria-label={t.buttons.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{
                    opacity: 0,
                    x: msg.role === 'user' ? 30 : -30,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.05,
                  }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'gradient-emerald'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div
                      className={`relative max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'gradient-emerald text-white rounded-br-sm'
                          : 'glass-card-sm rounded-bl-sm'
                      }`}
                    >
                      {msg.showSparkle && <SparkleEffect />}
                      {msg.content}
                    </div>
                    {/* Timestamp */}
                    {index > 0 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className={`text-[10px] text-muted-foreground/60 mt-0.5 ${
                          msg.role === 'user' ? 'text-left' : 'text-left'
                        }`}
                      >
                        {getRelativeTime(msg.timestamp, isArabic)}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && <TypingIndicator isArabic={isArabic} />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <AnimatePresence>
              {showSuggestions && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-2 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQuestions.map((q, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.25 }}
                        onClick={() => sendMessage(q)}
                        className="px-3 py-1.5 text-xs rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors whitespace-nowrap"
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-3 border-t border-border/50 bg-background/50">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? t.chat.thinkingPlaceholder : t.chat.placeholder}
                    className={`w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-muted-foreground transition-all ${
                      isLoading ? 'opacity-60' : ''
                    }`}
                    disabled={isLoading}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  />
                  {/* Thinking placeholder animation */}
                  {isLoading && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-xs text-emerald-500">•••</span>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-xl gradient-emerald text-white flex items-center justify-center shrink-0 hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  aria-label={isArabic ? 'إرسال' : 'Send'}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={sendAnimating ? { x: [0, 10, 0], opacity: [1, 0, 1] } : { x: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full gradient-emerald text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center transition-shadow duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={t.chat.title}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
