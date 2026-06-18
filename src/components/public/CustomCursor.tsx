'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: fine)').matches;
  });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState('emerald');
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const ringXSpring = useSpring(ringX, springConfig);
  const ringYSpring = useSpring(ringY, springConfig);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Directly set cursor position for minimal lag
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);

      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDesktop, cursorX, cursorY, ringX, ringY, isVisible]);

  // Track hoverable elements
  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor-hover], label[for]'
      );
      setIsHovering(!!isInteractive);
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, [isDesktop]);

  // Track section colors
  useEffect(() => {
    if (!isDesktop) return;

    const sectionColors: Record<string, string> = {
      hero: 'emerald',
      about: 'teal',
      skills: 'emerald',
      projects: 'teal',
      services: 'emerald',
      testimonials: 'teal',
      experience: 'emerald',
      education: 'teal',
      faq: 'emerald',
      contact: 'teal',
      blog: 'emerald',
    };

    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + window.innerHeight / 2;

      sections.forEach((section) => {
        const top = (section as HTMLElement).offsetTop;
        const height = (section as HTMLElement).offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          const color = sectionColors[section.id] || 'emerald';
          setCurrentColor(color);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDesktop]);

  if (!isDesktop) return null;

  const dotColor = currentColor === 'teal'
    ? 'bg-teal-500'
    : 'bg-emerald-500';
  const ringColor = currentColor === 'teal'
    ? 'border-teal-500/50'
    : 'border-emerald-500/50';

  return (
    <>
      {/* Small dot cursor */}
      <motion.div
        className={`fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] mix-blend-difference ${dotColor}`}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isVisible ? 1 : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Large ring cursor */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border-2 ${ringColor}`}
        style={{
          x: ringXSpring,
          y: ringYSpring,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
        }}
        animate={{
          scale: isVisible ? 1 : 0,
          opacity: isHovering ? 0.8 : 0.4,
        }}
        transition={{
          width: { duration: 0.3, ease: 'easeOut' },
          height: { duration: 0.3, ease: 'easeOut' },
          opacity: { duration: 0.2 },
          scale: { duration: 0.15 },
        }}
      />
    </>
  );
}
