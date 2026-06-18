'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareEnabled?: boolean;
  glareOpacity?: number;
  scale?: number;
  springConfig?: { damping: number; stiffness: number };
  /** Enable spotlight effect that follows cursor */
  spotlightEnabled?: boolean;
  /** Enable glass reflection sweep on hover */
  glassSweepEnabled?: boolean;
  /** Enable border glow on hover */
  borderGlowEnabled?: boolean;
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 10,
  glareEnabled = true,
  glareOpacity = 0.15,
  scale = 1.02,
  springConfig = { damping: 20, stiffness: 200 },
  spotlightEnabled = true,
  glassSweepEnabled = false,
  borderGlowEnabled = false,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(16, 185, 129, ${glareOpacity}), transparent 60%)`
  );

  // Spotlight position
  const spotlightX = useMotionValue(50);
  const spotlightY = useMotionValue(50);

  const spotlightBackground = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.04) 30%, transparent 60%)`
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateXVal = (-mouseY / (rect.height / 2)) * maxTilt;
      const rotateYVal = (mouseX / (rect.width / 2)) * maxTilt;

      rotateX.set(rotateXVal);
      rotateY.set(rotateYVal);

      // Update glare position
      const glareXVal = ((e.clientX - rect.left) / rect.width) * 100;
      const glareYVal = ((e.clientY - rect.top) / rect.height) * 100;
      glareX.set(glareXVal);
      glareY.set(glareYVal);

      // Update spotlight position
      if (spotlightEnabled) {
        spotlightX.set(glareXVal);
        spotlightY.set(glareYVal);
      }
    },
    [maxTilt, rotateX, rotateY, glareX, glareY, spotlightX, spotlightY, spotlightEnabled]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
    if (spotlightEnabled) {
      spotlightX.set(50);
      spotlightY.set(50);
    }
    setIsHovered(false);
  }, [rotateX, rotateY, glareX, glareY, spotlightX, spotlightY, spotlightEnabled]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const combinedClassName = [
    'tilt-card',
    glassSweepEnabled ? 'card-glass-sweep' : '',
    borderGlowEnabled ? 'card-border-glow' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      ref={ref}
      className={combinedClassName}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      animate={{
        scale: isHovered ? scale : 1,
      }}
      transition={{ scale: { duration: 0.2 } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {children}

      {/* Spotlight overlay - follows cursor within card */}
      {spotlightEnabled && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden"
          style={{
            background: spotlightBackground,
            opacity: isHovered ? 1 : 0,
            zIndex: 1,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Glare overlay */}
      {glareEnabled && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden"
          style={{
            background: glareBackground,
            opacity: isHovered ? 1 : 0,
            zIndex: 2,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}
