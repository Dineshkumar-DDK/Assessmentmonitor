import { logEvent } from '@/lib/eventLogger';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseExamTimerOptions {
    durationMinutes: number;
    attemptId: string;
    onExpire?: () => void;
    enabled: boolean;

}
export function useExamTimer({ durationMinutes, attemptId, onExpire, enabled }: UseExamTimerOptions) {
    const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const warningLogged = useRef(false);
    const intervalRef:any= useRef(null);
    const start = useCallback(() => {
        setIsRunning(true);
        logEvent('timer_start', attemptId, undefined, `Duration: ${durationMinutes}min`);
    }, [attemptId, durationMinutes]);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        
        return () => clearInterval(intervalRef.current);
    }, [enabled]);


    useEffect(() => {

        if (!enabled) return;
        //   console.log(isRunning,"cheking the running....",new Date().toISOString())
      

        intervalRef.current = setInterval(() => {
            setRemainingSeconds((prev) => {
                const next = prev - 1;
               
                if (next === 300 && !warningLogged.current) {
                    warningLogged.current = true;
                    logEvent('timer_warning', attemptId, undefined, '5 minutes remaining');
                }

                if (next <= 0) {
                    clearInterval(intervalRef.current);
                    setIsRunning(false);
                    logEvent('timer_expired', attemptId);
                    onExpire?.();
                    return 0;
                }

                return next;
            });
        }, 1000);

         return () => clearInterval(intervalRef.current);
    }, [enabled]);

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const isCritical = remainingSeconds <= 300;
    const progress = ((durationMinutes * 60 - remainingSeconds) / (durationMinutes * 60)) * 100;

    return {
        minutes,
        seconds,
        remainingSeconds,
        isCritical,
        isRunning,
        progress,
        start,
        stop,
        formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
}
