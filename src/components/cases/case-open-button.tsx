"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import { Gift, X, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  caseId: string;
  caseSlug: string;
  price: number;
  canAfford: boolean;
  isLoggedIn: boolean;
  inStock: boolean;
}

interface OpenResult {
  product: {
    id: string;
    name: string;
    brand: string | null;
    price: number;
    images: string[];
    size: string | null;
    color: string | null;
  };
  openingId: string;
  newBalance: number;
}

export function CaseOpenButton({
  caseId,
  caseSlug,
  price,
  canAfford,
  isLoggedIn,
  inStock,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "opening" | "result">("idle");
  const [result, setResult] = useState<OpenResult | null>(null);

  async function handleOpen() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!canAfford || !inStock) return;

    setPhase("opening");

    try {
      const res = await fetch(`/api/cases/${caseId}/open`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Ошибка открытия");
        setPhase("idle");
        return;
      }

      // Simulate animation delay
      await new Promise((r) => setTimeout(r, 2500));

      setResult(data);
      setPhase("result");
    } catch {
      toast.error("Ошибка сети");
      setPhase("idle");
    }
  }

  function handleClose() {
    setPhase("idle");
    setResult(null);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={phase === "opening" || (!canAfford && isLoggedIn) || !inStock}
        className="btn-accent w-full sm:w-auto text-base py-4 px-8 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {!isLoggedIn ? (
          "Войти и открыть"
        ) : !canAfford ? (
          "Недостаточно средств"
        ) : !inStock ? (
          "Нет товаров в наличии"
        ) : phase === "opening" ? (
          "Открываем..."
        ) : (
          <>
            <Gift className="w-5 h-5" />
            Открыть за {formatPrice(price)}
          </>
        )}
      </button>

      {/* Opening animation overlay */}
      <AnimatePresence>
        {phase === "opening" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              {/* Spinning glow */}
              <motion.div
                className="w-32 h-32 mx-auto mb-8 rounded-full border-2 border-accent/30 relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-accent" />
              </motion.div>

              {/* Pulsing text */}
              <motion.p
                className="font-display text-xl text-accent"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Открываем кейс...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result modal */}
      <AnimatePresence>
        {phase === "result" && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-md rounded-2xl border border-accent/30 bg-bg-card overflow-hidden relative"
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-glow-gold opacity-30 pointer-events-none" />

              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 text-text-tertiary hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 p-8 text-center">
                <p className="text-accent text-sm font-medium mb-4">Тебе выпало</p>

                {/* Фото выпавшей вещи */}
                <div className="w-28 h-28 mx-auto mb-6 rounded-xl bg-bg-elevated border border-border relative overflow-hidden">
                  {result.product.images[0] ? (
                    <Image
                      src={result.product.images[0]}
                      alt={result.product.name}
                      fill
                      sizes="112px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-10 h-10 text-accent/60" />
                    </span>
                  )}
                </div>

                <h2 className="font-display font-bold text-2xl mb-1">
                  {result.product.name}
                </h2>
                {result.product.brand && (
                  <p className="text-text-secondary text-sm mb-2">
                    {result.product.brand}
                  </p>
                )}
                <p className="text-accent text-lg font-semibold mb-1">
                  {formatPrice(result.product.price)}
                </p>
                <div className="flex items-center justify-center gap-3 text-xs text-text-tertiary mb-6">
                  {result.product.size && <span>Размер: {result.product.size}</span>}
                  {result.product.color && <span>Цвет: {result.product.color}</span>}
                </div>

                <p className="text-sm text-text-secondary mb-6">
                  Баланс: {formatPrice(result.newBalance)}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard/orders"
                    className="btn-accent flex-1"
                  >
                    Оформить получение
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button onClick={handleClose} className="btn-ghost flex-1">
                    Открыть ещё
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
