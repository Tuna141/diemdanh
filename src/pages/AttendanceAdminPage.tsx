import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";

export function AttendanceAdminPage() {
  return (
    <div>
      <PageHeader title="Lịch sử điểm danh" />
      <Notice
        type="info"
        message="Điểm danh hiện xuất trực tiếp ra Excel trên máy người dùng. Không lưu lịch sử vào Firestore."
      />
    </div>
  );
}
