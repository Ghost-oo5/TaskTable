import { FaAccusoft, FaCalendarPlus, FaTag, FaUser } from "react-icons/fa";
import { IoText } from "react-icons/io5";
import { MdNumbers } from "react-icons/md";
import { RiDropdownList } from "react-icons/ri";

export type ColumnType = "text" | "number" | "select" | "date";

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  iconType?: string;  
}

export const iconTypeMapping: Record<string, JSX.Element> = {
  name: <FaUser />,
  text: <IoText />,
  date: <FaCalendarPlus />,
  select: <RiDropdownList />,
  Tags: <FaTag />,
  status: <FaAccusoft />,
  number: <MdNumbers  />,
};


export const defaultColumns: ColumnDefinition[] = [
  { name: "Name", type: "text", iconType: "name" },
  { name: "Date", type: "date", iconType: "date" },
  { name: "Tags", type: "select", iconType: "Tags" },
  { name: "Status", type: "select", iconType: "status" },
  { name: "number", type: "number", iconType: "number" },
];
