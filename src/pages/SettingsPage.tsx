import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { Field, SelectInput, TextInput } from "../components/Field";
import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";
import { useAsync } from "../hooks/useAsync";
import { settingsSchema, type SettingsFormValues } from "../schemas";
import { createCustomField, deleteCustomField, getCustomFields } from "../services/customFieldService";
import { getSettings, saveSettings } from "../services/settingsService";
import type { CustomField } from "../types";

export function SettingsPage() {
  const settings = useAsync(useCallback(() => getSettings(), []), null);
  const fields = useAsync(useCallback(() => getCustomFields(), []), []);
  const [message, setMessage] = useState("");
  const [fieldDraft, setFieldDraft] = useState<{ label: string; type: CustomField["type"]; required: boolean }>({
    label: "",
    type: "text",
    required: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { schoolName: "Điểm danh", attendanceOpen: true },
  });

  useEffect(() => {
    if (settings.data) {
      reset({
        schoolName: settings.data.schoolName,
        attendanceOpen: settings.data.attendanceOpen,
      });
    }
  }, [settings.data, reset]);

  async function onSubmit(values: SettingsFormValues) {
    await saveSettings(values);
    setMessage("Đã lưu cài đặt");
    await settings.refresh();
  }

  async function addField() {
    const label = fieldDraft.label.trim();
    if (!label) {
      return;
    }
    await createCustomField({ ...fieldDraft, label });
    setFieldDraft({ label: "", type: "text", required: false });
    await fields.refresh();
  }

  async function removeField(fieldId: string) {
    await deleteCustomField(fieldId);
    await fields.refresh();
  }

  return (
    <div>
      <PageHeader title="Cài đặt" />
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
          <h2 className="font-semibold">Hệ thống</h2>
          {message ? <Notice type="success" message={message} /> : null}
          {settings.error ? <Notice type="error" message={settings.error} /> : null}
          <Field label="Tên hiển thị" error={errors.schoolName?.message}>
            <TextInput {...register("schoolName")} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-5" {...register("attendanceOpen")} />
            Mở điểm danh
          </label>
          <Button type="submit" disabled={isSubmitting} icon={<Save size={18} />}>Lưu</Button>
        </form>
        <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
          <h2 className="font-semibold">Trường tùy chỉnh</h2>
          <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
            <TextInput
              placeholder="Tên trường"
              value={fieldDraft.label}
              onChange={(event) => setFieldDraft((current) => ({ ...current, label: event.target.value }))}
            />
            <SelectInput
              value={fieldDraft.type}
              onChange={(event) =>
                setFieldDraft((current) => ({ ...current, type: event.target.value as CustomField["type"] }))
              }
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
            </SelectInput>
            <Button type="button" onClick={() => void addField()}>Thêm</Button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-5"
              checked={fieldDraft.required}
              onChange={(event) => setFieldDraft((current) => ({ ...current, required: event.target.checked }))}
            />
            Bắt buộc
          </label>
          <div className="divide-y divide-stone-100">
            {fields.data.map((field) => (
              <div key={field.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{field.label} · {field.type} · {field.required ? "Bắt buộc" : "Không bắt buộc"}</span>
                <Button variant="danger" onClick={() => void removeField(field.id)} icon={<Trash2 size={16} />}>Xóa</Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
