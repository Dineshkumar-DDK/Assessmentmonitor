import { logEvent } from '@/lib/eventLogger';
import { useEffect, useState, useCallback } from 'react';

interface UseFocusMonitorOptions {
  attemptId: string;
  enabled?: boolean;
}

export function useFocusMonitor({ attemptId, enabled = true }: UseFocusMonitorOptions) {
  const [isFocused, setIsFocused] = useState(true);
  const [blurCount, setBlurCount] = useState(0);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setBlurCount((c) => c + 1);
    logEvent('tab_blur', attemptId, undefined, 'Window lost focus');
  }, [attemptId]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    logEvent('tab_focus', attemptId, undefined, 'Window regained focus');
  }, [attemptId]);

  const handleVisibility = useCallback(() => {
    if (document.hidden) {
      logEvent('visibility_hidden', attemptId, undefined, 'Tab hidden');
    } else {
      logEvent('visibility_visible', attemptId, undefined, 'Tab visible');
    }
  }, [attemptId]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, handleBlur, handleFocus, handleVisibility]);

  return { isFocused, blurCount };
}
