'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail,
  Send,
  Check,
  AlertCircle,
  Shield,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface NewsletterFormProps {
  variant?: 'footer' | 'inline' | 'card';
  showTitle?: boolean;
  className?: string;
}

// Confetti particles for success animation
function ConfettiParticle({ delay, index }: { delay: number; index: number }) {
  const colors = ['#10b981', '#14b8a6', '#34d399', '#6ee7b7', '#fbbf24'];
  const color = colors[index % colors.length];
  const xOffset = (Math.random() - 0.5) * 200;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
      animate={{
        opacity: 0,
        y: -80 - Math.random() * 60,
        x: xOffset,
        rotate: rotation,
        scale: [1, 1.2, 0],
      }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    />
  );
}

export function NewsletterForm({ variant = 'footer', showTitle = true, className = '' }: NewsletterFormProps) {
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const validateEmail = useCallback((emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  }, []);

  const checkSubscriptionStatus = async (emailStr: string) => {
    try {
      const res = await fetch(`/api/newsletter?email=${encodeURIComponent(emailStr)}`);
      if (res.ok) {
        const data = await res.json();
        return data.data?.subscribed && data.data?.isActive;
      }
    } catch {
      // Silently ignore
    }
    return false;
  };

  const handleSubscribe = async () => {
    setEmailError('');

    if (!email) {
      setEmailError(t.newsletter.enterEmail);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t.newsletter.errorInvalid);
      return;
    }

    setSubscribing(true);

    try {
      // First check if already subscribed
      setCheckingStatus(true);
      const alreadySubscribed = await checkSubscriptionStatus(email);
      setCheckingStatus(false);

      if (alreadySubscribed) {
        setEmailError(t.newsletter.errorExists);
        setSubscribing(false);
        return;
      }

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source: variant === 'footer' ? 'footer' : 'website',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeSuccess(true);
        setEmail('');
        setName('');
        toast.success(t.newsletter.successMessage);
      } else if (response.status === 409) {
        setEmailError(t.newsletter.errorExists);
      } else {
        setEmailError(data.error || t.newsletter.genericError);
      }
    } catch {
      setEmailError(t.newsletter.connectionError);
    } finally {
      setSubscribing(false);
    }
  };

  const handleReset = () => {
    setSubscribeSuccess(false);
    setEmailError('');
  };

  const isCard = variant === 'card';
  const isInline = variant === 'inline';

  return (
    <div className={`${className}`}>
      <AnimatePresence mode="wait">
        {subscribeSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative text-center py-4"
          >
            {/* Confetti particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.05} index={i} />
            ))}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.2 }}
              className="w-12 h-12 rounded-full gradient-emerald flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
            <p className="text-sm font-medium text-foreground mb-1">
              {t.newsletter.successMessage}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              {t.newsletter.doubleOptIn}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground"
            >
              {t.newsletter.back}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={isCard ? 'rounded-xl p-5 space-y-3 overflow-hidden relative' : 'space-y-3'}
          >
            {isCard && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 rounded-xl" />
                <div className="absolute inset-0 glass-card-sm rounded-xl" />
              </>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubscribe();
              }}
              className={`space-y-3 ${isCard ? 'relative z-10' : ''}`}
            >
              {showTitle && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {t.newsletter.title}
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    </h3>
                  </div>
                </div>
              )}

              {isCard && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.newsletter.cardDescription}
                </p>
              )}

              {/* Name field (only for card variant) */}
              {isCard && (
                <Input
                  type="text"
                  placeholder={t.newsletter.nameOptional}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-sm h-9 glass-card-sm border-primary/10 focus:border-primary/30 bg-background/50"
                />
              )}

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="email"
                    placeholder={t.newsletter.placeholder}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    className={`text-sm h-9 glass-card-sm border-primary/10 focus:border-primary/30 bg-background/50 ${
                      emailError ? 'border-red-500/50 focus:border-red-500/70' : ''
                    }`}
                    dir="ltr"
                    aria-required="true"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={subscribing || !email}
                  aria-label={t.newsletter.subscribe}
                  className="gradient-emerald text-white shrink-0 px-3 hover:shadow-md hover:shadow-emerald-500/20 transition-shadow min-h-[44px]"
                >
                  {subscribing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {emailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -5, height: 0 }}
                    className="flex items-center gap-1.5 text-xs text-red-500"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{emailError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Privacy notice */}
              <div className="flex items-start gap-1.5 mt-1">
                <Shield className="w-3 h-3 text-muted-foreground/50 shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  {t.newsletter.privacyNotice}
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
