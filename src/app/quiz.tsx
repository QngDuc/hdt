import { useEffect, useState } from "react";
import { Modal, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Loading, Page, QuestionCard, styles } from "../components/ui";
import { useQuiz } from "../quiz/context";
import { formatDuration, remainingSeconds } from "../quiz/logic";

export default function Quiz() {
  const { state, loading, error, answer, finish } = useQuiz();
  const active = state.active;
  const [id] = useState(active?.id);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!active && id && state.history.some((r) => r.id === id)) {
      router.replace({ pathname: "/result", params: { id } });
    }
  }, [active, id, state.history]);
  async function submit() {
    if (!active) return;
    setBusy(true);
    try {
      const resultId = await finish(active.id);
      setConfirm(false);
      router.replace({ pathname: "/result", params: { id: resultId } });
    } catch {
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <Page>
        <Loading />
      </Page>
    );
  if (!active)
    return (
      <Page>
        <Text style={styles.text}>Không có bài đang làm.</Text>
        <Button label="Về trang bắt đầu" onPress={() => router.replace("/")} />
      </Page>
    );
  const answered = Object.keys(active.answers).length;
  const remaining = remainingSeconds(active, now);
  const question = active.questions[index];
  return (
    <Page>
      <Text style={styles.title}>{active.topic}</Text>
      <Text style={styles.text}>
        Câu {index + 1}/5 • Đã trả lời {answered}/5
      </Text>
      <Text
        style={[
          styles.title,
          { color: remaining < 30 ? "#b91c1c" : "#172554" },
        ]}
      >
        Còn {formatDuration(remaining)}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        {active.questions.map((q, i) => (
          <Button
            key={q.id}
            secondary={i !== index}
            label={`${i + 1}${active.answers[q.id] !== undefined ? " ✓" : " ○"}`}
            onPress={() => setIndex(i)}
          />
        ))}
      </View>
      <Text style={styles.text}>✓ Đã trả lời • ○ Chưa trả lời</Text>
      <QuestionCard
        question={question}
        selected={active.answers[question.id]}
        onSelect={
          remaining === 0 || busy
            ? undefined
            : (choice) => {
                void answer(active.id, question.id, choice).catch(() => {});
              }
        }
      />
      <View style={styles.row}>
        <Button
          secondary
          label="Câu trước"
          disabled={index === 0}
          onPress={() => setIndex(index - 1)}
        />
        <Button
          secondary
          label="Câu tiếp theo"
          disabled={index === 4}
          onPress={() => setIndex(index + 1)}
        />
      </View>
      <Button
        label={
          busy
            ? "Đang lưu kết quả…"
            : remaining === 0
              ? "Thử lưu bài hết giờ"
              : "Nộp bài"
        }
        disabled={busy}
        onPress={() => (remaining === 0 ? void submit() : setConfirm(true))}
      />
      <Modal
        visible={confirm && remaining > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#0008",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Xác nhận nộp bài?</Text>
            <Text style={styles.text}>
              Còn {5 - answered} câu chưa trả lời. Nếu hủy, thời gian vẫn tiếp
              tục chạy.
            </Text>
            <Button
              label="Xác nhận nộp bài"
              disabled={busy}
              onPress={() => void submit()}
            />
            <Button
              secondary
              label="Hủy, tiếp tục làm"
              disabled={busy}
              onPress={() => setConfirm(false)}
            />
          </View>
        </View>
      </Modal>
    </Page>
  );
}
