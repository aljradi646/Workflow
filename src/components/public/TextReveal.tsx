'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type RevealType = 'fade-up' | 'fade-in' | 'typewriter';

interface TextRevealProps {
  text: string;
  className?: string;
  type?: RevealType;
  delay?: number;
  staggerDelay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

const characterVariants: Record<RevealType, {
  initial: { opacity: number; y?: number; x?: number };
  animate: { opacity: number; y?: number; x?: number };
}> = {
  'fade-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  'fade-in': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  typewriter: {
    initial: { opacity: 0, x: -5 },
    animate: { opacity: 1, x: 0 },
  },
};

export function TextReveal({
  text,
  className = '',
  type = 'fade-up',
  delay = 0,
  staggerDelay = 0.03,
  as: Tag = 'span',
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const variant = characterVariants[type];
  const isArabic = isArabicText(text);

  // For Arabic text, split by words to preserve ligatures and character joining
  // For English/Latin text, split by characters for finer animation
  if (isArabic) {
    const words = text.split(' ').map((word, i) => ({
      word,
      key: `word-${i}`,
    }));

    return (
      <div ref={ref} className={`inline-block ${className}`}>
        <Tag className="inline">
          {words.map((item, i) => (
            <motion.span
              key={item.key}
              className="inline"
              initial={variant.initial}
              animate={isInView ? variant.animate : variant.initial}
              transition={{
                duration: 0.4,
                delay: delay + i * staggerDelay * 3,
                ease: 'easeOut',
              }}
            >
              {item.word}{i < words.length - 1 ? ' ' : ''}
            </motion.span>
          ))}
        </Tag>
      </div>
    );
  }

  // Non-Arabic: character-by-character animation
  const characters = text.split('').map((char, i) => ({
    char,
    key: `${char}-${i}`,
    isSpace: char === ' ',
  }));

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      <Tag className="inline">
        {characters.map((item, i) => (
          <motion.span
            key={item.key}
            className="inline-block"
            style={{ whiteSpace: item.isSpace ? 'pre' : 'normal' }}
            initial={variant.initial}
            animate={isInView ? variant.animate : variant.initial}
            transition={{
              duration: 0.4,
              delay: delay + i * staggerDelay,
              ease: 'easeOut',
            }}
          >
            {item.char}
          </motion.span>
        ))}
      </Tag>
    </div>
  );
}
