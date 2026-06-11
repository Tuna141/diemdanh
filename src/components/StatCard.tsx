import type { ReactNode } from "react";

export function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: ReactNode }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-600">{title}</p>
        <span className="text-teal-800">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-stone-950">{value}</p>
    </div>
  );
}
