import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "BDT") {
  if (currency === "BDT") {
    if (amount >= 1_000_000) {
      return `৳ ${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 1_000) {
      return `৳ ${amount.toLocaleString("en-BD")}`;
    }
    return `৳ ${amount}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}
