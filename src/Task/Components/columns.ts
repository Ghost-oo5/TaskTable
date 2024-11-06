// columns.ts
export type ColumnType = "text" | "number" | "select" | "date";

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
}

// Define your columns here
export const defaultColumns: ColumnDefinition[] = [
  { name: "Name", type: "text" },
  { name: "Date", type: "date" },
  { name: "Tags", type: "select" },
  { name: "Status", type: "select" },
];
