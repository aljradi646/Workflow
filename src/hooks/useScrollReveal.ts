'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  /** IntersectionObserver threshold – 0–1, fraction of element visible */
  threshold?: number;
  /** Margin around the root element, e.g. '-50px' */
  rootMargin?: string;
  /** If true, the reveal fires only once and then disconnects the observer */
  once?: boolean;
}

/**
 * A reusable hook that adds intersection-observer-based reveal animations.
 *
 * @param options - Configuration for the IntersectionObserver
 * @returns A ref to attach to the target element and a boolean `isVisible`
 *
 * @example
 * ```tsx
 * const [ref, isVisible] = useScrollReveal({ threshold: 0.15 });
 * return <div ref={ref} className={isVisible ? 'opacity-100' : 'opacity-0'}>...</div>;
 * ```
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {},
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = '-50px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}
