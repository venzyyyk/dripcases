"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { rarityOf } from "@/lib/rarity";
import type { ClientCase, ClientCaseItem, OpenResult } from "@/lib/case-types";

interface OpenCaseCtx {
  openCase: (c: ClientCase) => void;
}

const Ctx = createContext<OpenCaseCtx | null>(null);

export function useOpenCase() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOpenCase must be used within OpenCaseProvider");
  return ctx;
}

const SLOT_W = 124;
const TOTAL = 58;
const WIN_AT = 52;
const SPIN_MS = 5400;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function boxIcon(size: number, color: string) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.2"><path d="M20 7h-3V5a3 3 0 0 0-6 0M4 7h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 12h16"/></svg>`;
}

function slotHTML(item: ClientCaseItem) {
  const col = rarityOf(item.share).color;
  const inner = item.images?.[0]
    ? `<img src="${esc(item.images[0])}" alt="">`
    : boxIcon(26, col);
  return `<div class="sl" style="border-bottom:3px solid ${col}"><div class="ico" style="box-shadow:inset 0 -2px 0 ${col}">${inner}</div><b>${esc(
    item.name
  )}</b></div>`;
}

export function OpenCaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ClientCase | null>(null);
  const [phase, setPhase] = useState<"spinning" | "won" | "error">("spinning");
  const [result, setResult] = useState<OpenResult | null>(null);
  const [wonItem, setWonItem] = useState<ClientCaseItem | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const stripRef = useRef<HTMLDivElement>(null);
  const stripWRef = useRef<HTMLDivElement>(null);
  const spinningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateTo = useCallback((c: ClientCase, winner: ClientCaseItem, res: OpenResult) => {
    const strip = stripRef.current;
    const view = stripWRef.current?.offsetWidth ?? 600;
    if (!strip) return;

    const pool = c.items.length ? c.items : [winner];
    let html = "";
    for (let i = 0; i < TOTAL; i++) {
      const it = i === WIN_AT ? winner : pool[Math.floor(Math.random() * pool.length)];
      html += slotHTML(it);
    }
    strip.innerHTML = html;
    strip.style.transition = "none";
    strip.style.transform = "translateX(0)";

    const jitter = (Math.random() * 0.6 - 0.3) * SLOT_W;
    const target = -(WIN_AT * SLOT_W + SLOT_W / 2 - view / 2 + jitter);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        strip.style.transition = `transform ${SPIN_MS / 1000}s cubic-bezier(.12,.72,.08,1)`;
        strip.style.transform = `translateX(${target}px)`;
      })
    );

    timerRef.current = setTimeout(() => {
      spinningRef.current = false;
      setWonItem(winner);
      setResult(res);
      setPhase("won");
    }, SPIN_MS + 120);
  }, []);

  const run = useCallback(
    async (c: ClientCase) => {
      spinningRef.current = true;
      setResult(null);
      setWonItem(null);
      setErrMsg("");
      setPhase("spinning");
      if (stripRef.current) {
        // предварительная лента до ответа сервера
        const pool = c.items.length ? c.items : [];
        let html = "";
        for (let i = 0; i < TOTAL; i++) {
          const it = pool.length ? pool[i % pool.length] : null;
          html += it ? slotHTML(it) : "";
        }
        stripRef.current.innerHTML = html;
        stripRef.current.style.transition = "none";
        stripRef.current.style.transform = "translateX(0)";
      }

      try {
        const r = await fetch(`/api/cases/${c.id}/open`, { method: "POST" });

        if (r.status === 401) {
          spinningRef.current = false;
          setOpen(false);
          toast.error("Войди, чтобы открыть кейс");
          router.push(`/login?callbackUrl=/`);
          return;
        }

        const data = await r.json().catch(() => ({}));

        if (!r.ok) {
          spinningRef.current = false;
          const msg = (data as any)?.error || "Не удалось открыть кейс";
          setErrMsg(msg);
          setPhase("error");
          toast.error(msg);
          return;
        }

        const res = data as OpenResult;
        const winner: ClientCaseItem =
          c.items.find((i) => i.productId === res.product.id) || {
            productId: res.product.id,
            name: res.product.name,
            brand: res.product.brand,
            price: res.product.price,
            images: res.product.images,
            share: c.items.length ? 100 / c.items.length : 50,
          };

        animateTo(c, winner, res);
      } catch {
        spinningRef.current = false;
        setErrMsg("Ошибка сети");
        setPhase("error");
        toast.error("Ошибка сети");
      }
    },
    [animateTo, router]
  );

  const openCase = useCallback(
    (c: ClientCase) => {
      if (spinningRef.current) return;
      if (status === "unauthenticated") {
        toast.error("Войди, чтобы открыть кейс");
        router.push(`/login?callbackUrl=/`);
        return;
      }
      setCurrent(c);
      setOpen(true);
      // ждём, пока оверлей смонтируется, затем крутим
      requestAnimationFrame(() => run(c));
    },
    [run, router, status]
  );

  const close = useCallback(() => {
    if (spinningRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }, []);

  const rarity = wonItem ? rarityOf(wonItem.share) : null;
  const prod = result?.product;

  return (
    <Ctx.Provider value={{ openCase }}>
      {children}

      <div
        className={`ov${open ? " on" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <button className="cls" onClick={close} aria-label="Закрыть">
          <X size={18} />
        </button>

        <div className="rl">
          <div className="rl-h">
            <p>
              {phase === "won"
                ? "ТЕБЕ ВЫПАЛО"
                : phase === "error"
                ? "ОШИБКА"
                : "ОТКРЫВАЕМ КЕЙС"}
            </p>
            <h3 className="dsp">{current?.name ?? ""}</h3>
          </div>

          <div className="strip-w" ref={stripWRef}>
            <div className="ptr" />
            <div className="strip" ref={stripRef} />
          </div>

          <div className="rl-f">
            {phase === "won" && prod && rarity && (
              <div className="won">
                <div className="ico" style={{ borderColor: rarity.color }}>
                  {prod.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={prod.images[0]} alt={prod.name} />
                  ) : (
                    <span
                      dangerouslySetInnerHTML={{ __html: boxIcon(40, rarity.color) }}
                    />
                  )}
                </div>
                <h4 className="dsp">{prod.name}</h4>
                <p className="br">
                  {prod.brand || "DRIPCASE"} ·{" "}
                  <span style={{ color: rarity.color }}>{rarity.key}</span>
                </p>
                <p className="pz">{formatPrice(prod.price)}</p>
                <p className="meta">
                  {[prod.size && `Размер ${prod.size}`, prod.color]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="wbtns">
                  <button
                    className="bgo"
                    onClick={() => current && openCase(current)}
                  >
                    Открыть ещё
                  </button>
                  <Link className="bg-" href="/dashboard/orders" onClick={close}>
                    Оформить получение
                  </Link>
                </div>
              </div>
            )}

            {phase === "error" && (
              <div className="won">
                <p className="br" style={{ fontSize: 14 }}>
                  {errMsg}
                </p>
                <div className="wbtns">
                  <Link className="bgo" href="/dashboard" onClick={close}>
                    Пополнить баланс
                  </Link>
                  <button className="bg-" onClick={close}>
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Ctx.Provider>
  );
}
