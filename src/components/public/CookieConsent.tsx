'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, X, Check, BarChart3, Megaphone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguageStore } from '@/store/language-store';
import { getTranslations } from '@/lib/i18n';

const COOKIE_KEY = 'cookie-consent';

interface ConsentState {
  accepted: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: string;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    accepted: false,
    analytics: true,
    marketing: false,
  });
  const { language } = useLanguageStore();
  const t = getTranslations(language);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const state: ConsentState = { accepted: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
    localStorage.setItem(COOKIE_KEY, JSON.stringify(state));
    setVisible(false);
  };

  const handleAcceptSelected = () => {
    const state: ConsentState = { ...consent, accepted: true, timestamp: new Date().toISOString() };
    localStorage.setItem(COOKIE_KEY, JSON.stringify(state));
    setVisible(false);
  };

  const handleReject = () => {
    const state: ConsentState = { accepted: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
    localStorage.setItem(COOKIE_KEY, JSON.stringify(state));
    setVisible(false);
  };

  const cookieCategories = [
    {
      key: 'necessary' as const,
      label: t.cookie.necessary,
      description: t.cookie.necessaryDesc,
      icon: Lock,
      required: true,
      enabled: true,
    },
    {
      key: 'analytics' as const,
      label: t.cookie.analytics,
      description: t.cookie.analyticsDesc,
      icon: BarChart3,
      required: false,
      enabled: consent.analytics,
    },
    {
      key: 'marketing' as const,
      label: t.cookie.marketing,
      description: t.cookie.marketingDesc,
      icon: Megaphone,
      required: false,
      enabled: consent.marketing,
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4"
        >
          <div className="container mx-auto max-w-4xl">
            <motion.div
              className="rounded-2xl p-6 shadow-2xl shadow-black/20 border border-white/10 backdrop-blur-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              {/* Apply dark mode styles via a wrapper */}
              <div className="dark:hidden" />
              <style>{`
                .dark [class*="backdrop-blur-2xl"] {
                  background: rgba(17, 24, 22, 0.85) !important;
                  border-color: rgba(16, 185, 129, 0.1) !important;
                }
              `}</style>

              {!showDetails ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-11 h-11 rounded-xl gradient-emerald flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                      <Cookie className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {t.cookie.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.cookie.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(true)}
                      className="text-xs flex-1 sm:flex-initial gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {t.cookie.customize}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReject}
                      className="text-xs flex-1 sm:flex-initial"
                    >
                      {t.cookie.reject}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptAll}
                      className="gradient-emerald text-white text-xs flex-1 sm:flex-initial shadow-md shadow-emerald-500/20"
                    >
                      {t.cookie.acceptAll}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      {t.cookie.privacySettings}
                    </h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {cookieCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <div
                          key={cat.key}
                          className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 ${
                            cat.required
                              ? 'bg-emerald-500/5 border border-emerald-500/10'
                              : 'hover:bg-muted/30 border border-transparent hover:border-border/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              cat.required
                                ? 'bg-emerald-500/10'
                                : cat.enabled
                                  ? 'bg-emerald-500/10'
                                  : 'bg-muted/50'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                cat.required || cat.enabled
                                  ? 'text-emerald-500'
                                  : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium flex items-center gap-1.5">
                                {cat.label}
                                {cat.required && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                                    {t.cookie.required}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                            </div>
                          </div>
                          <div className="shrink-0 mr-1">
                            {cat.required ? (
                              <div className="w-10 h-6 rounded-full bg-emerald-500 flex items-center justify-end px-0.5">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            ) : (
                              <Switch
                                checked={cat.enabled}
                                onCheckedChange={(checked) =>
                                  setConsent(prev => ({ ...prev, [cat.key]: checked }))
                                }
                                className="data-[state=checked]:bg-emerald-500"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-1">
                    <Button variant="outline" size="sm" onClick={handleReject} className="text-xs">
                      {t.cookie.rejectAll}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptSelected}
                      className="gradient-emerald text-white text-xs shadow-md shadow-emerald-500/20"
                    >
                      {t.cookie.savePreferences}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
