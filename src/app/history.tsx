import { Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Loading, Page, styles } from "../components/ui";
import { useQuiz } from "../quiz/context";
import { formatDuration } from "../quiz/logic";

export default function History() {
  const { state, loading, error } = useQuiz();
  const history = [...state.history].sort(
    (a, b) => b.submittedAt - a.submittedAt,
  );
  const average = history.length
    ? history.reduce((sum, r) => sum + r.score, 0) / history.length
    : 0;
  return (
    <Page>
      <Text style={styles.title}>Lịch sử luyện tập</Text>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Text style={styles.text}>
            Tổng số lượt: {history.length} • Điểm trung bình:{" "}
            {average.toFixed(2)}/10
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!history.length && (
            <Text style={styles.text}>Chưa có lượt làm bài hoàn thành.</Text>
          )}
          {history.map((r) => (
            <View key={r.id} style={styles.card}>
              <Text style={[styles.text, { fontWeight: "700" }]}>
                {r.topic} • {r.score}/10 điểm
              </Text>
              <Text style={styles.text}>
                {new Date(r.startedAt).toLocaleString("vi-VN")} •{" "}
                {formatDuration(r.usedSeconds)}
              </Text>
              <Button
                secondary
                label="Xem chi tiết"
                onPress={() =>
                  router.push({ pathname: "/result", params: { id: r.id } })
                }
              />
            </View>
          ))}
        </>
      )}
      <Button label="Về trang bắt đầu" onPress={() => router.replace("/")} />
    </Page>
  );
}
