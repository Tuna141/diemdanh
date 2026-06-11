export function Notice({ type, message }: { type: "error" | "success" | "info"; message: string }) {
  const className = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  }[type];

  return <p className={`rounded-md border px-3 py-2 text-sm ${className}`}>{message}</p>;
}
