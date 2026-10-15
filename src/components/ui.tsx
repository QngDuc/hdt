import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Question } from '../quiz/types';

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f6fc' },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center', paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#172554' },
  text: { fontSize: 16, lineHeight: 25, color: '#334155' },
  card: { padding: 18, borderRadius: 16, backgroundColor: 'white', gap: 12, borderWidth: 1, borderColor: '#dbe3ef' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  input: { borderWidth: 1, borderColor: '#94a3b8', borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: 'white' },
  error: { color: '#b91c1c', fontSize: 16 },
});
export function Page({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.page} edges={['bottom', 'left', 'right']}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView></SafeAreaView>;
}
export function Button({ label, onPress, disabled = false, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={{ padding: 14, minHeight: 48, borderRadius: 10, backgroundColor: disabled ? '#cbd5e1' : secondary ? '#e0e7ff' : '#2563eb' }}><Text style={{ color: secondary ? '#1e3a8a' : 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{label}</Text></Pressable>;
}
export function Loading() { return <View style={styles.card}><ActivityIndicator size="large" /><Text style={styles.text}>Đang đọc dữ liệu đã lưu…</Text></View>; }
export function QuestionCard({ question, selected, onSelect, review = false }: { question: Question; selected?: number; onSelect?: (index: number) => void; review?: boolean }) {
  return <View style={styles.card}>
    <Text style={[styles.text, { fontWeight: '700' }]}>{question.text}</Text>
    {question.options.map((option, index) => {
      const correct = review && index === question.correct;
      const chosen = index === selected;
      return <Pressable key={index} disabled={review || !onSelect} accessibilityRole="radio" accessibilityState={{ checked: chosen, disabled: review }} onPress={() => onSelect?.(index)} style={{ padding: 14, borderRadius: 10, borderWidth: 2, borderColor: correct ? '#15803d' : chosen ? (review ? '#dc2626' : '#2563eb') : '#e2e8f0', backgroundColor: correct ? '#dcfce7' : chosen ? '#eff6ff' : '#fff' }}><Text style={styles.text}>{String.fromCharCode(65 + index)}. {option}{chosen ? ' • Đã chọn' : ''}{correct ? ' • Đáp án đúng' : ''}</Text></Pressable>;
    })}
    {review && <><Text style={styles.text}>{selected === undefined ? 'Bạn chưa trả lời câu này.' : selected === question.correct ? 'Bạn trả lời đúng.' : 'Bạn trả lời sai.'}</Text><Text style={styles.text}>Giải thích: {question.explanation}</Text></>}
  </View>;
}