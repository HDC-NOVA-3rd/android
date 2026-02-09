// src/api/chatUiStorage.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

const KEY_PINNED = "chat_pinned_session_ids";
const KEY_ARCHIVED = "chat_archived_session_ids";
const KEY_DEBUG = "chat_debug_enabled";

const getItem = async (key: string) => {
  if (isWeb) return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
};

const setItem = async (key: string, value: string) => {
  if (isWeb) return localStorage.setItem(key, value);
  return await SecureStore.setItemAsync(key, value);
};

const removeItem = async (key: string) => {
  if (isWeb) return localStorage.removeItem(key);
  return await SecureStore.deleteItemAsync(key);
};

const readSet = async (key: string): Promise<Set<string>> => {
  const raw = await getItem(key);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
};

const writeSet = async (key: string, set: Set<string>) => {
  await setItem(key, JSON.stringify(Array.from(set)));
};

// 📌 pinned
export const getPinnedIds = async () => readSet(KEY_PINNED);
export const togglePinnedId = async (sessionId: string) => {
  const set = await readSet(KEY_PINNED);
  if (set.has(sessionId)) set.delete(sessionId);
  else set.add(sessionId);
  await writeSet(KEY_PINNED, set);
  return set;
};
export const clearPinned = async () => removeItem(KEY_PINNED);

// 🗄 archived (숨김)
export const getArchivedIds = async () => readSet(KEY_ARCHIVED);
export const archiveId = async (sessionId: string) => {
  const set = await readSet(KEY_ARCHIVED);
  set.add(sessionId);
  await writeSet(KEY_ARCHIVED, set);
  return set;
};
export const unarchiveId = async (sessionId: string) => {
  const set = await readSet(KEY_ARCHIVED);
  set.delete(sessionId);
  await writeSet(KEY_ARCHIVED, set);
  return set;
};
export const clearArchived = async () => removeItem(KEY_ARCHIVED);

// 🧪 debug
export const getDebugEnabled = async (): Promise<boolean> => {
  const v = await getItem(KEY_DEBUG);
  return v === "1";
};
export const setDebugEnabled = async (on: boolean) => setItem(KEY_DEBUG, on ? "1" : "0");
