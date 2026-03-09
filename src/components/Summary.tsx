import type { Entry } from "../types";
import { deriveStatus, getGapAmount, parseAmount } from "../utils";

interface Props { entries: Entry[]; }

export function Summary({ entries }: Props) {
  const totalPaid = entries.reduce((s, e) => s + parseAmount(e.amountPaid), 0);
  const totalReimbursed = entries.reduce((s, e) => s + parseAmount(e.reimbursedAmount), 0);
  const waitingForReimbursement = entries
    .filter(e => ["received", "paid", "submitted"].includes(deriveStatus(e)))
    .reduce((s, e) => s + getGapAmount(e), 0);
  const totalGap = entries
    .filter(e => ["partial", "rejected", "reimbursed"].includes(deriveStatus(e)))
    .reduce((s, e) => s + getGapAmount(e), 0);
  const labelClass = "text-xs text-gray-600 mb-1";
  const valueClass = "text-2xl font-bold tabular-nums";

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="rounded-xl border border-green-300 bg-green-50 p-4 sm:col-span-2 lg:col-span-1">
        <div className={labelClass}>Waiting</div>
        <div className={`${valueClass} text-green-900`}>€{waitingForReimbursement.toFixed(2)}</div>
      </div>
      {[
        { label: "Total Paid", value: totalPaid, color: "bg-gray-50 border-gray-200" },
        { label: "Total Reimbursed", value: totalReimbursed, color: "bg-emerald-50 border-emerald-200" },
        { label: "Total Gap", value: totalGap, color: "bg-red-50 border-red-200" },
      ].map(({ label, value, color }) => (
        <div key={label} className={`rounded-xl border p-4 ${color}`}>
          <div className={labelClass}>{label}</div>
          <div className={`${valueClass} text-gray-800`}>€{value.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
