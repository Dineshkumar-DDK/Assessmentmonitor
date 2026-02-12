import { useEffect, useCallback, useRef } from 'react';

import { logEvent, type EventType } from '@/lib/eventLogger';
import { useToast } from './useToast';

interface UseExamSecurityOptions {
    attemptId: string;
    questionId?: string;
    enabled?: boolean;
    onViolation?: (type: EventType) => void;
}

export function useExamSecurity({
    attemptId,
    questionId,
    enabled = true,
    onViolation,
}: UseExamSecurityOptions) {
    const { toast } = useToast();
    const violationCount = useRef(0);

    const showWarning = useCallback(
        (message: string) => {
            toast({
                variant: 'destructive',
                title: 'Action Blocked',
                description: message,
                duration: 3000,
            });
        },
        [toast]
    );

    const handleViolation = useCallback(
        (type: EventType, message: string, detail?: string) => {
            violationCount.current++;
            logEvent(type, attemptId, questionId, detail);
            showWarning(message);
            onViolation?.(type);
        },
        [attemptId, questionId, showWarning, onViolation]
    );

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isMeta = e.ctrlKey || e.metaKey;

            if (isMeta && e.key === 'c') {
                e.preventDefault();
                handleViolation('copy_attempt', 'Copy is disabled during the assessment.', `Key: ${e.key}`);
            }
            if (isMeta && e.key === 'v') {
                e.preventDefault();
                handleViolation('paste_attempt', 'Paste is disabled during the assessment.', `Key: ${e.key}`);
            }
            if (isMeta && e.key === 'x') {
                e.preventDefault();
                handleViolation('cut_attempt', 'Cut is disabled during the assessment.', `Key: ${e.key}`);
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            handleViolation('right_click_attempt', 'Right-click is disabled during the assessment.');
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            handleViolation('copy_attempt', 'Copy is disabled during the assessment.', 'clipboard event');
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            handleViolation('paste_attempt', 'Paste is disabled during the assessment.', 'clipboard event');
        };

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault();
            handleViolation('cut_attempt', 'Cut is disabled during the assessment.', 'clipboard event');
        };

        const handleSelectStart = (e: Event) => {
            const target = e.target as HTMLElement;
            // Allow selection in input/textarea elements
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.closest('.exam-input-allowed')
            ) {
                return;
            }
            e.preventDefault();
            logEvent('text_select_attempt', attemptId, questionId, 'selectstart');
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('cut', handleCut);
        document.addEventListener('selectstart', handleSelectStart);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('selectstart', handleSelectStart);
        };
    }, [enabled, handleViolation, attemptId, questionId]);

    return { violationCount }
}