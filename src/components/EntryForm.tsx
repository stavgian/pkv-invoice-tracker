import { useState } from "react";
import type { Entry } from "../types";
import { CATEGORIES, CATEGORY_LABELS, EMPTY_FORM } from "../constants";

interface Props {
  initial?: Partial<Entry>;
  personOptions?: string[];
  title?: string;
  onSave: (form: Partial<Entry>) => void;
  onCancel: () => void;
}

export function EntryForm({ initial, personOptions = [], title, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Entry>>({ ...EMPTY_FORM, ...initial });
  const [showValidation, setShowValidation] = useState(false);
  const isCreate = !initial?.id;
  const set = (k: keyof Entry, v: string) => setForm(f => ({ ...f, [k]: v }));
  const today = new Date().toISOString().substring(0, 10);

  const requiredFields: Array<{ key: keyof Entry; label: string }> = [
    { key: "person", label: "Person" },
    { key: "provider", label: "Provider" },
    { key: "receivedDate", label: "Invoice Date" },
    { key: "amountPaid", label: "Amount" },
  ];

  const missingRequired = requiredFields.filter(({ key }) => String(form[key] ?? "").trim().length === 0);
  const hasError = (key: keyof Entry) => showValidation && missingRequired.some(f => f.key === key);
  const fieldClass = (key: keyof Entry) =>
    `w-full border rounded-lg px-3 py-2 text-sm mt-1 ${hasError(key) ? "border-red-400 bg-red-50" : "border-gray-200"}`;

  return (
    <div className="bg-white border border-blue-200 rounded-xl p-4 mb-4 shadow-sm">
      {title && <h2 className="text-base font-semibold text-gray-800 mb-3">{title}</h2>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-gray-500">Person <span className="text-red-500">*</span></label>
          <input
            list="person-options"
            required
            className={fieldClass("person")}
            value={form.person ?? ""}
            onChange={e => set("person", e.target.value)}
            placeholder="e.g. Yiannis, Ilia, Maria"
          />
          <datalist id="person-options">
            {personOptions.map(name => <option key={name} value={name} />)}
          </datalist>
        </div>
        <div>
          <label className="text-xs text-gray-500">Provider <span className="text-red-500">*</span></label>
          <input required className={fieldClass("provider")} value={form.provider ?? ""} onChange={e => set("provider", e.target.value)} placeholder="e.g. Dr. Mueller, City Pharmacy" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Invoice No.</label>
          <input className={fieldClass("rechnungNr")} value={form.rechnungNr ?? ""} onChange={e => set("rechnungNr", e.target.value)} placeholder="e.g. 2024-0042" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Category</label>
          <select className={`${fieldClass("category")} bg-white`} value={form.category ?? ""} onChange={e => set("category", e.target.value)}>
            <option value="">- Select -</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500">Invoice Date <span className="text-red-500">*</span></label>
            <button type="button" onClick={() => set("receivedDate", today)} className="text-[11px] text-blue-600 hover:underline">Today</button>
          </div>
          <input required type="date" className={fieldClass("receivedDate")} value={form.receivedDate ?? ""} onChange={e => set("receivedDate", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Amount (€) <span className="text-red-500">*</span></label>
          <input required type="number" className={fieldClass("amountPaid")} value={form.amountPaid ?? ""} onChange={e => set("amountPaid", e.target.value)} placeholder="0.00" />
        </div>
        {!isCreate && (
          <>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Paid Date</label>
                <button type="button" onClick={() => set("paidDate", today)} className="text-[11px] text-blue-600 hover:underline">Today</button>
              </div>
              <input type="date" className={fieldClass("paidDate")} value={form.paidDate ?? ""} onChange={e => set("paidDate", e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Submitted to Insurance</label>
                <button type="button" onClick={() => set("submittedDate", today)} className="text-[11px] text-blue-600 hover:underline">Today</button>
              </div>
              <input type="date" className={fieldClass("submittedDate")} value={form.submittedDate ?? ""} onChange={e => set("submittedDate", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Reimbursed Amount (EUR)</label>
              <input type="number" className={fieldClass("reimbursedAmount")} value={form.reimbursedAmount ?? ""} onChange={e => set("reimbursedAmount", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Insurer Response Date</label>
                <button type="button" onClick={() => set("pkvResponseDate", today)} className="text-[11px] text-blue-600 hover:underline">Today</button>
              </div>
              <input type="date" className={fieldClass("pkvResponseDate")} value={form.pkvResponseDate ?? ""} onChange={e => set("pkvResponseDate", e.target.value)} />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500">Notes</label>
          <textarea rows={2} className={fieldClass("notes")} value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} placeholder="Optional notes" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-end justify-between gap-3">
        <div className="min-h-[40px]">
          {showValidation && missingRequired.length > 0 ? (
            <p className="text-[11px] text-red-600">Missing required fields: {missingRequired.map(f => f.label).join(", ")}</p>
          ) : (
            <p className="text-[11px] text-gray-400"><span className="text-red-500">*</span> Required fields</p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => {
              setShowValidation(true);
              if (missingRequired.length > 0) return;
              onSave(form);
            }}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
