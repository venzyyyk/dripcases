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
import { X, Zap, Gauge } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { rarityOf } from "@/lib/rarity";
import type { ClientCase, ClientCaseItem } from "@/lib/case-types";

interface OpenResultProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  images: string[];
  size: string | null;
  color: string | null;
}

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
const PRESETS = [1, 3, 5, 10];

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

function refreshBalance() {
  try {
    window.dispatchEvent(new Event("balance:refresh"));
  } catch {}
}

export function OpenCaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ClientCase | null>(null);
  const [phase, setPhase] = useState<"setup" | "spinning" | "won" | "error">("setup");
  const [count, setCount] = useState(1);
  const [fast, setFast] = useState(false);
  const [results, setResults] = useState<OpenResultProduct[]>([]);
  const [errMsg, setErrMsg] = useState("");

  const stripRef = useRef<HTMLDivElement>(null);
  const stripWRef = useRef<HTMLDivElement>(null);
  const spinningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemFor = useCallback(
    (c: ClientCase, productId: string): ClientCaseItem =>
      c.items.find((i) => i.productId === productId) || {
        productId,
        name: "",
        brand: null,
        price: 0,
        images: [],
        share: c.items.length ? 100 / c.items.length : 50,
      },
    []
  );

  const animate = useCallback(
    (c: ClientCase, winner: ClientCaseItem, spinMs: number, done: () => void) => {
      const strip = stripRef.current;
      const view = stripWRef.current?.offsetWidth ?? 600;
      if (!strip) {
        done();
        return;
      }
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
          strip.style.transition = `transform ${spinMs / 1000}s cubic-bezier(.12,.72,.08,1)`;
          strip.style.transform = `translateX(${target}px)`;
        })
      );
      timerRef.current = setTimeout(done, spinMs + 120);
    },
    []
  );

  const run = useCallback(
    async (c: ClientCase, n: number, isFast: boolean) => {
      spinningRef.current = true;
      setErrMsg("");
      setResults([]);
      setPhase("spinning");

      try {
        const r = await fetch(`/api/cases/${c.id}/open`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: n }),
        });

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

        const res = (data as any).results as OpenResultProduct[];
        refreshBalance();

        const firstWinner = itemFor(c, res[0].id);
        const spinMs = isFast ? 1400 : 5200;

        animate(c, firstWinner, spinMs, () => {
          spinningRef.current = false;
          setResults(res);
          setPhase("won");
        });
      } catch {
        spinningRef.current = false;
        setErrMsg("Ошибка сети");
        setPhase("error");
        toast.error("Ошибка сети");
      }
    },
    [animate, itemFor, router]
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
      setCount(1);
      setFast(false);
      setResults([]);
      setErrMsg("");
      setPhase("setup");
      setOpen(true);
    },
    [router, status]
  );

  const close = useCallback(() => {
    if (spinningRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }, []);

  const totalCost = current ? current.price * count : 0;

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
                ? results.length > 1
                  ? "ТВОЙ ДРОП"
                  : "ТЕБЕ ВЫПАЛО"
                : phase === "error"
                ? "ОШИБКА"
                : phase === "setup"
                ? "ОТКРЫТИЕ КЕЙСА"
                : "ОТКРЫВАЕМ КЕЙС"}
            </p>
            <h3 className="dsp">{current?.name ?? ""}</h3>
          </div>

          {/* --- SETUP --- */}
          {phase === "setup" && current && (
            <div className="setup">
              <div className="setup-row">
                <span className="setup-lbl">Сколько открыть</span>
                <div className="chips">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      className={`chip${count === p ? " on" : ""}`}
                      onClick={() => setCount(p)}
                    >
                      ×{p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setup-row">
                <span className="setup-lbl">Скорость</span>
                <div className="chips">
                  <button
                    className={`chip${!fast ? " on" : ""}`}
                    onClick={() => setFast(false)}
                  >
                    <Gauge size={14} /> Обычная
                  </button>
                  <button
                    className={`chip${fast ? " on" : ""}`}
                    onClick={() => setFast(true)}
                  >
                    <Zap size={14} /> Быстрая
                  </button>
                </div>
              </div>

              <button
                className="bgo setup-go"
                onClick={() => run(current, count, fast)}
              >
                Крутить за {formatPrice(totalCost)}
              </button>
            </div>
          )}

          {/* --- STRIP (spin) --- */}
          {(phase === "spinning" || (phase === "won" && results.length === 1)) && (
            <div className="strip-w" ref={stripWRef}>
              <div className="ptr" />
              <div className="strip" ref={stripRef} />
            </div>
          )}

          {/* --- WON --- */}
          <div className="rl-f">
            {phase === "won" && results.length === 1 && (
              <WonSingle
                product={results[0]}
                item={current ? itemFor(current, results[0].id) : null}
                onAgain={() => setPhase("setup")}
                onClose={close}
              />
            )}

            {phase === "won" && results.length > 1 && current && (
              <div className="won" style={{ width: "100%" }}>
                <div className="drop-grid">
                  {results.map((p, i) => {
                    const r = rarityOf(itemFor(current, p.id).share);
                    return (
                      <div
                        key={i}
                        className="drop-cell"
                        style={{ borderColor: r.color }}
                      >
                        <div className="drop-ic">
                          {p.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.name} />
                          ) : (
                            <span
                              dangerouslySetInnerHTML={{ __html: boxIcon(26, r.color) }}
                            />
                          )}
                        </div>
                        <b>{p.name}</b>
                        <span style={{ color: r.color }}>{formatPrice(p.price)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="wbtns">
                  <button className="bgo" onClick={() => setPhase("setup")}>
                    Открыть ещё
                  </button>
                  <Link className="bg-" href="/dashboard" onClick={close}>
                    В профиль
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

function WonSingle({
  product,
  item,
  onAgain,
  onClose,
}: {
  product: OpenResultProduct;
  item: ClientCaseItem | null;
  onAgain: () => void;
  onClose: () => void;
}) {
  const rarity = rarityOf(item?.share ?? 50);
  return (
    <div className="won">
      <div className="ico" style={{ borderColor: rarity.color }}>
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <span dangerouslySetInnerHTML={{ __html: boxIcon(40, rarity.color) }} />
        )}
      </div>
      <h4 className="dsp">{product.name}</h4>
      <p className="br">
        {product.brand || "DRIPCASE"} ·{" "}
        <span style={{ color: rarity.color }}>{rarity.key}</span>
      </p>
      <p className="pz">{formatPrice(product.price)}</p>
      <p className="meta">
        {[product.size && `Размер ${product.size}`, product.color]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className="wbtns">
        <button className="bgo" onClick={onAgain}>
          Открыть ещё
        </button>
        <Link className="bg-" href="/dashboard" onClick={onClose}>
          В профиль
        </Link>
      </div>
    </div>
  );
}
