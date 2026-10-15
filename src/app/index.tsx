import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Button, Loading, Page, styles } from "../components/ui";
import { useQuiz } from "../quiz/context";
import { topics } from "../quiz/questions";
import type { Topic } from "../quiz/types";

export default function Home() {
  const { state, loading, error, load, start } = useQuiz();
  const [nameDraft, setName] = useState<string | null>(null);
  const [codeDraft, setCode] = useState<string | null>(null);
  const name = nameDraft ?? state.student.name;
  const code = codeDraft ?? state.student.code;
  const [topic, setTopic] = useState<Topic>(topics[0]);
  const [busy, setBusy] = useState(false);
  async function begin() {
    setBusy(true);
    try {
      await start(topic, { name: name.trim(), code: code.trim() });
      router.push("/quiz");
    } catch {
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <Text style={styles.title}>Sẵn sàng thử sức?</Text>
      <Text style={styles.text}>
        5 câu hỏi ngẫu nhiên • 3 phút • tối đa 10 điểm
      </Text>
      {loading ? (
        <Loading />
      ) : (
        <>
          {error ? (
            <>
              <Text style={styles.error}>{error}</Text>
              <Button label="Đọc lại dữ liệu" onPress={() => void load()} />
            </>
          ) : null}
          <View style={styles.card}>
            <Text style={styles.text}>Thông tin sinh viên</Text>
            <TextInput
              accessibilityLabel="Họ tên"
              placeholder="Họ và tên"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              accessibilityLabel="Mã sinh viên"
              placeholder="Mã sinh viên"
              value={code}
              onChangeText={setCode}
              style={styles.input}
            />
          </View>
          {state.active ? (
            <View style={styles.card}>
              <Text style={styles.text}>
                Bạn có bài {state.active.topic} đang làm. Bộ câu hỏi và thời hạn
                được giữ nguyên.
              </Text>
              <Button
                label="Tiếp tục bài đang làm"
                onPress={() => router.push("/quiz")}
              />
            </View>
          ) : (
            <>
              <Text style={styles.text}>Chọn chủ đề</Text>
              {topics.map((t) => (
                <Button
                  key={t}
                  secondary={topic !== t}
                  label={`${topic === t ? "✓ " : ""}${t}`}
                  onPress={() => setTopic(t)}
                />
              ))}
              <Button
                label={busy ? "Đang tạo bài…" : "Bắt đầu làm bài"}
                disabled={busy || !!error || !name.trim() || !code.trim()}
                onPress={() => void begin()}
              />
            </>
          )}
          <Button
            secondary
            label="Xem lịch sử làm bài"
            onPress={() => router.push("/history")}
          />
        </>
      )}
    </Page>
  );
}
