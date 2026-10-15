import { questions } from "./questions";
import type { Attempt, Result, Student, Topic } from "./types";

export function createAttempt(
  topic: Topic,
  student: Student,
  now = Date.now(),
): Attempt {
  const pool = questions.filter((q) => q.topic === topic);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return {
    id: `${now}-${Math.random().toString(36).slice(2)}`,
    student: { ...student },
    topic,
    questions: pool.slice(0, 5),
    answers: {},
    startedAt: now,
    expiresAt: now + 180000,
  };
}
export function grade(attempt: Attempt, now = Date.now()): Result {
  const correctCount = attempt.questions.filter(
    (q) => attempt.answers[q.id] === q.correct,
  ).length;
  const unansweredCount = attempt.questions.filter(
    (q) => attempt.answers[q.id] === undefined,
  ).length;
  const submittedAt = Math.min(
    Math.max(now, attempt.startedAt),
    attempt.expiresAt,
  );
  return {
    ...attempt,
    submittedAt,
    correctCount,
    unansweredCount,
    wrongCount: 5 - correctCount - unansweredCount,
    score: correctCount * 2,
    usedSeconds: Math.ceil((submittedAt - attempt.startedAt) / 1000),
  };
}
export function remainingSeconds(attempt: Attempt, now = Date.now()) {
  return Math.max(0, Math.ceil((attempt.expiresAt - now) / 1000));
}
export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
