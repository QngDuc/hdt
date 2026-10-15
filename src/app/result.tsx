import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button, Loading, Page, QuestionCard, styles } from "../components/ui";
import { useQuiz } from "../quiz/context";
import { formatDuration } from "../quiz/logic";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, loading } = useQuiz();
  const result = state.history.find((r) => r.id === id);
  if (loading)
    return (
      <Page>
        <Loading />
      </Page>
    );
  if (!result)
    return (
      <Page>
        <Text style={styles.text}>Không tìm thấy kết quả.</Text>
        <Button label="Về trang bắt đầu" onPress={() => router.replace("/")} />
      </Page>
    );
  return (
    <Page>
      <Text style={styles.title}>Kết quả: {result.score}/10 điểm</Text>
      <View style={styles.card}>
        <Text style={styles.text}>
          {result.student.name} • {result.student.code}
        </Text>
        <Text style={styles.text}>Chủ đề: {result.topic}</Text>
        <Text style={styles.text}>
          Bắt đầu: {new Date(result.startedAt).toLocaleString("vi-VN")}
        </Text>
        <Text style={styles.text}>
          Đúng: {result.correctCount} • Sai: {result.wrongCount} • Chưa trả lời:{" "}
          {result.unansweredCount}
        </Text>
        <Text style={styles.text}>
          Thời gian đã dùng: {formatDuration(result.usedSeconds)}
        </Text>
      </View>
      <Button label="Làm bài mới" onPress={() => router.replace("/")} />
      <Button
        secondary
        label="Lịch sử làm bài"
        onPress={() => router.push("/history")}
      />
      <Text style={styles.title}>Xem lại bài (chỉ đọc)</Text>
      {result.questions.map((q, i) => (
        <View key={q.id} style={{ gap: 8 }}>
          <Text style={styles.text}>Câu {i + 1}</Text>
          <QuestionCard question={q} selected={result.answers[q.id]} review />
        </View>
      ))}
    </Page>
  );
}
