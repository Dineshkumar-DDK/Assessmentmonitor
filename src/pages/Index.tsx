import { ExamFooter } from '@/components/ui/exam/ExamFooter';
import { ExamHeader } from '@/components/ui/exam/ExamHeader';
import { QuestionNav } from '@/components/ui/exam/QuestionNav';
import { QuestionPanel, type Question } from '@/components/ui/exam/QuestionPanel';
import { useExamSecurity } from '@/hooks/useExamSecurity';
import { useExamTimer } from '@/hooks/useExamTimer';
import { useFocusMonitor } from '@/hooks/useFocusMonitor';
import { useToast } from '@/hooks/useToast';
import { getAllLogs, logEvent, markSubmitted, resetLogger, startAutoFlush, stopAutoFlush, subscribeToLogs } from '@/lib/eventLogger';
import { useState, useCallback, useEffect } from 'react';
import { submitAttempt } from "@/api/attempt.api";

import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

const DURATION = 10;

const QUESTIONS: Question[] = [
    {
        id: 'q2',
        number: 1,
        text: 'Which of the following is NOT a valid HTTP status code category?',
        type: 'mcq',
        options: ['1xx - Informational', '2xx - Success', '6xx - Server Overload', '4xx - Client Error'],
    },
    {
        id: 'q4',
        number: 2,
        text: 'Which data structure uses LIFO (Last In, First Out) ordering?',
        type: 'mcq',
        options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    },
    {
        id: 'q6',
        number: 3,
        text: 'What is the time complexity of binary search?',
        type: 'mcq',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    },
    {
        id: 'q8',
        number: 4,
        text: 'Which protocol is used for secure web communication?',
        type: 'mcq',
        options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
    },
];

const Index = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [events, setEvents] = useState(getAllLogs());
    const [isStarted, setIsStarted] = useState(false);
    const { toast } = useToast();
    const currentQuestion = QUESTIONS[currentIndex];
    const [submittedAttemptId, setSubmittedAttemptId] = useState<string | null>(null);
    const [ATTEMPT_ID] = useState(() => `attempt-${Date.now()}`);

    useExamSecurity({
        attemptId: ATTEMPT_ID,
        questionId: currentQuestion?.id,
        enabled: isStarted && !isSubmitted,
    });

    const { isFocused, blurCount } = useFocusMonitor({
        attemptId: ATTEMPT_ID,
        enabled: isStarted && !isSubmitted,
    });

    const timer = useExamTimer({
        durationMinutes: DURATION,
        attemptId: ATTEMPT_ID,
        onExpire: () => handleSubmit(),
        enabled: isStarted && !isSubmitted,
    });

    useEffect(() => {
        if (!isStarted) return;

        const unsubscribe = subscribeToLogs((logs) => {
            setEvents(logs);
        });

        return unsubscribe;
    }, [isStarted]);


    const handleStart = useCallback(() => {
        resetLogger();
        setIsStarted(true);
        startAutoFlush();
        logEvent('exam_start', ATTEMPT_ID);
        timer.start();
    }, [timer, ATTEMPT_ID]);

    const handleAnswerChange = useCallback(
        (value: string) => {
            setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
            logEvent('answer_change', ATTEMPT_ID, currentQuestion.id);
        },
        [currentQuestion, ATTEMPT_ID]
    );

    const navigateTo = useCallback(
        (index: number) => {
            setCurrentIndex(index);
            logEvent('question_navigate', ATTEMPT_ID, QUESTIONS[index].id, `Navigated to Q${index + 1}`);
        },
        [ATTEMPT_ID]
    );

    const handleSubmit = useCallback(async () => {
        logEvent('exam_submit', ATTEMPT_ID);
        markSubmitted();
        stopAutoFlush();
        setIsSubmitted(true);
        setEvents(getAllLogs());
        toast({
            title: 'Exam Submitted',
            description: 'Your answers have been recorded successfully.',
        });

        const response = await submitAttempt(ATTEMPT_ID);
        const returnedId = response.data.attemptId;
        setSubmittedAttemptId(returnedId);
        timer.stop();
    }, [toast, timer, ATTEMPT_ID]);



    if (!isStarted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Technical Assessment</h1>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        This is a proctored exam. Copy, paste, cut, and right-click will be disabled.
                        Tab switches and focus changes are monitored. You have <strong>{DURATION} minutes</strong> to complete{' '}
                        <strong>{QUESTIONS.length} questions</strong>.
                    </p>
                    <div className="space-y-3 text-xs text-muted-foreground bg-muted rounded-lg p-4 mb-6 text-left">
                        <p>• Copy/Paste/Cut actions are blocked</p>
                        <p>• Right-click context menu is disabled</p>
                        <p>• Tab switches are tracked</p>
                        <p>• All activity is logged</p>
                    </div>
                    <button
                        onClick={handleStart}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        Begin Assessment
                    </button>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Assessment Submitted</h1>
                        <p className="text-muted-foreground text-sm mb-4">
                            Your responses have been recorded. {events.length} events were logged during this session.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Answers: {Object.values(answers).filter((a) => a.trim()).length}/{QUESTIONS.length} answered
                        </p>
                        <div className="bg-muted rounded-lg p-3 flex items-center justify-between mt-4">
                            <code className="text-sm font-mono truncate">
                                {submittedAttemptId}
                            </code>

                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                    if (submittedAttemptId) {
                                        navigator.clipboard.writeText(submittedAttemptId);
                                    }
                                }}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background no-select">
            <ExamHeader
                title="Technical Assessment"
                timerFormatted={timer.formatted}
                isCritical={timer.isCritical}
                isFocused={isFocused}
                blurCount={blurCount}
                currentQuestion={currentIndex + 1}
                totalQuestions={QUESTIONS.length}
            />

            <div className="flex flex-1 overflow-hidden">
                <QuestionPanel
                    question={currentQuestion}
                    answer={answers[currentQuestion.id] || ''}
                    onAnswerChange={handleAnswerChange}
                />
                <QuestionNav
                    questions={QUESTIONS}
                    currentIndex={currentIndex}
                    answers={answers}
                    onSelect={navigateTo}
                />
            </div>

            <ExamFooter
                currentIndex={currentIndex}
                totalQuestions={QUESTIONS.length}
                onPrev={() => navigateTo(Math.max(0, currentIndex - 1))}
                onNext={() => navigateTo(Math.min(QUESTIONS.length - 1, currentIndex + 1))}
                onSubmit={handleSubmit}
                isLastQuestion={currentIndex === QUESTIONS.length - 1}
            />


        </div>
    );
};

export default Index;
