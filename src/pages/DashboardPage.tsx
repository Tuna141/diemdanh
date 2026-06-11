import { Download, Users, ClipboardCheck, Percent, Sigma } from "lucide-react";
import { useCallback } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../components/Button";
import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { useAsync } from "../hooks/useAsync";
import { getBonusTransactions } from "../services/bonusService";
import { buildDashboardStats } from "../services/statsService";
import { getStudents } from "../services/studentService";
import { exportStatistics } from "../utils/excel";

export function DashboardPage() {
  const loadStats = useCallback(async () => {
    const [students, bonus] = await Promise.all([
      getStudents(),
      getBonusTransactions(1000),
    ]);
    return buildDashboardStats(students, [], bonus);
  }, []);
  const stats = useAsync(loadStats, null);

  if (stats.loading) {
    return <Notice type="info" message="Đang tải thống kê..." />;
  }

  if (stats.error || !stats.data) {
    return <Notice type="error" message={stats.error || "Không tải được thống kê"} />;
  }

  const dashboardStats = stats.data;

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        actions={
          <Button variant="secondary" onClick={() => exportStatistics(dashboardStats)} icon={<Download size={18} />}>
            Xuất Excel
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Học viên" value={dashboardStats.totalStudents} icon={<Users size={22} />} />
        <StatCard title="Lượt điểm danh" value={dashboardStats.totalAttendance} icon={<ClipboardCheck size={22} />} />
        <StatCard title="Tỷ lệ hôm nay" value={`${dashboardStats.attendanceRate}%`} icon={<Percent size={22} />} />
        <StatCard title="Top có dữ liệu" value={dashboardStats.topParticipants.length} icon={<Sigma size={22} />} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Chart title="30 ngày gần đây" data={dashboardStats.dailyAttendance} dataKey="date" />
        <Chart title="12 tháng gần đây" data={dashboardStats.monthlyAttendance} dataKey="month" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Rank title="Top điểm danh" rows={dashboardStats.topParticipants.map((row) => [row.studentName, row.count])} />
        <Rank title="Top điểm thưởng" rows={dashboardStats.topBonusEarners.map((row) => [row.studentName, row.points])} />
      </div>
    </div>
  );
}

function Chart({ title, data, dataKey }: { title: string; data: Record<string, string | number>[]; dataKey: string }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Rank({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="divide-y divide-stone-100">
        {rows.map(([name, value]) => (
          <div key={name} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>{name}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
