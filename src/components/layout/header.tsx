"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Search, User, ShoppingBag, Menu, X, LogOut, Settings, Store } from "lucide-react";
import { BalanceBadge } from "@/components/layout/balance-badge";

const NAV = [
  { href: "/#cat", label: "Кейсы" },
  { href: "/cases", label: "Все кейсы" },
  { href: "/#how", label: "Как это работает" },
];

export function Header() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";
  const isSupplier = role === "SUPPLIER";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`dc-header${scrolled ? " on" : ""}`}>
      <div className="dc-wrap hd">
        <Link href="/" className="logo">
          DRIPCASES
        </Link>

        <nav className="nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ic">
          <Link href="/cases" aria-label="Поиск кейсов">
            <Search size={18} strokeWidth={1.5} />
          </Link>

          {status === "authenticated" ? (
            <>
              <BalanceBadge />
              {isSupplier && (
                <Link href="/supplier" aria-label="Кабинет поставщика">
                  <Store size={18} strokeWidth={1.5} />
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" aria-label="Админка">
                  <Settings size={18} strokeWidth={1.5} />
                </Link>
              )}
              <Link href="/dashboard" aria-label="Кабинет">
                <User size={18} strokeWidth={1.5} />
              </Link>
              <Link href="/dashboard/orders" aria-label="Заказы">
                <ShoppingBag size={18} strokeWidth={1.5} />
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} aria-label="Выйти">
                <LogOut size={17} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" aria-label="Войти">
                <User size={18} strokeWidth={1.5} />
              </Link>
              <Link
                href="/register"
                style={{ fontSize: 13, color: "var(--t2)" }}
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

        <button
          className="brg"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`mnav${open ? " open" : ""}`}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </Link>
        ))}
        {status === "authenticated" ? (
          <>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              Личный кабинет
            </Link>
            {isSupplier && (
              <Link href="/supplier" onClick={() => setOpen(false)}>
                Кабинет поставщика
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)}>
                Админка
              </Link>
            )}
            <a
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              style={{ cursor: "pointer" }}
            >
              Выйти
            </a>
          </>
        ) : (
          <>
            <Link href="/login" onClick={() => setOpen(false)}>
              Войти
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              Регистрация
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
