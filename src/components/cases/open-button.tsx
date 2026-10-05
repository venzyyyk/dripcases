"use client";

import { ArrowRight } from "lucide-react";
import { useOpenCase } from "@/components/cases/open-case-provider";
import type { ClientCase } from "@/lib/case-types";

export function OpenButton({
  data,
  label = "Открыть кейс",
}: {
  data: ClientCase;
  label?: string;
}) {
  const { openCase } = useOpenCase();
  return (
    <button className="b1" onClick={() => openCase(data)} style={{ alignSelf: "flex-start" }}>
      {label}
      <span>
        <ArrowRight size={15} strokeWidth={2} />
      </span>
    </button>
  );
}
