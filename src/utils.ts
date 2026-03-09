import type { Entry, Status } from "./types";

export function deriveStatus(e: Entry): Status {
  const paidAmount = parseAmount(e.amountPaid);
  const reimbursedAmount = parseAmount(e.reimbursedAmount);
  const hasReimbursedValue = (e.reimbursedAmount || "").trim().length > 0;
  if (hasReimbursedValue && reimbursedAmount <= 0) return "rejected";
  if (reimbursedAmount > 0 && reimbursedAmount < paidAmount) return "partial";
  if (paidAmount > 0 && hasReimbursedValue && reimbursedAmount >= paidAmount) return "reimbursed";
  if (e.submittedDate) return "submitted";
  if (e.paidDate) return "paid";
  return "received";
}

export function parseAmount(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function getGapAmount(e: Entry): number {
  return Math.max(0, parseAmount(e.amountPaid) - parseAmount(e.reimbursedAmount));
}

export function getLifecycleStep(status: Status): number {
  if (status === "received") return 0;
  if (status === "paid") return 1;
  if (status === "submitted" || status === "partial" || status === "rejected") return 2;
  return 3;
}

export function getYear(e: Entry): string {
  return e.receivedDate ? e.receivedDate.substring(0, 4) : "—";
}

export function formatTs(ts: number): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${d.toLocaleDateString("de-DE")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

export function formatDateDisplay(value: string): string {
  if (!value) return "—";
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-");
    return `${d}.${m}.${y}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("de-DE");
}

export function nowTs(): number { return Date.now(); }

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}
