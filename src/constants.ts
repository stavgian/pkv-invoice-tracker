import type { Category, Entry, SortField } from "./types";

export const CATEGORIES: Category[] = [
  "Arzt", "Zahnarzt", "Krankenhaus", "Physiotherapie",
  "Apotheke", "Optiker", "Psychotherapie", "Labor",
  "Kinderwunsch", "Sonstiges",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  Arzt: "Doctor",
  Zahnarzt: "Dentist",
  Krankenhaus: "Hospital",
  Physiotherapie: "Physiotherapy",
  Apotheke: "Pharmacy",
  Optiker: "Optician",
  Psychotherapie: "Psychotherapy",
  Labor: "Lab",
  Kinderwunsch: "Fertility",
  Sonstiges: "Other",
};

export const STATUS_COLORS: Record<string, string> = {
  received: "bg-gray-100 text-gray-700",
  paid: "bg-yellow-100 text-yellow-800",
  submitted: "bg-blue-100 text-blue-800",
  partial: "bg-amber-100 text-amber-800",
  reimbursed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<string, string> = {
  received: "Received",
  paid: "Paid",
  submitted: "Submitted",
  partial: "Partially reimbursed",
  reimbursed: "Reimbursed",
  rejected: "Rejected",
};

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "receivedDate", label: "Invoice Date" },
  { value: "createdAt", label: "Created At" },
  { value: "updatedAt", label: "Last Updated" },
  { value: "amountPaid", label: "Amount" },
];

export const EMPTY_FORM: Omit<Entry, "id" | "person" | "createdAt" | "updatedAt"> = {
  provider: "", rechnungNr: "", category: "", receivedDate: "", paidDate: "",
  amountPaid: "", submittedDate: "", reimbursedAmount: "", pkvResponseDate: "", notes: "",
};
