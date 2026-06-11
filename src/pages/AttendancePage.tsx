import { uploadToImgBB } from "../services/imgbbService";
import { Download, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "../components/Button";
import { TextInput } from "../components/Field";
import { PublicLayout } from "../components/Layout";
import { Notice } from "../components/Notice";
import { useAsync } from "../hooks/useAsync";
import {
  getLatestAttendanceSession,
  saveAttendanceSession,
} from "../services/attendanceSessionService";
import { getSettings } from "../services/settingsService";
import { getStudents } from "../services/studentService";
import { exportAttendanceSession } from "../utils/excel";
import type {
  AttendanceExportRow,
  AttendanceSessionStudent,
} from "../types";

type RowForm = {
  studentId: string;
  fullName: string;
  status: "absent" | "present";
  imageUrl: string;
  note: string;
};

type AttendanceForm = {
  rows: RowForm[];
};

export function AttendancePage() {
  const students = useAsync(useCallback(() => getStudents(), []), []);
  const settings = useAsync(useCallback(() => getSettings(), []), null);
  const latestSession = useAsync(
    useCallback(() => getLatestAttendanceSession(), []),
    null
  );

  const [message, setMessage] = useState<{
    type: "error" | "success" | "info";
    text: string;
  } | null>(null);

  // ================= INIT =================
  const defaultRows = useMemo<RowForm[]>(() => {
    const map = new Map(
      latestSession.data?.students.map((s) => [s.studentId, s]) ?? []
    );

    return students.data.map((s) => {
      const saved = map.get(s.id);

      return {
        studentId: s.id,
        fullName: s.fullName,
        status: saved?.status ?? "absent",
        imageUrl: saved?.imageUrl ?? "",
        note: saved?.note ?? "",
      };
    });
  }, [students.data, latestSession.data]);

  const { control, setValue, reset } = useForm<AttendanceForm>({
    defaultValues: { rows: defaultRows },
  });

  const { fields, update } = useFieldArray({
    control,
    name: "rows",
  });

  const rows = useWatch({ control, name: "rows" }) ?? [];

  useEffect(() => {
    reset({ rows: defaultRows });
  }, [defaultRows, reset]);

  // ================= IMAGE UPLOAD =================
  async function handleImageSelect(index: number, file: File | null) {
  if (!file) return;

  try {
    console.log("📤 uploading...");

    const url = await uploadToImgBB(file);

    console.log("🔥 RECEIVED URL:", url);

    setValue(`rows.${index}.imageUrl`, url);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
  }
}
  // ================= SAVE =================
  async function handleSave() {
    try {
      const payload: AttendanceSessionStudent[] = rows.map((r) => ({
        studentId: r.studentId,
        fullName: r.fullName,
        status: r.status,
        imageUrl: r.imageUrl || "",
        note: r.note || "",
      }));

      await saveAttendanceSession(payload);
      await latestSession.refresh();

      setMessage({ type: "success", text: "Đã lưu điểm danh" });
    } catch {
      setMessage({ type: "error", text: "Lưu thất bại" });
    }
  }

  // ================= EXPORT (SAFE) =================
  function handleExport() {
    const snapshot: AttendanceExportRow[] = rows.map((r) => {
      let url = r.imageUrl || "";

      // chặn lỗi Excel
      if (
        url.startsWith("data:") ||
        url.startsWith("blob:") ||
        url.length > 2000
      ) {
        url = "";
      }

      return {
        fullName: r.fullName,
        status: r.status,
        note: r.note || "",
        imageUrl: url,
      };
    });

    console.log("📦 EXPORT SNAPSHOT:", snapshot);

    exportAttendanceSession(snapshot);
  }
  function handleReset() {
  const resetRows = rows.map((r) => ({
    ...r,
    status: "absent" as "absent",
    imageUrl: "",
    note: "",
  }));

  setValue("rows", resetRows, {
    shouldDirty: true,
  });
}

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">
          {settings.data?.schoolName ?? "Điểm danh"}
        </h1>

        {message && <Notice type={message.type} message={message.text} />}

        <div className="flex gap-2 mb-4">
  <Button onClick={handleSave} icon={<Save size={16} />}>
    Save
  </Button>

  <Button onClick={handleExport} icon={<Download size={16} />}>
    Export Excel
  </Button>

  <Button onClick={handleReset}>
    Reset
  </Button>
</div>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Image</th>
              <th>Note</th>
            </tr>
          </thead>

          <tbody>
            {fields.map((f, i) => (
              <tr key={f.id}>
                <td>{rows[i]?.fullName}</td>

                <td>
                  <input
                    type="checkbox"
                    checked={rows[i]?.status === "present"}
                    onChange={(e) =>
                      setValue(
                        `rows.${i}.status`,
                        e.target.checked ? "present" : "absent"
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      void handleImageSelect(i, e.target.files?.[0] ?? null)
                    }
                  />

                  {rows[i]?.imageUrl && (
                    <img
                      src={rows[i].imageUrl}
                      className="h-16 w-16 mt-2 rounded"
                    />
                  )}
                </td>

                <td>
                  <TextInput
                    value={rows[i]?.note || ""}
                    onChange={(e) =>
                      setValue(`rows.${i}.note`, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PublicLayout>
  );
}