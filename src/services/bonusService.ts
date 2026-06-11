import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { BonusInput, BonusTransaction } from "../types";

const bonusRef = collection(db, "bonusTransactions");

function toBonus(snapshot: import("firebase/firestore").QueryDocumentSnapshot): BonusTransaction {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    studentId: String(data.studentId ?? ""),
    studentName: String(data.studentName ?? ""),
    points: Number(data.points ?? 0),
    reason: String(data.reason ?? ""),
    createdAt: data.createdAt,
    createdAtMillis: Number(data.createdAtMillis ?? 0),
  };
}

export async function createBonusTransaction(input: BonusInput) {
  if (!input.studentId) {
    throw new Error("Thiếu mã học viên");
  }

  const studentSnap = await getDoc(doc(db, "students", input.studentId));
  if (!studentSnap.exists()) {
    throw new Error("Không tìm thấy học viên");
  }

  const studentData = studentSnap.data();
  const fullName = String(studentData.fullName ?? studentData.name ?? "").trim();
  if (!fullName) {
    throw new Error("Dữ liệu học viên thiếu họ tên");
  }

  await addDoc(bonusRef, {
    studentId: input.studentId,
    studentName: fullName,
    points: input.points,
    reason: input.reason.trim(),
    createdAt: serverTimestamp(),
    createdAtMillis: Date.now(),
  });
}

export async function getBonusTransactions(maxRecords = 500) {
  const snapshot = await getDocs(
    query(bonusRef, orderBy("createdAtMillis", "desc"), limit(maxRecords)),
  );
  return snapshot.docs.map(toBonus);
}

export function calculateBonusTotals(transactions: BonusTransaction[]) {
  const totals = new Map<string, { studentId: string; studentName: string; points: number }>();
  for (const transaction of transactions) {
    const current = totals.get(transaction.studentId) ?? {
      studentId: transaction.studentId,
      studentName: transaction.studentName,
      points: 0,
    };
    current.points += transaction.points;
    totals.set(transaction.studentId, current);
  }
  return [...totals.values()].sort(
    (left, right) => right.points - left.points || left.studentName.localeCompare(right.studentName, "vi"),
  );
}
