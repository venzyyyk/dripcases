"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Wallet, Ban, CheckCircle } from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  balance: number;
  isBlocked: boolean;
  createdAt: string;
  _count: { caseOpenings: number; orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositUserId, setDepositUserId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function handleDeposit(userId: string) {
    const amount = Math.round(parseFloat(depositAmount) * 100);
    if (!amount || amount <= 0) {
      toast.error("Укажите сумму");
      return;
    }

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deposit", userId, amount }),
    });

    if (res.ok) {
      toast.success(`Начислено ${formatPrice(amount)}`);
      setDepositUserId(null);
      setDepositAmount("");
      fetchUsers();
    } else {
      toast.error("Ошибка");
    }
  }

  async function setRole(userId: string, role: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setRole", userId, role }),
    });
    if (res.ok) {
      toast.success("Роль обновлена");
      fetchUsers();
    } else {
      toast.error("Ошибка");
    }
  }

  async function toggleBlock(userId: string, current: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleBlock", userId, isBlocked: !current }),
    });
    fetchUsers();
  }

  if (loading) return <p className="text-text-secondary">Загрузка...</p>;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Пользователи</h1>

      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-bg-elevated">
              <th className="text-left px-4 py-3 text-text-tertiary font-medium text-xs">Пользователь</th>
              <th className="text-right px-4 py-3 text-text-tertiary font-medium text-xs">Баланс</th>
              <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs">Кейсов</th>
              <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs">Заказов</th>
              <th className="text-center px-4 py-3 text-text-tertiary font-medium text-xs">Статус</th>
              <th className="text-right px-4 py-3 text-text-tertiary font-medium text-xs">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name || "—"}</p>
                  <p className="text-xs text-text-tertiary">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(u.balance)}</td>
                <td className="px-4 py-3 text-center">{u._count.caseOpenings}</td>
                <td className="px-4 py-3 text-center">{u._count.orders}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    {u.isBlocked ? (
                      <span className="text-xs text-red-400">Заблокирован</span>
                    ) : (
                      <span className="text-xs text-green-400">Активен</span>
                    )}
                    <select
                      value={u.role}
                      onChange={(e) => setRole(u.id, e.target.value)}
                      className="input w-28 py-1 text-xs"
                      title="Роль"
                    >
                      <option value="USER">Покупатель</option>
                      <option value="SUPPLIER">Поставщик</option>
                      <option value="ADMIN">Админ</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Deposit */}
                    {depositUserId === u.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          type="number"
                          step="0.01"
                          className="input w-24 py-1 text-xs"
                          placeholder="₽"
                          autoFocus
                        />
                        <button
                          onClick={() => handleDeposit(u.id)}
                          className="p-1.5 text-green-400 hover:text-green-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDepositUserId(u.id)}
                        className="p-1.5 text-text-tertiary hover:text-accent transition-colors"
                        title="Пополнить баланс"
                      >
                        <Wallet className="w-4 h-4" />
                      </button>
                    )}
                    {/* Block */}
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => toggleBlock(u.id, u.isBlocked)}
                        className="p-1.5 text-text-tertiary hover:text-red-400 transition-colors"
                        title={u.isBlocked ? "Разблокировать" : "Заблокировать"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
