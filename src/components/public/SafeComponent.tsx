'use client';

import React, { Component, ReactNode } from 'react';

interface SafeComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface SafeComponentState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary wrapper that catches errors from child components
 * and renders a fallback instead of crashing the entire page.
 */
export class SafeComponent extends Component<SafeComponentProps, SafeComponentState> {
  constructor(props: SafeComponentProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeComponentState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(`[SafeComponent${this.props.name ? ` (${this.props.name})` : ''}] Error caught:`, error.message);
    if (process.env.NODE_ENV === 'development') {
      console.warn('Component stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      // Silent fallback - just render nothing so the page doesn't break
      return null;
    }
    return this.props.children;
  }
}
