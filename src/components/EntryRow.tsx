import type { Entry } from "../types";
import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from "../constants";
import { deriveStatus, formatDateDisplay, formatTs, getGapAmount, getLifecycleStep, parseAmount } from "../utils";

interface Props {
  entry: Entry;
  showPerson?: boolean;
  isRecentlyUpdated?: boolean;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onDuplicate: (entry: Entry) => void;
  onQuickSetPaid: (entry: Entry) => void;
  onQuickSubmit: (entry: Entry) => void;
  onQuickReimburse: (entry: Entry) => void;
}

export function EntryRow({ entry, showPerson, isRecentlyUpdated, onEdit, onDelete, onDuplicate, onQuickSetPaid, onQuickSubmit, onQuickReimburse }: Props) {
  const status = deriveStatus(entry);
  const paid = parseAmount(entry.amountPaid);
  const reimbursed = parseAmount(entry.reimbursedAmount);
  const hasReimbursedValue = (entry.reimbursedAmount || "").trim() !== "";
  const gap = getGapAmount(entry);
  const currentStep = getLifecycleStep(status);
  const finalStepLabel =
    status === "rejected"
      ? STATUS_LABELS.rejected
      : status === "partial"
        ? STATUS_LABELS.partial
        : status === "reimbursed"
          ? STATUS_LABELS.reimbursed
          : "Insurer Response";
  const steps = ["Received", "Paid", "Submitted", finalStepLabel];
  const stepDates = [
    formatDateDisplay(entry.receivedDate),
    formatDateDisplay(entry.paidDate),
    formatDateDisplay(entry.submittedDate),
    formatDateDisplay(entry.pkvResponseDate),
  ];
  const getStepBarClass = (idx: number): string => {
    if (status === "rejected") {
      if (idx === 3) return "bg-red-500";
      return idx < 3 ? "bg-blue-600" : "bg-gray-200";
    }
    if (status === "partial") {
      if (idx < 3) return "bg-blue-600";
      if (idx === 3) return "bg-amber-500";
      return "bg-gray-200";
    }
    return idx <= currentStep ? "bg-blue-600" : "bg-gray-200";
  };
  const actionTextClass = "text-xs font-medium";
  return (
    <div
      id={`entry-${entry.id}`}
      className={`border rounded-xl p-4 mb-3 shadow-sm transition-colors duration-700 ${isRecentlyUpdated ? "bg-green-50 border-green-400 ring-1 ring-green-200" : "bg-white border-gray-200"}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-800 truncate">{entry.provider}</div>
            {showPerson && entry.person && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">{entry.person}</span>
            )}
          </div>
          <div className="flex gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400">{formatDateDisplay(entry.receivedDate)}</span>
            {entry.category && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{CATEGORY_LABELS[entry.category]}</span>}
            {entry.rechnungNr && <span className="text-xs text-gray-400">#{entry.rechnungNr}</span>}
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div><div className="text-gray-400 text-xs">Paid</div><div className="font-medium">€{paid.toFixed(2)}</div></div>
        <div><div className="text-gray-400 text-xs">Reimbursed</div><div className="font-medium">{reimbursed ? `€${reimbursed.toFixed(2)}` : "—"}</div></div>
        <div><div className="text-gray-400 text-xs">Gap</div><div className={`font-medium ${gap > 0 ? "text-red-500" : "text-gray-400"}`}>{`€${gap.toFixed(2)}`}</div></div>
      </div>
      <div className="mt-3">
        <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-500 mb-1">
          {steps.map(step => <span key={step} className="text-center">{step}</span>)}
        </div>
        <div className="progress-bar-row grid grid-cols-4 gap-2">
          {steps.map((step, idx) => (
            <div key={step} className={`progress-bar h-1.5 rounded-full ${getStepBarClass(idx)}`} />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-400 mt-1">
          {stepDates.map((value, idx) => <span key={steps[idx]} className="text-center">{value}</span>)}
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {(entry.submittedDate || entry.pkvResponseDate || entry.notes) && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
            {entry.submittedDate && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Submitted {formatDateDisplay(entry.submittedDate)}</span>
            )}
            {entry.pkvResponseDate && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Response {formatDateDisplay(entry.pkvResponseDate)}</span>
            )}
            {entry.notes && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 max-w-full truncate" title={entry.notes}>{entry.notes}</span>
            )}
          </div>
        )}
        <div className="text-[10px] text-gray-300">
          {entry.createdAt && <span>Created {formatTs(entry.createdAt)}</span>}
          {entry.updatedAt && <span> · Updated {formatTs(entry.updatedAt)}</span>}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(entry)}
            title="Edit"
            aria-label="Edit"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ✎
          </button>
          <button
            onClick={() => onDuplicate(entry)}
            title="Duplicate"
            aria-label="Duplicate"
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            ⧉
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            title="Delete"
            aria-label="Delete"
            className="text-sm text-red-400 hover:text-red-600"
          >
            🗑
          </button>
        </div>
        <div className="flex items-center gap-2">
          {status === "received" && <button onClick={() => onQuickSetPaid(entry)} className={`${actionTextClass} bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600`}>Set Paid</button>}
          {status === "paid" && <button onClick={() => onQuickSubmit(entry)} className={`${actionTextClass} bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600`}>Submit to Insurance</button>}
          {(status === "submitted" && !hasReimbursedValue) && <button onClick={() => onQuickReimburse(entry)} className={`${actionTextClass} bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600`}>Record Insurer Response</button>}
        </div>
      </div>
    </div>
  );
}
