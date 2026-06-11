import * as XLSX from "xlsx";
import type {
  Attendance,
  AttendanceExportRow,
  DashboardStats,
  Student,
  StudentInput,
} from "../types";
import { formatDateTime } from "./date";

type SheetRow = Record<string, string | number | boolean>;

function downloadWorkbook(
  fileName: string,
  sheets: { name: string; rows: SheetRow[] }[]
) {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.rows);

    const headers = Object.keys(sheet.rows[0] ?? {});

    ws["!cols"] = headers.map((h) => ({
      wch: Math.max(
        h.length,
        ...sheet.rows.map((r) => String(r[h] ?? "").length),
        10
      ),
    }));

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

    const linkColIndex = headers.indexOf("Image Link");

    if (linkColIndex !== -1) {
      for (let r = 1; r <= range.e.r; r++) {
        const addr = XLSX.utils.encode_cell({ r, c: linkColIndex });
        const cell = ws[addr];

        if (cell?.v && typeof cell.v === "string") {
          cell.l = { Target: cell.v };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
  }

  XLSX.writeFile(workbook, fileName);
}

// ================= EXPORT ATTENDANCE =================
export function exportAttendanceSession(rows: AttendanceExportRow[]) {
  const safeRows = rows.map((r) => {
    const url =
      typeof r.imageUrl === "string" && r.imageUrl.startsWith("http")
        ? r.imageUrl
        : "";

    return {
      Name: r.fullName,
      Status: r.status as "present" | "absent",
      Note: r.note ?? "",
      Image: url ? "Click to open" : "No image",
      "Image Link": url,
    };
  });

  const ws = XLSX.utils.json_to_sheet(safeRows);

  const headers = Object.keys(safeRows[0] ?? {});
  const linkIndex = headers.indexOf("Image Link");

  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  if (linkIndex !== -1) {
    for (let r = 1; r <= range.e.r; r++) {
      const addr = XLSX.utils.encode_cell({ r, c: linkIndex });
      const cell = ws[addr];

      if (cell?.v) {
        cell.l = { Target: cell.v };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  XLSX.writeFile(wb, "attendance.xlsx");
}

// ================= STUDENTS =================
export function exportStudents(students: Student[]) {
  downloadWorkbook("hoc-vien.xlsx", [
    {
      name: "Students",
      rows: students.map((s) => ({
        "Họ tên": s.fullName,
        "Trạng thái": s.status as "present" | "absent",
      })),
    },
  ]);
}

// ================= ATTENDANCE =================
export function exportAttendance(attendance: Attendance[]) {
  downloadWorkbook("diem-danh.xlsx", [
    {
      name: "Diem danh",
      rows: attendance.map((r) => ({
        "Ngày": r.dateKey,
        "Thời gian": formatDateTime(r.createdAtMillis),
        "Họ tên": r.studentName,
        "Ghi chú": r.note,
        "Ảnh": r.imagePath,
      })),
    },
  ]);
}

// ================= STATISTICS =================
export function exportStatistics(stats: DashboardStats) {
  downloadWorkbook("thong-ke.xlsx", [
    {
      name: "Overview",
      rows: [
        { "Chỉ số": "Tổng học viên", "Giá trị": stats.totalStudents },
        { "Chỉ số": "Tổng lượt", "Giá trị": stats.totalAttendance },
      ],
    },
  ]);
}

// ================= IMPORT FIX =================
export function parseStudentImport(file: File): Promise<StudentInput[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () =>
      reject(new Error("Không đọc được file Excel"));

    reader.onload = () => {
      const wb = XLSX.read(reader.result, { type: "array" });

      if (!wb.SheetNames?.length) {
        return reject(new Error("No sheet found"));
      }

      const firstSheetName = wb.SheetNames?.[0];

      if (!firstSheetName) {
        return reject(new Error("No sheet found"));
      }

      const sheet = wb.Sheets[firstSheetName];

      if (!sheet) return reject(new Error("No sheet"));

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      resolve(
        rows
          .map((r) => ({
            fullName: String(r["Họ tên"] ?? "").trim(),
            status:
              String(r["Trạng thái"] ?? "").toLowerCase() === "có mặt"
                ? ("present" as const)
                : ("absent" as const),
          }))
          .filter((r) => r.fullName)
      );
    };

    reader.readAsArrayBuffer(file);
  });
}