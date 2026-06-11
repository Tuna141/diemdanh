import type { Timestamp } from "firebase/firestore";

export type Student = {
  id: string;
  fullName: string;
  status: "absent" | "present";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type StudentInput = {
  fullName: string;
  status: "absent" | "present";
};

export type Attendance = {
  id: string;
  studentId: string;
  studentName: string;
  note: string;
  imagePath: string;
  dateKey: string;
  createdAt: Timestamp;
  createdAtMillis: number;
};

export type AttendanceSessionStudent = {
  studentId: string;
  fullName: string;
  status: "absent" | "present";
  imageUrl: string;
  note: string;
};

export type AttendanceExportRow = {
  fullName: string;
  status: "absent" | "present";
  imageUrl: string;
  note: string;
};

export type AttendanceSession = {
  id: string;
  createdAt: Timestamp;
  createdAtMillis: number;
  exported: boolean;
  students: AttendanceSessionStudent[];
};

export type AttendanceSessionInput = {
  students: AttendanceSessionStudent[];
};

export type AttendanceInput = {
  studentId: string;
  note: string;
  image: File;
};

export type DailyAttendance = {
  attendanceId: string;
  studentId: string;
  dateKey: string;
  createdAt: Timestamp;
};

export type BonusTransaction = {
  id: string;
  studentId: string;
  studentName: string;
  points: number;
  reason: string;
  createdAt: Timestamp;
  createdAtMillis: number;
};

export type BonusInput = {
  studentId: string;
  points: number;
  reason: string;
};

export type AppSettings = {
  schoolName: string;
  attendanceOpen: boolean;
  updatedAt: Timestamp;
};

export type DashboardStats = {
  totalStudents: number;
  totalAttendance: number;
  attendanceRate: number;
  dailyAttendance: { date: string; count: number }[];
  weeklyAttendance: { week: string; count: number }[];
  monthlyAttendance: { month: string; count: number }[];
  topParticipants: { studentId: string; studentName: string; count: number }[];
  topBonusEarners: { studentId: string; studentName: string; points: number }[];
};

export type CustomField = {
  id: string;
  label: string;
  type: "text" | "number" | "date";
  required: boolean;
  createdAt: Timestamp;
};

export type AuthState = {
  user: import("firebase/auth").User | null;
  isAdmin: boolean;
  loading: boolean;
};
