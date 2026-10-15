export type Topic = "Toán học" | "Tin học";
export interface Question {
  id: string;
  topic: Topic;
  text: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
}
export interface Student {
  name: string;
  code: string;
}
export interface Attempt {
  id: string;
  student: Student;
  topic: Topic;
  questions: Question[];
  answers: Record<string, number>;
  startedAt: number;
  expiresAt: number;
}
export interface Result extends Attempt {
  submittedAt: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  usedSeconds: number;
}
export interface SavedState {
  student: Student;
  active: Attempt | null;
  history: Result[];
}
