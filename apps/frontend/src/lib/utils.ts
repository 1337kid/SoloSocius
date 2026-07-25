import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { escape } from "lodash";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function activityPubContent(text: string): string {
  return escape(text)
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
