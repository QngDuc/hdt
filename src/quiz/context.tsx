import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { createAttempt, grade } from "./logic";
import { emptyState, readState, writeState } from "./storage";
import type { SavedState, Student, Topic } from "./types";

function useQuizStore() {
  const [state, setState] = useState<SavedState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const current = useRef(state);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const transact = useCallback(
    async <T,>(
      operation: (saved: SavedState) => { next: SavedState; result: T },
    ): Promise<T> => {
      const task = queue.current.then(async () => {
        const { next, result } = operation(current.current);
        await writeState(next);
        current.current = next;
        setState(next);
        setError("");
        return result;
      });
      queue.current = task.catch(() => {
        setError(
          "Không thể lưu dữ liệu. Vui lòng thử lại; bài và thời gian vẫn được giữ nguyên.",
        );
      });
      return task;
    },
    [],
  );
  const finish = useCallback(
    (id: string) => {
      return transact((saved) => {
        const existing = saved.history.find((r) => r.id === id);
        if (existing) return { next: saved, result: existing.id };
        if (!saved.active || saved.active.id !== id)
          throw new Error("Không tìm thấy bài đang làm.");
        const result = grade(saved.active);
        return {
          next: { ...saved, active: null, history: [result, ...saved.history] },
          result: result.id,
        };
      });
    },
    [transact],
  );
  async function load() {
    setLoading(true);
    try {
      let saved = await readState();
      if (saved.active && saved.active.expiresAt <= Date.now()) {
        const result = grade(saved.active);
        saved = {
          ...saved,
          active: null,
          history: [result, ...saved.history.filter((r) => r.id !== result.id)],
        };
        await writeState(saved);
      }
      current.current = saved;
      setState(saved);
      setError("");
    } catch {
      setError(
        "Không thể đọc dữ liệu đã lưu. Hãy thử lại, dữ liệu cũ không bị xóa.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);
  useEffect(() => {
    const check = () => {
      const active = current.current.active;
      if (active && Date.now() >= active.expiresAt)
        void finish(active.id).catch(() => {});
    };
    const timer = setInterval(check, 500);
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") check();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [finish]);
  return {
    state,
    loading,
    error,
    load,
    finish,
    start: (topic: Topic, student: Student) =>
      transact((saved) => {
        if (saved.active) return { next: saved, result: saved.active.id };
        const active = createAttempt(topic, student);
        return { next: { ...saved, student, active }, result: active.id };
      }),
    answer: (id: string, questionId: string, choice: number) =>
      transact((saved) => {
        const active = saved.active;
        if (!active || active.id !== id || Date.now() >= active.expiresAt)
          return { next: saved, result: undefined };
        return {
          next: {
            ...saved,
            active: {
              ...active,
              answers: { ...active.answers, [questionId]: choice },
            },
          },
          result: undefined,
        };
      }),
  };
}
const QuizContext = createContext<ReturnType<typeof useQuizStore> | null>(null);
export function QuizProvider({ children }: { children: React.ReactNode }) {
  const value = useQuizStore();
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}
export function useQuiz() {
  const value = useContext(QuizContext);
  if (!value) throw new Error("QuizProvider chưa được khởi tạo.");
  return value;
}
