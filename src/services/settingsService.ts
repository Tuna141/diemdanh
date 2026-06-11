import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { AppSettings } from "../types";

const settingsRef = doc(db, "settings", "app");

export async function getSettings(): Promise<AppSettings> {
  const snapshot = await getDoc(settingsRef);
  if (!snapshot.exists()) {
    return {
      schoolName: "Điểm danh",
      attendanceOpen: true,
      updatedAt: Timestamp.now(),
    };
  }

  const data = snapshot.data();
  return {
    schoolName: String(data.schoolName ?? "Điểm danh"),
    attendanceOpen: Boolean(data.attendanceOpen ?? true),
    updatedAt: data.updatedAt,
  };
}

export async function saveSettings(input: { schoolName: string; attendanceOpen: boolean }) {
  await setDoc(
    settingsRef,
    {
      ...input,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
