import { useState } from "react";
import type { Entry } from "../types";

export function QuickPaidModal({ entry, onSave, onCancel }: { entry: Entry; onSave: (d: string, n: string) => void; onCancel: () => void }) {
  const today = new Date().toISOString().substring(0, 10);
  const [date, setDate] = useState(entry.paidDate || today);
  const [note, setNote] = useState(entry.notes || "");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Set as Paid</h2>
        <p className="text-xs text-gray-400 mb-4">{entry.provider} · €{parseFloat(entry.amountPaid || "0").toFixed(2)} amount</p>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500">Paid Date</label>
            <button type="button" onClick={() => setDate(today)} className="text-[11px] text-blue-600 hover:underline">Today</button>
          </div>
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500">Notes (optional)</label>
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={note} onChange={e => setNote(e.target.value)} placeholder="Enter a note for this status update" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => onSave(date, note)} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">Save</button>
          <button onClick={onCancel} className="flex-1 text-sm text-gray-500 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function QuickSubmitModal({ entry, onSave, onCancel }: { entry: Entry; onSave: (d: string, n: string) => void; onCancel: () => void }) {
  const today = new Date().toISOString().substring(0, 10);
  const [date, setDate] = useState(entry.submittedDate || today);
  const [note, setNote] = useState(entry.notes || "");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Submit to Insurance</h2>
        <p className="text-xs text-gray-400 mb-4">{entry.provider} · €{parseFloat(entry.amountPaid || "0").toFixed(2)} paid</p>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500">Submission Date</label>
            <button type="button" onClick={() => setDate(today)} className="text-[11px] text-blue-600 hover:underline">Today</button>
          </div>
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500">Notes (optional)</label>
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={note} onChange={e => setNote(e.target.value)} placeholder="Enter a note for this status update" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => onSave(date, note)} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">Save</button>
          <button onClick={onCancel} className="flex-1 text-sm text-gray-500 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function QuickReimburseModal({ entry, onSave, onCancel }: { entry: Entry; onSave: (a: string, d: string, n: string) => void; onCancel: () => void }) {
  const today = new Date().toISOString().substring(0, 10);
  const [amount, setAmount] = useState(entry.amountPaid || "");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState(entry.notes || "");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Record Insurer Response</h2>
        <p className="text-xs text-gray-400 mb-4">{entry.provider} · €{parseFloat(entry.amountPaid || "0").toFixed(2)} paid</p>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500">Reimbursed Amount (€)</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={amount} onChange={e => setAmount(e.target.value)} /></div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500">Insurer Response Date</label>
              <button type="button" onClick={() => setDate(today)} className="text-[11px] text-blue-600 hover:underline">Today</button>
            </div>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Notes (optional)</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={note} onChange={e => setNote(e.target.value)} placeholder="Enter a note for this status update" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => onSave(amount, date, note)} className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700">Save</button>
          <button onClick={onCancel} className="flex-1 text-sm text-gray-500 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-2">Delete entry?</h2>
        <p className="text-sm text-gray-500 mb-4">This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white text-sm py-2 rounded-lg hover:bg-red-600">Delete</button>
          <button onClick={onCancel} className="flex-1 text-sm text-gray-500 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function ExportModal({ json, onClose }: { json: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      return;
    } catch {
      // Fallback for non-secure contexts / older browsers.
      const ta = document.createElement("textarea");
      ta.value = json;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const handleDownload = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dt = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const a = document.createElement("a");
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `PKV_Invoices_export_${dt}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">Export JSON</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
        </div>
        <p className="text-xs text-gray-500 mb-2">Copy to clipboard or download the file to save your data.</p>
        <textarea readOnly className="w-full border border-gray-200 rounded-lg p-3 text-xs font-mono h-64 bg-gray-50" value={json} onFocus={e => e.target.select()} />
        <div className="flex gap-2 mt-3">
          <button onClick={handleCopy} className="flex-1 border border-blue-600 text-blue-600 text-sm py-2 rounded-lg hover:bg-blue-50">{copied ? "Copied!" : "Copy to Clipboard"}</button>
          <button onClick={handleDownload} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">Download File</button>
        </div>
      </div>
    </div>
  );
}

export function ResetDataModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
        <h2 className="font-semibold text-gray-800 mb-2">Reset to initial JSON?</h2>
        <p className="text-sm text-gray-500 mb-4">
          This will replace current browser data with the contents of <code>/rechnungen.json</code>.
          Unsaved local changes will be lost.
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white text-sm py-2 rounded-lg hover:bg-red-600">Reset Now</button>
          <button onClick={onCancel} className="flex-1 text-sm text-gray-500 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function ImportChoiceModal({
  count,
  onMerge,
  onReplace,
  onCancel,
}: {
  count: number;
  onMerge: () => void;
  onReplace: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5">
        <h2 className="font-semibold text-gray-800 mb-2">Import JSON</h2>
        <p className="text-sm text-gray-500 mb-2">File contains {count} entr{count === 1 ? "y" : "ies"}.</p>
        <p className="text-sm text-gray-500 mb-4">
          Choose what should happen:
          <br />
          <strong>Merge</strong>: keep current data, add imported entries, skip duplicate IDs.
          <br />
          <strong>Replace all</strong>: remove current data and use only imported entries.
        </p>
        <div className="flex gap-2">
          <button onClick={onMerge} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">Merge</button>
          <button onClick={onReplace} className="flex-1 bg-amber-500 text-white text-sm py-2 rounded-lg hover:bg-amber-600">Replace All</button>
          <button onClick={onCancel} className="flex-1 text-sm text-gray-500 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}
