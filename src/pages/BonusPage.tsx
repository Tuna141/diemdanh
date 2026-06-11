import { zodResolver } from "@hookform/resolvers/zod";
import { Gift, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { Field, SelectInput, TextInput } from "../components/Field";
import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { bonusSchema, type BonusFormValues } from "../schemas";
import { createBonusTransaction, getBonusTransactions } from "../services/bonusService";
import { getStudents } from "../services/studentService";
import { formatDateTime } from "../utils/date";

export function BonusPage() {
  const loadStudents = useCallback(() => getStudents(), []);
  const loadBonus = useCallback(() => getBonusTransactions(1000), []);
  const students = useAsync(loadStudents, []);
  const bonus = useAsync(loadBonus, []);
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BonusFormValues>({
    resolver: zodResolver(bonusSchema),
    defaultValues: { studentId: "", points: 1, reason: "" },
  });

  async function onSubmit(values: BonusFormValues) {
    await createBonusTransaction(values);
    setMessage("Đã ghi điểm thưởng");
    reset({ studentId: "", points: 1, reason: "" });
    await bonus.refresh();
  }

  return (
    <div>
      <PageHeader title="Điểm thưởng" />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-semibold"><Gift size={18} /> Ghi điểm</h2>
          {message ? <Notice type="success" message={message} /> : null}
          <Field label="Học viên" error={errors.studentId?.message}>
            <SelectInput {...register("studentId")}>
              <option value="">Chọn học viên</option>
              {students.data.map((student) => (
                <option key={student.id} value={student.id}>{student.fullName}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Điểm" error={errors.points?.message}>
            <TextInput type="number" {...register("points", { valueAsNumber: true })} />
          </Field>
          <Field label="Lý do" error={errors.reason?.message}>
            <TextInput {...register("reason")} />
          </Field>
          <Button type="submit" disabled={isSubmitting} icon={<Plus size={18} />}>Ghi điểm</Button>
        </form>
        <section className="overflow-hidden rounded-md border border-stone-200 bg-white">
          {bonus.error ? <Notice type="error" message={bonus.error} /> : null}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3">Học viên</th>
                  <th className="p-3">Điểm</th>
                  <th className="p-3">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bonus.data.map((row) => (
                  <tr key={row.id}>
                    <td className="p-3">{formatDateTime(row.createdAtMillis)}</td>
                    <td className="p-3 font-medium">{row.studentName}</td>
                    <td className="p-3">{row.points}</td>
                    <td className="p-3">{row.reason}</td>
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
