import { z } from "zod";

export const imageSchema = z
  .instanceof(File, { message: "Vui lòng chọn ảnh" })
  .refine((file) => file.type.startsWith("image/"), "Chỉ nhận tệp ảnh")
  .refine((file) => file.size <= 10 * 1024 * 1024, "Ảnh tối đa 10 MB");

export const attendanceSchema = z.object({
  studentId: z.string().min(1, "Vui lòng chọn tên"),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự"),
  image: imageSchema,
});

export const studentSchema = z.object({
  fullName: z.string().trim().min(1, "Tên bắt buộc").max(120, "Tên tối đa 120 ký tự"),
  status: z.enum(["absent", "present"]),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const bonusSchema = z.object({
  studentId: z.string().min(1, "Vui lòng chọn học viên"),
  points: z.number().int("Điểm phải là số nguyên").min(-999).max(999),
  reason: z.string().trim().min(1, "Lý do bắt buộc").max(200, "Lý do tối đa 200 ký tự"),
});

export const settingsSchema = z.object({
  schoolName: z.string().trim().min(1, "Tên hệ thống bắt buộc").max(120),
  attendanceOpen: z.boolean(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;
export type StudentFormValues = z.infer<typeof studentSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type BonusFormValues = z.infer<typeof bonusSchema>;
export type SettingsFormValues = z.infer<typeof settingsSchema>;
