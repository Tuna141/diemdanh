import type { Attendance, BonusTransaction, DashboardStats, Student } from "../types";
import { weekKeyFromMillis } from "../utils/date";
import { calculateBonusTotals } from "./bonusService";

function increment(map: Map<string, number>, key: string, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function mapToDateSeries(map: Map<string, number>) {
  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date, count }));
}

function mapToWeekSeries(map: Map<string, number>) {
  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([week, count]) => ({ week, count }));
}

function mapToMonthSeries(map: Map<string, number>) {
  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, count]) => ({ month, count }));
}

export function buildDashboardStats(
  students: Student[],
  attendance: Attendance[],
  bonusTransactions: BonusTransaction[],
): DashboardStats {
  const daily = new Map<string, number>();
  const weekly = new Map<string, number>();
  const monthly = new Map<string, number>();
  const participants = new Map<string, { studentId: string; studentName: string; count: number }>();

  for (const record of attendance) {
    increment(daily, record.dateKey);
    increment(weekly, weekKeyFromMillis(record.createdAtMillis));
    increment(monthly, record.dateKey.slice(0, 7));
    const current = participants.get(record.studentId) ?? {
      studentId: record.studentId,
      studentName: record.studentName,
      count: 0,
    };
    current.count += 1;
    participants.set(record.studentId, current);
  }

  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const todayCount = attendance.filter((record) => record.dateKey === todayKey).length;

  return {
    totalStudents: students.length,
    totalAttendance: attendance.length,
    attendanceRate: students.length === 0 ? 0 : Math.round((todayCount / students.length) * 100),
    dailyAttendance: mapToDateSeries(daily).slice(-30),
    weeklyAttendance: mapToWeekSeries(weekly).slice(-12),
    monthlyAttendance: mapToMonthSeries(monthly).slice(-12),
    topParticipants: [...participants.values()]
      .sort((left, right) => right.count - left.count || left.studentName.localeCompare(right.studentName, "vi"))
      .slice(0, 10),
    topBonusEarners: calculateBonusTotals(bonusTransactions).slice(0, 10),
  };
}
