import { requireAuth } from "@/lib/session";
import Link from "next/link";

export const metadata = { title: "Настройки — DRIPCASES" };

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-text-tertiary hover:text-white text-sm transition-colors">
            Кабинет
          </Link>
          <span className="text-text-tertiary">/</span>
          <h1 className="font-display font-bold text-xl">Настройки</h1>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-6">
          <div className="space-y-4">
            <div>
              <p className="label">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <p className="label">Имя</p>
              <p className="text-sm">{user.name || "Не указано"}</p>
            </div>
            <div>
              <p className="label">Дата регистрации</p>
              <p className="text-sm">{new Date(user.createdAt).toLocaleDateString("ru-RU")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
