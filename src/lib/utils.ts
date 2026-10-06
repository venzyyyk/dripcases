import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Копейки → "3 990 ₽" */
export function formatPrice(kopecks: number): string {
  const rubles = kopecks / 100;
  return rubles.toLocaleString("ru-RU") + " ₽";
}

/** Копейки → число без валюты "3 990" */
export function formatNumber(kopecks: number): string {
  return (kopecks / 100).toLocaleString("ru-RU");
}
