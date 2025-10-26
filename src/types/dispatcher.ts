export type DispatcherName = "Luiza" | "Laura" | "Rely" | "Antigona" | "Memeta";

export interface Transaction {
  id: string;
  type: "intrare" | "iesire";
  amount: number;
  description: string;
  timestamp: string;
  dispatcher: DispatcherName;
}

export interface Shift {
  id: string;
  dispatcher: DispatcherName;
  startTime: string;
  endTime?: string;
  initialBalance: number;
  finalBalance: number;
  transactions: Transaction[];
}

export interface ShiftData {
  dispatcher: DispatcherName;
  startTime: string;
  endTime: string;
  initialBalance: number;
  finalBalance: number;
  intrari: number;
  iesiri: number;
}
