import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Time12Hour {
  time: string;
  am: boolean;
}

export function convertTo12Hour(time24: string): Time12Hour {
  const [hours, minutes] = time24.split(":").map(Number);
  const am = hours < 12;
  const hours12 = hours % 12 || 12;
  const formattedTime = `${hours12}:${minutes.toString().padStart(2, "0")}`;
  return { time: formattedTime, am };
}
