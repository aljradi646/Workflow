'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { type Section } from '@/store/site-store';
import { useSiteStore } from '@/store/site-store';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';
import { localizeSection } from '@/lib/localize';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  ExternalLink,
  Check,
  Heart,
  Sparkles,
  CircleDot,
  User,
  MessageSquare,
  FileText,
  Zap,
  ChevronDown,
  HelpCircle,
  Navigation,
  X,
  Paperclip,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

interface ContactSectionProps {
  section: Section;
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
};

// Social branded hover colors for quick links section
const socialBrandedColors: Record<string, string> = {
  Github: 'hover:border-gray-600 hover:shadow-gray-500/20 hover:text-gray-300',
  Linkedin: 'hover:border-blue-500 hover:shadow-blue-500/20 hover:text-blue-400',
  Twitter: 'hover:border-sky-500 hover:shadow-sky-500/20 hover:text-sky-400',
  Instagram: 'hover:border-pink-500 hover:shadow-pink-500/20 hover:text-pink-400',
  Youtube: 'hover:border-red-500 hover:shadow-red-500/20 hover:text-red-400',
};

// LocalStorage key for draft
const DRAFT_KEY = 'contact_form_draft';
const MAX_MESSAGE_LENGTH = 2000;
const MAX_RETRY_ATTEMPTS = 3;

// Floating icon component for background animation
function FloatingIcon({
  icon: Icon,
  className,
  delay,
  duration,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      className={`absolute text-muted-foreground/10 ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 0.6, 0.6, 0],
        y: [20, -10, -30, -60],
        x: [0, 5, -5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Icon className="w-6 h-6" />
    </motion.div>
  );
}

// Full-screen confetti animation with emerald/teal colors
function ConfettiOverlay() {
  const confettiColors = [
    'bg-emerald-400', 'bg-emerald-500', 'bg-teal-400', 'bg-teal-500',
    'bg-emerald-300', 'bg-teal-300', 'bg-yellow-400', 'bg-amber-400',
  ];
  const shapes = ['rounded-full', 'rounded-sm', 'rounded-none'];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => {
        const x = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 1.5 + Math.random() * 2;
        const size = 4 + Math.random() * 8;
        const rotation = Math.random() * 360;
        const drift = (Math.random() - 0.5) * 200;

        return (
          <motion.div
            key={i}
            className={`absolute ${confettiColors[i % confettiColors.length]} ${shapes[i % shapes.length]}`}
            style={{
              width: size,
              height: size,
              left: `${x}%`,
              top: -20,
              rotate: rotation,
            }}
            initial={{ y: -20, x: 0, opacity: 1 }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
              x: drift,
              opacity: [1, 1, 0.8, 0],
              rotate: rotation + 720,
            }}
            transition={{
              duration,
              delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        );
      })}
    </div>
  );
}

// Draw-itself checkmark SVG animation
function DrawCheckmark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="text-white">
      <motion.path
        d="M12 20 L18 26 L28 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      />
    </svg>
  );
}

// Success animation with draw checkmark, confetti, and personalized message
function SuccessAnimation({ userName, onSendAnother, t }: { userName: string; onSendAnother: () => void; t: any }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showConfetti && <ConfettiOverlay />}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="flex flex-col items-center justify-center py-12 gap-4"
        aria-live="polite"
        role="status"
      >
        {/* Checkmark circle with draw animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-full gradient-emerald flex items-center justify-center shadow-lg shadow-emerald-500/30"
        >
          <DrawCheckmark />
        </motion.div>

        {/* Particle burst */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const distance = 70 + Math.random() * 50;
          const colors = ['bg-emerald-400', 'bg-teal-400', 'bg-yellow-400', 'bg-emerald-300'];
          return (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                scale: 0.3,
              }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.02, ease: 'easeOut' }}
            />
          );
        })}

        {/* Personalized message */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-bold text-center"
        >
          🎉 {t.contact.successTitle}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-muted-foreground text-center"
        >
          {userName ? `${t.contact.thankYou} ${userName}! ` : ''}
          {t.contact.successMessage}
        </motion.p>

        {/* Send Another button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="outline"
            onClick={onSendAnother}
            className="gap-2 mt-2 border-emerald-500/30 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <RotateCcw className="w-4 h-4" />
            {t.contact.sendAnother}
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}

// Field validation indicator component
function ValidationIndicator({ status }: { status: 'valid' | 'invalid' | 'neutral' }) {
  if (status === 'neutral') return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className="absolute end-3 top-1/2 -translate-y-1/2"
    >
      {status === 'valid' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
    </motion.div>
  );
}

// Floating label input component with validation indicator
function FloatingLabelInput({
  id,
  name,
  label,
  required,
  placeholder,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  dir,
  className,
  validationStatus,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  dir?: string;
  className?: string;
  validationStatus: 'valid' | 'invalid' | 'neutral';
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = focused || hasValue;

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  return (
    <div className="relative">
      {/* Animated gradient bottom border */}
      <div className="absolute bottom-0 start-0 end-0 h-[2px] overflow-hidden rounded-b">
        <motion.div
          className="h-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            background: validationStatus === 'invalid'
              ? 'linear-gradient(90deg, #ef4444, #f87171, #ef4444)'
              : 'linear-gradient(90deg, #10b981, #14b8a6, #10b981)',
            transformOrigin: 'center',
          }}
        />
      </div>
      {/* Floating label */}
      <motion.label
        htmlFor={id}
        className="absolute pointer-events-none text-muted-foreground origin-start start-9"
        animate={{
          y: isFloating ? -22 : 0,
          scale: isFloating ? 0.8 : 1,
          color: focused
            ? validationStatus === 'invalid'
              ? '#ef4444'
              : '#10b981'
            : undefined,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          top: '50%',
          marginTop: isFloating ? 0 : -8,
        }}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </motion.label>
      <div className="relative">
        <Icon className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
          focused
            ? validationStatus === 'invalid'
              ? 'text-red-500'
              : 'text-emerald-500'
            : 'text-muted-foreground/50'
        }`} />
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFloating ? placeholder : ''}
          required={required}
          aria-required={required ? 'true' : undefined}
          aria-label={label}
          dir={dir}
          className={`bg-background/50 border-border/50 focus:border-transparent focus:ring-0 transition-colors h-11 ps-10 pt-2 pe-10 ${
            validationStatus === 'invalid' ? 'border-red-500/50' : ''
          } ${validationStatus === 'valid' ? 'border-emerald-500/30' : ''} ${className || ''}`}
        />
        <ValidationIndicator status={validationStatus} />
      </div>
    </div>
  );
}

// Phone input with masking
function PhoneInput({
  id,
  name,
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
  onFocus,
  onBlur,
  dir,
  validationStatus,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  dir?: string;
  validationStatus: 'valid' | 'invalid' | 'neutral';
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = focused || hasValue;

  const formatPhone = (val: string) => {
    // Remove all non-digit characters
    const digits = val.replace(/\D/g, '');
    // Apply formatting based on length
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: formatted },
    };
    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  return (
    <div className="relative">
      <div className="absolute bottom-0 start-0 end-0 h-[2px] overflow-hidden rounded-b">
        <motion.div
          className="h-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            background: validationStatus === 'invalid'
              ? 'linear-gradient(90deg, #ef4444, #f87171, #ef4444)'
              : 'linear-gradient(90deg, #10b981, #14b8a6, #10b981)',
            transformOrigin: 'center',
          }}
        />
      </div>
      <motion.label
        htmlFor={id}
        className="absolute pointer-events-none text-muted-foreground origin-start start-9"
        animate={{
          y: isFloating ? -22 : 0,
          scale: isFloating ? 0.8 : 1,
          color: focused ? (validationStatus === 'invalid' ? '#ef4444' : '#10b981') : undefined,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ top: '50%', marginTop: isFloating ? 0 : -8 }}
      >
        {label}
      </motion.label>
      <div className="relative">
        <Icon className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
          focused ? (validationStatus === 'invalid' ? 'text-red-500' : 'text-emerald-500') : 'text-muted-foreground/50'
        }`} />
        <Input
          id={id}
          name={name}
          type="tel"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFloating ? placeholder : ''}
          aria-label={label}
          dir="ltr"
          className={`bg-background/50 border-border/50 focus:border-transparent focus:ring-0 transition-colors h-11 ps-10 pt-2 pe-10 text-left ${
            validationStatus === 'invalid' ? 'border-red-500/50' : ''
          } ${validationStatus === 'valid' ? 'border-emerald-500/30' : ''}`}
        />
        <ValidationIndicator status={validationStatus} />
      </div>
    </div>
  );
}

// Floating label textarea component with character counter
function FloatingLabelTextarea({
  id,
  name,
  label,
  required,
  placeholder,
  icon: Icon,
  value,
  onChange,
  onFocus,
  onBlur,
  rows = 5,
  maxLength = MAX_MESSAGE_LENGTH,
  validationStatus,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  validationStatus: 'valid' | 'invalid' | 'neutral';
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = focused || hasValue;
  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isOverLimit = charCount > maxLength;

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  return (
    <div className="relative">
      {/* Animated gradient bottom border */}
      <div className="absolute bottom-0 start-0 end-0 h-[2px] overflow-hidden rounded-b">
        <motion.div
          className="h-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            background: isOverLimit
              ? 'linear-gradient(90deg, #ef4444, #f87171, #ef4444)'
              : 'linear-gradient(90deg, #10b981, #14b8a6, #10b981)',
            transformOrigin: 'center',
          }}
        />
      </div>
      {/* Floating label */}
      <motion.label
        htmlFor={id}
        className="absolute pointer-events-none text-muted-foreground origin-start start-9"
        animate={{
          y: isFloating ? -22 : 0,
          scale: isFloating ? 0.8 : 1,
          color: focused
            ? isOverLimit
              ? '#ef4444'
              : validationStatus === 'invalid'
                ? '#ef4444'
                : '#10b981'
            : undefined,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ top: 16 }}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </motion.label>
      <div className="relative">
        <Icon className={`absolute start-3 top-3 w-4 h-4 transition-colors duration-300 ${
          focused ? (isOverLimit ? 'text-red-500' : 'text-emerald-500') : 'text-muted-foreground/50'
        }`} />
        <Textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFloating ? placeholder : ''}
          required={required}
          aria-required={required ? 'true' : undefined}
          aria-label={label}
          rows={rows}
          className={`bg-background/50 border-border/50 focus:border-transparent focus:ring-0 transition-colors resize-none ps-10 pt-5 pb-8 ${
            isOverLimit || validationStatus === 'invalid' ? 'border-red-500/50' : ''
          } ${validationStatus === 'valid' ? 'border-emerald-500/30' : ''}`}
        />
        {/* Character counter */}
        <div className={`absolute bottom-2 end-3 text-[10px] font-mono transition-colors ${
          isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-muted-foreground/40'
        }`}>
          {charCount}/{maxLength}
        </div>
      </div>
    </div>
  );
}

// Decorative Map Section with grid pattern, animated pin, and connecting lines
function DecorativeMap({ title }: { title: string }) {
  return (
    <Card className="glass-card card-shadow-elevation card-border-glow overflow-hidden">
      <CardContent className="p-5">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-500" />
          {title}
        </h4>
        <div className="relative h-40 rounded-lg overflow-hidden bg-emerald-500/5 border border-emerald-500/10">
          {/* Grid pattern with emerald dots */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.25) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.line
              x1="30%" y1="40%" x2="55%" y2="30%"
              stroke="rgba(16,185,129,0.2)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line
              x1="55%" y1="30%" x2="75%" y2="55%"
              stroke="rgba(20,184,166,0.2)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.line
              x1="30%" y1="40%" x2="45%" y2="65%"
              stroke="rgba(16,185,129,0.15)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            {/* Intersection dots */}
            <circle cx="30%" cy="40%" r="3" fill="rgba(16,185,129,0.4)" />
            <circle cx="55%" cy="30%" r="3" fill="rgba(16,185,129,0.4)" />
            <circle cx="75%" cy="55%" r="3" fill="rgba(20,184,166,0.4)" />
            <circle cx="45%" cy="65%" r="3" fill="rgba(16,185,129,0.3)" />
          </svg>
          {/* Animated pin marker */}
          <motion.div
            className="absolute"
            style={{ left: '55%', top: '15%' }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full gradient-emerald flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-500/50"
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
          {/* Second smaller pin */}
          <motion.div
            className="absolute"
            style={{ left: '75%', top: '40%' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center shadow-md shadow-teal-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </motion.div>
          {/* Compass indicator */}
          <div className="absolute top-2 end-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs text-muted-foreground">
            <Navigation className="w-3 h-3 text-emerald-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced FAQ Accordion Item with rotating chevron, gradient left border, background change
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      className="relative border border-border/50 rounded-xl overflow-hidden glass-card-sm"
      animate={{
        backgroundColor: isOpen ? 'rgba(16,185,129,0.03)' : 'rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient left border that expands on open */}
      <motion.div
        className="absolute top-0 start-0 bottom-0 w-1 rounded-s-xl"
        animate={{
          background: isOpen
            ? 'linear-gradient(180deg, #10b981, #14b8a6, #10b981)'
            : 'linear-gradient(180deg, rgba(16,185,129,0.2), rgba(20,184,166,0.1))',
          height: isOpen ? '100%' : '40%',
          top: isOpen ? '0%' : '30%',
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-start hover:bg-accent/30 transition-colors ps-6"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-sm pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.1 : 1 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
          className="shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${isOpen ? 'text-emerald-500' : 'text-muted-foreground'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed ps-6">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Enhanced Contact Info Card with hover expansion and animated icon
function ContactInfoCard({
  icon: Icon,
  label,
  value,
  detail,
  href,
  responseTime,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  href: string | null;
  responseTime?: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const IconComp = Icon;

  const content = (
    <motion.div
      className="glass-card rounded-xl overflow-hidden group relative"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient background that shifts on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(20,184,166,0.05), rgba(16,185,129,0.08))',
        }}
      />
      <CardContent className="p-5 flex items-start gap-4 relative">
        <motion.div
          className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20"
          animate={{
            rotate: hovered ? [0, -10, 10, -5, 5, 0] : 0,
            scale: hovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <IconComp className="w-5 h-5 text-white" />
        </motion.div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium truncate" dir={Icon === Phone || Icon === Mail ? 'ltr' : 'rtl'}>
            {value}
          </p>
          {/* Expanded detail that shows on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-muted-foreground/70 mt-1 overflow-hidden"
              >
                {detail}
              </motion.p>
            )}
          </AnimatePresence>
          {/* Response time badge */}
          {responseTime && hovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center gap-1 mt-1.5"
            >
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                {responseTime}
              </span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block" aria-label={label}>
        {content}
      </a>
    );
  }
  return <div>{content}</div>;
}

// Gradient border wrapper for the form card
function GradientBorderCard({
  children,
  isFocused,
}: {
  children: React.ReactNode;
  isFocused: boolean;
}) {
  return (
    <div className="relative rounded-xl p-[1.5px] transition-all duration-500">
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          background: isFocused
            ? 'linear-gradient(135deg, #10b981, #14b8a6, #10b981, #059669, #10b981)'
            : 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.1), rgba(16,185,129,0.2))',
        }}
        transition={{ duration: 0.5 }}
        style={{ backgroundSize: '300% 300%' }}
      />
      {/* Shimmer on focus */}
      {isFocused && (
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(135deg, transparent 30%, rgba(16,185,129,0.3) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
            }}
          />
        </motion.div>
      )}
      <div className="relative rounded-[10px] bg-background">
        {children}
      </div>
    </div>
  );
}

// File attachment chip
function FileAttachmentChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400"
    >
      <Paperclip className="w-3 h-3" />
      <span className="max-w-[120px] truncate">{name}</span>
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
        aria-label="Remove file"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </motion.div>
  );
}

export function ContactSection({ section }: ContactSectionProps) {
  const { siteData } = useSiteStore();
  const { language } = useLanguageStore();
  const t = getTranslations(language);
  const isRtl = language === 'ar';
  const settings = siteData?.settings || {};
  const socialLinks = siteData?.socialLinks || [];
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const content = (() => {
    try { return JSON.parse(section.content || '{}'); } catch { return {}; }
  })();

  const localizedSection = localizeSection(section, language);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState('');

  // Validation statuses
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleFocus = useCallback(() => setIsFormFocused(true), []);
  const handleBlur = useCallback(() => setIsFormFocused(false), []);

  // Auto-save draft to localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setFormData(draft);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    // Don't save empty or success state
    if (formData.name || formData.email || formData.message || formData.subject || formData.phone) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // Validation helpers
  const validateName = (val: string) => val.trim().length >= 2;
  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validateMessage = (val: string) => val.trim().length >= 10 && val.length <= MAX_MESSAGE_LENGTH;
  const validatePhone = (val: string) => {
    if (!val) return true; // optional field
    const digits = val.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const getFieldStatus = (field: string, value: string): 'valid' | 'invalid' | 'neutral' => {
    if (!touched[field] && !value) return 'neutral';
    if (!touched[field] && value) {
      // Show validation for filled but untouched fields
      switch (field) {
        case 'name': return value ? (validateName(value) ? 'valid' : 'invalid') : 'neutral';
        case 'email': return value ? (validateEmail(value) ? 'valid' : 'invalid') : 'neutral';
        case 'message': return value ? (validateMessage(value) ? 'valid' : 'invalid') : 'neutral';
        case 'phone': return value ? (validatePhone(value) ? 'valid' : 'invalid') : 'neutral';
        default: return 'neutral';
      }
    }
    switch (field) {
      case 'name': return validateName(value) ? 'valid' : 'invalid';
      case 'email': return validateEmail(value) ? 'valid' : 'invalid';
      case 'message': return validateMessage(value) ? 'valid' : 'invalid';
      case 'phone': return validatePhone(value) ? 'valid' : 'invalid';
      default: return 'neutral';
    }
  };

  const faqItems = [
    { q: t.contact.faq1q, a: t.contact.faq1a },
    { q: t.contact.faq2q, a: t.contact.faq2a },
    { q: t.contact.faq3q, a: t.contact.faq3a },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleFileSelect = () => {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const newFiles = Array.from(files).map(f => ({ name: f.name, size: f.size }));
        setAttachments(prev => [...prev, ...newFiles].slice(0, 5)); // max 5 files
      }
    };
    input.click();
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendAnother = () => {
    setShowSuccess(false);
    setSubmittedName('');
    setRetryCount(0);
    setLastError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, email: true, message: true, subject: true, phone: true });

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t.contact.errorRequired);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error(t.contact.validEmail);
      return;
    }

    if (formData.message.length > MAX_MESSAGE_LENGTH) {
      toast.error(t.contact.messageTooLong.replace('{max}', String(MAX_MESSAGE_LENGTH)));
      return;
    }

    setSending(true);
    setLastError('');

    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject || undefined,
      message: formData.message,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setSubmittedName(formData.name);
        setShowSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setAttachments([]);
        setTouched({});
        // Clear draft from localStorage
        localStorage.removeItem(DRAFT_KEY);
        toast.success(t.contact.successTitle);
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.error || t.contact.errorSending;
        setLastError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = t.contact.errorConnection;
      setLastError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  // Retry with exponential backoff
  const handleRetry = async () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      toast.error(t.contact.maxRetriesExceeded);
      return;
    }
    setRetryCount(prev => prev + 1);
    const delay = Math.pow(2, retryCount) * 1000; // exponential backoff
    toast.info(`${t.contact.retryAfter} ${delay / 1000} ${t.contact.contactSeconds}...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t.contact.emailLabel,
      value: content.email || settings.owner_email,
      detail: t.contact.emailDetail,
      href: `mailto:${content.email || settings.owner_email}`,
      responseTime: t.contact.responseTime,
    },
    {
      icon: Phone,
      label: t.contact.phoneLabel,
      value: content.phone || settings.owner_phone,
      detail: t.contact.phoneDetail,
      href: `tel:${content.phone || settings.owner_phone}`,
      responseTime: t.contact.availableHours,
    },
    {
      icon: MapPin,
      label: t.contact.locationLabel,
      value: content.location || settings.owner_location,
      detail: t.contact.locationDetail,
      href: null,
    },
  ].filter((item) => item.value);

  return (
    <section
      id="contact"
      ref={sectionRef}
      aria-labelledby="contact-heading"
      className="section-padding relative overflow-hidden dark-card-gradient"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        <motion.div
          className="absolute top-1/4 start-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 end-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 30, 0],
            y: [0, 30, -20, 0],
            scale: [1, 0.95, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Additional gradient mesh orb */}
        <motion.div
          className="absolute top-1/2 end-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -25, 35, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating contact icons */}
      <FloatingIcon icon={Mail} className="top-[10%] start-[5%]" delay={0} duration={8} />
      <FloatingIcon icon={Phone} className="top-[30%] end-[8%]" delay={1.5} duration={9} />
      <FloatingIcon icon={MapPin} className="bottom-[20%] start-[10%]" delay={3} duration={7} />
      <FloatingIcon icon={Heart} className="top-[50%] end-[5%]" delay={4.5} duration={10} />
      <FloatingIcon icon={Send} className="bottom-[10%] end-[15%]" delay={2} duration={8.5} />
      <FloatingIcon icon={Check} className="top-[70%] start-[3%]" delay={5} duration={9} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Let's Work Together Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {/* Availability Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-sm mb-4"
          >
            <CircleDot className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {t.contact.currentlyAvailable}
            </span>
          </motion.div>

          <h2 id="contact-heading" className="text-3xl sm:text-4xl font-bold mb-4 text-shimmer-heading">
            {localizedSection.title || t.contact.letsWorkTogether}
          </h2>
          {localizedSection.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              {localizedSection.subtitle}
            </p>
          )}

          {/* Estimated Response Time Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-sm text-sm"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-muted-foreground">{t.contact.avgResponseTime}</span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Contact Form with Gradient Border */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <GradientBorderCard isFocused={isFormFocused}>
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {showSuccess ? (
                      <SuccessAnimation
                        key="success"
                        userName={submittedName}
                        onSendAnother={handleSendAnother}
                        t={t}
                      />
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {/* Name with floating label + validation */}
                          <FloatingLabelInput
                            id="name"
                            name="name"
                            label={t.contact.name}
                            required
                            placeholder={t.contact.namePlaceholder}
                            icon={User}
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={() => { handleBlur(); handleFieldBlur('name'); }}
                            validationStatus={getFieldStatus('name', formData.name)}
                          />

                          {/* Email with floating label + validation */}
                          <FloatingLabelInput
                            id="email"
                            name="email"
                            label={t.contact.email}
                            required
                            placeholder={t.contact.emailPlaceholder}
                            icon={Mail}
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={() => { handleBlur(); handleFieldBlur('email'); }}
                            dir="ltr"
                            className="text-left"
                            validationStatus={getFieldStatus('email', formData.email)}
                          />
                        </div>

                        {/* Phone with masking + validation */}
                        <PhoneInput
                          id="phone"
                          name="phone"
                          label={t.contact.phoneNumber}
                          placeholder={language === 'ar' ? 'XXX-XXX-XXXX' : 'XXX-XXX-XXXX'}
                          icon={Phone}
                          value={formData.phone}
                          onChange={handleChange}
                          onFocus={handleFocus}
                          onBlur={() => { handleBlur(); handleFieldBlur('phone'); }}
                          validationStatus={getFieldStatus('phone', formData.phone)}
                        />

                        {/* Subject with floating label */}
                        <FloatingLabelInput
                          id="subject"
                          name="subject"
                          label={t.contact.subject}
                          placeholder={t.contact.subjectPlaceholder}
                          icon={FileText}
                          value={formData.subject}
                          onChange={handleChange}
                          onFocus={handleFocus}
                          onBlur={() => { handleBlur(); handleFieldBlur('subject'); }}
                          validationStatus="neutral"
                        />

                        {/* Message with floating label + character counter */}
                        <FloatingLabelTextarea
                          id="message"
                          name="message"
                          label={t.contact.message}
                          required
                          placeholder={t.contact.messagePlaceholder}
                          icon={MessageSquare}
                          value={formData.message}
                          onChange={handleChange}
                          onFocus={handleFocus}
                          onBlur={() => { handleBlur(); handleFieldBlur('message'); }}
                          validationStatus={getFieldStatus('message', formData.message)}
                        />

                        {/* File attachments */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <AnimatePresence>
                              {attachments.map((file, i) => (
                                <FileAttachmentChip
                                  key={`${file.name}-${i}`}
                                  name={file.name}
                                  onRemove={() => removeAttachment(i)}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleFileSelect}
                            className="text-xs text-muted-foreground gap-1.5"
                            disabled={attachments.length >= 5}
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            {t.contact.attachFile}
                            {attachments.length > 0 && (
                              <span className="text-emerald-500">({attachments.length}/5)</span>
                            )}
                          </Button>
                        </div>

                        {/* Retry indicator */}
                        {lastError && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                          >
                            <div className="flex items-center gap-2 text-xs text-red-500">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{lastError}</span>
                            </div>
                            {retryCount < MAX_RETRY_ATTEMPTS && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRetry}
                                className="text-xs text-red-500 hover:text-red-400 gap-1"
                                disabled={sending}
                              >
                                <RotateCcw className="w-3 h-3" />
                                {t.misc.retry}
                              </Button>
                            )}
                          </motion.div>
                        )}

                        {/* Auto-save indicator */}
                        {(formData.name || formData.email || formData.message) && !showSuccess && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                            {t.contact.draftSaved}
                          </motion.div>
                        )}

                        <Button
                          type="submit"
                          disabled={sending}
                          className="w-full gradient-emerald text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 py-6 text-base font-medium group"
                        >
                          {sending ? (
                            <>
                              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                              {t.buttons.sending}
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
                              {t.buttons.sendMessage}
                            </>
                          )}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </GradientBorderCard>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-5"
          >
            {/* Enhanced Info Cards with response time */}
            {contactInfo.map((info, index) => (
              <ContactInfoCard
                key={index}
                icon={info.icon}
                label={info.label}
                value={info.value}
                detail={info.detail}
                href={info.href}
                responseTime={info.responseTime}
                index={index}
              />
            ))}

            {/* Social Links with branded hover colors */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t.contact.followMe}
              </h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => {
                  const IconComponent = link.icon ? socialIconMap[link.icon] : ExternalLink;
                  if (!IconComponent) return null;
                  const brandedClass = socialBrandedColors[link.icon] || 'hover:text-primary';
                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-xl glass-card border border-border/50 flex items-center justify-center text-muted-foreground transition-all duration-300 card-hover ${brandedClass}`}
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={link.platform}
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Availability Card */}
            <Card className="glass-card card-shadow-elevation overflow-hidden border-emerald-500/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/40" />
                  <div>
                    <p className="font-semibold text-sm">{t.contact.availableForWork}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.contact.currentlyAvailable}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decorative Map */}
            <DecorativeMap title={t.contact.mapTitle} />
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-2xl mx-auto mt-16"
        >
          <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            {t.contact.faqTitle}
          </h3>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.q}
                answer={item.a}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
