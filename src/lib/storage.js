import AsyncStorage from "@react-native-async-storage/async-storage";

/* JSON-friendly AsyncStorage wrappers (also work on web via localStorage). */

export async function loadJSON(key, fallback = null) {
  try {
    const v = await AsyncStorage.getItem(key);
    return v != null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function removeKeys(keys) {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {}
}
