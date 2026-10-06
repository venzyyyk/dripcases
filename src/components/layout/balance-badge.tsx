"use client";

import { useCallback, useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";

/** Баланс пользователя в хедере. Обновляется по событию "balance:refresh". */
export function BalanceBadge() {
  const [balance, setBalance] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/me");
      if (!r.ok) return;
      const d = await r.json();
      if (typeof d.balance === "number") setBalance(d.balance);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("balance:refresh", h);
    return () => window.removeEventListener("balance:refresh", h);
  }, [load]);

  if (balance === null) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 999,
        border: "1px solid var(--line2)",
        background: "rgba(212,178,84,.1)",
        color: "var(--gold2)",
        fontSize: 12.5,
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      <Wallet size={13} />
      {formatPrice(balance)}
    </span>
  );
}
