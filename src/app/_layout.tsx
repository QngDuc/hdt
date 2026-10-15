import { Stack } from "expo-router";
import { QuizProvider } from "../quiz/context";

export default function Layout() {
  return (
    <QuizProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#f3f6fc" },
          headerTintColor: "#172554",
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Luyện tập trắc nghiệm" }}
        />
        <Stack.Screen name="quiz" options={{ title: "Làm bài" }} />
        <Stack.Screen name="result" options={{ title: "Kết quả & xem lại" }} />
        <Stack.Screen name="history" options={{ title: "Lịch sử làm bài" }} />
      </Stack>
    </QuizProvider>
  );
}
