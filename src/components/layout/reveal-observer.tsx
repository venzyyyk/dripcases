"use client";

import { useEffect } from "react";

/** Навешивает .in на элементы .rv при появлении в вьюпорте (scroll-reveal). */
export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".rv"));
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
