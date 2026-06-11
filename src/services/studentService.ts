import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Student, StudentInput } from "../types";

const studentsRef = collection(db, "students");
const seedRef = doc(db, "settings", "seed");

export const SEED_STUDENTS = [
  { id: "seed_dao_nhy_khang", fullName: "Đạo Nhỹ Khang" },
  { id: "seed_le_ngoc_phuong_dong", fullName: "Lê Ngọc Phương Đông" },
  { id: "seed_le_quynh_anh", fullName: "Lê Quỳnh Anh" },
  { id: "seed_le_trong_nghia", fullName: "Lê Trọng Nghĩa" },
  { id: "seed_nguyen_dinh_nguyen", fullName: "Nguyễn Đình Nguyên" },
  { id: "seed_nguyen_ly_phuc_thinh", fullName: "Nguyễn Lý Phúc Thịnh" },
  { id: "seed_nguyen_tran_thien_trang", fullName: "Nguyễn Trần Thiên Trang" },
  { id: "seed_nguyen_van_luc", fullName: "Nguyễn Văn Lực" },
  { id: "seed_tran_huynh_thuy_hoa", fullName: "Trần Huỳnh Thúy Hoa" },
  { id: "seed_tran_minh_quan", fullName: "Trần Minh Quân" },
  { id: "seed_vo_minh_thao", fullName: "Võ Minh Thảo" },
] as const;

function normalizeStatus(value: unknown): Student["status"] {
  return value === "present" ? "present" : "absent";
}

function sortStudents(students: Student[]) {
  return [...students].sort((left, right) => left.fullName.localeCompare(right.fullName, "vi"));
}

function toStudent(snapshot: import("firebase/firestore").QueryDocumentSnapshot): Student | null {
  const data = snapshot.data();
  const legacyName = typeof data.name === "string" ? data.name : "";
  const fullName = typeof data.fullName === "string" ? data.fullName : legacyName;

  if (!fullName.trim()) {
    return null;
  }

  return {
    id: snapshot.id,
    fullName: fullName.trim(),
    status: normalizeStatus(data.status),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
  };
}

export async function getStudents() {
  try {
    const snapshot = await getDocs(studentsRef);
    return sortStudents(snapshot.docs.map(toStudent).filter((student): student is Student => student !== null));
  } catch (error) {
    throw new Error(error instanceof Error ? `Không tải được học viên: ${error.message}` : "Không tải được học viên", {
      cause: error,
    });
  }
}

export async function createStudent(input: StudentInput) {
  const fullName = input.fullName.trim();
  if (!fullName) {
    throw new Error("Tên học viên bắt buộc");
  }

  try {
    await addDoc(studentsRef, {
      fullName,
      status: input.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error instanceof Error ? `Không tạo được học viên: ${error.message}` : "Không tạo được học viên", {
      cause: error,
    });
  }
}

export async function updateStudent(studentId: string, input: StudentInput) {
  if (!studentId) {
    throw new Error("Thiếu mã học viên");
  }

  const fullName = input.fullName.trim();
  if (!fullName) {
    throw new Error("Tên học viên bắt buộc");
  }

  try {
    await updateDoc(doc(db, "students", studentId), {
      fullName,
      status: input.status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(error instanceof Error ? `Không cập nhật được học viên: ${error.message}` : "Không cập nhật được học viên", {
      cause: error,
    });
  }
}

export async function deleteStudent(studentId: string) {
  if (!studentId) {
    throw new Error("Thiếu mã học viên");
  }

  try {
    await deleteDoc(doc(db, "students", studentId));
  } catch (error) {
    throw new Error(error instanceof Error ? `Không xóa được học viên: ${error.message}` : "Không xóa được học viên", {
      cause: error,
    });
  }
}

export async function resetAllStudentStatuses() {
  try {
    const snapshot = await getDocs(studentsRef);
    const batch = writeBatch(db);
    for (const studentDoc of snapshot.docs) {
      batch.update(studentDoc.ref, {
        status: "absent",
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (error) {
    throw new Error(error instanceof Error ? `Không reset được điểm danh: ${error.message}` : "Không reset được điểm danh", {
      cause: error,
    });
  }
}

export async function seedStudentsIfEmpty() {
  try {
    const batch = writeBatch(db);
    for (const student of SEED_STUDENTS) {
      batch.set(doc(db, "students", student.id), {
        fullName: student.fullName,
        status: "absent",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    batch.set(seedRef, {
      completed: true,
      createdAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    await setDoc(seedRef, {
      completed: false,
      error: error instanceof Error ? error.message : "Unknown seed error",
      createdAt: serverTimestamp(),
    }).catch(() => undefined);
    throw error;
  }
}
