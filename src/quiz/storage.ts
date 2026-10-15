import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedState } from "./types";

const key = "@quiz-practice/state-v1";
export const emptyState: SavedState = {
  student: { name: "", code: "" },
  active: null,
  history: [],
};
export async function readState(): Promise<SavedState> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return emptyState;
  const value = JSON.parse(raw) as SavedState;
  if (!value.student || !Array.isArray(value.history) || !("active" in value))
    throw new Error("Dữ liệu lưu không hợp lệ.");
  return value;
}
export async function writeState(state: SavedState) {
  await AsyncStorage.setItem(key, JSON.stringify(state));
}
