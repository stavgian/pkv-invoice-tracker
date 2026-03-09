export type Person = string;
export type Status = "received" | "paid" | "submitted" | "partial" | "reimbursed" | "rejected";
export type Category =
  | "Arzt" | "Zahnarzt" | "Krankenhaus" | "Physiotherapie"
  | "Apotheke" | "Optiker" | "Psychotherapie" | "Labor"
  | "Kinderwunsch" | "Sonstiges";

export interface Entry {
  id: string;
  provider: string;
  rechnungNr: string;
  category: Category | "";
  receivedDate: string;
  paidDate: string;
  amountPaid: string;
  submittedDate: string;
  reimbursedAmount: string;
  pkvResponseDate: string;
  notes: string;
  person: Person;
  createdAt: number;
  updatedAt: number;
}

export type EntriesStore = Record<Person, Entry[]>;
export type SortField = "receivedDate" | "createdAt" | "updatedAt" | "amountPaid";
export type SortDir = "asc" | "desc";
