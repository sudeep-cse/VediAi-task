import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** DD-MM-YYYY -> validity check */
export function isValidDdMmYyyy(value: string): boolean {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!m) return false;
  const [, dd, mm, yyyy] = m.map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return d.getDate() === dd && d.getMonth() === mm - 1 && d.getFullYear() === yyyy;
}
