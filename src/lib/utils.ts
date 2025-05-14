/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupByMonth(subs: any[]) {
  const map: Record<string, any[]> = {};
  for (const sub of subs) {
    const month = new Date(sub.nextPayment).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!map[month]) map[month] = [];
    map[month].push(sub);
  }
  return map;
}
