"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Search, User, ShoppingBag, Menu, X, LogOut, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/cases", label: "Кейсы" },
  { href: "/collections", label: "Коллекции" },
  { href: "/#how-it-works", label: "Как это работает" },
  { href: "/#reviews", label: "Отзывы" },
];

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
        scrolled ? "bg-bg/85 backdrop-blur-xl border-b border-border" : "bg-transparent"
      )}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-6">
        {/* Логотип */}
        <Link
          href="/"
          className="font-display font-bold text-[19px] tracking-[0.14em] shrink-0"
        >
          DRIPCASES
        </Link>

        {/* Навигация по центру */}
        <nav className="hidden lg:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "text-[13px] transition-colors relative py-1",
                  active ? "text-white" : "text-white/55 hover:text-white"
                )}
              >
                {n.label}
                {active && (
                  <span className="absolute -bottom-0.5 inset-x-0 h-px bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Иконки справа */}
        <div className="hidden lg:flex items-center gap-5 shrink-0">
          <button
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Поиск"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>

          {status === "authenticated" ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-white/70 hover:text-accent transition-colors"
                  aria-label="Админка"
                >
                  <Settings className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Кабинет"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
              <Link
                href="/dashboard/orders"
                className="relative text-white/70 hover:text-white transition-colors"
                aria-label="Заказы"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <span className="absolute -top-1.5 -right-1.5 w-[15px] h-[15px] rounded-full bg-white text-black text-[9px] font-semibold flex items-center justify-center">
                  0
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-white/45 hover:text-white transition-colors"
                aria-label="Выйти"
              >
                <LogOut className="w-[17px] h-[17px]" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Войти"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </Link>
              <Link
                href="/register"
                className="text-[13px] text-white/55 hover:text-white transition-colors"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

        {/* Бургер */}
        <button
          className="lg:hidden text-white/80 p-1 -mr-1"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Мобильное меню */}
      {open && (
        <div className="lg:hidden border-t border-border bg-bg/95 backdrop-blur-xl px-5 py-5 space-y-1 animate-fade-in">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block text-[15px] py-2.5 text-white/75 hover:text-white transition-colors"
            >
              {n.label}
            </Link>
          ))}
          <div className="h-px bg-border my-3" />
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-[15px] py-2.5 text-white/75">
                Личный кабинет
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} className="block text-[15px] py-2.5 text-accent">
                  Админка
                </Link>
              )}
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="block text-[15px] py-2.5 text-white/45"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block text-[15px] py-2.5 text-white/75">
                Войти
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block text-[15px] py-2.5 text-accent">
                Регистрация
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
