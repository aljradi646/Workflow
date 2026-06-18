'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxWrapperProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
}

export function ParallaxWrapper({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
}: ParallaxWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [multiplier * speed * 60, multiplier * speed * -60]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y,
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
}
