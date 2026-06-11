import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileUp, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { Field, SelectInput, TextInput } from "../components/Field";
import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { studentSchema, type StudentFormValues } from "../schemas";
import { createStudent, deleteStudent, getStudents, updateStudent } from "../services/studentService";
import type { Student } from "../types";
import { exportStudents, parseStudentImport } from "../utils/excel";

export function StudentsPage() {
  const loadStudents = useCallback(() => getStudents(), []);
  const students = useAsync(loadStudents, []);
  const [editing, setEditing] = useState<Student | null>(null);
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: "", status: "absent" },
  });

  function startEdit(student: Student) {
    setEditing(student);
    reset({ fullName: student.fullName, status: student.status });
  }

  async function onSubmit(values: StudentFormValues) {
    if (editing) {
      await updateStudent(editing.id, values);
      setMessage("Đã cập nhật học viên");
    } else {
      await createStudent(values);
      setMessage("Đã thêm học viên");
    }
    setEditing(null);
    reset({ fullName: "", status: "absent" });
    await students.refresh();
  }

  async function handleImport(file: File | null) {
    if (!file) {
      return;
    }
    const rows = await parseStudentImport(file);
    await Promise.all(rows.map((row) => createStudent(row)));
    setMessage(`Đã nhập ${rows.length} học viên`);
    await students.refresh();
  }

  async function handleDelete(student: Student) {
    if (!confirm(`Xóa ${student.fullName}?`)) {
      return;
    }
    await deleteStudent(student.id);
    await students.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Học viên"
        actions={
          <>
            <label className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-900 hover:bg-teal-50">
              <FileUp size={18} />
              Nhập Excel
              <input className="hidden" type="file" accept=".xlsx,.xls" onChange={(event) => void handleImport(event.target.files?.[0] ?? null)} />
            </label>
            <Button variant="secondary" onClick={() => exportStudents(students.data)} icon={<Download size={18} />}>
              Xuất Excel
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
          <h2 className="font-semibold">{editing ? "Sửa học viên" : "Thêm học viên"}</h2>
          {message ? <Notice type="success" message={message} /> : null}
          <Field label="Họ tên" error={errors.fullName?.message}>
            <TextInput {...register("fullName")} />
          </Field>
          <Field label="Trạng thái" error={errors.status?.message}>
            <SelectInput {...register("status")}>
              <option value="absent">Vắng</option>
              <option value="present">Có mặt</option>
            </SelectInput>
          </Field>
          <Button type="submit" disabled={isSubmitting} icon={editing ? <Save size={18} /> : <Plus size={18} />}>
            {editing ? "Lưu" : "Thêm"}
          </Button>
        </form>
        <section className="overflow-hidden rounded-md border border-stone-200 bg-white">
          {students.error ? <Notice type="error" message={students.error} /> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="p-3">Họ tên</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {students.data.map((student) => (
                  <tr key={student.id}>
                    <td className="p-3 font-medium">{student.fullName}</td>
                    <td className="p-3">{student.status === "present" ? "Có mặt" : "Vắng"}</td>
                    <td className="flex gap-2 p-3">
                      <Button variant="secondary" onClick={() => startEdit(student)}>Sửa</Button>
                      <Button variant="danger" onClick={() => void handleDelete(student)} icon={<Trash2 size={16} />}>Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
