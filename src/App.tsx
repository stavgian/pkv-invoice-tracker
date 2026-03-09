import { useState, useEffect } from "react";
import type { Entry, EntriesStore, Person, SortField, SortDir } from "./types";
import { SORT_OPTIONS, STATUS_LABELS } from "./constants";
import { deriveStatus, getYear, generateId, nowTs, parseAmount } from "./utils";
import { Summary } from "./components/Summary";
import { EntryRow } from "./components/EntryRow";
import { EntryForm } from "./components/EntryForm";
import { QuickPaidModal, QuickSubmitModal, QuickReimburseModal, ConfirmDeleteModal, ImportChoiceModal, ExportModal, HelpModal } from "./components/Modals";

const ALL_TAB = "All";
type ActiveTab = Person | typeof ALL_TAB;
const DEFAULT_PERSON = "Yiannis";
const STORAGE_KEY = "pkv-entries";
function normalizePersonName(value: string | undefined, fallback: string): Person {
  const name = typeof value === "string" ? value.trim() : "";
  return name.length > 0 ? name : fallback;
}

function loadFromStorage(): EntriesStore {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function saveToStorage(data: EntriesStore) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function normalizeEntry(raw: Partial<Entry>): Entry {
  const now = nowTs();
  const person: Person = normalizePersonName(raw.person, DEFAULT_PERSON);
  const created = raw.createdAt || now;
  const updated = raw.updatedAt || raw.createdAt || now;
  return {
    id: String(raw.id || generateId()),
    provider: raw.provider || "",
    rechnungNr: raw.rechnungNr || "",
    category: raw.category || "",
    receivedDate: raw.receivedDate || "",
    paidDate: raw.paidDate || "",
    amountPaid: raw.amountPaid || "",
    submittedDate: raw.submittedDate || "",
    reimbursedAmount: raw.reimbursedAmount || "",
    pkvResponseDate: raw.pkvResponseDate || "",
    notes: raw.notes || "",
    person,
    createdAt: created,
    updatedAt: updated,
  };
}
function isValidImportEntry(value: unknown): value is Partial<Entry> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.provider !== "string" || v.provider.trim().length === 0) return false;
  if (typeof v.receivedDate !== "string" || v.receivedDate.trim().length === 0) return false;
  if (typeof v.amountPaid !== "string") return false;
  if (v.paidDate !== undefined && typeof v.paidDate !== "string") return false;
  if (v.person !== undefined && typeof v.person !== "string") return false;
  if (v.rechnungNr !== undefined && typeof v.rechnungNr !== "string") return false;
  if (v.pkvResponseDate !== undefined && typeof v.pkvResponseDate !== "string") return false;
  return true;
}
function mergeEntries(base: EntriesStore, imported: Partial<Entry>[]) {
  let skipped = 0;
  const updated: EntriesStore = { ...base };
  imported.forEach(raw => {
    const entry = normalizeEntry(raw);
    const person = entry.person;
    if (!updated[person]) updated[person] = [];
    if (updated[person]!.some(ex => ex.id === entry.id)) { skipped++; return; }
    const allIds = new Set(Object.values(updated).flat().map(ex => ex!.id));
    updated[person]!.push({ ...entry, id: allIds.has(entry.id) ? generateId() : entry.id });
  });
  return { updated, skipped };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ALL_TAB);
  const [entries, setEntries] = useState<EntriesStore>({});
  const [showForm, setShowForm] = useState(false);
  const [createFormVersion, setCreateFormVersion] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [exportJson, setExportJson] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [sortBy, setSortBy] = useState<SortField>("receivedDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [quickPaidEntry, setQuickPaidEntry] = useState<Entry | null>(null);
  const [quickSubmitEntry, setQuickSubmitEntry] = useState<Entry | null>(null);
  const [quickReimburseEntry, setQuickReimburseEntry] = useState<Entry | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [recentlySavedId, setRecentlySavedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingImport, setPendingImport] = useState<Partial<Entry>[] | null>(null);
  const personTabs = Object.keys(entries)
    .filter(p => p.trim().length > 0 && (entries[p] || []).length > 0)
    .sort((a, b) => a.localeCompare(b));

  const save = (updated: EntriesStore) => { setEntries(updated); saveToStorage(updated); };
  const scrollToEntryIfNeeded = (id: string) => {
    const el = document.getElementById(`entry-${id}`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    if (!isVisible) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  const flashRecentlySaved = (id: string) => {
    setRecentlySavedId(id);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToEntryIfNeeded(id));
    });
    setTimeout(() => {
      setRecentlySavedId(current => (current === id ? null : current));
    }, 1200);
  };
  useEffect(() => { setEntries(loadFromStorage()); }, []);
  useEffect(() => {
    if (activeTab === ALL_TAB) return;
    if ((entries[activeTab] || []).length === 0) setActiveTab(ALL_TAB);
  }, [entries, activeTab]);

  const getPersonEntries = (): Entry[] =>
    activeTab === ALL_TAB
      ? Object.entries(entries).flatMap(([p, list]) => (list || []).map(e => ({ ...e, person: p })))
      : entries[activeTab] || [];

  const getExportJson = (): string => {
    const all: Entry[] = [];
    Object.entries(entries).forEach(([p, list]) => (list || []).forEach(e => all.push({ ...e, person: p })));
    return JSON.stringify(all, null, 2);
  };
  const openExportModal = () => {
    setExportJson(getExportJson());
    setShowExport(true);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed) || !parsed.every(isValidImportEntry)) throw new Error("Invalid JSON schema");
        setPendingImport(parsed);
      } catch {
        alert("Invalid JSON schema. Expected an array of invoice entries.");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    handleImportFile(file);
    e.target.value = "";
  };
  const handleDropImport = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleImportFile(file);
  };
  const handleImportMerge = () => {
    if (!pendingImport) return;
    const { updated, skipped } = mergeEntries(entries, pendingImport);
    save(updated);
    setPendingImport(null);
    alert(skipped > 0 ? `Imported! ${skipped} duplicate(s) skipped.` : "Imported successfully!");
  };
  const handleImportReplace = () => {
    if (!pendingImport) return;
    const { updated } = mergeEntries({}, pendingImport);
    save(updated);
    setPendingImport(null);
    alert("Imported and replaced existing data.");
  };
  const personEntries = getPersonEntries();
  const availableYears = [...new Set(personEntries.map(getYear).filter(y => y !== "—"))].sort().reverse();
  const availableStatuses = ["received", "paid", "submitted", "partial", "reimbursed", "rejected"].filter(s => personEntries.some(e => deriveStatus(e) === s));
  const q = filterText.trim().toLowerCase();
  const sortFn = (a: Entry, b: Entry) => {
    const aVal = sortBy === "amountPaid" ? (parseFloat(a.amountPaid) || 0) : (a[sortBy] || "");
    const bVal = sortBy === "amountPaid" ? (parseFloat(b.amountPaid) || 0) : (b[sortBy] || "");
    return aVal < bVal ? (sortDir === "asc" ? -1 : 1) : aVal > bVal ? (sortDir === "asc" ? 1 : -1) : 0;
  };
  const filtered = personEntries
    .filter(e => filterStatus === "all" || deriveStatus(e) === filterStatus)
    .filter(e => filterYear === "all" || getYear(e) === filterYear)
    .filter(e => {
      if (!q) return true;
      return [
        e.provider,
        e.rechnungNr,
        e.category,
        e.notes,
        e.person,
      ].join(" ").toLowerCase().includes(q);
    })
    .sort(sortFn);
  const summaryEntries = filterYear === "all" ? personEntries : personEntries.filter(e => getYear(e) === filterYear);
  useEffect(() => {
    if (personEntries.length === 0) return;
    if (filtered.length > 0) return;
    if (filterStatus !== "all") setFilterStatus("all");
    if (filterYear !== "all") setFilterYear("all");
  }, [personEntries.length, filtered.length, filterStatus, filterYear]);

  const handleAdd = (form: Partial<Entry>) => {
    const person: Person = normalizePersonName(form.person, activeTab === ALL_TAB ? DEFAULT_PERSON : activeTab);
    const now = nowTs();
    const newId = generateId();
    save({
      ...entries,
      [person]: [{
        ...form,
        id: newId,
        person,
        pkvResponseDate: form.pkvResponseDate || "",
        createdAt: now,
        updatedAt: now,
      } as Entry, ...(entries[person] || [])],
    });
    flashRecentlySaved(newId);
    setShowForm(false);
  };

  const handleEdit = (form: Partial<Entry>) => {
    if (!form.id) return;
    const fallback = activeTab === ALL_TAB ? (personTabs[0] || DEFAULT_PERSON) : activeTab;
    const person: Person = normalizePersonName(form.person, fallback);
    const existing = Object.values(entries).flat().find(e => e.id === form.id);
    const updated = { ...entries };
    Object.keys(updated).forEach(p => { updated[p] = (updated[p] || []).filter(e => e.id !== form.id); });
    const now = nowTs();
    const merged: Entry = {
      ...(existing || {}),
      ...form,
      id: form.id,
      person,
      pkvResponseDate: form.pkvResponseDate ?? existing?.pkvResponseDate ?? "",
      createdAt: existing?.createdAt || form.createdAt || now,
      updatedAt: now,
    } as Entry;
    updated[person] = [merged, ...(updated[person] || [])];
    save(updated);
    flashRecentlySaved(form.id);
    setEditEntry(null);
  };

  const confirmDelete = () => {
    const updated = { ...entries };
    Object.keys(updated).forEach(p => { updated[p] = (updated[p] || []).filter(e => e.id !== confirmDeleteId); });
    save(updated); setConfirmDeleteId(null);
  };

  const handleDuplicate = (entry: Entry) => {
    const now = nowTs();
    const newId = generateId();
    save({
      ...entries,
      [entry.person]: [{
        ...entry,
        id: newId,
        paidDate: "",
        submittedDate: "",
        reimbursedAmount: "",
        pkvResponseDate: "",
        createdAt: now,
        updatedAt: now,
      }, ...(entries[entry.person] || [])],
    });
    flashRecentlySaved(newId);
  };

  const handleQuickSetPaid = (entry: Entry, date: string, note: string) => {
    const now = nowTs();
    const updated = { ...entries };
    Object.keys(updated).forEach(p => {
      updated[p] = (updated[p] || []).map(e => e.id === entry.id
        ? { ...e, paidDate: date, notes: note, updatedAt: now }
        : e);
    });
    save(updated);
    setQuickPaidEntry(null);
  };

  const handleQuickSubmit = (entry: Entry, date: string, note: string) => {
    const now = nowTs();
    const updated = { ...entries };
    Object.keys(updated).forEach(p => { updated[p] = (updated[p] || []).map(e => e.id === entry.id ? { ...e, submittedDate: date, notes: note, updatedAt: now } : e); });
    save(updated);
    setQuickSubmitEntry(null);
  };

  const handleQuickReimburse = (entry: Entry, amount: string, date: string, note: string) => {
    const now = nowTs();
    const reimb = parseAmount(amount);
    const normalizedAmount = reimb <= 0 ? "0" : amount;
    save({
      ...entries,
      [entry.person]: (entries[entry.person] || []).map(e => e.id === entry.id
        ? {
            ...e,
            reimbursedAmount: normalizedAmount,
            pkvResponseDate: date,
            paidDate: e.paidDate || date,
            submittedDate: e.submittedDate || date,
            notes: note,
            updatedAt: now,
          }
        : e),
    });
    setQuickReimburseEntry(null);
  };

  const switchTab = (tab: ActiveTab) => { setActiveTab(tab); setShowForm(false); setEditEntry(null); setFilterYear("all"); setFilterStatus("all"); };
  const toggleSort = (field: SortField) => { if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortBy(field); setSortDir("desc"); } };
  const openCreateModal = () => {
    setCreateFormVersion(v => v + 1);
    setShowForm(true);
  };
  const year = new Date().getFullYear();

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDropImport}
      className={`min-h-screen w-full flex flex-col ${isDragOver ? "bg-blue-50" : ""}`}
    >
      <div className="flex-1">
      <div className="max-w-2xl mx-auto p-4 pt-16 font-sans rounded-xl relative">
      {quickPaidEntry !== null && <QuickPaidModal entry={quickPaidEntry} onSave={(d, n) => handleQuickSetPaid(quickPaidEntry, d, n)} onCancel={() => setQuickPaidEntry(null)} />}
      {quickSubmitEntry !== null && <QuickSubmitModal entry={quickSubmitEntry} onSave={(d, n) => handleQuickSubmit(quickSubmitEntry, d, n)} onCancel={() => setQuickSubmitEntry(null)} />}
      {quickReimburseEntry !== null && <QuickReimburseModal entry={quickReimburseEntry} onSave={(a, d, n) => handleQuickReimburse(quickReimburseEntry, a, d, n)} onCancel={() => setQuickReimburseEntry(null)} />}
      {confirmDeleteId !== null && <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={() => setConfirmDeleteId(null)} />}
      {pendingImport !== null && (
        <ImportChoiceModal
          count={pendingImport.length}
          onMerge={handleImportMerge}
          onReplace={handleImportReplace}
          onCancel={() => setPendingImport(null)}
        />
      )}
      {showExport && <ExportModal json={exportJson} onClose={() => setShowExport(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <EntryForm
              key={`create-${createFormVersion}`}
              title="Insert"
              initial={{ person: activeTab === ALL_TAB ? DEFAULT_PERSON : activeTab }}
              personOptions={personTabs}
              onSave={handleAdd}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      {editEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={() => setEditEntry(null)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <EntryForm
              title={`Edit${editEntry.rechnungNr ? ` · #${editEntry.rechnungNr}` : editEntry.provider ? ` · ${editEntry.provider}` : ""}`}
              initial={editEntry}
              personOptions={personTabs}
              onSave={handleEdit}
              onCancel={() => setEditEntry(null)}
            />
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10 flex gap-1.5 flex-nowrap">
        <button onClick={() => setShowHelp(true)} className="text-[11px] text-gray-500 border border-gray-200/80 bg-white/90 px-2.5 py-1 rounded-md hover:bg-gray-50 whitespace-nowrap leading-none shadow-sm">Help</button>
        <label className="text-[11px] text-gray-500 border border-gray-200/80 bg-white/90 px-2.5 py-1 rounded-md hover:bg-gray-50 cursor-pointer whitespace-nowrap inline-flex items-center leading-none shadow-sm">Import JSON<input type="file" accept=".json" className="hidden" onChange={handleImport} /></label>
        <button onClick={openExportModal} className="text-[11px] text-gray-500 border border-gray-200/80 bg-white/90 px-2.5 py-1 rounded-md hover:bg-gray-50 whitespace-nowrap leading-none shadow-sm">Export JSON</button>
      </div>

      <div className="mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">PKV Tracker</h1>
          <p className="text-xs text-gray-400">Private health insurance reimbursements</p>
          <p className="text-xs text-gray-500 mt-2">
            Track invoices from received → paid → submitted → insurer response. Use <button type="button" className="text-blue-600 hover:underline" onClick={() => setShowHelp(true)}>Help</button> for details.
          </p>
        </div>
      </div>

      <Summary entries={summaryEntries} />

      {!showForm && !editEntry && (
        <div className="flex justify-center mb-3">
          <button onClick={openCreateModal} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700">Insert Invoice</button>
        </div>
      )}

      {personEntries.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-3 mb-3 bg-gray-50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Filters</div>
            <div className="text-[11px] text-gray-400 whitespace-nowrap">
              Invoices: {filtered.length}{filtered.length !== personEntries.length ? ` of ${personEntries.length}` : ""}
            </div>
          </div>
          <div className="flex gap-1 flex-wrap mb-2">
            {([ALL_TAB, ...personTabs] as ActiveTab[]).map(tab => (
              <button key={tab} onClick={() => switchTab(tab)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${activeTab === tab ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-600 hover:bg-white"}`}>{tab}</button>
            ))}
          </div>
          {availableYears.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {["all", ...availableYears].map(y => (
                <button key={y} onClick={() => setFilterYear(y)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterYear === y ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-600 hover:bg-white"}`}>{y === "all" ? "All Years" : y}</button>
              ))}
            </div>
          )}
          <div className="mb-2">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Free text filter..."
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white"
            />
          </div>
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {(["all", ...availableStatuses] as string[]).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterStatus === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-white"}`}>{s === "all" ? "All Status" : STATUS_LABELS[s]}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {personEntries.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <span className="text-xs text-gray-400">Sort:</span>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => toggleSort(opt.value)} className={`text-xs px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${sortBy === opt.value ? "bg-gray-700 text-white border-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              {opt.label}{sortBy === opt.value && <span>{sortDir === "desc" ? "↓" : "↑"}</span>}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0
        ? <div className="text-center text-gray-400 py-12 text-sm">{personEntries.length === 0 ? "No invoices yet. Insert your first one!" : "No entries match the current filters."}</div>
        : filtered.map(entry => (
            <EntryRow key={entry.id} entry={entry} showPerson={activeTab === ALL_TAB} isRecentlyUpdated={recentlySavedId === entry.id} onEdit={setEditEntry} onDelete={setConfirmDeleteId} onDuplicate={handleDuplicate} onQuickSetPaid={setQuickPaidEntry} onQuickSubmit={setQuickSubmitEntry} onQuickReimburse={setQuickReimburseEntry} />
          ))
      }
      </div>
      </div>
      <footer className="py-6 text-center text-xs text-gray-400">
        © {year}{" "}
        <a className="text-gray-500 hover:text-gray-700 underline underline-offset-2" href="https://stavgian.de" target="_blank" rel="noopener noreferrer">
          Yiannis Stavgianoudakis
        </a>
      </footer>
    </div>
  );
}
