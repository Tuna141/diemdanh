import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Field, TextInput } from "../components/Field";
import { PublicLayout } from "../components/Layout";
import { Notice } from "../components/Notice";
import { loginSchema, type LoginFormValues } from "../schemas";
import { loginAdmin } from "../services/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setError("");
    try {
      await loginAdmin(values.email, values.password);
      navigate("/admin");
    } catch {
      setError("Email hoặc mật khẩu không đúng");
    }
  }

  return (
    <PublicLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-10 max-w-sm space-y-4 rounded-md border border-stone-200 bg-white p-5">
        <h1 className="text-xl font-bold text-teal-900">Quản trị</h1>
        {error ? <Notice type="error" message={error} /> : null}
        <Field label="Email" error={errors.email?.message}>
          <TextInput type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Mật khẩu" error={errors.password?.message}>
          <TextInput type="password" autoComplete="current-password" {...register("password")} />
        </Field>
        <Button type="submit" className="w-full" disabled={isSubmitting} icon={<LogIn size={18} />}>
          Đăng nhập
        </Button>
      </form>
    </PublicLayout>
  );
}
