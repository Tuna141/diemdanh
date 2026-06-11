import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { AttendanceSession, AttendanceSessionStudent } from "../types";

const sessionsRef = collection(db, "attendance_session");

function normalizeStatus(value: unknown): "absent" | "present" {
  return value === "present" ? "present" : "absent";
}

function toStudentRow(value: unknown): AttendanceSessionStudent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const studentId = String(row.studentId ?? "");
  const fullName = String(row.fullName ?? "");

  if (!studentId || !fullName) {
    return null;
  }

  return {
    studentId,
    fullName,
    status: normalizeStatus(row.status),
    imageUrl: String(row.imageUrl ?? ""),
    note: String(row.note ?? ""),
  };
}

function toAttendanceSession(snapshot: import("firebase/firestore").QueryDocumentSnapshot): AttendanceSession {
  const data = snapshot.data();
  const rows = Array.isArray(data.students)
    ? data.students.map(toStudentRow).filter((row): row is AttendanceSessionStudent => row !== null)
    : [];

  return {
    id: snapshot.id,
    createdAt: data.createdAt,
    createdAtMillis: Number(data.createdAtMillis ?? 0),
    exported: Boolean(data.exported),
    students: rows,
  };
}

function makeRows(students: AttendanceSessionStudent[]) {
  return students.map((student) => ({
    studentId: student.studentId,
    fullName: student.fullName,
    status: student.status,
    imageUrl: student.imageUrl ?? "",
    note: student.note ?? "",
  }));
}

export async function saveAttendanceSession(students: AttendanceSessionStudent[]) {
  const rows = makeRows(students);
  const latest = await getLatestAttendanceSession();

  if (latest) {
    await updateDoc(doc(db, "attendance_session", latest.id), {
      updatedAt: serverTimestamp(),
      students: rows,
    });
    return;
  }

  await addDoc(sessionsRef, {
    createdAt: serverTimestamp(),
    createdAtMillis: Date.now(),
    students: rows,
  });
}

export async function createAttendanceSession(students: AttendanceSessionStudent[]) {
  const rows = students.map((student) => ({
    studentId: student.studentId,
    fullName: student.fullName,
    status: student.status,
    imageUrl: student.imageUrl ?? "",
    note: student.note ?? "",
  }));

  await addDoc(sessionsRef, {
    createdAt: serverTimestamp(),
    createdAtMillis: Date.now(),
    students: rows,
  });
}

export async function getLatestAttendanceSession() {
  const snapshot = await getDocs(query(sessionsRef, orderBy("createdAtMillis", "desc"), limit(1)));
  const latest = snapshot.docs[0];
  return latest ? toAttendanceSession(latest) : null;
}
