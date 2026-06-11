import { BarChart3, Gift, Home, LogOut, Settings, Users, ClipboardList } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../services/authService";
import { Button } from "./Button";

const navItems = [
  { to: "/admin", label: "Tổng quan", icon: BarChart3 },
  { to: "/admin/students", label: "Học viên", icon: Users },
  { to: "/admin/attendance", label: "Điểm danh", icon: ClipboardList },
  { to: "/admin/bonus", label: "Điểm thưởng", icon: Gift },
  { to: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-stone-50 px-4 py-4 sm:py-8">{children}</main>;
}

export function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutAdmin();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="focus-ring inline-flex items-center gap-2 rounded-md font-bold text-teal-900">
            <Home size={20} />
            Điểm danh
          </NavLink>
          <Button variant="ghost" onClick={handleLogout} icon={<LogOut size={18} />}>
            Thoát
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto rounded-md border border-stone-200 bg-white p-2 lg:block lg:space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `focus-ring flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                    isActive ? "bg-teal-700 text-white" : "text-stone-800 hover:bg-stone-100"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
