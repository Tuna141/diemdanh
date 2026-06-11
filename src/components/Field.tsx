import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, error, children }: BaseProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-stone-800">{label}</span>
      {children}
      {error ? <span className="block text-sm text-red-700">{error}</span> : null}
    </label>
  );
}

const controlClass =
  "focus-ring min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  props,
  ref,
) {
  return <input ref={ref} className={controlClass} {...props} />;
});

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={controlClass} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlClass} min-h-20 resize-y`} {...props} />;
}
