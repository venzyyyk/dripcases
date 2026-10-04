import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Vitrine } from "./vitrine";

interface Props {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  tag: string | null;
  warm?: boolean;
  priority?: boolean;
}

export function CaseCard({
  name,
  slug,
  description,
  price,
  image,
  tag,
  warm = false,
  priority = false,
}: Props) {
  return (
    <Link
      href={`/cases/${slug}`}
      className="group relative flex flex-col rounded-xl border border-white/[0.07] bg-[#0a0a0b] overflow-hidden transition-colors duration-300 hover:border-white/20"
    >
      {/* Тег */}
      {tag && (
        <span className="absolute top-3.5 left-3.5 z-20 rounded-md bg-white/[0.07] border border-white/15 backdrop-blur-sm px-2.5 py-1 text-[10px] text-white/85">
          {tag}
        </span>
      )}

      {/* Витрина */}
      <div className="relative aspect-[3/3.6] w-full">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.06),transparent_65%)]" />
        <Vitrine image={image} label={name} warm={warm} variant="card" priority={priority} />
      </div>

      {/* Текст */}
      <div className="px-4 pb-4 pt-1 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-[15px] tracking-wide">
          {name}
        </h3>
        {description && (
          <p className="mt-1.5 text-[11.5px] leading-[1.45] text-white/40 min-h-[32px]">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[14px] tabular-nums">{formatPrice(price)}</span>
          <span className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 transition-colors group-hover:border-white/45 group-hover:text-white">
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
