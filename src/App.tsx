import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AdminLayout } from "./components/Layout";
import { Notice } from "./components/Notice";
import { useAuth } from "./hooks/useAuth";
import { AttendanceAdminPage } from "./pages/AttendanceAdminPage";
import { AttendancePage } from "./pages/AttendancePage";
import { BonusPage } from "./pages/BonusPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { seedStudentsIfEmpty } from "./services/studentService";

function RequireAdmin() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <div className="p-4"><Notice type="info" message="Đang kiểm tra đăng nhập..." /></div>;
  }

  if (!auth.user || !auth.isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <AdminLayout />;
}

export default function App() {
  useEffect(() => {
    void seedStudentsIfEmpty().catch(() => undefined);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<AttendancePage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/attendance" element={<AttendanceAdminPage />} />
        <Route path="/admin/bonus" element={<BonusPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
