'use client';

import { motion } from 'framer-motion';

type TransitionStyle = 'wave' | 'curve' | 'angle' | 'zigzag' | 'dots' | 'diagonal' | 'double-wave';

interface SectionTransitionProps {
  style?: TransitionStyle;
  fromColor?: string;
  toColor?: string;
  flip?: boolean;
  className?: string;
}

const transitions: Record<TransitionStyle, (flip: boolean) => React.ReactNode> = {
  wave: (flip) => (
    <svg
      viewBox="0 0 1440 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      <motion.path
        d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="fill-background"
      />
      <motion.path
        d="M0,50 C320,20 640,70 960,35 C1120,20 1320,55 1440,45 L1440,80 L0,80 Z"
        initial={{ d: "M0,50 C320,20 640,70 960,35 C1120,20 1320,55 1440,45 L1440,80 L0,80 Z" }}
        animate={{
          d: "M0,45 C320,70 640,15 960,50 C1120,65 1320,30 1440,50 L1440,80 L0,80 Z"
        }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="fill-background"
        opacity="0.6"
      />
    </svg>
  ),
  'double-wave': (flip) => (
    <svg
      viewBox="0 0 1440 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      <motion.path
        d="M0,30 C180,50 360,10 540,30 C720,50 900,10 1080,30 C1260,50 1380,35 1440,30 L1440,50 C1260,55 900,30 540,50 C360,60 180,40 0,50 Z"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        className="fill-background"
      />
      <motion.path
        d="M0,45 C240,65 480,25 720,45 C960,65 1200,25 1440,45 L1440,80 L0,80 Z"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="fill-background"
      />
    </svg>
  ),
  curve: (flip) => (
    <svg
      viewBox="0 0 1440 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      <motion.path
        d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z"
        className="fill-background"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  ),
  angle: (flip) => (
    <svg
      viewBox="0 0 1440 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      <polygon
        points="0,60 1440,0 1440,60"
        className="fill-background"
      />
    </svg>
  ),
  zigzag: (flip) => (
    <svg
      viewBox="0 0 1440 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      <motion.path
        d="M0,30 L60,10 L120,30 L180,10 L240,30 L300,10 L360,30 L420,10 L480,30 L540,10 L600,30 L660,10 L720,30 L780,10 L840,30 L900,10 L960,30 L1020,10 L1080,30 L1140,10 L1200,30 L1260,10 L1320,30 L1380,10 L1440,30 L1440,60 L0,60 Z"
        className="fill-background"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  ),
  dots: (flip) => (
    <svg
      viewBox="0 0 1440 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      {/* Row of dots with fade-in opacity */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.circle
          key={i}
          cx={72 + i * 72}
          cy={30}
          r="3"
          className="fill-emerald"
          initial={{ opacity: 0.1, scale: 0.5 }}
          animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  ),
  diagonal: (flip) => (
    <svg
      viewBox="0 0 1440 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      <defs>
        <pattern id="diagonal-pattern" x="0" y="0" width="40" height="60" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="40" y2="60" stroke="currentColor" strokeWidth="1" className="text-emerald/10" />
        </pattern>
      </defs>
      <rect width="1440" height="60" fill="url(#diagonal-pattern)" />
      <motion.path
        d="M0,55 L1440,5 L1440,60 L0,60 Z"
        className="fill-background"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
      />
    </svg>
  ),
};

const transitionOrder: TransitionStyle[] = ['wave', 'double-wave', 'curve', 'angle', 'zigzag', 'dots', 'diagonal'];

export function SectionTransition({
  style,
  flip = false,
  className = '',
}: SectionTransitionProps) {
  const transitionStyle = style || 'wave';

  return (
    <div
      className={`relative w-full overflow-hidden leading-[0] ${className}`}
      aria-hidden="true"
    >
      <div className="relative">
        {transitions[transitionStyle](flip)}
      </div>
    </div>
  );
}

export function getTransitionStyle(index: number): TransitionStyle {
  return transitionOrder[index % transitionOrder.length];
}
