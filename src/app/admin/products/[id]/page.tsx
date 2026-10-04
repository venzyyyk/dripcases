"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminProductEditPage() {
  const params = useParams();

  return (
    <div>
      <Link href="/admin/products" className="flex items-center gap-2 text-sm text-text-tertiary hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Назад к товарам
      </Link>
      <h1 className="font-display font-bold text-2xl mb-6">Редактирование товара</h1>
      <p className="text-text-secondary text-sm">ID: {params.id}</p>
      <p className="text-text-tertiary text-xs mt-2">Расширенное редактирование — в следующей итерации</p>
    </div>
  );
}
