import Image from "next/image";
import { cn } from "@/lib/utils";

interface VitrineProps {
  /** Путь к рендеру: /cases/urban.png */
  image?: string | null;
  /** Название — для alt и для подписи, если рендер без таблички */
  label?: string;
  /** Тёплая золотая подсветка вместо холодной белой */
  warm?: boolean;
  variant?: "hero" | "card";
  /** Грузить сразу — для первой витрины в герое */
  priority?: boolean;
  className?: string;
}

/**
 * Слот под рендер витрины.
 *
 * Рендер — PNG/WebP с прозрачным фоном, пропорции 4:5.
 * Свечение и отражение под подиумом добавляются здесь (CSS),
 * в самой картинке их запекать не надо — иначе на hover будет двоиться.
 *
 * Если image не передан — рисуется нейтральный плейсхолдер,
 * чтобы сетка не разъезжалась, пока рендеров нет.
 */
export function Vitrine({
  image,
  label,
  warm = false,
  variant = "card",
  priority = false,
  className,
}: VitrineProps) {
  const isHero = variant === "hero";

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Свечение позади витрины */}
      <div
        aria-hidden
        className={cn(
          "absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none",
          isHero
            ? "top-[10%] w-[72%] h-[58%] blur-[70px]"
            : "top-[6%] w-[84%] h-[62%] blur-[48px]",
          warm
            ? "bg-[radial-gradient(ellipse,rgba(200,168,72,0.26),transparent_70%)]"
            : "bg-[radial-gradient(ellipse,rgba(255,255,255,0.13),transparent_70%)]"
        )}
      />

      {image ? (
        <Image
          src={image}
          alt={label ? `Кейс ${label}` : "Кейс"}
          fill
          priority={priority}
          sizes={
            isHero
              ? "(max-width: 1024px) 90vw, 560px"
              : "(max-width: 768px) 45vw, (max-width: 1280px) 30vw, 230px"
          }
          className="relative z-10 object-contain object-bottom select-none"
          draggable={false}
        />
      ) : (
        <Placeholder isHero={isHero} label={label} />
      )}

      {/* Отражение под подиумом */}
      <div
        aria-hidden
        className={cn(
          "absolute left-1/2 -translate-x-1/2 rounded-[50%] pointer-events-none z-20",
          isHero ? "bottom-[6%] w-[58%] h-[26px] blur-[14px]" : "bottom-[4%] w-[66%] h-[18px] blur-[10px]",
          warm
            ? "bg-[radial-gradient(ellipse,rgba(200,168,72,0.20),transparent_70%)]"
            : "bg-[radial-gradient(ellipse,rgba(255,255,255,0.14),transparent_70%)]"
        )}
      />
    </div>
  );
}

/** Нейтральная заглушка на время, пока рендеров нет */
function Placeholder({ isHero, label }: { isHero: boolean; label?: string }) {
  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center">
      <div
        className="rounded-sm border border-dashed border-white/12 flex flex-col items-center justify-center gap-2"
        style={{ width: isHero ? "58%" : "70%", height: isHero ? "70%" : "72%" }}
      >
        <svg
          width={isHero ? 28 : 20}
          height={isHero ? 28 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-white/20"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-4.6-4.6a2 2 0 0 0-2.8 0L3 21" />
        </svg>
        <p className="text-[10px] text-white/20 tracking-wide">
          {label || "Нет рендера"}
        </p>
      </div>
    </div>
  );
}
