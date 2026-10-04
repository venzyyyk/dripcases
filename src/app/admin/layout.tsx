import { requireAdmin } from "@/lib/session";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Users, ClipboardList } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/cases", label: "Кейсы", icon: Package },
  { href: "/admin/products", label: "Товары", icon: ShoppingBag },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/orders", label: "Заказы", icon: ClipboardList },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar */}
      <aside className="hidden lg:block w-56 border-r border-border bg-bg-card shrink-0">
        <nav className="p-4 space-y-1 sticky top-20">
          <p className="text-xs text-text-tertiary px-3 mb-3 tracking-wider">
            Админ-панель
          </p>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-bg-hover transition-colors"
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-bg/90 backdrop-blur-xl px-2 py-2">
        <div className="flex justify-around">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-text-tertiary hover:text-white transition-colors"
            >
              <n.icon className="w-4 h-4" />
              <span className="text-[10px]">{n.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 sm:p-8 pb-24 lg:pb-8">{children}</div>
    </div>
  );
}
