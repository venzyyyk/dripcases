"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const passwordConfirm = formData.get("passwordConfirm") as string;
    if (data.password !== passwordConfirm) {
      toast.error("Пароли не совпадают");
      setLoading(false);
      return;
    }

    if (data.password.length < 6) {
      toast.error("Пароль минимум 6 символов");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error || "Ошибка регистрации");
      setLoading(false);
      return;
    }

    toast.success("Регистрация успешна");
    router.push("/login");
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl mb-1 text-center">Регистрация</h1>
        <p className="text-text-secondary text-sm mb-8 text-center">
          Создай аккаунт и начни открывать кейсы
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Имя</label>
            <input id="name" name="name" type="text" required className="input" placeholder="Как тебя зовут" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" required className="input" placeholder="your@email.com" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="password" className="label">Пароль</label>
            <input id="password" name="password" type="password" required className="input" placeholder="Минимум 6 символов" autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="passwordConfirm" className="label">Повторите пароль</label>
            <input id="passwordConfirm" name="passwordConfirm" type="password" required className="input" placeholder="Ещё раз" autoComplete="new-password" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Есть аккаунт?{" "}
          <Link href="/login" className="text-accent hover:text-accent-light transition-colors">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
