import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/* Thin, safe wrappers — no-ops on web, never throw. */

export async function tapLight() {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function tapMedium() {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {}
}

export async function notifySuccess() {
  if (Platform.OS === "web") return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}
