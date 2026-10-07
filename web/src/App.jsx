import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import tentScene from "./assets/tent-scene.jpeg";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CircleHelp,
  Download,
  Ellipsis,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Package,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  Users,
  X,
  Receipt,
  Wallet,
  UserCog,
  Wrench,
  Send,
  CircleDollarSign,
  Printer,
  Table2,
  ChartColumnBig,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  ArrowLeft,
  ListFilter,
  Eye,
  EyeOff,
  Phone,
  Lock,
  LogOut,
  LoaderCircle,
  CircleAlert,
  Tent,
  BadgeCheck,
  Headset,
  Mail,
  MapPin,
  UserRound,
  CircleCheck,
  CalendarCheck,
  Building2,
  PencilLine,
  Banknote,
  ScrollText,
  CreditCard,
  Plug,
  Upload,
  Save,
  Smartphone,
  Landmark,
  Percent,
  KeyRound,
  Globe,
  MessageCircle,
  Cloud,
  HardDriveDownload,
  CircleDot,
  Info,
  Armchair,
  PanelTop,
  Shirt,
  Lightbulb,
  Footprints,
  RectangleHorizontal,
  Speaker,
  Mic,
  Monitor,
  Camera,
  Lamp,
  CookingPot,
  PhoneCall,
  ClipboardCheck,
  Minus,
  PackageCheck,
  StickyNote,
  Flag,
  Layers,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Inventory", icon: Package, count: "248" },
  { label: "Orders", icon: CalendarDays, count: "8" },
  { label: "Customers", icon: Users },
  { label: "Invoices", icon: Receipt },
  { label: "Finance", icon: Wallet },
  { label: "SMS & Notifications", icon: MessageSquareText, count: "3" },
];

const managementNavigation = [
  { label: "Reports", icon: ChartNoAxesCombined },
  { label: "Users & Roles", icon: UserCog },
  { label: "Settings", icon: Settings2 },
];

function BrandMark() {
  return (
    <div className="brand-mark">
      <span>PR</span>
      <i />
    </div>
  );
}

function Metric({ icon: Icon, label, value, change, kind, color, caption }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${color}`}>
        <Icon size={18} strokeWidth={2.1} />
      </div>
      <div className="metric-main">
        <span className="metric-label">{label}</span>
        <strong>{value}</strong>
        <span className={`metric-change ${kind}`}>
          {kind === "down" ? (
            <ArrowDownRight size={13} />
          ) : (
            <ArrowUpRight size={13} />
          )}
          {change}
          <span className="change-caption">{caption}</span>
        </span>
      </div>
    </article>
  );
}

async function downloadTableReport(title, columns, rows, format, options = {}) {
  const fileName = `pendo-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}`;

  if (format === "excel") {
    const { zipSync } = await import("fflate");
    const escapeXml = (value) => String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
    const columnName = (index) => String.fromCharCode(65 + index);
    const sheetData = [
      ...(options.subtitle ? [[`Pendo Rentals - ${title}`], [options.subtitle], []] : []),
      columns,
      ...rows,
      ...(options.footer ? [options.footer] : []),
    ];
    const sheetRows = sheetData
      .map((row, rowIndex) => {
        const cells = row.map((value, columnIndex) => {
          const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
          return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
        }).join("");
        return `<row r="${rowIndex + 1}">${cells}</row>`;
      }).join("");
    const workbookFiles = {
      "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(title.slice(0, 31))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
      "xl/worksheets/sheet1.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`,
    };
    const workbook = zipSync(Object.fromEntries(
      Object.entries(workbookFiles).map(([path, content]) => [path, new TextEncoder().encode(content)]),
    ));
    const url = URL.createObjectURL(new Blob([workbook], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const pdfDocument = new jsPDF({ orientation: "landscape" });
  pdfDocument.setFontSize(16);
  pdfDocument.text(`Pendo Rentals - ${title}`, 14, 16);
  if (options.subtitle) {
    pdfDocument.setFontSize(8);
    pdfDocument.setTextColor(107, 122, 144);
    pdfDocument.text(pdfDocument.splitTextToSize(options.subtitle, 265), 14, 22);
  }
  autoTable(pdfDocument, {
    head: [columns],
    body: rows,
    ...(options.footer ? { foot: [options.footer], showFoot: "lastPage" } : {}),
    startY: options.subtitle ? 29 : 23,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [38, 116, 237] },
    footStyles: { fillColor: [238, 245, 255], textColor: [16, 48, 94], fontStyle: "bold" },
  });
  pdfDocument.save(`${fileName}.pdf`);
}

const BUSINESS_INFO = {
  name: "Pendo Rentals",
  workspace: "Pendo Outdoors",
  email: "hello@pendooutdoors.com",
  phone: "0622 882 278",
  address: "Kayenze, Geita, Tanzania",
};

const sumBy = (rows, key) => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
const formatTSh = (value) =>
  `TSh ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatReportDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

function formatReportValue(value, type) {
  if (value === undefined || value === null || value === "") return "";
  if (type === "money") return formatTSh(value);
  if (type === "date") return formatReportDate(value);
  if (type === "percent") return `${value}%`;
  if (type === "number") return Number(value).toLocaleString("en-US");
  if (type === "km") return `${Number(value).toFixed(1)} km`;
  return String(value);
}

const statusTones = {
  Paid: "green", Completed: "green", Delivered: "green", Approved: "green", Active: "green", Available: "green",
  "Partially paid": "amber", Pending: "amber", Maintenance: "amber",
  Scheduled: "blue", "In transit": "blue", Rented: "blue",
  Refunded: "red", Cancelled: "red", Failed: "red", Inactive: "red",
};

const reportDefinitions = [
  {
    id: "finance",
    icon: Receipt,
    title: "Finance & receipts",
    desc: "Payments received, receipts issued and collections by method.",
    tag: "FINANCE",
    rows: [],
    rowKey: "receipt",
    dateKey: "date",
    amountKey: "amount",
    amountLabel: "Collected",
    receipts: true,
    searchKeys: ["receipt", "customer", "phone", "reference", "invoice"],
    filters: [
      { key: "method", label: "Payment method" },
      { key: "status", label: "Payment status" },
      { key: "cashier", label: "Received by" },
    ],
    columns: [
      { key: "receipt", label: "RECEIPT", type: "id" },
      { key: "date", label: "DATE", type: "date" },
      { key: "customer", label: "CUSTOMER" },
      { key: "phone", label: "PHONE", hidden: true },
      { key: "reference", label: "ORDER" },
      { key: "invoice", label: "INVOICE" },
      { key: "method", label: "METHOD" },
      { key: "transactionRef", label: "TRANSACTION REF", hidden: true },
      { key: "cashier", label: "RECEIVED BY" },
      { key: "status", label: "STATUS", type: "status" },
      { key: "amount", label: "AMOUNT", type: "money", total: true },
      { key: "tithe", label: "TITHE", type: "money", total: true },
      { key: "giving", label: "GIVING", type: "money", total: true },
      { key: "net", label: "NET", type: "money", total: true, hidden: true },
    ],
    groupBy: [
      { key: "method", label: "Collections by payment method" },
      { key: "status", label: "By payment status" },
      { key: "customer", label: "Top paying customers" },
    ],
    // Cards show this month vs last month until a filter is applied (see ReportDetail).
    monthlyCards: true,
    // Money columns show plain numbers; the currency sits in the column heading.
    currencyInHeader: true,
    metrics: (rows, previous) => {
      const totals = (list) => {
        const kept = list.filter((row) => row.status !== "Refunded");
        const refunds = list.filter((row) => row.status === "Refunded");
        const collected = sumBy(kept, "amount");
        const tithe = sumBy(kept, "tithe");
        const giving = sumBy(kept, "giving");
        const byMethod = kept.reduce((map, row) => map.set(row.method, (map.get(row.method) || 0) + (Number(row.amount) || 0)), new Map());
        const [topLabel, topValue] = [...byMethod.entries()].sort((left, right) => right[1] - left[1])[0] || [];
        return {
          collected, tithe, giving, net: collected - tithe - giving,
          payments: kept.length, receipts: list.length,
          average: kept.length ? collected / kept.length : 0,
          refunded: sumBy(refunds, "amount"), refunds: refunds.length,
          topMethod: topLabel ? { label: topLabel, value: topValue } : null,
        };
      };
      const now = totals(rows);
      const before = previous ? totals(previous) : null;
      const card = (label, key, value, hint, extra = {}) => ({ label, value, hint, current: now[key], previous: before?.[key], format: formatTSh, ...extra });
      return [
        card("Total collected", "collected", formatTSh(now.collected), `${now.payments} payment${now.payments === 1 ? "" : "s"}`),
        card("Tithe", "tithe", formatTSh(now.tithe), "set aside from payments"),
        card("Giving", "giving", formatTSh(now.giving), "set aside from payments"),
        card("Net", "net", formatTSh(now.net), "collected − tithe − giving", { tone: now.net < 0 ? "negative" : "" }),
        card("Receipts issued", "receipts", now.receipts.toLocaleString("en-US"), "including refunds", { format: (value) => value.toLocaleString("en-US") }),
        card("Average receipt", "average", formatTSh(now.average), "excluding refunds"),
        card("Refunded", "refunded", formatTSh(now.refunded), `${now.refunds} refund${now.refunds === 1 ? "" : "s"}`, { tone: now.refunded > 0 ? "negative" : "", lowerIsBetter: true }),
        { label: "Top method", value: now.topMethod?.label || "—", hint: now.topMethod ? `${formatTSh(now.topMethod.value)} collected` : "no payments" },
      ];
    },
  },
  {
    id: "sales",
    icon: CircleDollarSign,
    title: "Sales report",
    desc: "Revenue, order volume, channels and top-performing categories.",
    tag: "FINANCE",
    rows: [],
    rowKey: "order",
    dateKey: "date",
    amountKey: "total",
    amountLabel: "Revenue",
    searchKeys: ["order", "customer", "items"],
    filters: [
      { key: "category", label: "Category" },
      { key: "channel", label: "Channel" },
      { key: "status", label: "Order status" },
    ],
    columns: [
      { key: "order", label: "ORDER", type: "id" },
      { key: "date", label: "DATE", type: "date" },
      { key: "customer", label: "CUSTOMER" },
      { key: "items", label: "ITEMS" },
      { key: "category", label: "CATEGORY" },
      { key: "channel", label: "CHANNEL" },
      { key: "days", label: "DAYS", type: "number", total: true },
      { key: "status", label: "STATUS", type: "status" },
      { key: "total", label: "TOTAL", type: "money", total: true },
    ],
    groupBy: [
      { key: "category", label: "Revenue by category" },
      { key: "channel", label: "Revenue by channel" },
      { key: "customer", label: "Top customers" },
    ],
    metrics: (rows) => {
      const kept = rows.filter((row) => row.status !== "Cancelled");
      const revenue = sumBy(kept, "total");
      return [
        { label: "Revenue", value: formatTSh(revenue), hint: "excluding cancelled" },
        { label: "Orders", value: rows.length, hint: `${kept.length} not cancelled` },
        { label: "Average order", value: formatTSh(kept.length ? revenue / kept.length : 0), hint: "per order" },
        { label: "Cancelled", value: rows.length - kept.length, hint: formatTSh(sumBy(rows.filter((row) => row.status === "Cancelled"), "total")), tone: "negative" },
      ];
    },
  },
  {
    id: "expenses",
    icon: Wallet,
    title: "Expense report",
    desc: "Operating costs by category, vendor and payment method.",
    tag: "FINANCE",
    rows: [],
    rowKey: "id",
    dateKey: "date",
    amountKey: "amount",
    amountLabel: "Spent",
    searchKeys: ["description", "vendor", "category"],
    filters: [
      { key: "category", label: "Category" },
      { key: "method", label: "Paid with" },
      { key: "status", label: "Approval" },
    ],
    columns: [
      { key: "date", label: "DATE", type: "date" },
      { key: "category", label: "CATEGORY" },
      { key: "description", label: "DESCRIPTION" },
      { key: "vendor", label: "VENDOR" },
      { key: "method", label: "PAID WITH" },
      { key: "status", label: "STATUS", type: "status" },
      { key: "amount", label: "AMOUNT", type: "money", total: true },
    ],
    groupBy: [
      { key: "category", label: "Spend by category" },
      { key: "method", label: "Spend by payment method" },
      { key: "vendor", label: "Top vendors" },
    ],
    metrics: (rows) => {
      const total = sumBy(rows, "amount");
      const byCategory = groupTotals(rows, "category", "amount");
      return [
        { label: "Total expenses", value: formatTSh(total), hint: `${rows.length} entries` },
        { label: "Largest category", value: byCategory[0]?.label || "—", hint: byCategory[0] ? formatTSh(byCategory[0].value) : "" },
        { label: "Average expense", value: formatTSh(rows.length ? total / rows.length : 0), hint: "per entry" },
        { label: "Pending approval", value: formatTSh(sumBy(rows.filter((row) => row.status === "Pending"), "amount")), hint: `${rows.filter((row) => row.status === "Pending").length} entries`, tone: "negative" },
      ];
    },
  },
  {
    id: "inventory",
    icon: Package,
    title: "Items & availability",
    desc: "Rental utilization, availability and revenue per item.",
    tag: "INVENTORY",
    currencyInHeader: true,
    // The period filter uses order event dates: booked units and revenue are recounted for the period.
    dateLabel: "Event date",
    periodRows: (rows, from, to) => (from || to
      ? rows.map((row) => {
        const inPeriod = (row.bookings || []).filter((booking) => (!from || booking.date >= from) && (!to || booking.date <= to));
        return { ...row, booked: inPeriod.reduce((sum, booking) => sum + booking.units, 0), revenue: inPeriod.reduce((sum, booking) => sum + booking.revenue, 0) };
      })
      : rows),
    rows: [],
    rowKey: "sku",
    labelKey: "name",
    amountKey: "revenue",
    amountLabel: "Revenue",
    searchKeys: ["name", "sku", "category"],
    filters: [
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
    ],
    columns: [
      { key: "name", label: "ITEM" },
      { key: "sku", label: "SKU", type: "id" },
      { key: "category", label: "CATEGORY" },
      { key: "quantity", label: "QTY", type: "number", total: true },
      { key: "rented", label: "OUT TODAY", type: "number", total: true },
      { key: "utilization", label: "UTILIZATION", type: "percent" },
      { key: "booked", label: "BOOKED", type: "number", total: true },
      { key: "status", label: "STATUS", type: "status" },
      { key: "revenue", label: "REVENUE", type: "money", total: true },
    ],
    groupBy: [
      { key: "category", label: "Revenue by category" },
      { key: "status", label: "Revenue by status" },
    ],
    metrics: (rows) => {
      const quantity = sumBy(rows, "quantity");
      const rented = sumBy(rows, "rented");
      // Units in maintenance can't be rented, so they don't count as available.
      const available = rows.filter((row) => row.status === "Available").reduce((sum, row) => sum + Math.max(0, row.quantity - row.rented), 0);
      const inMaintenance = sumBy(rows.filter((row) => row.status === "Maintenance"), "quantity");
      const overbooked = rows.filter((row) => row.rented > row.quantity).length;
      return [
        { label: "Units in stock", value: quantity.toLocaleString("en-US"), hint: `${rows.length} item${rows.length === 1 ? "" : "s"}${inMaintenance ? ` · ${inMaintenance.toLocaleString("en-US")} in maintenance` : ""}` },
        { label: "Out on orders today", value: rented.toLocaleString("en-US"), hint: `${available.toLocaleString("en-US")} available now` },
        { label: "Utilization", value: `${quantity ? Math.round((rented / quantity) * 100) : 0}%`, hint: overbooked ? `${overbooked} item${overbooked === 1 ? "" : "s"} overbooked` : "out today / in stock", tone: overbooked ? "negative" : "" },
        { label: "Rental revenue", value: formatTSh(sumBy(rows, "revenue")), hint: `${sumBy(rows, "booked").toLocaleString("en-US")} units booked in period` },
      ];
    },
  },
  {
    id: "customers",
    icon: Users,
    title: "Customer report",
    desc: "Customer activity, segments, retention and lifetime value.",
    tag: "CUSTOMERS",
    rows: [],
    rowKey: "name",
    dateKey: "lastOrder",
    dateLabel: "Last order",
    amountKey: "spent",
    amountLabel: "Lifetime spend",
    searchKeys: ["name", "phone"],
    filters: [
      { key: "segment", label: "Segment" },
      { key: "status", label: "Status" },
    ],
    columns: [
      { key: "name", label: "CUSTOMER" },
      { key: "phone", label: "PHONE" },
      { key: "segment", label: "SEGMENT" },
      { key: "lastOrder", label: "LAST ORDER", type: "date" },
      { key: "orders", label: "ORDERS", type: "number", total: true },
      { key: "status", label: "STATUS", type: "status" },
      { key: "spent", label: "LIFETIME SPEND", type: "money", total: true },
    ],
    groupBy: [
      { key: "segment", label: "Spend by segment" },
      { key: "name", label: "Top customers" },
    ],
    metrics: (rows) => {
      const spent = sumBy(rows, "spent");
      return [
        { label: "Customers", value: rows.length, hint: `${rows.filter((row) => row.status === "Active").length} active` },
        { label: "Lifetime spend", value: formatTSh(spent), hint: `${sumBy(rows, "orders")} orders` },
        { label: "Average value", value: formatTSh(rows.length ? spent / rows.length : 0), hint: "per customer" },
        { label: "VIP customers", value: rows.filter((row) => row.segment === "VIP").length, hint: "top segment" },
      ];
    },
  },
  {
    id: "deliveries",
    icon: Truck,
    title: "Delivery report",
    desc: "Delivery schedules, completion rate, drivers and fees.",
    tag: "OPERATIONS",
    rows: [],
    rowKey: "id",
    dateKey: "date",
    amountKey: "fee",
    amountLabel: "Delivery fees",
    searchKeys: ["id", "customer", "area"],
    filters: [
      { key: "driver", label: "Driver" },
      { key: "area", label: "Area" },
      { key: "status", label: "Status" },
    ],
    columns: [
      { key: "id", label: "DELIVERY", type: "id" },
      { key: "date", label: "DATE", type: "date" },
      { key: "customer", label: "CUSTOMER" },
      { key: "area", label: "AREA" },
      { key: "driver", label: "DRIVER" },
      { key: "status", label: "STATUS", type: "status" },
      { key: "fee", label: "FEE", type: "money", total: true },
    ],
    groupBy: [
      { key: "driver", label: "Fees by driver" },
      { key: "area", label: "Fees by area" },
      { key: "status", label: "By status" },
    ],
    metrics: (rows) => {
      const delivered = rows.filter((row) => row.status === "Delivered").length;
      return [
        { label: "Deliveries", value: rows.length, hint: `${delivered} delivered` },
        { label: "Completion rate", value: `${rows.length ? Math.round((delivered / rows.length) * 100) : 0}%`, hint: "delivered / total" },
        { label: "Drivers", value: new Set(rows.map((row) => row.driver)).size, hint: "assigned" },
        { label: "Delivery fees", value: formatTSh(sumBy(rows, "fee")), hint: `${rows.filter((row) => row.status === "Failed").length} failed`, tone: rows.some((row) => row.status === "Failed") ? "negative" : undefined },
      ];
    },
  },
];

function groupTotals(rows, key, valueKey) {
  const totals = new Map();
  rows.forEach((row) => {
    const entry = totals.get(row[key]) || { label: row[key], value: 0, count: 0 };
    entry.value += Number(row[valueKey]) || 0;
    entry.count += 1;
    totals.set(row[key], entry);
  });
  return [...totals.values()].sort((a, b) => b.value - a.value);
}

function shiftIsoDate(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const reportPeriods = ["All time", "Today", "Last 7 days", "Last 30 days", "This month", "Last month", "This year", "Custom range"];

function getPeriodRange(period, from, to) {
  const today = localTodayIso();
  const monthStart = `${today.slice(0, 7)}-01`;
  const lastMonthEnd = shiftIsoDate(monthStart, -1);
  if (period === "Today") return [today, today];
  if (period === "Last 7 days") return [shiftIsoDate(today, -6), today];
  if (period === "Last 30 days") return [shiftIsoDate(today, -29), today];
  if (period === "This month") return [monthStart, today];
  if (period === "Last month") return [`${lastMonthEnd.slice(0, 7)}-01`, lastMonthEnd];
  if (period === "This year") return [`${today.slice(0, 4)}-01-01`, today];
  if (period === "Custom range") return [from, to];
  return ["", ""];
}

// Local calendar day (YYYY-MM-DD) of a timestamp or date string.
function localDay(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function useDateRange(initial = "All time") {
  const [period, setPeriod] = useState(initial);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [from, to] = getPeriodRange(period, customFrom, customTo);
  return {
    period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo, from, to,
    active: period !== initial,
    matches: (value) => {
      const day = localDay(value);
      if (!from && !to) return true;
      return Boolean(day) && (!from || day >= from) && (!to || day <= to);
    },
    reset: () => { setPeriod(initial); setCustomFrom(""); setCustomTo(""); },
  };
}

function DateRangeFilter({ range, label }) {
  return (
    <>
      <select className="inv-select" value={range.period} onChange={(event) => range.setPeriod(event.target.value)} aria-label={`Filter by ${label.toLowerCase()} date`}>
        {reportPeriods.map((option) => <option key={option} value={option}>{option === "All time" ? `${label}: any time` : `${label}: ${option.toLowerCase()}`}</option>)}
      </select>
      {range.period === "Custom range" && (
        <span className="inv-date-range">
          <input type="date" value={range.customFrom} max={range.customTo || undefined} onChange={(event) => range.setCustomFrom(event.target.value)} aria-label={`${label} from`} />
          <i>–</i>
          <input type="date" value={range.customTo} min={range.customFrom || undefined} onChange={(event) => range.setCustomTo(event.target.value)} aria-label={`${label} to`} />
        </span>
      )}
    </>
  );
}

function ClearFiltersButton({ active, onClear }) {
  return (
    <button type="button" className="inv-clear" onClick={onClear} disabled={!active} title="Clear all filters">
      <RotateCcw size={13} /> Clear filters
    </button>
  );
}

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const receiptPrintStyles = `
  @page { size: A5; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "DM Sans", Arial, sans-serif; color: #1c2a3f; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .receipt { position: relative; page-break-after: always; padding: 4mm 2mm; }
  .receipt:last-child { page-break-after: auto; }
  .r-head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2px solid #2674ed; }
  .r-brand strong { display: block; font-size: 20px; letter-spacing: -0.5px; }
  .r-brand strong span { color: #2674ed; }
  .r-brand small, .r-meta small { display: block; color: #6b7a90; font-size: 10px; line-height: 1.5; }
  .r-meta { text-align: right; }
  .r-meta b { display: block; color: #2674ed; font-size: 11px; letter-spacing: 1.5px; }
  .r-meta em { display: block; font-style: normal; font-size: 14px; font-weight: 700; margin-top: 3px; }
  .r-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; margin: 16px 0; }
  .r-grid span { display: block; color: #8492a6; font-size: 9px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; }
  .r-grid strong { display: block; margin-top: 3px; font-size: 12px; }
  .r-amount { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-radius: 8px; background: #eef5ff; }
  .r-amount span { color: #4b5d77; font-size: 11px; font-weight: 600; }
  .r-amount strong { font-size: 22px; color: #10305e; }
  .r-stamp { display: inline-block; margin-left: 10px; padding: 3px 8px; border: 2px solid currentColor; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; transform: rotate(-6deg); }
  .r-stamp { font-style: normal; }
  .r-stamp.green { color: #1f9a6a; } .r-stamp.amber { color: #c4851f; } .r-stamp.red { color: #d0443c; }
  .r-foot { margin-top: 20px; padding-top: 12px; border-top: 1px dashed #c9d3e0; color: #6b7a90; font-size: 10px; text-align: center; line-height: 1.6; }
`;

function receiptMarkup(payment) {
  const tone = statusTones[payment.status] || "green";
  return `
    <section class="receipt">
      <div class="r-head">
        <div class="r-brand">
          <strong>Pendo<span>rentals</span></strong>
          <small>${escapeHtml(BUSINESS_INFO.workspace)} · ${escapeHtml(BUSINESS_INFO.address)}</small>
          <small>${escapeHtml(BUSINESS_INFO.phone)} · ${escapeHtml(BUSINESS_INFO.email)}</small>
        </div>
        <div class="r-meta">
          <b>PAYMENT RECEIPT</b>
          <em>${escapeHtml(payment.receipt)}</em>
          <small>${escapeHtml(formatReportDate(payment.date))}</small>
        </div>
      </div>
      <div class="r-grid">
        <div><span>Received from</span><strong>${escapeHtml(payment.customer)}</strong></div>
        <div><span>Phone</span><strong>${escapeHtml(payment.phone)}</strong></div>
        <div><span>Order</span><strong>${escapeHtml(payment.reference)}</strong></div>
        <div><span>Invoice</span><strong>${escapeHtml(payment.invoice)}</strong></div>
        <div><span>Payment method</span><strong>${escapeHtml(payment.method)}</strong></div>
        <div><span>Received by</span><strong>${escapeHtml(payment.cashier)}</strong></div>
      </div>
      <div class="r-amount"><span>Amount ${payment.status === "Refunded" ? "refunded" : "received"}<em class="r-stamp ${tone}">${escapeHtml(payment.status.toUpperCase())}</em></span><strong>${escapeHtml(formatTSh(payment.amount))}</strong></div>
      <div class="r-foot">Thank you for renting with Pendo. Please keep this receipt for your records.<br />Generated ${escapeHtml(new Date().toLocaleString("en-US"))}</div>
    </section>`;
}

// Prints a complete HTML document through a hidden iframe.
function printHtml(html) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const frameDocument = frame.contentDocument;
  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();
  frame.contentWindow.onafterprint = () => setTimeout(() => frame.remove(), 500);
  const fontsReady = frameDocument.fonts?.ready || Promise.resolve();
  Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1200))]).then(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.isConnected && frame.remove(), 60000);
  });
}

function printReceipts(payments) {
  printHtml(`<!doctype html><html><head><meta charset="utf-8" /><title>Pendo receipts</title><style>${receiptPrintStyles}</style></head><body>${payments.map(receiptMarkup).join("")}</body></html>`);
}

async function downloadReceiptPdf(payment) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ format: "a5" });
  const width = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(38, 116, 237);
  pdf.rect(0, 0, width, 4, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(28, 42, 63);
  pdf.text("Pendo", 12, 18);
  pdf.setTextColor(38, 116, 237);
  pdf.text("rentals", 12 + pdf.getTextWidth("Pendo"), 18);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(107, 122, 144);
  pdf.text(`${BUSINESS_INFO.workspace} · ${BUSINESS_INFO.address}`, 12, 24);
  pdf.text(`${BUSINESS_INFO.phone} · ${BUSINESS_INFO.email}`, 12, 28);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(38, 116, 237);
  pdf.text("PAYMENT RECEIPT", width - 12, 16, { align: "right" });
  pdf.setFontSize(12);
  pdf.setTextColor(28, 42, 63);
  pdf.text(payment.receipt, width - 12, 22, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(107, 122, 144);
  pdf.text(formatReportDate(payment.date), width - 12, 27, { align: "right" });
  pdf.setDrawColor(38, 116, 237);
  pdf.setLineWidth(0.6);
  pdf.line(12, 33, width - 12, 33);

  const fields = [
    ["RECEIVED FROM", payment.customer], ["PHONE", payment.phone],
    ["ORDER", payment.reference], ["INVOICE", payment.invoice],
    ["PAYMENT METHOD", payment.method], ["RECEIVED BY", payment.cashier],
    ["STATUS", payment.status], ["DATE", formatReportDate(payment.date)],
  ];
  fields.forEach(([label, value], index) => {
    const x = index % 2 === 0 ? 12 : width / 2 + 2;
    const y = 44 + Math.floor(index / 2) * 15;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(132, 146, 166);
    pdf.text(label, x, y);
    pdf.setFontSize(10);
    pdf.setTextColor(28, 42, 63);
    pdf.text(String(value), x, y + 5.5);
  });

  pdf.setFillColor(238, 245, 255);
  pdf.roundedRect(12, 108, width - 24, 18, 3, 3, "F");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(75, 93, 119);
  pdf.text(payment.status === "Refunded" ? "Amount refunded" : "Amount received", 17, 119);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(16, 48, 94);
  pdf.text(formatTSh(payment.amount), width - 17, 119.5, { align: "right" });

  pdf.setDrawColor(201, 211, 224);
  pdf.setLineDashPattern([1, 1], 0);
  pdf.line(12, 138, width - 12, 138);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(107, 122, 144);
  pdf.text("Thank you for renting with Pendo. Please keep this receipt for your records.", width / 2, 145, { align: "center" });
  pdf.text(`Generated ${new Date().toLocaleString("en-US")}`, width / 2, 150, { align: "center" });
  pdf.save(`pendo-receipt-${payment.receipt.toLowerCase()}.pdf`);
}

const SESSION_KEY = "pendo-session";

async function api(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can’t reach Pendo right now. Check your internet connection and try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.error || "Something went wrong. Please try again."), { status: response.status, fields: data.fields });
  }
  return data;
}

function normalizePhone(value) {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+255")) return `0${digits.slice(4)}`;
  if (digits.startsWith("255") && digits.length === 12) return `0${digits.slice(3)}`;
  return digits;
}

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "null");
    return session?.token && session?.role ? session : null;
  } catch {
    return null;
  }
}

function writeSession(session, remember) {
  try {
    clearSession();
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable (private mode); the session then lasts until reload.
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing stored to clear.
  }
}

// Service areas come from the API (Settings → Service areas). "Other area" is built in:
// it means the customer types the place themselves.
const OTHER_AREA = "Other area";
let areasCache = null;
const areaListeners = new Set();

function refreshAreas() {
  return api("/areas").then((data) => {
    areasCache = data.areas;
    areaListeners.forEach((listener) => listener(areasCache));
    return areasCache;
  });
}

function useAreas() {
  const [areas, setAreas] = useState(areasCache || []);
  useEffect(() => {
    areaListeners.add(setAreas);
    if (!areasCache) refreshAreas().catch(() => {});
    return () => areaListeners.delete(setAreas);
  }, []);
  return areas;
}

// <option>s for an area <select>. Keeps an old value that has since left the list.
function AreaOptions({ current, other = true }) {
  const names = useAreas().map((area) => area.name);
  if (current && current !== OTHER_AREA && !names.includes(current)) names.push(current);
  if (other) names.push(OTHER_AREA);
  return names.map((name) => <option key={name} value={name}>{name}</option>);
}

const authShowcaseContent = {
  staff: {
    eyebrow: "RENT · CELEBRATE · GROW",
    title: "Everything your rental business needs, in one place.",
    text: "Track inventory, bookings, deliveries and payments — then print receipts and reports in a click.",
    features: [
      "Live availability for every tent, table and light",
      "Receipts, invoices and M-Pesa collections",
      "Finance, sales and delivery reports",
    ],
    stats: [["248", "items tracked"], ["72%", "utilization"], ["1,284", "customers"]],
  },
  customer: {
    eyebrow: "FOR YOUR NEXT EVENT",
    title: "Tents, chairs and décor — delivered to your door.",
    text: "Create a free Pendo Rentals account to book equipment for weddings, send-offs, meetings and celebrations across Geita.",
    features: [
      "Book tents, tables, chairs, lights and more",
      "Pay easily with M-Pesa, cash or bank transfer",
      "Booking updates and receipts by SMS",
    ],
    stats: [["248", "items to rent"], ["24h", "delivery in Geita"], ["1,284", "happy customers"]],
  },
};

function AuthShowcase({ variant = "staff" }) {
  const content = authShowcaseContent[variant];
  return (
    <section className="auth-showcase" aria-hidden="true">
      <img className="auth-showcase-art" src={tentScene} alt="" />
      <div className="auth-brand">
        <BrandMark />
        <span className="brand-lockup">
          <span className="brand-name">Pendo<span>rentals</span></span>
          <span className="brand-caption">{variant === "customer" ? "EVENT & OUTDOOR RENTALS" : "RENTAL WORKSPACE"}</span>
        </span>
      </div>
      <div className="auth-showcase-copy">
        <span className="auth-eyebrow"><Tent size={13} /> {content.eyebrow}</span>
        <h2>{content.title}</h2>
        <p>{content.text}</p>
        <ul className="auth-features">
          {content.features.map((feature) => (
            <li key={feature}><BadgeCheck size={15} /> {feature}</li>
          ))}
        </ul>
      </div>
      <div className="auth-stat-row">
        {content.stats.map(([value, label]) => (
          <div key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
      </div>
      <footer className="auth-showcase-foot">
        <span>Kayenze, Geita · Tanzania</span>
        <span>© 2026 Pendo Rentals</span>
      </footer>
    </section>
  );
}

const RENTAL_ITEMS = [
  { name: "Tents", icon: Tent, unit: "pcs", start: 1 },
  { name: "Chairs", icon: Armchair, unit: "pcs", start: 50 },
  { name: "Tables", icon: PanelTop, unit: "pcs", start: 10 },
  { name: "Seat covers", icon: Shirt, unit: "pcs", start: 50 },
  { name: "Lights", icon: Lightbulb, unit: "pcs", start: 10 },
  { name: "Red carpet", icon: Footprints, unit: "m", start: 10 },
  { name: "Carpet", icon: RectangleHorizontal, unit: "m", start: 10 },
  { name: "PA system", icon: Speaker, unit: "sets", start: 1 },
  { name: "Microphone", icon: Mic, unit: "pcs", start: 2 },
  { name: "LED screen", icon: Monitor, unit: "pcs", start: 1 },
  { name: "Camera", icon: Camera, unit: "pcs", start: 1 },
  { name: "Light box", icon: Lamp, unit: "pcs", start: 1 },
  { name: "Utensils (cooking vessels)", label: "Utensils", sub: "Cooking vessels", icon: CookingPot, unit: "sets", start: 1 },
];

const orderStatusInfo = {
  "New request": { tone: "blue", text: "We received your request and will call you to confirm the price." },
  Confirmed: { tone: "green", text: "Your booking is confirmed." },
  "Ready for pickup": { tone: "amber", text: "Your items are ready." },
  "Out for delivery": { tone: "blue", text: "Your items are on the way." },
  Completed: { tone: "green", text: "Thank you for renting with Pendo." },
  Cancelled: { tone: "red", text: "This request was cancelled." },
};

const itemLabel = (name) => RENTAL_ITEMS.find((item) => item.name === name)?.label || name;
const itemUnit = (name) => RENTAL_ITEMS.find((item) => item.name === name)?.unit || "pcs";
const itemDisplay = (item) => item.custom || itemLabel(item.name);
const formatEventDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

function localTodayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function validateRentRequest(form) {
  const errors = {};
  if (form.items.length === 0) errors.items = "Choose at least one item to rent.";
  else if (form.items.some((item) => item.name === "Other" && item.custom.trim().length < 2)) errors.items = "Tell us which item you need for “Other”.";
  if (!form.eventDate) errors.eventDate = "Choose the event date.";
  else if (form.eventDate < localTodayIso()) errors.eventDate = "The event date cannot be in the past.";
  if (!(Number(form.days) >= 1 && Number(form.days) <= 30)) errors.days = "Between 1 and 30 days.";
  if (!form.area) errors.area = "Choose your area.";
  if (form.area === "Other area" && !form.place.trim()) errors.place = "Tell us where the event is.";
  if (!form.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!form.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!/^0[67]\d{8}$/.test(normalizePhone(form.phone))) errors.phone = "Enter a valid phone number, e.g. 0712 345 678.";
  if (!form.agree) errors.agree = "Please agree so we can contact you.";
  return errors;
}

function RentNowScreen({ onBack, onSignedIn, prefill, backLabel = "Back to sign in" }) {
  const [form, setForm] = useState({
    items: [],
    eventDate: "",
    days: "1",
    area: prefill?.area || "",
    place: prefill?.place || "",
    firstName: prefill?.firstName || "",
    lastName: prefill?.lastName || "",
    phone: prefill?.phone || "",
    notes: "",
    agree: Boolean(prefill),
  });
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const errors = { ...validateRentRequest(form), ...Object.fromEntries(Object.entries(serverErrors).filter(([, message]) => message)) };
  const show = (key) => (submitted && errors[key] ? <small className="auth-field-error"><CircleAlert size={12} /> {errors[key]}</small> : null);
  const invalid = (key) => Boolean(submitted && errors[key]);
  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setServerErrors((current) => ({ ...current, [key]: undefined }));
  };
  const [picker, setPicker] = useState("");
  const selectedCount = form.items.length;
  const available = RENTAL_ITEMS.filter((item) => !form.items.some((selected) => selected.name === item.name));

  function setItems(change) {
    setForm((current) => ({ ...current, items: change(current.items) }));
    setServerErrors((current) => ({ ...current, items: undefined }));
  }

  function addItem(name) {
    setPicker("");
    if (!name) return;
    if (name === "Other") {
      setItems((items) => [...items, { key: `other-${Date.now()}`, name: "Other", custom: "", quantity: 1 }]);
      return;
    }
    const catalogItem = RENTAL_ITEMS.find((item) => item.name === name);
    setItems((items) => [...items, { key: name, name, custom: "", quantity: catalogItem.start }]);
  }

  function setQuantity(key, value) {
    const quantity = Math.max(1, Math.min(10000, Math.round(Number(value) || 1)));
    setItems((items) => items.map((item) => (item.key === key ? { ...item, quantity } : item)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError("");
    const clientErrors = validateRentRequest(form);
    if (Object.keys(clientErrors).length) {
      const first = event.currentTarget.querySelector("[aria-invalid='true'], .rent-picker select");
      first?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const data = await api("/rental-requests", {
        method: "POST",
        body: {
          items: form.items.map(({ name, custom, quantity }) => ({ name, quantity, ...(name === "Other" ? { custom: custom.trim() } : {}) })),
          eventDate: form.eventDate,
          days: Number(form.days),
          area: form.area,
          place: form.place,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          notes: form.notes,
        },
      });
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error.fields) setServerErrors(error.fields);
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const { order, account, sms, session } = result;
    return (
      <main className="auth-page">
        <AuthShowcase variant="customer" />
        <section className="auth-panel">
          <div className="auth-flow auth-success rent-success">
            <div className="auth-success-badge"><PackageCheck size={30} /></div>
            <div className="auth-heading">
              <h1>Asante, {form.firstName.trim()}!</h1>
              <p>Your request <strong>{order.id}</strong> has been received.</p>
            </div>
            <dl className="auth-summary">
              <div><dt><ClipboardCheck size={14} /> Request</dt><dd>{order.id}</dd></div>
              <div><dt><CalendarDays size={14} /> Event</dt><dd>{formatEventDate(order.eventDate)} · {order.days} day{order.days === 1 ? "" : "s"}</dd></div>
              <div><dt><MapPin size={14} /> Location</dt><dd>{order.place ? `${order.place}, ${order.area}` : order.area}</dd></div>
              <div className="rent-summary-items">
                <dt><Package size={14} /> Items</dt>
                <dd>{order.items.map((item) => <span key={item.custom || item.name}>{itemDisplay(item)} × {item.quantity}</span>)}</dd>
              </div>
            </dl>
            {sms.status === "sent" ? (
              <div className="rent-sms-card sent">
                <span><MessageSquareText size={16} /></span>
                <div>
                  <strong>SMS sent to {account.phone}</strong>
                  <small>{account.isNew ? "It has your request details and your login: your phone number and a password." : "It has your request details. Sign in with your phone number and your password."}</small>
                </div>
              </div>
            ) : account.temporaryPassword ? (
              <div className="rent-sms-card login">
                <span><KeyRound size={16} /></span>
                <div>
                  <strong>Your account is ready — save these details</strong>
                  <small>We couldn’t send the SMS right now, so here are your login details.</small>
                  <div className="rent-credentials">
                    <span>Username <b>{account.phone}</b></span>
                    <span>Password <b>{account.temporaryPassword}</b></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rent-sms-card">
                <span><Info size={16} /></span>
                <div>
                  <strong>Request added to your account</strong>
                  <small>Sign in with {account.phone} and your password to track it.</small>
                </div>
              </div>
            )}
            <p className="rent-next"><PhoneCall size={14} /> Our team will call you shortly to confirm availability and price.</p>
            <button type="button" className="auth-primary" onClick={() => onSignedIn(session)}>
              View my requests <ArrowRight size={17} />
            </button>
            <button type="button" className="auth-link rent-center-link" onClick={onBack}>{backLabel}</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <AuthShowcase variant="customer" />
      <section className="auth-panel">
        <div className="auth-flow auth-signup rent-flow">
          <button type="button" className="auth-back" onClick={onBack}>
            <ArrowLeft size={15} /> {backLabel}
          </button>
          <div className="auth-card-brand">
            <BrandMark />
            <span className="brand-name">Pendo<span>rentals</span></span>
          </div>
          <div className="auth-heading">
            <span className="auth-kicker">RENT NOW</span>
            <h1>Request your rental</h1>
            <p>Tell us what you need. We’ll confirm the price and send you an SMS.</p>
          </div>

          <form className="auth-form rent-form" onSubmit={handleSubmit} noValidate>
            <fieldset className="rent-section">
              <legend><span>1</span> What do you need?</legend>
              <label className={`auth-input auth-select rent-picker ${invalid("items") ? "has-error" : ""}`}>
                <Package size={17} />
                <span className="sr-only">Add an item</span>
                <select
                  value={picker}
                  onChange={(event) => addItem(event.target.value)}
                  aria-invalid={invalid("items")}
                  className="is-placeholder"
                >
                  <option value="">{selectedCount ? "Add another item…" : "Choose an item to rent…"}</option>
                  {available.map((item) => (
                    <option key={item.name} value={item.name}>{item.label ? `${item.label} (${item.sub.toLowerCase()})` : item.name}</option>
                  ))}
                  <option value="Other">Other (not listed)…</option>
                </select>
                <ChevronDown size={15} className="auth-select-caret" />
              </label>
              {selectedCount > 0 && (
                <div className="rent-selected">
                  {form.items.map((item) => {
                    const catalogItem = RENTAL_ITEMS.find((entry) => entry.name === item.name);
                    const Icon = catalogItem?.icon || Sparkles;
                    const unit = catalogItem?.unit || "pcs";
                    return (
                      <div className={`rent-item selected ${item.name === "Other" ? "rent-item-other" : ""}`} key={item.key}>
                        <div className="rent-item-head">
                          <span className="rent-item-icon"><Icon size={18} /></span>
                          {item.name === "Other" ? (
                            <input
                              className="rent-other-input"
                              placeholder="Which item? e.g. Flowers"
                              value={item.custom}
                              maxLength={60}
                              autoFocus
                              aria-label="Other item name"
                              aria-invalid={Boolean(submitted && item.custom.trim().length < 2)}
                              onChange={(event) => setItems((items) => items.map((entry) => (entry.key === item.key ? { ...entry, custom: event.target.value } : entry)))}
                            />
                          ) : (
                            <span className="rent-item-name">{catalogItem.label || catalogItem.name}{catalogItem.sub && <small>{catalogItem.sub}</small>}</span>
                          )}
                          <button
                            type="button"
                            className="rent-item-remove"
                            onClick={() => setItems((items) => items.filter((entry) => entry.key !== item.key))}
                            aria-label={`Remove ${item.custom || item.name}`}
                          >
                            <X size={13} />
                          </button>
                        </div>
                        <div className="rent-qty">
                          <button type="button" onClick={() => setQuantity(item.key, item.quantity - 1)} aria-label={`Fewer ${item.custom || item.name}`}><Minus size={12} /></button>
                          <input
                            type="number"
                            min="1"
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={(event) => setQuantity(item.key, event.target.value)}
                            aria-label={`${item.custom || item.name} quantity`}
                          />
                          <i>{unit}</i>
                          <button type="button" onClick={() => setQuantity(item.key, item.quantity + 1)} aria-label={`More ${item.custom || item.name}`}><Plus size={12} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {show("items") || <small className="rent-hint">{selectedCount ? `${selectedCount} item${selectedCount === 1 ? "" : "s"} selected — add more from the list above.` : "Pick from the list. Choose “Other” if your item isn’t listed."}</small>}
            </fieldset>

            <fieldset className="rent-section">
              <legend><span>2</span> When &amp; where?</legend>
              <div className="auth-field-grid">
                <div className="auth-field">
                  <label className={`auth-input ${invalid("eventDate") ? "has-error" : ""}`}>
                    <CalendarDays size={17} />
                    <span className="sr-only">Event date</span>
                    <input type="date" min={localTodayIso()} value={form.eventDate} onChange={(event) => update("eventDate", event.target.value)} aria-invalid={invalid("eventDate")} />
                  </label>
                  {show("eventDate")}
                </div>
                <div className="auth-field">
                  <label className={`auth-input auth-select ${invalid("days") ? "has-error" : ""}`}>
                    <Clock3 size={17} />
                    <span className="sr-only">Number of days</span>
                    <select value={form.days} onChange={(event) => update("days", event.target.value)} aria-invalid={invalid("days")}>
                      {Array.from({ length: 14 }, (_, index) => String(index + 1)).map((value) => (
                        <option key={value} value={value}>{value} day{value === "1" ? "" : "s"}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="auth-select-caret" />
                  </label>
                  {show("days")}
                </div>
                <div className="auth-field">
                  <label className={`auth-input auth-select ${invalid("area") ? "has-error" : ""}`}>
                    <MapPin size={17} />
                    <span className="sr-only">Area</span>
                    <select value={form.area} onChange={(event) => update("area", event.target.value)} aria-invalid={invalid("area")} className={form.area ? "" : "is-placeholder"}>
                      <option value="" disabled>Area</option>
                      <AreaOptions current={form.area} />
                    </select>
                    <ChevronDown size={15} className="auth-select-caret" />
                  </label>
                  {show("area")}
                </div>
                <div className="auth-field">
                  <label className={`auth-input ${invalid("place") ? "has-error" : ""}`}>
                    <Flag size={17} />
                    <span className="sr-only">Venue or landmark</span>
                    <input placeholder={form.area === "Other area" ? "Town / village" : "Venue or landmark"} value={form.place} onChange={(event) => update("place", event.target.value)} aria-invalid={invalid("place")} maxLength={80} />
                  </label>
                  {show("place")}
                </div>
              </div>
            </fieldset>

            <fieldset className="rent-section">
              <legend><span>3</span> Your details</legend>
              <div className="auth-field-grid">
                <div className="auth-field">
                  <label className={`auth-input ${invalid("firstName") ? "has-error" : ""}`}>
                    <UserRound size={17} />
                    <span className="sr-only">First name</span>
                    <input className="caps-input" autoComplete="given-name" placeholder="First name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} aria-invalid={invalid("firstName")} />
                  </label>
                  {show("firstName")}
                </div>
                <div className="auth-field">
                  <label className={`auth-input ${invalid("lastName") ? "has-error" : ""}`}>
                    <UserRound size={17} />
                    <span className="sr-only">Last name</span>
                    <input className="caps-input" autoComplete="family-name" placeholder="Last name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} aria-invalid={invalid("lastName")} />
                  </label>
                  {show("lastName")}
                </div>
              </div>
              <div className="auth-field">
                <label className={`auth-input ${invalid("phone") ? "has-error" : ""}`}>
                  <Phone size={17} />
                  <span className="sr-only">Phone number</span>
                  <input type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone number" value={form.phone} onChange={(event) => update("phone", event.target.value)} aria-invalid={invalid("phone")} />
                </label>
                {show("phone") || <small className="rent-hint">This becomes your username. We’ll SMS your request and login details here.</small>}
              </div>
              <label className="auth-field">
                <span className="sr-only">Notes</span>
                <textarea className="rent-notes" rows="2" maxLength={300} placeholder="Notes (optional) — e.g. type of event, colours, delivery time" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
              </label>
            </fieldset>

            <div className="auth-consents">
              <label className="auth-check">
                <input type="checkbox" checked={form.agree} onChange={(event) => update("agree", event.target.checked)} aria-invalid={invalid("agree")} />
                <span>I agree to Pendo Rentals’ <b>rental terms</b> and to be contacted by SMS and phone</span>
              </label>
              {show("agree")}
            </div>

            {submitError && <p className="auth-error" role="alert"><CircleAlert size={14} /> {submitError}</p>}

            <button className="auth-primary" type="submit" disabled={submitting}>
              {submitting ? <><LoaderCircle size={17} className="auth-spin" /> Sending request…</> : <>Send request <Send size={16} /></>}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function CustomerHome({ session, onLogout, onRentMore }) {
  const [state, setState] = useState({ loading: true, error: "", customer: null, orders: [] });

  async function load() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const data = await api("/my/orders", { token: session.token });
      setState({ loading: false, error: "", customer: data.customer, orders: data.orders });
    } catch (error) {
      if (error.status === 401) {
        onLogout();
        return;
      }
      setState((current) => ({ ...current, loading: false, error: error.message }));
    }
  }

  useEffect(() => {
    load();
  }, [session.token]);

  const firstName = state.customer?.firstName || session.name.split(" ")[0];

  return (
    <div className="cust-page">
      <header className="cust-top">
        <div className="cust-brand">
          <BrandMark />
          <span className="brand-name">Pendo<span>rentals</span></span>
        </div>
        <div className="cust-user">
          <span className="cust-avatar">{session.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
          <span className="cust-user-copy"><strong>{session.name}</strong><small>Customer</small></span>
          <button type="button" className="cust-logout" onClick={onLogout}><LogOut size={14} /> Log out</button>
        </div>
      </header>

      <main className="cust-main">
        <section className="cust-hero">
          <div>
            <span className="auth-kicker">MY RENTALS</span>
            <h1>Karibu, {firstName}!</h1>
            <p>Track your rental requests and bookings with Pendo Rentals.</p>
          </div>
          <button type="button" className="auth-primary cust-rent" onClick={() => onRentMore(state.customer)}>
            <Plus size={16} /> Rent more
          </button>
        </section>

        <section className="cust-section">
          <div className="cust-section-head">
            <h2>My requests {!state.loading && <span className="heading-count">{state.orders.length}</span>}</h2>
            <button type="button" className="cust-refresh" onClick={load} disabled={state.loading}><RotateCcw size={13} /> Refresh</button>
          </div>

          {state.loading ? (
            <div className="cust-loading"><LoaderCircle size={18} className="auth-spin" /> Loading your requests…</div>
          ) : state.error ? (
            <div className="cust-empty"><CircleAlert size={20} /><strong>{state.error}</strong><button type="button" className="auth-link" onClick={load}>Try again</button></div>
          ) : state.orders.length === 0 ? (
            <div className="cust-empty"><Tent size={22} /><strong>No requests yet</strong><small>Tap “Rent more” to request tents, chairs and more.</small></div>
          ) : (
            <div className="cust-orders">
              {state.orders.map((order) => {
                const info = orderStatusInfo[order.status] || { tone: "blue", text: "" };
                return (
                  <article className="cust-order" key={order.id}>
                    <header>
                      <div>
                        <strong>{order.id}</strong>
                        <small>Requested {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</small>
                      </div>
                      <span className={`status-pill ${info.tone}`}><i />{order.status}</span>
                    </header>
                    <div className="cust-order-items">
                      {order.items.map((item) => (
                        <span key={item.custom || item.name}>{itemDisplay(item)} <b>× {item.quantity}</b> <i>{item.custom ? "pcs" : itemUnit(item.name)}</i></span>
                      ))}
                    </div>
                    <dl>
                      <div><dt><CalendarDays size={13} /> Event</dt><dd>{formatEventDate(order.eventDate)} · {order.days} day{order.days === 1 ? "" : "s"}</dd></div>
                      <div><dt><MapPin size={13} /> Location</dt><dd>{order.place ? `${order.place}, ${order.area}` : order.area}</dd></div>
                      {order.notes && <div><dt><StickyNote size={13} /> Notes</dt><dd>{order.notes}</dd></div>}
                    </dl>
                    {order.total !== null && order.total !== undefined && (
                      <div className="cust-order-money">
                        <span>Total <b>{formatShillings(order.total)}</b></span>
                        <span>Paid <b>{formatShillings(order.paid)}</b></span>
                        <span className={order.balance ? "due" : "settled"}>{order.balance ? <>Balance <b>{formatShillings(order.balance)}</b></> : <b>Paid in full</b>}</span>
                      </div>
                    )}
                    {info.text && <p className="cust-order-note"><Info size={13} /> {info.text}</p>}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="cust-help">
          <span className="auth-help-icon"><Headset size={18} /></span>
          <div>
            <strong>Questions about your rental?</strong>
            <small>Our team in Kayenze, Geita is happy to help.</small>
          </div>
          <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`}><Phone size={14} /> {BUSINESS_INFO.phone}</a>
          <a href={`mailto:${BUSINESS_INFO.email}`}><Mail size={14} /> Email us</a>
        </section>
      </main>
    </div>
  );
}

function LoginScreen({ onLogin, onRentNow }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!helpOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest(".auth-help")) setHelpOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setHelpOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [helpOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting || !username.trim() || !password) return;
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const session = await api("/auth/login", { method: "POST", body: { phone: username, password } });
      writeSession(session, remember);
      onLogin(session);
    } catch (loginError) {
      setSubmitting(false);
      setAttempt((count) => count + 1);
      setError(loginError.message);
    }
  }

  return (
    <main className="auth-page">
      <AuthShowcase variant="staff" />

      <section className="auth-panel">
        <div className="auth-flow">
          <div className="auth-card-brand">
            <BrandMark />
            <span className="brand-name">Pendo<span>rentals</span></span>
          </div>

          <div className="auth-heading">
            <h1>Welcome back</h1>
            <p>Sign in with your phone number to manage your rentals.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className={`auth-input ${error ? "has-error" : ""}`}>
              <Phone size={17} />
              <span className="sr-only">Phone number</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="username"
                placeholder="Phone Number"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                autoFocus
              />
            </label>
            <label className={`auth-input ${error ? "has-error" : ""}`}>
              <Lock size={17} />
              <span className="sr-only">Password</span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
              />
              <button
                type="button"
                className="auth-reveal"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </label>
            {error && (
              <p className="auth-error" role="alert" key={attempt}>
                <CircleAlert size={14} /> {error}
              </p>
            )}
            <div className="auth-row">
              <label className="auth-check">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                <span>Keep me signed in</span>
              </label>
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setError("");
                  setNotice(`To reset your password, call Pendo Rentals on ${BUSINESS_INFO.phone}.`);
                }}
              >
                Forgot Password?
              </button>
            </div>
            <button className="auth-primary" type="submit" disabled={submitting || !username.trim() || !password}>
              {submitting ? <><LoaderCircle size={17} className="auth-spin" /> Signing in…</> : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          {notice && <p className="auth-notice" role="status">{notice}</p>}

          <div className="auth-divider"><span>OR</span></div>

          <button
            type="button"
            className="auth-outline"
            onClick={onRentNow}
          >
            <Tent size={17} /> Rent Now
          </button>

          <section className={`auth-help ${helpOpen ? "open" : ""}`} aria-label="Contact Pendo support">
            <button
              type="button"
              className="auth-help-head"
              onClick={() => setHelpOpen((open) => !open)}
              aria-expanded={helpOpen}
              aria-controls="auth-help-contacts"
            >
              <span className="auth-help-icon"><Headset size={18} /></span>
              <span>
                <strong>Need Help?</strong>
                <small>{helpOpen ? "Reach Pendo Support by phone or email" : "Contact Pendo Support"}</small>
              </span>
              <ChevronDown size={17} className="auth-help-caret" />
            </button>
            {helpOpen && (
            <div className="auth-help-contacts" id="auth-help-contacts">
              <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`}>
                <Phone size={15} />
                <span><small>Call us</small><strong>{BUSINESS_INFO.phone}</strong></span>
                <ChevronRight size={15} />
              </a>
              <a href={`mailto:${BUSINESS_INFO.email}`}>
                <Mail size={15} />
                <span><small>Email us</small><strong>{BUSINESS_INFO.email}</strong></span>
                <ChevronRight size={15} />
              </a>
            </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(readSession);
  const [authView, setAuthView] = useState("login");
  const [rentPrefill, setRentPrefill] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [authView, session?.role]);

  useEffect(() => {
    if (!session) return;
    api("/me", { token: session.token })
      .then((me) => {
        if (me.staffRole !== session.staffRole || me.name !== session.name || me.id !== session.id) {
          const next = { ...session, staffRole: me.staffRole, name: me.name, id: me.id };
          let remembered = false;
          try {
            remembered = Boolean(localStorage.getItem(SESSION_KEY));
          } catch {
            remembered = false;
          }
          writeSession(next, remembered);
          setSession(next);
        }
      })
      .catch((error) => {
        if (error.status === 401) {
          clearSession();
          setSession(null);
        }
      });
  }, [session?.token]);

  function logout() {
    if (session) api("/auth/logout", { method: "POST", token: session.token }).catch(() => {});
    clearSession();
    setSession(null);
    setAuthView("login");
    setRentPrefill(null);
  }

  function signIn(nextSession) {
    writeSession(nextSession, true);
    setSession(nextSession);
    setAuthView("login");
    setRentPrefill(null);
  }

  if (authView === "rent" && (!session || session.role === "customer")) {
    return (
      <RentNowScreen
        prefill={rentPrefill}
        backLabel={session ? "Back to my requests" : "Back to sign in"}
        onBack={() => {
          setAuthView("login");
          setRentPrefill(null);
        }}
        onSignedIn={signIn}
      />
    );
  }
  if (!session) return <LoginScreen onLogin={setSession} onRentNow={() => setAuthView("rent")} />;
  if (session.role === "customer") {
    return (
      <CustomerHome
        session={session}
        onLogout={logout}
        onRentMore={(customer) => {
          setRentPrefill(customer ? { ...customer, phone: customer.phone } : null);
          setAuthView("rent");
        }}
      />
    );
  }
  return <Workspace session={session} onLogout={logout} />;
}

function applyBusinessInfo(settings) {
  if (!settings) return;
  Object.assign(BUSINESS_INFO, {
    name: settings.businessName || BUSINESS_INFO.name,
    phone: settings.phone || BUSINESS_INFO.phone,
    email: settings.email || BUSINESS_INFO.email,
    address: [settings.address, settings.region, "Tanzania"].filter(Boolean).join(", "),
  });
}

const PAGE_ACCESS = {
  Admin: null,
  "Store manager": null,
  "Inventory staff": ["Overview", "Inventory", "Orders", "Settings"],
  "Delivery staff": ["Overview", "Orders", "Settings"],
};

const PAGE_COPY = {
  Inventory: "Keep your tents, chairs and equipment ready for the next event.",
  Orders: "Price requests, confirm bookings and track every rental.",
  Customers: "Everyone who rents from Pendo, with their history and spend.",
  Invoices: "Bill customers and track what has been paid.",
  Finance: "Revenue, tithe, expenses and profit from real payments.",
  "SMS & Notifications": "Every SMS sent to customers and staff, and the automatic templates.",
  Reports: "Detailed reports built from your live data.",
  "Users & Roles": "Who can sign in and what each role can do.",
  Settings: "Business details, policies, payments and your account.",
};

function Workspace({ session, onLogout }) {
  const logoutRef = useRef(onLogout);
  logoutRef.current = onLogout;
  const call = useCallback(
    (path, options = {}) => api(path, { ...options, token: session.token }).catch((error) => {
      if (error.status === 401) logoutRef.current();
      throw error;
    }),
    [session.token],
  );
  const value = useMemo(() => ({ session, call }), [session, call]);
  return (
    <ApiContext.Provider value={value}>
      <WorkspaceShell session={session} onLogout={onLogout} />
    </ApiContext.Provider>
  );
}

function WorkspaceShell({ session, onLogout }) {
  const { call } = useApi();
  const [activePage, setActivePage] = useState("Overview");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [startCreate, setStartCreate] = useState(null);
  const settingsRes = useResource("/settings");
  const pulse = useResource("/dashboard");

  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState("loading");
  const [inventoryAddOpen, setInventoryAddOpen] = useState(false);
  const [customerAddOpen, setCustomerAddOpen] = useState(false);
  const [invoiceAddOpen, setInvoiceAddOpen] = useState(false);

  const loadInventory = useCallback(() => {
    setInventoryStatus("loading");
    call("/inventory")
      .then(({ items, categories }) => {
        setInventoryItems(items);
        setInventoryCategories(categories || []);
        setInventoryStatus("ready");
      })
      .catch(() => setInventoryStatus("error"));
  }, [call]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    applyBusinessInfo(settingsRes.data?.settings);
  }, [settingsRes.data]);

  const allowedPages = PAGE_ACCESS[session.staffRole];
  const canSee = (label) => !allowedPages || allowedPages.includes(label);
  const canEditInventory = ["Admin", "Store manager", "Inventory staff"].includes(session.staffRole);
  const initials = session.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const firstName = session.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const newRequests = pulse.data?.orders?.new_requests;

  function changePage(label) {
    setActivePage(label);
    setMobileNav(false);
    setQuery("");
    if (label === "Overview") pulse.reload();
    if (label === "Inventory") loadInventory();
  }

  function openNewOrder(customer) {
    setStartCreate(customer ? { customer } : { customer: null });
    changePage("Orders");
  }

  const navCount = (label) => {
    if (label === "Inventory") return inventoryStatus === "ready" ? String(inventoryItems.length) : null;
    if (label === "Orders") return newRequests ? String(newRequests) : null;
    return null;
  };

  const navButton = ({ label, icon: Icon }) => (
    <button key={label} className={`nav-link ${activePage === label ? "active" : ""}`} onClick={() => changePage(label)}>
      <Icon size={17} strokeWidth={1.8} />
      <span>{label}</span>
      {navCount(label) && <span className={`nav-count ${label === "Orders" ? "count-highlight" : ""}`}>{navCount(label)}</span>}
    </button>
  );

  const settings = settingsRes.data?.settings;
  let content;
  if (activePage === "Overview") content = <OverviewPage onNavigate={changePage} onNewOrder={() => openNewOrder(null)} />;
  else if (activePage === "Inventory") {
    content = (
      <InventoryManager
        session={session}
        query={query}
        items={inventoryItems}
        setItems={setInventoryItems}
        categories={inventoryCategories}
        status={inventoryStatus}
        reload={loadInventory}
        addOpen={inventoryAddOpen}
        setAddOpen={setInventoryAddOpen}
        onUnauthorized={onLogout}
        canEdit={canEditInventory}
      />
    );
  } else if (activePage === "Orders") content = <OrdersPage query={query} settings={settings} startCreate={startCreate} onCreateHandled={() => setStartCreate(null)} />;
  else if (activePage === "Customers") content = <CustomersPage query={query} onNewOrder={(customer) => openNewOrder(customer)} addOpen={customerAddOpen} setAddOpen={setCustomerAddOpen} />;
  else if (activePage === "Invoices") content = <InvoicesPage query={query} settings={settings} addOpen={invoiceAddOpen} setAddOpen={setInvoiceAddOpen} />;
  else if (activePage === "Finance") content = <FinancePage query={query} session={session} />;
  else if (activePage === "SMS & Notifications") content = <MessagingPage session={session} settingsResource={settingsRes} />;
  else if (activePage === "Reports") content = <ReportsPage />;
  else if (activePage === "Users & Roles") content = <UsersPage query={query} session={session} />;
  else if (activePage === "Settings") {
    content = settingsRes.data
      ? <SettingsPage session={session} onLogout={onLogout} settingsResource={settingsRes} />
      : <section className="panel inv-panel"><LoadState status={settingsRes.status} error={settingsRes.error} onRetry={settingsRes.reload} /></section>;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <a className="brand" href="#overview" onClick={() => changePage("Overview")}>
          <BrandMark />
          <span className="brand-lockup">
            <span className="brand-name">Pendo<span>rentals</span></span>
            <span className="brand-caption">RENTAL WORKSPACE</span>
          </span>
        </a>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">{navigation.filter(({ label }) => canSee(label)).map(navButton)}</nav>
        {managementNavigation.some(({ label }) => canSee(label)) && <div className="nav-caption manage-caption">MANAGE</div>}
        <nav className="main-nav" aria-label="Management navigation">{managementNavigation.filter(({ label }) => canSee(label)).map(navButton)}</nav>
        <div className="sidebar-bottom">
          <div className="help-panel">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Need a hand?</strong>
            <span>Call {BUSINESS_INFO.phone}</span>
            <button onClick={() => setModal("help")}>Help &amp; support <ArrowRight size={13} /></button>
          </div>
          <button className="profile-button" onClick={() => setModal("profile")}>
            <div className="profile-avatar">{initials}</div>
            <span><strong>{session.name}</strong><small>{session.staffRole}</small></span>
            <Ellipsis size={19} />
          </button>
        </div>
      </aside>
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19} /></button>
            <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{activePage}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={activePage === "Overview" ? "Search on any list page…" : `Search ${activePage.toLowerCase()}…`} />
            </label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => (newRequests && canSee("Orders") ? changePage("Orders") : setModal("notifications"))}>
              <Bell size={18} />
              {newRequests > 0 && <i />}
            </button>
            <div className="top-divider" />
            <button className="top-profile" onClick={() => setModal("profile")}>
              <div className="profile-avatar small-avatar">{initials}</div>
              <span><strong>{session.name}</strong><small>{session.staffRole}</small></span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}</div>
              <h1>{activePage === "Overview" ? `${greeting}, ${firstName}` : activePage}</h1>
              <p>{activePage === "Overview" ? "Here’s what’s happening with your rentals today." : PAGE_COPY[activePage]}</p>
            </div>
            <div className="welcome-actions">
              {activePage === "Inventory" && canEditInventory && (
                <button className="button button-primary" onClick={() => setInventoryAddOpen(true)}><Plus size={17} /> Add items</button>
              )}
              {activePage === "Invoices" && isManager(session) && (
                <button className="button button-primary" onClick={() => setInvoiceAddOpen(true)}><Plus size={17} /> Create invoice</button>
              )}
              {activePage === "Customers" && isManager(session) && (
                <button className="button button-primary" onClick={() => setCustomerAddOpen(true)}><Plus size={17} /> Add customer</button>
              )}
              {["Overview", "Orders"].includes(activePage) && isManager(session) && (
                <button className="button button-primary" onClick={() => openNewOrder(null)}><Plus size={17} /> New order</button>
              )}
            </div>
          </section>
          {content}
          <footer className="page-footer">
            <span>© {new Date().getFullYear()} {BUSINESS_INFO.name}</span>
            <span><i className="online-dot" /> Connected</span>
            <button onClick={() => setModal("help")}>Help &amp; support <ArrowRight size={13} /></button>
          </footer>
        </div>
      </main>
      {modal && <Modal type={modal} session={session} onClose={() => setModal("")} onLogout={onLogout} />}
    </div>
  );
}

// Categories (and their optional dimension fields) come from the API; see Settings → Inventory categories.
const findCategory = (categories, name) => categories.find((category) => category.name === name);

function dimensionText(item, categories) {
  const fields = findCategory(categories, item.category)?.dimensions || [];
  return fields
    .filter((field) => item.dimensions?.[field.key] !== undefined)
    .map((field) => `${field.label} ${Number(item.dimensions[field.key]).toLocaleString("en-US")}${field.unit ? ` ${field.unit}` : ""}`)
    .join(" · ");
}

function cleanDimensions(values, fields) {
  return Object.fromEntries(fields.filter((field) => values?.[field.key] !== undefined && values[field.key] !== "").map((field) => [field.key, Number(values[field.key])]));
}

function DimensionInputs({ fields, values, onChange, idPrefix }) {
  if (!fields?.length) return null;
  return (
    <div className="inv-dims">
      <span className="inv-dims-label">Dimensions <em>optional</em></span>
      {fields.map((field) => (
        <label key={field.key} className="inv-dim">
          <span>{field.label}</span>
          <span className="inv-dim-input">
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={values?.[field.key] ?? ""}
              onChange={(event) => onChange({ ...values, [field.key]: event.target.value })}
              aria-label={`${idPrefix} ${field.label}${field.unit ? ` in ${field.unit}` : ""}`}
            />
            {field.unit && <i>{field.unit}</i>}
          </span>
        </label>
      ))}
    </div>
  );
}


const categoryIcons = {
  Tents: Tent,
  Chairs: Armchair,
  Tables: PanelTop,
  "Seat covers": Shirt,
  Lighting: Lightbulb,
  Carpets: RectangleHorizontal,
  "Sound (PA & mics)": Speaker,
  "Screens & cameras": Monitor,
  "Light boxes": Lamp,
  Utensils: CookingPot,
  Décor: Sparkles,
  Other: Package,
};

const formatShillings = (value) => `TSh ${Number(value || 0).toLocaleString("en-US")}`;

const blankInventoryRow = () => ({ key: `${Date.now()}-${Math.random()}`, name: "", category: "", rate: "", quantity: "", sku: "", dimensions: {} });

function validateInventoryRow(row) {
  const errors = {};
  if (row.name.trim().length < 2) errors.name = "Enter a name";
  if (!row.category) errors.category = "Choose one";
  if (row.rate === "" || !Number.isInteger(Number(row.rate)) || Number(row.rate) < 0) errors.rate = "Whole TSh";
  if (row.quantity === "" || !Number.isInteger(Number(row.quantity)) || Number(row.quantity) < 0) errors.quantity = "Whole number";
  if (row.sku && !/^[A-Za-z0-9-]{2,20}$/.test(row.sku.trim())) errors.sku = "Letters, numbers, -";
  if (Object.values(row.dimensions || {}).some((value) => value !== "" && !(Number(value) >= 0))) errors.dimensions = "Dimensions must be positive numbers";
  return errors;
}

function InventoryAddModal({ onClose, onSave, categories }) {
  const [rows, setRows] = useState([blankInventoryRow()]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [serverRows, setServerRows] = useState([]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && !saving && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const rowErrors = rows.map((row, index) => ({ ...validateInventoryRow(row), ...(serverRows[index] || {}) }));
  const filledRows = rows.filter((row) => row.name || row.category || row.rate || row.quantity);
  const totalUnits = rows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);

  const updateRow = (key, field, value) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
    setServerRows([]);
  };
  const addRow = (copyFrom) => setRows((current) => [...current, { ...blankInventoryRow(), category: copyFrom?.category || "" }]);

  async function save(event) {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    const toSave = rows.filter((row) => row.name || row.category || row.rate || row.quantity);
    if (toSave.length === 0) {
      setError("Fill in at least one item.");
      return;
    }
    if (toSave.some((row) => Object.keys(validateInventoryRow(row)).length)) {
      setRows(toSave.length ? toSave : rows);
      setError("Some rows need fixing — check the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      await onSave(toSave.map((row) => ({
        name: row.name.trim(),
        category: row.category,
        rate: Number(row.rate),
        quantity: Number(row.quantity),
        ...(row.sku.trim() ? { sku: row.sku.trim() } : {}),
        dimensions: cleanDimensions(row.dimensions, findCategory(categories, row.category)?.dimensions || []),
      })));
    } catch (saveError) {
      setRows(toSave);
      if (saveError.rows) setServerRows(saveError.rows);
      setError(saveError.message);
      setSaving(false);
    }
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="modal inv-modal" role="dialog" aria-modal="true" aria-labelledby="inv-add-title">
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">INVENTORY</span>
            <h2 id="inv-add-title">Add items</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close" disabled={saving}><X size={19} /></button>
        </div>
        <form className="inv-add-form" onSubmit={save} noValidate>
          <p className="inv-add-intro">Add one or many items at once. Leave SKU empty to create one automatically.</p>
          <div className="inv-add-head" aria-hidden="true">
            <span>Category</span><span>Item name</span><span>Daily rate (TSh)</span><span>Quantity</span><span>SKU</span><span />
          </div>
          <div className="inv-add-rows">
            {rows.map((row, index) => {
              const errors = submitted ? rowErrors[index] : {};
              const Icon = categoryIcons[row.category] || Package;
              return (
                <div className="inv-add-row" key={row.key}>
                  <select
                    className="inv-cell"
                    value={row.category}
                    onChange={(event) => setRows((current) => current.map((entry) => (entry.key === row.key ? { ...entry, category: event.target.value, dimensions: {} } : entry)))}
                    aria-label={`Item ${index + 1} category`}
                    autoFocus={index === rows.length - 1}
                    aria-invalid={Boolean(errors.category)}
                  >
                    <option value="" disabled>Category</option>
                    {categories.map((category) => <option key={category.id}>{category.name}</option>)}
                  </select>
                  <label className="inv-cell inv-name">
                    <span className="inv-row-icon"><Icon size={15} /></span>
                    <input
                      placeholder={`Item ${index + 1}, e.g. Wedding tent 10×20`}
                      value={row.name}
                      onChange={(event) => updateRow(row.key, "name", event.target.value)}
                      aria-label={`Item ${index + 1} name`}
                      aria-invalid={Boolean(errors.name)}
                      maxLength={60}
                    />
                  </label>
                  <input
                    className="inv-cell"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="0"
                    value={row.rate}
                    onChange={(event) => updateRow(row.key, "rate", event.target.value)}
                    aria-label={`Item ${index + 1} daily rate in TSh`}
                    aria-invalid={Boolean(errors.rate)}
                  />
                  <input
                    className="inv-cell"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="0"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.key, "quantity", event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && index === rows.length - 1) {
                        event.preventDefault();
                        addRow(row);
                      }
                    }}
                    aria-label={`Item ${index + 1} quantity`}
                    aria-invalid={Boolean(errors.quantity)}
                  />
                  <input
                    className="inv-cell"
                    placeholder="Auto"
                    value={row.sku}
                    onChange={(event) => updateRow(row.key, "sku", event.target.value.toUpperCase())}
                    aria-label={`Item ${index + 1} SKU`}
                    aria-invalid={Boolean(errors.sku)}
                    maxLength={20}
                  />
                  <button
                    type="button"
                    className="inv-row-remove"
                    onClick={() => setRows((current) => (current.length === 1 ? [blankInventoryRow()] : current.filter((item) => item.key !== row.key)))}
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <X size={14} />
                  </button>
                  <DimensionInputs
                    fields={findCategory(categories, row.category)?.dimensions}
                    values={row.dimensions}
                    onChange={(dimensions) => updateRow(row.key, "dimensions", dimensions)}
                    idPrefix={`Item ${index + 1}`}
                  />
                  {submitted && Object.keys(errors).length > 0 && (
                    <small className="inv-row-error"><CircleAlert size={11} /> {Object.values(errors).join(" · ")}</small>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" className="inv-add-another" onClick={() => addRow(rows[rows.length - 1])} disabled={rows.length >= 50}>
            <Plus size={14} /> Add another item
          </button>
          {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
          <div className="modal-actions inv-add-actions">
            <span className="inv-add-total">{filledRows.length} item{filledRows.length === 1 ? "" : "s"} · {totalUnits.toLocaleString("en-US")} units</span>
            <button type="button" className="button button-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? <><LoaderCircle size={15} className="auth-spin" /> Saving…</> : <><Save size={15} /> Save {filledRows.length > 1 ? `${filledRows.length} items` : "item"}</>}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

function InventoryEditModal({ item, onClose, onSave, categories }) {
  const [form, setForm] = useState({
    name: item.name, category: item.category, rate: String(item.rate), quantity: String(item.quantity), sku: item.sku, status: item.status,
    dimensions: Object.fromEntries(Object.entries(item.dimensions || {}).map(([key, value]) => [key, String(value)])),
  });
  const dimensionFields = findCategory(categories, form.category)?.dimensions || [];
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const errors = validateInventoryRow(form);
  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: field === "sku" ? event.target.value.toUpperCase() : event.target.value })),
    "aria-invalid": Boolean(submitted && errors[field]),
  });

  async function save(event) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    setSaving(true);
    setError("");
    try {
      await onSave({ name: form.name.trim(), category: form.category, rate: Number(form.rate), quantity: Number(form.quantity), sku: form.sku.trim(), status: form.status, dimensions: cleanDimensions(form.dimensions, dimensionFields) });
    } catch (saveError) {
      setError(saveError.message);
      setSaving(false);
    }
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="modal team-modal" role="dialog" aria-modal="true" aria-labelledby="inv-edit-title">
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">EDIT ITEM · {item.sku}</span>
            <h2 id="inv-edit-title">{item.name}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </div>
        <form className="team-form" onSubmit={save} noValidate>
          <div className="set-grid">
            <label className="set-field set-span-2"><span>Item name</span><input {...bind("name")} maxLength={60} /></label>
            <label className="set-field">
              <span>Category</span>
              <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value, dimensions: {} }))}>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</select>
            </label>
            <label className="set-field"><span>SKU</span><input {...bind("sku")} maxLength={20} /></label>
            <label className="set-field"><span>Daily rate (TSh)</span><input type="number" min="0" {...bind("rate")} /></label>
            <label className="set-field"><span>Quantity</span><input type="number" min="0" {...bind("quantity")} /></label>
            <label className="set-field set-span-2">
              <span>Status</span>
              <select {...bind("status")}><option>Available</option><option>Maintenance</option></select>
            </label>
          </div>
          <DimensionInputs fields={dimensionFields} values={form.dimensions} onChange={(dimensions) => setForm((current) => ({ ...current, dimensions }))} idPrefix="Item" />
          {submitted && Object.keys(errors).length > 0 && <p className="inv-form-error"><CircleAlert size={14} /> {Object.values(errors).join(" · ")}</p>}
          {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? <><LoaderCircle size={15} className="auth-spin" /> Saving…</> : <><Save size={15} /> Save changes</>}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

// "Are you sure?" dialog. `ask({ title, message, confirmLabel, danger })` resolves true or false.
function ConfirmDialog({ title, message, confirmLabel = "Yes, continue", danger = false, onCancel, onConfirm }) {
  const confirmRef = useRef(null);
  useEffect(() => {
    confirmRef.current?.focus();
    // Capture Escape here so it doesn't also close a form underneath.
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      onCancel();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onCancel]);
  return createPortal(
    <div className="modal-backdrop confirm-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="modal inv-confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <div className="inv-confirm-body">
          <span className={`inv-confirm-icon ${danger ? "" : "info"}`}>{danger ? <CircleAlert size={22} /> : <CircleHelp size={22} />}</span>
          <h2 id="confirm-title">{title}</h2>
          {message && <p id="confirm-message">{message}</p>}
        </div>
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>No, go back</button>
          <button type="button" ref={confirmRef} className={`button button-primary ${danger ? "inv-danger" : ""}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function useConfirm() {
  const [request, setRequest] = useState(null);
  const ask = useCallback((options) => new Promise((resolve) => setRequest({ ...options, resolve })), []);
  const answer = useCallback((value) => setRequest((current) => {
    current?.resolve(value);
    return null;
  }), []);
  const cancel = useCallback(() => answer(false), [answer]);
  const dialog = request ? <ConfirmDialog {...request} onCancel={cancel} onConfirm={() => answer(true)} /> : null;
  return [ask, dialog];
}

function InventoryConfirmDelete({ item, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <section className="modal inv-confirm" role="alertdialog" aria-modal="true" aria-labelledby="inv-del-title">
        <div className="inv-confirm-body">
          <span className="inv-confirm-icon"><CircleAlert size={22} /></span>
          <h2 id="inv-del-title">Delete {item.name}?</h2>
          <p>This removes {item.quantity.toLocaleString("en-US")} unit{item.quantity === 1 ? "" : "s"} ({item.sku}) from inventory. This can’t be undone.</p>
          {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
        </div>
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            type="button"
            className="button button-primary inv-danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } catch (deleteError) {
                setError(deleteError.message);
                setBusy(false);
              }
            }}
          >
            {busy ? <><LoaderCircle size={15} className="auth-spin" /> Deleting…</> : "Delete item"}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function InventoryManager({ session, query, items, setItems, categories = [], status, reload, addOpen, setAddOpen, onUnauthorized, canEdit = true }) {
  const [statusFilter, setStatusFilter] = useState("All items");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [search, setSearch] = useState("");
  const added = useDateRange();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  async function call(path, options) {
    try {
      return await api(path, { ...options, token: session.token });
    } catch (error) {
      if (error.status === 401) onUnauthorized();
      throw error;
    }
  }

  const words = `${query} ${search}`.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Every filter except status; the status tabs count within this set.
  const scoped = items.filter((item) => {
    const text = `${item.name} ${item.sku} ${item.category}`.toLowerCase();
    return words.every((word) => text.includes(word))
      && (categoryFilter === "All categories" || item.category === categoryFilter)
      && added.matches(item.createdAt);
  });
  const visible = scoped
    .filter((item) => statusFilter === "All items" || item.status === statusFilter)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const totalUnits = visible.reduce((sum, item) => sum + item.quantity, 0);
  const dailyValue = visible.filter((item) => item.status === "Available").reduce((sum, item) => sum + item.rate * item.quantity, 0);
  const maintenance = visible.filter((item) => item.status === "Maintenance").length;
  const usedCategories = categories.filter((category) => visible.some((item) => item.category === category.name));
  const filtersActive = search || statusFilter !== "All items" || categoryFilter !== "All categories" || added.active;
  const clearFilters = () => { setSearch(""); setStatusFilter("All items"); setCategoryFilter("All categories"); added.reset(); };
  const filteredNote = filtersActive ? "matching filters" : null;

  return (
    <>
      <section className="inv-stats">
        {[
          [Package, "Products", visible.length.toLocaleString("en-US"), `${usedCategories.length} categor${usedCategories.length === 1 ? "y" : "ies"}${filteredNote ? ` · ${filteredNote}` : ""}`, "blue"],
          [Layers, "Total units", totalUnits.toLocaleString("en-US"), filteredNote || "in stock", "mint"],
          [Banknote, "Rental value / day", formatShillings(dailyValue), "if all available units rent", "purple"],
          [Wrench, "In maintenance", maintenance.toLocaleString("en-US"), maintenance ? "not rentable now" : "all good", "orange"],
        ].map(([Icon, label, value, hint, tone]) => (
          <article key={label} className="inv-stat">
            <span className={`inv-stat-icon ${tone}`}><Icon size={18} /></span>
            <div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div>
          </article>
        ))}
      </section>

      <section className="panel inv-panel">
        <div className="inv-toolbar">
          <div className="inv-tabs" role="tablist" aria-label="Filter by status">
            {["All items", "Available", "Maintenance"].map((option) => (
              <button
                key={option}
                role="tab"
                aria-selected={statusFilter === option}
                className={statusFilter === option ? "active" : ""}
                onClick={() => setStatusFilter(option)}
              >
                {option}
                <span>{option === "All items" ? scoped.length : scoped.filter((item) => item.status === option).length}</span>
              </button>
            ))}
          </div>
          <div className="inv-toolbar-actions">
            <label className="inv-search">
              <Search size={15} />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or SKU" aria-label="Search inventory" />
            </label>
            <select className="inv-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
              {["All categories", ...categories.map((category) => category.name)].map((option) => <option key={option}>{option}</option>)}
            </select>
            <DateRangeFilter range={added} label="Added" />
            <ClearFiltersButton active={Boolean(filtersActive)} onClear={clearFilters} />
          </div>
        </div>

        {status === "loading" ? (
          <div className="inv-empty"><LoaderCircle size={22} className="auth-spin" /><strong>Loading inventory…</strong></div>
        ) : status === "error" ? (
          <div className="inv-empty"><CircleAlert size={22} /><strong>Couldn’t load inventory.</strong><button className="button button-secondary" onClick={reload}><RotateCcw size={14} /> Try again</button></div>
        ) : items.length === 0 ? (
          <div className="inv-empty">
            <span className="inv-empty-icon"><Package size={26} /></span>
            <strong>No items yet</strong>
            <small>Add your tents, chairs, tables and other equipment to start tracking stock.</small>
            {canEdit && <button className="button button-primary inv-add-button" onClick={() => setAddOpen(true)}><Plus size={16} /> Add your first items</button>}
          </div>
        ) : (
          <>
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "ITEM",
                  render: (row) => {
                    const Icon = categoryIcons[row.category] || Package;
                    return (
                      <div className="inv-item-cell">
                        <span className="inv-item-icon"><Icon size={18} /></span>
                        <span><strong>{row.name}</strong><small>{row.sku}</small>{dimensionText(row, categories) && <em className="inv-dims-text">{dimensionText(row, categories)}</em>}</span>
                      </div>
                    );
                  },
                },
                { key: "category", label: "CATEGORY", render: (row) => <span className="inv-category">{row.category}</span> },
                { key: "rate", label: "DAILY RATE", render: (row) => <span className="inv-rate"><strong>{formatShillings(row.rate)}</strong> / day</span> },
                { key: "quantity", label: "QUANTITY", render: (row) => <span className="inv-qty">{row.quantity.toLocaleString("en-US")} <small>units</small></span> },
                { key: "status", label: "STATUS", render: (row) => <span className={`status-pill ${row.status === "Available" ? "green" : "amber"}`}><i />{row.status}</span> },
                { key: "createdAt", label: "ADDED", render: (row) => <span className="inv-updated">{new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> },
              ]}
              rows={visible}
              itemLabel="items"
              totalCount={items.length}
              rowKey="id"
              renderActions={(row) => (!canEdit ? [{ label: "View only", onClick: () => {} }] : [
                { label: "Edit item", onClick: () => setEditing(row) },
                {
                  label: row.status === "Available" ? "Mark as maintenance" : "Mark as available",
                  confirm: row.status === "Available"
                    ? { title: `Send ${row.name} to maintenance?`, message: "It won’t be available to rent until you mark it available again.", confirmLabel: "Yes, mark maintenance" }
                    : { title: `Mark ${row.name} as available?`, message: "It will be available to rent on new orders.", confirmLabel: "Yes, mark available" },
                  onClick: async () => {
                    try {
                      const next = row.status === "Available" ? "Maintenance" : "Available";
                      const { item } = await call(`/inventory/${row.id}`, { method: "PATCH", body: { status: next } });
                      setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
                      setToast(`${item.name} marked ${next.toLowerCase()}`);
                    } catch (error) {
                      setToast(error.message);
                    }
                  },
                },
                { label: "Delete item", danger: true, onClick: () => setDeleting(row) },
              ])}
            />
          </>
        )}
      </section>

      {addOpen && (
        <InventoryAddModal
          categories={categories}
          onClose={() => setAddOpen(false)}
          onSave={async (newItems) => {
            const { items: created } = await call("/inventory", { method: "POST", body: { items: newItems } });
            setItems((current) => [...created, ...current]);
            setAddOpen(false);
            setToast(`${created.length} item${created.length === 1 ? "" : "s"} added to inventory`);
          }}
        />
      )}
      {editing && (
        <InventoryEditModal
          item={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={async (changes) => {
            const { item } = await call(`/inventory/${editing.id}`, { method: "PATCH", body: changes });
            setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
            setEditing(null);
            setToast(`${item.name} updated`);
          }}
        />
      )}
      {deleting && (
        <InventoryConfirmDelete
          item={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await call(`/inventory/${deleting.id}`, { method: "DELETE" });
            setItems((current) => current.filter((entry) => entry.id !== deleting.id));
            setToast(`${deleting.name} deleted`);
            setDeleting(null);
          }}
        />
      )}
      {toast && <div className="set-toast" role="status"><Check size={15} /> {toast}</div>}
    </>
  );
}

// ===== Workspace data layer =====
const ApiContext = createContext(null);
const useApi = () => useContext(ApiContext);

// Loads `path` from the API; returns { data, status, error, reload, setData }.
function useResource(path) {
  const { call } = useApi();
  const [state, setState] = useState({ data: null, status: "loading", error: "" });
  const load = useCallback(() => {
    if (!path) return Promise.resolve();
    setState((current) => ({ ...current, status: current.data ? "refreshing" : "loading", error: "" }));
    return call(path)
      .then((data) => setState({ data, status: "ready", error: "" }))
      .catch((error) => setState((current) => ({ ...current, status: "error", error: error.message })));
  }, [call, path]);
  useEffect(() => {
    load();
  }, [load]);
  const setData = useCallback((update) => setState((current) => ({ ...current, data: typeof update === "function" ? update(current.data) : update })), []);
  return { ...state, reload: load, setData };
}

const MANAGER_ROLES = ["Admin", "Store manager"];
const isManager = (session) => MANAGER_ROLES.includes(session?.staffRole);
const ORDER_STATUSES = ["New request", "Confirmed", "Ready for pickup", "Out for delivery", "Completed", "Cancelled"];
const orderTone = (status) => ({ "New request": "blue", Confirmed: "green", "Ready for pickup": "amber", "Out for delivery": "blue", Completed: "green", Cancelled: "red" }[status] || "blue");
const invoiceTone = (status) => ({ Paid: "green", "Partially paid": "amber", Unpaid: "blue", Overdue: "red", Cancelled: "red" }[status] || "blue");
// Payment methods are edited in Settings → Payments & receipts.
const PAYMENT_METHOD_TYPES = [["mobile", "Mobile money"], ["bank", "Bank"], ["cash", "Cash"], ["card", "Card"], ["other", "Other"]];
const enabledMethods = (settings) => (settings?.paymentMethods || []).filter((method) => method.enabled);
// How a customer pays with this method, e.g. "Lipa Namba 5566778 · Pendo Rentals".
function paymentMethodDetail(method) {
  const owner = method.accountName ? ` · ${method.accountName}` : "";
  if (method.type === "mobile") {
    const payTo = method.payTo || "lipa";
    const parts = [
      payTo !== "phone" && method.number ? `Lipa Namba ${method.number}` : "",
      payTo !== "lipa" && method.phone ? `Send to ${method.phone}` : "",
    ].filter(Boolean);
    return parts.length ? `${parts.join(" or ")}${owner}` : "Ask us for the number";
  }
  if (method.type === "bank") return `${method.provider ? `${method.provider} · ` : ""}${method.number ? `Acc ${method.number}` : "ask us for the account"}${owner}`;
  if (method.number) return `${method.number}${owner}`;
  return method.type === "other" ? "Ask us for details" : "At our office";
}
const shortDate = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const orderItemsText = (items) => items.map((item) => `${item.custom || itemLabel(item.name)} ×${item.quantity}`).join(", ");
const orderDates = (order) => {
  const start = new Date(`${order.eventDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + order.days - 1);
  const fmt = (date) => date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return order.days > 1 ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)}, ${start.getFullYear()}`;
};

function StatusPill({ tone, children }) {
  return <span className={`status-pill ${tone}`}><i />{children}</span>;
}

function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onDone, 3200);
    return () => clearTimeout(timer);
  }, [message, onDone]);
  return message ? <div className="set-toast" role="status"><Check size={15} /> {message}</div> : null;
}

function useToast() {
  const [message, setMessage] = useState("");
  const clear = useCallback(() => setMessage(""), []);
  return [message ? <Toast message={message} onDone={clear} /> : null, setMessage];
}

function LoadState({ status, error, onRetry, empty, emptyIcon: EmptyIcon = Package, emptyText, action }) {
  if (status === "loading") return <div className="inv-empty"><LoaderCircle size={22} className="auth-spin" /><strong>Loading…</strong></div>;
  if (status === "error") return <div className="inv-empty"><CircleAlert size={22} /><strong>{error || "Couldn’t load this."}</strong><button className="button button-secondary" onClick={onRetry}><RotateCcw size={14} /> Try again</button></div>;
  if (empty) {
    return (
      <div className="inv-empty">
        <span className="inv-empty-icon"><EmptyIcon size={26} /></span>
        <strong>{empty}</strong>
        {emptyText && <small>{emptyText}</small>}
        {action}
      </div>
    );
  }
  return null;
}

function ExportMenu({ title, columns, rows, disabled }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => !event.target.closest(".ws-export") && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  async function run(format) {
    setBusy(format);
    try {
      await downloadTableReport(title, columns, rows, format, { subtitle: `${rows.length} rows · Generated ${new Date().toLocaleString("en-US")}` });
      setOpen(false);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="ws-export report-export-wrap">
      <button className="button button-secondary" onClick={() => setOpen((value) => !value)} disabled={disabled || rows.length === 0} aria-expanded={open}>
        <Download size={15} /> Export
      </button>
      {open && (
        <div className="report-export-menu" role="menu">
          <button role="menuitem" onClick={() => run("excel")} disabled={Boolean(busy)}>
            <FileSpreadsheet size={16} /><span><strong>{busy === "excel" ? "Preparing…" : "Excel workbook"}</strong><small>.xlsx · {rows.length} rows</small></span>
          </button>
          <button role="menuitem" onClick={() => run("pdf")} disabled={Boolean(busy)}>
            <FileText size={16} /><span><strong>{busy === "pdf" ? "Preparing…" : "PDF document"}</strong><small>Print-ready</small></span>
          </button>
        </div>
      )}
    </div>
  );
}

function WsModal({ title, kicker, onClose, wide, busy, className = "", children }) {
  const backdropRef = useRef(null);
  useEffect(() => {
    // With modals stacked (e.g. Edit over a profile), Escape closes only the top one.
    const isTop = () => {
      const open = document.querySelectorAll(".modal-backdrop");
      return open[open.length - 1] === backdropRef.current;
    };
    const onKey = (event) => event.key === "Escape" && !busy && isTop() && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);
  return createPortal(
    <div className="modal-backdrop" ref={backdropRef} onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <section className={`modal team-modal ws-modal ${wide ? "ws-modal-wide" : ""} ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading">
          <div>
            {kicker && <span className="modal-kicker">{kicker}</span>}
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close" disabled={busy}><X size={19} /></button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
}

function FieldError({ message }) {
  return message ? <small className="set-error"><CircleAlert size={12} /> {message}</small> : null;
}

function TempPasswordNote({ phone, password }) {
  if (!password) return null;
  return (
    <div className="rent-sms-card login ws-temp-password">
      <span><KeyRound size={16} /></span>
      <div>
        <strong>SMS not sent — share these login details</strong>
        <div className="rent-credentials"><span>Username <b>{phone}</b></span><span>Password <b>{password}</b></span></div>
      </div>
    </div>
  );
}

// ===== Record payment =====
function PaymentModal({ order, invoice, settings, onClose, onSaved }) {
  const { call } = useApi();
  const methods = enabledMethods(settings).map((method) => method.name);
  const balance = invoice ? invoice.balance : order?.balance;
  const [form, setForm] = useState({ amount: balance ? String(balance) : "", method: methods[0] || "Cash", reference: "", paidOn: localTodayIso(), notify: true });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const tithePercent = settings?.titheEnabled ? Number(settings.tithePercent) || 0 : 0;
  const tithe = Math.round(((Number(form.amount) || 0) * tithePercent) / 100);
  const givingPercent = settings?.givingEnabled ? Number(settings.givingPercent) || 0 : 0;
  const giving = Math.round(((Number(form.amount) || 0) * givingPercent) / 100);
  const label = invoice ? `${invoice.code} · ${invoice.customer}` : `${order.id} · ${order.customer.name}`;
  const [ask, confirmDialog] = useConfirm();

  async function save(event) {
    event.preventDefault();
    const next = {};
    if (!(Number(form.amount) >= 1) || !Number.isInteger(Number(form.amount))) next.amount = "Enter the amount received (whole TSh).";
    if (form.paidOn > localTodayIso()) next.paidOn = "Not in the future.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const ok = await ask({
      title: `Record ${formatShillings(Number(form.amount))}?`,
      message: `${form.method} payment for ${label} on ${shortDate(form.paidOn)}.${tithe ? ` Tithe set aside: ${formatShillings(tithe)}.` : ""}${giving ? ` Giving set aside: ${formatShillings(giving)}.` : ""} A receipt will be issued.`,
      confirmLabel: "Yes, record payment",
    });
    if (!ok) return;
    setBusy(true);
    setError("");
    try {
      const data = await call("/payments", {
        method: "POST",
        body: {
          ...(invoice ? { invoiceId: invoice.id } : { orderCode: order.id }),
          amount: Number(form.amount),
          method: form.method,
          reference: form.reference,
          paidOn: form.paidOn,
          notifyCustomer: form.notify,
        },
      });
      onSaved(data);
    } catch (saveError) {
      setErrors(saveError.fields || {});
      setError(saveError.message);
      setBusy(false);
    }
  }

  return (
    <WsModal title="Record payment" kicker={label} onClose={onClose} busy={busy}>
      <form className="team-form" onSubmit={save} noValidate>
        {balance !== null && balance !== undefined && (
          <div className="ws-balance"><span>Balance due</span><strong>{formatShillings(balance)}</strong></div>
        )}
        <div className="set-grid">
          <label className="set-field"><span>Amount received (TSh)</span><input type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} aria-invalid={Boolean(errors.amount)} autoFocus /><FieldError message={errors.amount} /></label>
          <label className="set-field"><span>Method</span><select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>{methods.map((method) => <option key={method}>{method}</option>)}</select></label>
          <label className="set-field"><span>Transaction ref. <em>Optional</em></span><input value={form.reference} maxLength={40} placeholder="e.g. M-Pesa code" onChange={(event) => setForm({ ...form, reference: event.target.value.toUpperCase() })} /></label>
          <label className="set-field"><span>Date received</span><input type="date" max={localTodayIso()} value={form.paidOn} onChange={(event) => setForm({ ...form, paidOn: event.target.value })} aria-invalid={Boolean(errors.paidOn)} /><FieldError message={errors.paidOn} /></label>
        </div>
        {tithePercent > 0 && (
          <p className="team-form-note"><Info size={13} /> Tithe ({tithePercent}%) set aside from this payment: <strong>&nbsp;{formatShillings(tithe)}</strong></p>
        )}
        {givingPercent > 0 && (
          <p className="team-form-note"><Info size={13} /> Giving ({givingPercent}%) set aside from this payment: <strong>&nbsp;{formatShillings(giving)}</strong></p>
        )}
        <label className="auth-check ws-check"><input type="checkbox" checked={form.notify} onChange={(event) => setForm({ ...form, notify: event.target.checked })} /><span>Send the customer an SMS receipt</span></label>
        {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? <><LoaderCircle size={15} className="auth-spin" /> Saving…</> : <><Banknote size={15} /> Record payment</>}</button>
        </div>
      </form>
      {confirmDialog}
    </WsModal>
  );
}

// ===== Create / edit order =====
// An order must have a rate on every item before it can move past "New request".
const PRICED_STATUSES = ["Confirmed", "Ready for pickup", "Out for delivery", "Completed"];

function OrderEditor({ order, prefillCustomer, inventory, drivers, onClose, onSaved }) {
  const { call, session } = useApi();
  const creating = !order;
  const customers = useResource(creating && !prefillCustomer ? "/customers" : null);
  const [customerMode, setCustomerMode] = useState(prefillCustomer ? "existing" : "existing");
  const [form, setForm] = useState(() => ({
    customerId: prefillCustomer ? String(prefillCustomer.id) : "",
    newCustomer: { firstName: "", lastName: "", phone: "", area: "" },
    eventDate: order?.eventDate || "",
    days: String(order?.days || 1),
    area: order?.area || prefillCustomer?.area || "",
    place: order?.place || "",
    notes: order?.notes || "",
    items: order ? order.items.map((item) => ({ key: `i${item.id}`, inventoryItemId: item.inventoryItemId || "", isCustom: !item.inventoryItemId, name: item.name, custom: item.custom || "", quantity: String(item.quantity), rate: item.rate === null ? "" : String(item.rate) }))
      : [{ key: "i0", inventoryItemId: "", isCustom: false, name: "", custom: "", quantity: "1", rate: "" }],
    deliveryRequired: order?.deliveryRequired || false,
    deliveryFee: String(order?.deliveryFee || 0),
    deliveryStatus: order?.deliveryStatus || "Not needed",
    driverId: order?.driver?.id ? String(order.driver.id) : "",
    discount: String(order?.discount || 0),
    status: order?.status || "Confirmed",
    notify: true,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [ask, confirmDialog] = useConfirm();
  // Editing a field clears its error message.
  const clearError = (name) => setFieldErrors((current) => {
    if (!current[name]) return current;
    const next = { ...current };
    delete next[name];
    return next;
  });
  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    clearError(["customerId", "newCustomer"].includes(key) ? "customer" : key);
  };
  const setItem = (key, changes) => {
    setForm((current) => ({ ...current, items: current.items.map((item) => (item.key === key ? { ...item, ...changes } : item)) }));
    clearError(`item${form.items.findIndex((item) => item.key === key)}`);
    if ("rate" in changes || "inventoryItemId" in changes) clearError("status");
  };
  const days = Math.max(1, Number(form.days) || 1);
  const lines = form.items.map((item) => (item.rate === "" ? null : (Number(item.rate) || 0) * (Number(item.quantity) || 0) * days));
  const priced = lines.every((line) => line !== null) && form.items.length > 0;
  const subtotal = lines.reduce((sum, line) => sum + (line || 0), 0);
  const delivery = form.deliveryRequired ? Number(form.deliveryFee) || 0 : 0;
  const total = priced ? Math.max(0, subtotal + delivery - (Number(form.discount) || 0)) : null;
  const managerView = isManager(session);

  async function save(event) {
    event.preventDefault();
    setError("");
    const errors = {};
    if (creating && customerMode === "existing" && !form.customerId) errors.customer = "Choose a customer.";
    if (creating && customerMode === "new") {
      if (!form.newCustomer.firstName.trim() || !form.newCustomer.lastName.trim()) errors.customer = "Enter the customer’s first and last name.";
      else if (!isLocalMobile(form.newCustomer.phone)) errors.customer = "Enter the customer’s 9-digit phone number after +255.";
    }
    if (!form.eventDate) errors.eventDate = "Choose the event date.";
    form.items.forEach((item, index) => {
      if (!item.inventoryItemId && (!item.isCustom || (item.custom || item.name).trim().length < 2)) errors[`item${index}`] = "Choose an item or type a name.";
      else if (!(Number(item.quantity) >= 1)) errors[`item${index}`] = "Enter a quantity.";
    });
    if (!priced && PRICED_STATUSES.includes(form.status)) errors.status = "Set a rate for every item first, or keep the order as “New request”.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    const customerName = !creating ? order.customer.name
      : prefillCustomer ? prefillCustomer.name
        : customerMode === "existing" ? customerOptions.find((customer) => String(customer.id) === form.customerId)?.name
          : `${form.newCustomer.firstName.trim()} ${form.newCustomer.lastName.trim()}`;
    const ok = await ask({
      title: creating ? "Create this order?" : `Save changes to ${order.id}?`,
      message: `${customerName} · ${shortDate(form.eventDate)} · ${form.items.length} item${form.items.length === 1 ? "" : "s"} · ${total === null ? "price to be set" : formatShillings(total)} · ${form.status}${form.notify ? ". The customer will get an SMS." : "."}`,
      confirmLabel: creating ? "Yes, create order" : "Yes, save order",
    });
    if (!ok) return;
    const body = {
      eventDate: form.eventDate,
      days,
      area: form.area,
      place: form.place,
      notes: form.notes,
      items: form.items.map((item) => ({
        ...(item.inventoryItemId ? { inventoryItemId: item.inventoryItemId } : { name: item.name.trim(), ...(item.custom ? { custom: item.custom } : {}) }),
        quantity: Number(item.quantity),
        rate: item.rate === "" ? null : Number(item.rate),
      })),
      deliveryRequired: form.deliveryRequired,
      deliveryFee: form.deliveryRequired ? Number(form.deliveryFee) || 0 : 0,
      deliveryStatus: form.deliveryRequired ? (form.deliveryStatus === "Not needed" ? "Scheduled" : form.deliveryStatus) : "Not needed",
      driverId: form.deliveryRequired && form.driverId ? Number(form.driverId) : null,
      discount: Number(form.discount) || 0,
      status: form.status,
      notifyCustomer: form.notify,
    };
    if (creating) {
      if (customerMode === "existing") body.customerId = Number(form.customerId);
      else body.customer = { ...form.newCustomer, phone: withCountryCode(form.newCustomer.phone) };
    }
    setBusy(true);
    try {
      const data = creating
        ? await call("/orders", { method: "POST", body })
        : await call(`/orders/${order.id}`, { method: "PATCH", body });
      onSaved(data, creating);
    } catch (saveError) {
      setError(saveError.message);
      setBusy(false);
    }
  }

  const customerOptions = customers.data?.customers || [];

  return (
    <WsModal title={creating ? "New order" : `Order ${order.id}`} kicker={creating ? "ORDERS" : `${order.customer.name} · ${order.customer.phone}`} onClose={onClose} wide busy={busy} className="ws-order-modal">
      <form className="ws-order-form" onSubmit={save} noValidate>
        <div className="ws-order-main">
          {creating && (
            <section className="ws-order-card">
              <header className="ws-order-card-head">
                <h3><UserRound size={15} /> Customer</h3>
                {!prefillCustomer && (
                  <div className="inv-tabs ws-mini-tabs" role="tablist">
                    {[["existing", "Existing"], ["new", "New customer"]].map(([value, text]) => (
                      <button type="button" key={value} role="tab" aria-selected={customerMode === value} className={customerMode === value ? "active" : ""} onClick={() => { setCustomerMode(value); clearError("customer"); }}>{text}</button>
                    ))}
                  </div>
                )}
              </header>
              {prefillCustomer ? (
                <p className="ws-chosen"><UserRound size={14} /> {prefillCustomer.name} · {prefillCustomer.phone}</p>
              ) : customerMode === "existing" ? (
                <label className="set-field">
                  <span>Customer</span>
                  <select value={form.customerId} onChange={(event) => set("customerId", event.target.value)} aria-invalid={Boolean(fieldErrors.customer)}>
                    <option value="">{customers.status === "loading" ? "Loading customers…" : "Choose a customer"}</option>
                    {customerOptions.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}
                  </select>
                </label>
              ) : (
                <div className="ws-order-row ws-cols-4">
                  <label className="set-field"><span>First name</span><input className="caps-input" value={form.newCustomer.firstName} onChange={(event) => set("newCustomer", { ...form.newCustomer, firstName: event.target.value })} /></label>
                  <label className="set-field"><span>Last name</span><input className="caps-input" value={form.newCustomer.lastName} onChange={(event) => set("newCustomer", { ...form.newCustomer, lastName: event.target.value })} /></label>
                  <label className="set-field"><span>Phone</span><PhoneInput value={form.newCustomer.phone} onChange={(phone) => set("newCustomer", { ...form.newCustomer, phone })} label="Customer phone number" /></label>
                  <label className="set-field"><span>Area</span><select value={form.newCustomer.area} onChange={(event) => set("newCustomer", { ...form.newCustomer, area: event.target.value })}><option value="">Choose</option><AreaOptions current={form.newCustomer.area} /></select></label>
                </div>
              )}
              <FieldError message={fieldErrors.customer} />
            </section>
          )}

          <section className="ws-order-card">
            <header className="ws-order-card-head"><h3><CalendarDays size={15} /> Event</h3></header>
            <div className="ws-order-row ws-cols-event">
              <label className="set-field"><span>Event date</span><input type="date" value={form.eventDate} onChange={(event) => set("eventDate", event.target.value)} aria-invalid={Boolean(fieldErrors.eventDate)} /></label>
              <label className="set-field"><span>Days</span><input type="number" min="1" max="60" value={form.days} onChange={(event) => set("days", event.target.value)} /></label>
              <label className="set-field"><span>Area</span><select value={form.area} onChange={(event) => set("area", event.target.value)}><option value="">Choose</option><AreaOptions current={form.area} /></select></label>
              <label className="set-field"><span>Venue / landmark</span><input value={form.place} maxLength={80} placeholder="e.g. Kayenze Primary School" onChange={(event) => set("place", event.target.value)} /></label>
            </div>
            <FieldError message={fieldErrors.eventDate} />
          </section>

          <section className="ws-order-card">
            <header className="ws-order-card-head"><h3><Package size={15} /> Items <small>rate per unit per day</small></h3></header>
            <div className="ws-items">
              <div className="ws-items-head" aria-hidden="true"><span>Item</span><span>Qty</span><span>Rate / day</span><span>Line total</span><span /></div>
              {form.items.map((item, index) => (
                <div className="ws-item-row" key={item.key}>
                  <div className="ws-item-pick">
                    <select
                      value={item.inventoryItemId || (item.isCustom ? "__custom" : "")}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === "__custom") return setItem(item.key, { inventoryItemId: "", isCustom: true, name: item.inventoryItemId ? "" : item.name });
                        const stock = inventory.find((entry) => entry.id === value);
                        return setItem(item.key, stock ? { inventoryItemId: stock.id, isCustom: false, name: stock.name, custom: "", rate: String(stock.rate) } : { inventoryItemId: "", isCustom: false, name: "", custom: "" });
                      }}
                      aria-label={`Item ${index + 1}`}
                      aria-invalid={Boolean(fieldErrors[`item${index}`])}
                    >
                      <option value="">Choose from inventory…</option>
                      {inventory.map((stock) => <option key={stock.id} value={stock.id}>{stock.name} · {stock.sku}{stock.status === "Maintenance" ? " (maintenance)" : ""}</option>)}
                      <option value="__custom">Other / not in inventory…</option>
                    </select>
                    {item.isCustom && (
                      <input className="ws-item-name" placeholder="Item name, e.g. Flower arch" value={item.custom || item.name} maxLength={60} onChange={(event) => setItem(item.key, { name: event.target.value, custom: "" })} aria-label={`Item ${index + 1} name`} />
                    )}
                  </div>
                  <input type="number" min="1" value={item.quantity} onChange={(event) => setItem(item.key, { quantity: event.target.value })} aria-label={`Item ${index + 1} quantity`} />
                  <input type="number" min="0" placeholder="Not priced" value={item.rate} onChange={(event) => setItem(item.key, { rate: event.target.value })} aria-label={`Item ${index + 1} rate`} />
                  <span className={`ws-line-total ${lines[index] === null ? "muted" : ""}`}>{lines[index] === null ? "—" : formatShillings(lines[index])}</span>
                  <button type="button" className="inv-row-remove" disabled={form.items.length === 1} onClick={() => setForm((current) => ({ ...current, items: current.items.length > 1 ? current.items.filter((entry) => entry.key !== item.key) : current.items }))} aria-label={`Remove item ${index + 1}`}><Trash2 size={14} /></button>
                  <FieldError message={fieldErrors[`item${index}`]} />
                </div>
              ))}
            </div>
            <button type="button" className="inv-add-another" onClick={() => setForm((current) => ({ ...current, items: [...current.items, { key: `i${Date.now()}`, inventoryItemId: "", isCustom: false, name: "", custom: "", quantity: "1", rate: "" }] }))}><Plus size={14} /> Add item</button>
          </section>

          <label className="set-field ws-order-notes"><span>Notes <em>Optional</em></span><input value={form.notes} maxLength={500} placeholder="Setup time, colours, special requests…" onChange={(event) => set("notes", event.target.value)} /></label>
        </div>

        <aside className="ws-order-side">
          <label className="set-field">
            <span>Status</span>
            <select value={form.status} onChange={(event) => set("status", event.target.value)} disabled={!managerView} aria-invalid={Boolean(fieldErrors.status)}>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}{!priced && PRICED_STATUSES.includes(status) ? " — needs prices" : ""}</option>)}
            </select>
            {fieldErrors.status ? <FieldError message={fieldErrors.status} /> : !priced && PRICED_STATUSES.includes(form.status) && <small className="ws-price-hint"><CircleAlert size={12} /> Add a rate to every item to {form.status === "Confirmed" ? "confirm" : "process"} this order.</small>}
          </label>

          <div className="ws-side-block">
            <label className="ws-switch">
              <input type="checkbox" checked={form.deliveryRequired} onChange={(event) => set("deliveryRequired", event.target.checked)} />
              <span className="ws-switch-track" aria-hidden="true" />
              <span className="ws-switch-text"><Truck size={14} /> Deliver to the customer</span>
            </label>
            {form.deliveryRequired && (
              <div className="ws-order-row ws-cols-2">
                <label className="set-field"><span>Fee (TSh)</span><input type="number" min="0" value={form.deliveryFee} onChange={(event) => set("deliveryFee", event.target.value)} /></label>
                <label className="set-field"><span>Delivery status</span><select value={form.deliveryStatus === "Not needed" ? "Scheduled" : form.deliveryStatus} onChange={(event) => set("deliveryStatus", event.target.value)}>{["Scheduled", "In transit", "Delivered", "Failed"].map((status) => <option key={status}>{status}</option>)}</select></label>
                <label className="set-field ws-span-2"><span>Driver</span><select value={form.driverId} onChange={(event) => set("driverId", event.target.value)}><option value="">Unassigned</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}</select></label>
              </div>
            )}
          </div>

          <label className="set-field"><span>Discount (TSh)</span><input type="number" min="0" value={form.discount} onChange={(event) => set("discount", event.target.value)} /></label>

          <div className="ws-totals">
            <span>Items · {days} day{days === 1 ? "" : "s"}<b>{formatShillings(subtotal)}</b></span>
            {form.deliveryRequired && <span>Delivery<b>{formatShillings(delivery)}</b></span>}
            {Number(form.discount) > 0 && <span>Discount<b>− {formatShillings(form.discount)}</b></span>}
            <span className="ws-total">Total<b>{total === null ? "Set all rates" : formatShillings(total)}</b></span>
            {order && <span>Paid<b>{formatShillings(order.paid)}</b></span>}
          </div>

          <label className="auth-check ws-check"><input type="checkbox" checked={form.notify} onChange={(event) => set("notify", event.target.checked)} /><span>{creating ? "SMS the booking details to the customer" : "SMS the customer when the status changes"}</span></label>
          {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
          <div className="ws-side-actions">
            <button type="submit" className="button button-primary" disabled={busy}>{busy ? <><LoaderCircle size={15} className="auth-spin" /> Saving…</> : <><Save size={15} /> {creating ? "Create order" : "Save order"}</>}</button>
            <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          </div>
        </aside>
      </form>
      {confirmDialog}
    </WsModal>
  );
}

function OrdersPage({ query, startCreate, onCreateHandled, settings }) {
  const { call, session } = useApi();
  const orders = useResource("/orders");
  const inventory = useResource("/inventory");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const eventRange = useDateRange();
  const [editing, setEditing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [toast, setToast] = useToast();
  const managerView = isManager(session);

  useEffect(() => {
    if (startCreate) {
      setEditing(startCreate.customer ? { prefillCustomer: startCreate.customer } : "new");
      onCreateHandled();
    }
  }, [startCreate, onCreateHandled]);

  const list = orders.data?.orders || [];
  const words = `${query} ${search}`.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Search and date filters; the status tabs and cards count within this set.
  const scoped = list.filter((order) => eventRange.matches(order.eventDate)
    && words.every((word) => `${order.id} ${order.customer.name} ${order.customer.phone} ${orderItemsText(order.items)} ${order.area || ""}`.toLowerCase().includes(word)));
  const rows = scoped.filter((order) => status === "All" || order.status === status);
  // Tabs count within search + date; the cards also follow the selected status tab.
  const count = (value) => scoped.filter((order) => order.status === value).length;
  const shown = (value) => rows.filter((order) => order.status === value).length;
  const active = rows.filter((order) => ["Confirmed", "Ready for pickup", "Out for delivery"].includes(order.status));
  const outstanding = rows.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + (order.balance || 0), 0);
  const unpriced = rows.filter((order) => !order.priced && order.status !== "Cancelled").length;
  const ordersFiltered = Boolean(search) || status !== "All" || eventRange.active;
  const clearOrderFilters = () => { setSearch(""); setStatus("All"); eventRange.reset(); };

  function replaceOrder(updated) {
    orders.setData((current) => ({ ...current, orders: current.orders.some((entry) => entry.id === updated.id) ? current.orders.map((entry) => (entry.id === updated.id ? updated : entry)) : [updated, ...current.orders] }));
  }

  async function setOrderStatus(order, next) {
    try {
      const data = await call(`/orders/${order.id}`, { method: "PATCH", body: { status: next } });
      replaceOrder(data.order);
      setToast(`${order.id} marked ${next.toLowerCase()}${data.sms ? (data.sms.status === "sent" ? " · SMS sent" : " · SMS not sent") : ""}`);
    } catch (error) {
      setToast(error.message);
    }
  }

  async function createInvoice(order) {
    try {
      const data = await call("/invoices", { method: "POST", body: { orderCode: order.id } });
      orders.reload();
      setToast(`Invoice ${data.invoice.code} created for ${order.id}`);
    } catch (error) {
      setToast(error.message);
    }
  }

  const exportColumns = ["Order", "Customer", "Phone", "Items", "Event", "Days", "Area", "Total", "Paid", "Balance", "Status"];
  const exportRows = rows.map((order) => [order.id, order.customer.name, order.customer.phone, orderItemsText(order.items), order.eventDate, order.days, order.place ? `${order.place}, ${order.area}` : order.area || "", order.total === null ? "Quote pending" : formatShillings(order.total), formatShillings(order.paid), order.balance === null ? "" : formatShillings(order.balance), order.status]);

  return (
    <>
      <section className="inv-stats">
        {[
          [Sparkles, "New requests", shown("New request"), unpriced ? `${unpriced} need pricing` : "all priced", "blue"],
          [CalendarDays, "Active rentals", active.length, "confirmed to out for delivery", "mint"],
          [Banknote, "Outstanding", formatShillings(outstanding), "balance still to collect", "orange"],
          [PackageCheck, "Completed", shown("Completed"), `${rows.length} order${rows.length === 1 ? "" : "s"}${ordersFiltered ? " matching filters" : " in total"}`, "purple"],
        ].map(([Icon, label, value, hint, tone]) => (
          <article key={label} className="inv-stat"><span className={`inv-stat-icon ${tone}`}><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div></article>
        ))}
      </section>
      <section className="panel inv-panel">
        <div className="inv-toolbar">
          <div className="inv-tabs ws-scroll-tabs" role="tablist" aria-label="Filter by status">
            {["All", ...ORDER_STATUSES].map((option) => (
              <button key={option} role="tab" aria-selected={status === option} className={status === option ? "active" : ""} onClick={() => setStatus(option)}>
                {option}<span>{option === "All" ? scoped.length : count(option)}</span>
              </button>
            ))}
          </div>
          <div className="inv-toolbar-actions">
            <label className="inv-search"><Search size={15} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders" aria-label="Search orders" /></label>
            <DateRangeFilter range={eventRange} label="Event" />
            <ClearFiltersButton active={ordersFiltered} onClear={clearOrderFilters} />
            <ExportMenu title="Orders" columns={exportColumns} rows={exportRows} />
          </div>
        </div>
        <LoadState status={orders.status} error={orders.error} onRetry={orders.reload} empty={orders.status === "ready" && list.length === 0 ? "No orders yet" : ""} emptyIcon={CalendarDays} emptyText="Orders from Rent Now and orders your team creates appear here." action={managerView && <button className="button button-primary inv-add-button" onClick={() => setEditing("new")}><Plus size={16} /> Create the first order</button>} />
        {list.length > 0 && (
          <>
            <DataTable
              columns={[
                { key: "id", label: "ORDER", render: (row) => <div className="inv-item-cell"><span><strong>{row.id}</strong><small className="ws-source">{row.source === "rent_now" ? "Rent Now" : "Staff"}</small></span></div> },
                { key: "customer", label: "CUSTOMER", render: (row) => <div className="ws-two-line"><strong>{row.customer.name}</strong><small>{row.customer.phone}</small></div> },
                { key: "items", label: "ITEMS", render: (row) => <span className="ws-items-cell" title={orderItemsText(row.items)}>{orderItemsText(row.items)}</span> },
                { key: "eventDate", label: "EVENT", render: (row) => <div className="ws-two-line"><strong>{orderDates(row)}</strong><small>{row.place || row.area || "—"}</small></div> },
                { key: "total", label: "TOTAL", render: (row) => (row.total === null ? <span className="ws-quote">Quote pending</span> : <div className="ws-two-line"><strong>{formatShillings(row.total)}</strong><small>{row.balance ? `${formatShillings(row.balance)} due` : "Paid in full"}</small></div>) },
                { key: "status", label: "STATUS", render: (row) => <div className="ws-two-line"><StatusPill tone={orderTone(row.status)}>{row.status}</StatusPill>{row.deliveryRequired && <small>Delivery: {row.deliveryStatus}</small>}</div> },
              ]}
              rows={rows}
              itemLabel="orders"
              totalCount={list.length}
              rowKey="id"
              renderActions={(order) => {
                const actions = [{ label: managerView ? "View & edit" : "View order", onClick: () => setEditing(order) }];
                const nextStatus = { "New request": "Confirmed", Confirmed: "Ready for pickup", "Ready for pickup": "Out for delivery", "Out for delivery": "Completed" }[order.status];
                if (nextStatus && !order.priced) {
                  if (managerView) actions.push({ label: "Set prices to confirm", onClick: () => setEditing(order) });
                } else if (nextStatus && (managerView || ["Out for delivery", "Completed"].includes(nextStatus))) {
                  actions.push({
                    label: `Mark ${nextStatus.toLowerCase()}`,
                    confirm: { title: `Mark ${order.id} as ${nextStatus.toLowerCase()}?`, message: `${order.customer.name} · ${orderItemsText(order.items)}${nextStatus === "Confirmed" ? ` · ${formatShillings(order.total)}` : ""}. The customer may get an SMS about this change.`, confirmLabel: `Yes, mark ${nextStatus.toLowerCase()}` },
                    onClick: () => setOrderStatus(order, nextStatus),
                  });
                }
                if (managerView && order.status !== "Cancelled") {
                  if (!order.invoice && order.priced) actions.push({ label: "Create invoice", confirm: { title: `Create an invoice for ${order.id}?`, message: `${order.customer.name} will be invoiced ${formatShillings(order.total)}.`, confirmLabel: "Yes, create invoice" }, onClick: () => createInvoice(order) });
                  if (order.priced && order.balance > 0) actions.push({ label: "Record payment", onClick: () => setPaying(order) });
                  actions.push({ label: "Cancel order", danger: true, confirm: { title: `Cancel ${order.id}?`, message: `${order.customer.name}’s booking for ${orderDates(order)} will be cancelled.`, confirmLabel: "Yes, cancel order" }, onClick: () => setOrderStatus(order, "Cancelled") });
                }
                return actions;
              }}
            />
          </>
        )}
      </section>

      {editing && (
        <OrderEditor
          order={editing === "new" || editing?.prefillCustomer ? null : editing}
          prefillCustomer={editing?.prefillCustomer}
          inventory={inventory.data?.items || []}
          drivers={orders.data?.drivers || []}
          onClose={() => setEditing(null)}
          onSaved={(data, created) => {
            replaceOrder(data.order);
            setEditing(null);
            if (data.temporaryPassword) setCredentials({ phone: data.order.customer.phone, password: data.temporaryPassword });
            setToast(`${data.order.id} ${created ? "created" : "saved"}${data.sms ? (data.sms.status === "sent" ? " · SMS sent" : " · SMS not sent") : ""}`);
          }}
        />
      )}
      {paying && (
        <PaymentModal
          order={paying}
          settings={settings}
          onClose={() => setPaying(null)}
          onSaved={(data) => {
            setPaying(null);
            orders.reload();
            setReceipt(data.payment);
            setToast(`Payment ${data.payment.receipt} recorded`);
          }}
        />
      )}
      {credentials && (
        <WsModal title="Customer account created" kicker="LOGIN DETAILS" onClose={() => setCredentials(null)}>
          <div className="team-form"><TempPasswordNote phone={credentials.phone} password={credentials.password} /><div className="modal-actions"><button className="button button-primary" onClick={() => setCredentials(null)}>Done</button></div></div>
        </WsModal>
      )}
      {receipt && <ReceiptPreview payment={receipt} onClose={() => setReceipt(null)} />}
      {toast}
    </>
  );
}

// Tanzanian mobile numbers: the +255 prefix is fixed and staff type the 9 digits after it.
function phoneLocalPart(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("255") && digits.length > 9) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}
const isLocalMobile = (digits) => /^[67]\d{8}$/.test(digits);
const withCountryCode = (digits) => `+255${digits}`;

function PhoneInput({ value, onChange, invalid, autoFocus, label = "Phone number" }) {
  const shown = value.replace(/(\d{3})(?=\d)/g, "$1 ");
  return (
    <span className={`phone-affix ${invalid ? "invalid" : ""}`}>
      <b>+255</b>
      <input inputMode="tel" autoComplete="tel-national" placeholder="712 345 678" value={shown} onChange={(event) => onChange(phoneLocalPart(event.target.value))} aria-invalid={invalid} aria-label={label} autoFocus={autoFocus} />
    </span>
  );
}

// ===== Customers =====
function CustomerModal({ customer, onClose, onSaved }) {
  const { call } = useApi();
  const [form, setForm] = useState({
    firstName: customer?.firstName || "", lastName: customer?.lastName || "", phone: phoneLocalPart(customer?.phone),
    email: customer?.email || "", area: customer?.area || "", place: customer?.place || "", notes: customer?.notes || "", sendLogin: true,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const bind = (key) => ({ value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }), "aria-invalid": Boolean(errors[key]) });

  async function save(event) {
    event.preventDefault();
    if (!isLocalMobile(form.phone)) {
      setErrors({ ...errors, phone: "Enter the 9 digits after +255, e.g. 712 345 678." });
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = { ...form, phone: withCountryCode(form.phone) };
      const data = customer
        ? await call(`/customers/${customer.id}`, { method: "PATCH", body })
        : await call("/customers", { method: "POST", body });
      onSaved(data, !customer);
    } catch (saveError) {
      setErrors(saveError.fields || {});
      setError(saveError.message);
      setBusy(false);
    }
  }

  return (
    <WsModal title={customer ? `Edit ${customer.name}` : "Add customer"} kicker="CUSTOMERS" onClose={onClose} busy={busy}>
      <form className="team-form" onSubmit={save} noValidate>
        <div className="set-grid">
          <label className="set-field"><span>First name</span><input {...bind("firstName")} className="caps-input" autoFocus /><FieldError message={errors.firstName} /></label>
          <label className="set-field"><span>Last name</span><input {...bind("lastName")} className="caps-input" /><FieldError message={errors.lastName} /></label>
          <label className="set-field"><span>Phone</span><PhoneInput value={form.phone} onChange={(phone) => { setForm({ ...form, phone }); setErrors({ ...errors, phone: undefined }); }} invalid={Boolean(errors.phone)} /><FieldError message={errors.phone} /></label>
          <label className="set-field"><span>Email <em>Optional</em></span><input {...bind("email")} type="email" /><FieldError message={errors.email} /></label>
          <label className="set-field"><span>Area</span><select {...bind("area")}><option value="">Choose</option><AreaOptions current={form.area} /></select></label>
          <label className="set-field"><span>Venue / landmark</span><input {...bind("place")} /></label>
          <label className="set-field set-span-2"><span>Notes</span><input {...bind("notes")} maxLength={500} /></label>
        </div>
        {!customer && <label className="auth-check ws-check"><input type="checkbox" checked={form.sendLogin} onChange={(event) => setForm({ ...form, sendLogin: event.target.checked })} /><span>Create a login and SMS it to the customer</span></label>}
        {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? <><LoaderCircle size={15} className="auth-spin" /> Saving…</> : <><Save size={15} /> {customer ? "Save changes" : "Add customer"}</>}</button>
        </div>
      </form>
    </WsModal>
  );
}

function SmsModal({ to, onClose, onSent }) {
  const { call } = useApi();
  const [phone, setPhone] = useState(to?.phone || "");
  const [message, setMessage] = useState(to ? `Hi ${to.firstName || to.name?.split(" ")[0] || ""}, ` : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ask, confirmDialog] = useConfirm();
  async function send(event) {
    event.preventDefault();
    if (phone.trim() && message.trim() && !(await ask({ title: `Send this SMS to ${phone.trim()}?`, message: `“${message.trim().slice(0, 140)}${message.trim().length > 140 ? "…" : ""}”`, confirmLabel: "Yes, send SMS" }))) return;
    setBusy(true);
    setError("");
    try {
      const data = await call("/messages", { method: "POST", body: { phone, message } });
      onSent(data.sms);
    } catch (sendError) {
      setError(sendError.message);
      setBusy(false);
    }
  }
  return (
    <WsModal title="Send SMS" kicker={to?.name || "SMS"} onClose={onClose} busy={busy}>
      <form className="team-form" onSubmit={send} noValidate>
        <label className="set-field"><span>Phone</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" /></label>
        <label className="set-field"><span>Message <em>{message.length}/480</em></span><textarea className="ws-textarea" rows="4" maxLength={480} value={message} onChange={(event) => setMessage(event.target.value)} autoFocus /></label>
        {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? <><LoaderCircle size={15} className="auth-spin" /> Sending…</> : <><Send size={15} /> Send SMS</>}</button>
        </div>
      </form>
      {confirmDialog}
    </WsModal>
  );
}

const CUSTOMER_SEGMENTS = ["All customers", "With orders", "No orders yet", "Owes a balance", "Has app login", "No app login"];
const inSegment = (customer, segment) => ({
  "With orders": customer.orders > 0,
  "No orders yet": customer.orders === 0,
  "Owes a balance": customer.balance > 0,
  "Has app login": customer.hasLogin,
  "No app login": !customer.hasLogin,
}[segment] ?? true);
const smsKindLabel = (kind) => ({
  order_created: "Booking created", order_status: "Order update", rental_request: "Rent Now request", customer_invite: "Login details",
  customer_login: "Login details", payment_receipt: "Payment receipt", manual: "Message",
}[kind] || "Message");

// Customer profile: details, account totals and full history from GET /api/customers/:id.
function CustomerProfile({ customerId, onClose, onEdit, onMessage, onNewOrder, onLogin, onRemoveLogin, reloadKey }) {
  const profile = useResource(`/customers/${customerId}?v=${reloadKey}`);
  const [tab, setTab] = useState("Orders");
  const [receipt, setReceipt] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(null);
  const data = profile.data;
  const customer = data?.customer;
  const paid = customer?.spent || 0;
  const tabs = data ? [["Orders", data.orders.length], ["Invoices", data.invoices.length], ["Payments", data.payments.length], ["Messages", data.messages.length]] : [];

  return (
    <WsModal title={customer ? customer.name : "Customer"} kicker="CUSTOMER PROFILE" onClose={onClose} wide className="cust-profile-modal">
      {!data ? (
        <div className="cust-profile-body"><LoadState status={profile.status} error={profile.error} onRetry={profile.reload} /></div>
      ) : (
        <div className="cust-profile-body">
          <section className="cust-profile-head">
            <div className="customer-avatar peach cust-profile-avatar">{customer.firstName[0]}{customer.lastName[0]}</div>
            <div className="cust-profile-id">
              <div className="cust-profile-chips">
                <span className={`cust-chip ${customer.hasLogin ? "ok" : ""}`}><KeyRound size={12} /> {customer.hasLogin ? "App login active" : "No app login"}</span>
                {customer.balance > 0 && <span className="cust-chip due"><CircleAlert size={12} /> Owes {formatShillings(customer.balance)}</span>}
              </div>
              <ul className="cust-profile-facts">
                <li><Phone size={13} /> {customer.phone}</li>
                <li><Mail size={13} /> {customer.email || "No email"}</li>
                <li><MapPin size={13} /> {[customer.place, customer.area].filter(Boolean).join(", ") || "No location"}</li>
                <li><CalendarCheck size={13} /> Customer since {shortDate(customer.createdAt)}</li>
              </ul>
            </div>
            <div className="cust-profile-actions">
              <button type="button" className="button button-primary" onClick={() => onNewOrder(customer)}><Plus size={14} /> New order</button>
              <button type="button" className="button button-secondary" onClick={() => onMessage(customer)}><MessageSquareText size={14} /> Send SMS</button>
              <button type="button" className="button button-secondary" onClick={() => onEdit(customer)}><PencilLine size={14} /> Edit</button>
              <button type="button" className="button button-secondary" onClick={() => onLogin(customer)}><KeyRound size={14} /> {customer.hasLogin ? "New password" : "Create login"}</button>
              {customer.hasLogin && <button type="button" className="button button-secondary cust-danger" onClick={() => onRemoveLogin(customer)}><Lock size={14} /> Remove access</button>}
            </div>
          </section>

          <section className="cust-profile-stats">
            {[
              ["Orders", customer.orders, `${customer.activeOrders} active · ${customer.completedOrders} completed`],
              ["Billed", formatShillings(customer.billed), customer.unpricedOrders ? `${customer.unpricedOrders} awaiting prices` : "priced orders"],
              ["Paid", formatShillings(paid), data.refunded ? `${formatShillings(data.refunded)} refunded` : `${data.payments.length} payment${data.payments.length === 1 ? "" : "s"}`],
              ["Balance due", formatShillings(customer.balance), customer.balance > 0 ? "still to collect" : "nothing owed"],
            ].map(([label, value, hint]) => (
              <div key={label} className={label === "Balance due" && customer.balance > 0 ? "due" : ""}><small>{label}</small><strong>{value}</strong><em>{hint}</em></div>
            ))}
          </section>

          {customer.notes && <p className="cust-notes"><StickyNote size={13} /> {customer.notes}</p>}

          <div className="inv-tabs ws-mini-tabs cust-tabs" role="tablist">
            {tabs.map(([name, count]) => (
              <button type="button" key={name} role="tab" aria-selected={tab === name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}>{name}<span>{count}</span></button>
            ))}
          </div>

          <div className="cust-history">
            {tab === "Orders" && (data.orders.length === 0 ? <p className="cust-empty">No orders yet.</p> : (
              <table className="cust-table">
                <thead><tr><th>Order</th><th>Event</th><th>Items</th><th>Total</th><th>Balance</th><th>Status</th></tr></thead>
                <tbody>{data.orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong><small>{order.source === "rent_now" ? "Rent Now" : "Staff"}</small></td>
                    <td>{orderDates(order)}<small>{order.place || order.area || "—"}</small></td>
                    <td className="cust-items" title={orderItemsText(order.items)}>{orderItemsText(order.items)}</td>
                    <td>{order.total === null ? <span className="ws-quote">Quote pending</span> : formatShillings(order.total)}</td>
                    <td>{order.balance ? <b className="cust-due">{formatShillings(order.balance)}</b> : order.total === null ? "—" : "Paid"}</td>
                    <td><StatusPill tone={orderTone(order.status)}>{order.status}</StatusPill></td>
                  </tr>
                ))}</tbody>
              </table>
            ))}
            {tab === "Invoices" && (data.invoices.length === 0 ? <p className="cust-empty">No invoices yet.</p> : (
              <table className="cust-table">
                <thead><tr><th>Invoice</th><th>Order</th><th>Issued</th><th>Due</th><th>Amount</th><th>Balance</th><th>Status</th><th /></tr></thead>
                <tbody>{data.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><strong>{invoice.code}</strong></td>
                    <td>{invoice.orderCode || "—"}</td>
                    <td>{shortDate(invoice.issuedOn)}</td>
                    <td>{shortDate(invoice.dueOn)}</td>
                    <td>{formatShillings(invoice.amount)}</td>
                    <td>{invoice.balance ? <b className="cust-due">{formatShillings(invoice.balance)}</b> : "—"}</td>
                    <td><StatusPill tone={invoiceTone(invoice.status)}>{invoice.status}</StatusPill></td>
                    <td><button type="button" className="report-icon-button" onClick={() => setInvoiceOpen(invoice.id)} title="View invoice" aria-label={`View ${invoice.code}`}><Eye size={13} /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            ))}
            {tab === "Payments" && (data.payments.length === 0 ? <p className="cust-empty">No payments yet.</p> : (
              <table className="cust-table">
                <thead><tr><th>Receipt</th><th>Date</th><th>Order</th><th>Method</th><th>Amount</th><th>Status</th><th /></tr></thead>
                <tbody>{data.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td><strong>{payment.receipt}</strong></td>
                    <td>{shortDate(payment.date)}</td>
                    <td>{payment.reference}</td>
                    <td>{payment.method}<small>{payment.transactionRef}</small></td>
                    <td>{formatShillings(payment.amount)}</td>
                    <td><StatusPill tone={payment.status === "Paid" ? "green" : "red"}>{payment.status}</StatusPill></td>
                    <td><button type="button" className="report-icon-button" onClick={() => setReceipt(payment)} title="View receipt" aria-label={`View ${payment.receipt}`}><Eye size={13} /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            ))}
            {tab === "Messages" && (data.messages.length === 0 ? <p className="cust-empty">No SMS sent to this number yet.</p> : (
              <ul className="cust-messages">{data.messages.map((message) => (
                <li key={message.id}>
                  <header><strong>{smsKindLabel(message.kind)}</strong><span>{new Date(message.sentAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span><StatusPill tone={message.status === "sent" ? "green" : message.status === "failed" ? "red" : "amber"}>{message.status === "sent" ? "Sent" : message.status === "failed" ? "Failed" : "Not sent"}</StatusPill></header>
                  <p>{message.message}</p>
                </li>
              ))}</ul>
            ))}
          </div>
        </div>
      )}
      {receipt && <ReceiptPreview payment={receipt} onClose={() => setReceipt(null)} />}
      {invoiceOpen && <InvoiceView invoiceId={invoiceOpen} onClose={() => setInvoiceOpen(null)} onChanged={profile.reload} />}
    </WsModal>
  );
}

function CustomersPage({ query, onNewOrder, addOpen, setAddOpen }) {
  const { call, session } = useApi();
  const customers = useResource("/customers");
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("All areas");
  const [segment, setSegment] = useState("All customers");
  const joined = useDateRange();
  const [editing, setEditing] = useState(null);
  const [messaging, setMessaging] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [profileVersion, setProfileVersion] = useState(0);
  const [toast, setToast] = useToast();
  const [ask, confirmDialog] = useConfirm();
  const list = customers.data?.customers || [];

  useEffect(() => {
    if (addOpen) {
      setEditing("new");
      setAddOpen(false);
    }
  }, [addOpen, setAddOpen]);
  const words = `${query} ${search}`.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const rows = list.filter((customer) => (areaFilter === "All areas" || customer.area === areaFilter)
    && inSegment(customer, segment)
    && joined.matches(customer.createdAt)
    && words.every((word) => `${customer.name} ${customer.phone} ${customer.email} ${customer.area} ${customer.place}`.toLowerCase().includes(word)));
  const monthStart = `${localTodayIso().slice(0, 7)}-01`;
  const totalSpent = rows.reduce((sum, customer) => sum + customer.spent, 0);
  const owing = rows.filter((customer) => customer.balance > 0);
  const newThisMonth = rows.filter((customer) => localDay(customer.createdAt) >= monthStart).length;
  const customersFiltered = Boolean(search) || areaFilter !== "All areas" || segment !== "All customers" || joined.active;
  const clearCustomerFilters = () => { setSearch(""); setAreaFilter("All areas"); setSegment("All customers"); joined.reset(); };
  const exportRows = rows.map((customer) => [customer.name, customer.phone, customer.email, customer.area, customer.place, customer.orders, customer.lastOrder || "", formatShillings(customer.billed), formatShillings(customer.spent), formatShillings(customer.balance), customer.hasLogin ? "Yes" : "No", localDay(customer.createdAt)]);

  // Keeps the table and an open profile in step after any change.
  function applyCustomer(updated) {
    customers.setData((current) => ({ ...current, customers: current.customers.map((entry) => (entry.id === updated.id ? updated : entry)) }));
    setProfileVersion((value) => value + 1);
  }

  async function sendLogin(customer) {
    const ok = await ask(customer.hasLogin
      ? { title: `Send ${customer.firstName} a new password?`, message: `A new password goes by SMS to ${customer.phone}. Their old password stops working and they are signed out.`, confirmLabel: "Yes, send new password" }
      : { title: `Create an app login for ${customer.firstName}?`, message: `They can track orders and payments. The login goes by SMS to ${customer.phone}.`, confirmLabel: "Yes, create login" });
    if (!ok) return;
    try {
      const data = await call(`/customers/${customer.id}/login`, { method: "POST" });
      applyCustomer(data.customer);
      if (data.temporaryPassword) setCredentials({ phone: data.customer.phone, password: data.temporaryPassword });
      setToast(data.sms.status === "sent" ? `Login sent to ${data.customer.phone}` : "SMS not sent — share the password shown");
    } catch (error) {
      setToast(error.message);
    }
  }

  async function removeLogin(customer) {
    const ok = await ask({ title: `Remove ${customer.firstName}’s app access?`, message: "They are signed out and can’t sign in until you create a new login. Their orders and payments stay.", confirmLabel: "Yes, remove access", danger: true });
    if (!ok) return;
    try {
      const data = await call(`/customers/${customer.id}/login`, { method: "DELETE" });
      applyCustomer(data.customer);
      setToast(`${customer.firstName}’s app access removed`);
    } catch (error) {
      setToast(error.message);
    }
  }

  return (
    <>
      <section className="inv-stats">
        {[
          [Users, "Customers", rows.length, `${newThisMonth} new this month${customersFiltered ? " · filtered" : ""}`, "blue"],
          [CalendarCheck, "With orders", rows.filter((customer) => customer.orders > 0).length, `${rows.filter((customer) => customer.activeOrders > 0).length} with active rentals`, "mint"],
          [CircleAlert, "Balance due", formatShillings(owing.reduce((sum, customer) => sum + customer.balance, 0)), `${owing.length} customer${owing.length === 1 ? " owes" : "s owe"}`, "orange"],
          [Banknote, "Lifetime revenue", formatShillings(totalSpent), customersFiltered ? "paid by these customers" : "paid by all customers", "purple"],
        ].map(([Icon, label, value, hint, tone]) => (
          <article key={label} className="inv-stat"><span className={`inv-stat-icon ${tone}`}><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div></article>
        ))}
      </section>
      <section className="panel inv-panel">
        <div className="inv-toolbar">
          <div className="inv-toolbar-actions">
            <label className="inv-search"><Search size={15} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, email" aria-label="Search customers" /></label>
            <select className="inv-select" value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} aria-label="Filter by area"><option value="All areas">All areas</option><AreaOptions current={areaFilter === "All areas" ? "" : areaFilter} /></select>
            <select className="inv-select" value={segment} onChange={(event) => setSegment(event.target.value)} aria-label="Filter customers">{CUSTOMER_SEGMENTS.map((option) => <option key={option}>{option}</option>)}</select>
            <DateRangeFilter range={joined} label="Joined" />
            <ClearFiltersButton active={customersFiltered} onClear={clearCustomerFilters} />
            <ExportMenu title="Customers" columns={["Name", "Phone", "Email", "Area", "Venue", "Orders", "Last event", "Billed", "Paid", "Balance", "App login", "Joined"]} rows={exportRows} />
          </div>
        </div>
        <LoadState status={customers.status} error={customers.error} onRetry={customers.reload} empty={customers.status === "ready" && list.length === 0 ? "No customers yet" : ""} emptyIcon={Users} emptyText="Customers appear here when they use Rent Now or when you add them." />
        {list.length > 0 && (
          <>
            <DataTable
              columns={[
                { key: "name", label: "CUSTOMER", render: (row) => <button type="button" className="customer-cell cust-open" onClick={() => setViewing(row.id)} title="Open profile"><div className="customer-avatar peach">{row.firstName[0]}{row.lastName[0]}</div><span><strong>{row.name}</strong><small>{row.email || "No email"}</small></span></button> },
                { key: "phone", label: "PHONE", render: (row) => <div className="ws-two-line"><span className="team-muted">{row.phone}</span><small className={`cust-login ${row.hasLogin ? "ok" : ""}`}>{row.hasLogin ? "App login" : "No login"}</small></div> },
                { key: "area", label: "LOCATION", render: (row) => <div className="ws-two-line"><strong>{row.area || "—"}</strong><small>{row.place}</small></div> },
                { key: "orders", label: "ORDERS", render: (row) => <strong className="inv-qty">{row.orders}</strong> },
                { key: "lastOrder", label: "LAST EVENT", render: (row) => <span className="team-muted">{shortDate(row.lastOrder)}</span> },
                { key: "spent", label: "PAID", render: (row) => <strong className="inv-qty">{formatShillings(row.spent)}</strong> },
                { key: "balance", label: "BALANCE", render: (row) => (row.balance > 0 ? <strong className="cust-due">{formatShillings(row.balance)}</strong> : <span className="team-muted">—</span>) },
              ]}
              rows={rows}
              itemLabel="customers"
              totalCount={list.length}
              rowKey="id"
              renderActions={(row) => [
                { label: "View profile", onClick: () => setViewing(row.id) },
                { label: "New order", onClick: () => onNewOrder(row) },
                { label: "Send SMS", onClick: () => setMessaging(row) },
                { label: "Edit customer", onClick: () => setEditing(row) },
                { label: row.hasLogin ? "Send new password" : "Create app login", onClick: () => sendLogin(row) },
                ...(row.hasLogin ? [{ label: "Remove app access", danger: true, onClick: () => removeLogin(row) }] : []),
                ...(session.staffRole === "Admin" && row.orders === 0 && row.spent === 0 ? [{ label: "Delete customer", danger: true, onClick: () => setDeleting(row) }] : []),
              ]}
            />
          </>
        )}
      </section>
      {editing && (
        <CustomerModal
          customer={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(data, created) => {
            if (created) customers.setData((current) => ({ ...current, customers: [data.customer, ...current.customers] }));
            else applyCustomer(data.customer);
            setEditing(null);
            if (data.temporaryPassword) setCredentials({ phone: data.customer.phone, password: data.temporaryPassword });
            setToast(`${data.customer.name} ${created ? "added" : "updated"}${data.sms ? (data.sms.status === "sent" ? " · login sent by SMS" : " · SMS not sent") : ""}`);
          }}
        />
      )}
      {viewing && (
        <CustomerProfile
          customerId={viewing}
          reloadKey={profileVersion}
          onClose={() => setViewing(null)}
          onEdit={(customer) => setEditing(customer)}
          onMessage={(customer) => setMessaging(customer)}
          onNewOrder={(customer) => { setViewing(null); onNewOrder(customer); }}
          onLogin={sendLogin}
          onRemoveLogin={removeLogin}
        />
      )}
      {messaging && <SmsModal to={messaging} onClose={() => setMessaging(null)} onSent={(sms) => { setMessaging(null); setProfileVersion((value) => value + 1); setToast(sms.status === "sent" ? "SMS sent" : `SMS not sent (${sms.status === "not_configured" ? "SMS not set up" : sms.error || "failed"})`); }} />}
      {deleting && (
        <InventoryConfirmDelete
          item={{ name: deleting.name, quantity: 0, sku: deleting.phone }}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await call(`/customers/${deleting.id}`, { method: "DELETE" });
            customers.setData((current) => ({ ...current, customers: current.customers.filter((entry) => entry.id !== deleting.id) }));
            setToast(`${deleting.name} deleted`);
            setDeleting(null);
          }}
        />
      )}
      {credentials && (
        <WsModal title="Customer login created" kicker="LOGIN DETAILS" onClose={() => setCredentials(null)}>
          <div className="team-form"><TempPasswordNote phone={credentials.phone} password={credentials.password} /><div className="modal-actions"><button className="button button-primary" onClick={() => setCredentials(null)}>Done</button></div></div>
        </WsModal>
      )}
      {confirmDialog}
      {toast}
    </>
  );
}

// ===== Invoices =====
// ===== Invoice document (screen, print and PDF share the same content) =====
const INVOICE_STAMPS = { Paid: ["PAID", "#1f9a6a"], "Partially paid": ["PART PAID", "#c4851f"], Overdue: ["OVERDUE", "#d0443c"], Unpaid: ["UNPAID", "#2674ed"], Cancelled: ["CANCELLED", "#8592a6"] };

// Lines, totals and payment details for an invoice, from GET /api/invoices/:id plus settings.
function invoiceContent({ invoice, order, payments, customer }, settings = {}) {
  const days = order?.days || 1;
  const items = (order?.items || []).map((item, index) => ({
    no: index + 1,
    name: item.custom || itemLabel(item.name),
    quantity: item.quantity,
    rate: item.rate,
    days,
    amount: item.lineTotal,
  }));
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const delivery = order?.deliveryFee || 0;
  const discount = order?.discount || 0;
  const computed = Math.max(0, subtotal + delivery - discount);
  const adjustment = order && order.priced ? invoice.amount - computed : 0;
  const totals = [
    ["Items subtotal", subtotal],
    ...(delivery ? [["Delivery", delivery]] : []),
    ...(discount ? [["Discount", -discount]] : []),
    ...(adjustment ? [["Adjustment", adjustment]] : []),
  ];
  // Every payment method switched on in Settings → Payments & receipts, with its number.
  const howToPay = enabledMethods(settings).map((method) => [method.name, paymentMethodDetail(method)]);
  const event = order ? `${orderDates(order)} · ${days} day${days === 1 ? "" : "s"}` : "—";
  const venue = order ? [order.place, order.area].filter(Boolean).join(", ") : [customer?.place, customer?.area].filter(Boolean).join(", ");
  const business = {
    name: settings.businessName || BUSINESS_INFO.name,
    tagline: settings.tagline || "",
    address: [settings.address, settings.region, "Tanzania"].filter(Boolean).join(", ") || BUSINESS_INFO.address,
    phone: settings.phone || BUSINESS_INFO.phone,
    email: settings.email || BUSINESS_INFO.email,
    tin: settings.tin || "",
  };
  return { invoice, order, payments: payments || [], customer: customer || {}, items, totals, howToPay, event, venue, business, stamp: INVOICE_STAMPS[invoice.status] || INVOICE_STAMPS.Unpaid };
}

const invoiceStyles = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #1c2a3f; font: 400 12px/1.5 "DM Sans", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .screen { padding: 24px; background: #eef2f7; }
  .screen .sheet { max-width: 794px; margin: 0 auto; padding: 40px 44px; background: #fff; border-radius: 6px; box-shadow: 0 6px 30px #0f23401f; }
  .top { display: flex; justify-content: space-between; gap: 20px; padding-bottom: 18px; border-bottom: 3px solid #2674ed; }
  .brand strong { display: block; font: 800 26px "Manrope", Arial, sans-serif; letter-spacing: -.6px; }
  .brand strong span { color: #2674ed; }
  .brand small { display: block; color: #6b7a90; font-size: 11px; }
  .title { text-align: right; }
  .title b { display: block; color: #2674ed; font: 800 24px "Manrope", Arial, sans-serif; letter-spacing: 3px; }
  .title em { display: block; margin-top: 2px; font-style: normal; font-size: 15px; font-weight: 700; }
  .stamp { display: inline-block; margin-top: 8px; padding: 3px 10px; border: 2px solid currentColor; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; transform: rotate(-4deg); }
  .parties { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin: 22px 0; }
  .parties h4, .block h4 { margin: 0 0 6px; color: #8492a6; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .parties p { margin: 0; color: #4b5d77; font-size: 11.5px; }
  .parties p strong { display: block; color: #1c2a3f; font-size: 13px; }
  .facts { display: grid; grid-template-columns: auto 1fr; gap: 3px 10px; margin: 0; font-size: 11.5px; }
  .facts dt { color: #8492a6; }
  .facts dd { margin: 0; color: #1c2a3f; font-weight: 600; text-align: right; }
  table { width: 100%; border-collapse: collapse; }
  .items th { padding: 9px 10px; background: #eef5ff; color: #2a4a78; font-size: 10px; font-weight: 700; letter-spacing: .6px; text-align: left; text-transform: uppercase; }
  .items td { padding: 10px; border-bottom: 1px solid #edf1f6; font-size: 12px; vertical-align: top; }
  .items .num { text-align: right; white-space: nowrap; }
  .items .muted { color: #9aa6b6; }
  .summary { display: grid; grid-template-columns: 1fr 300px; gap: 28px; margin-top: 18px; align-items: start; }
  .totals td { padding: 5px 0; font-size: 12px; }
  .totals td:last-child { text-align: right; font-weight: 600; }
  .totals .grand td { padding-top: 10px; border-top: 2px solid #1c2a3f; font-size: 14px; font-weight: 800; }
  .totals .paid td { color: #1f9a6a; }
  .due { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding: 12px 14px; border: 1px solid #d6e6ff; border-radius: 8px; background: #eef5ff; color: #2a4a78; }
  .due span { color: #2a4a78; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; }
  .due strong { color: #2674ed; font: 800 18px "Manrope", Arial, sans-serif; }
  .due.settled { background: #e6f6ee; }
  .due.settled span, .due.settled strong { color: #1f8a5b; }
  .block { margin-top: 18px; padding: 12px 14px; border: 1px solid #e3eaf3; border-radius: 8px; }
  .block p { margin: 3px 0; color: #4b5d77; font-size: 11.5px; }
  .block p b { color: #1c2a3f; }
  .pay { display: grid; grid-template-columns: auto 1fr; gap: 5px 14px; margin: 2px 0 0; font-size: 11.5px; }
  .pay dt { color: #1c2a3f; font-weight: 700; }
  .pay dd { margin: 0; color: #4b5d77; }
  .block p.ref { margin-top: 8px; padding-top: 7px; border-top: 1px dashed #e3eaf3; }
  .payments td, .payments th { padding: 6px 8px; font-size: 11px; text-align: left; border-bottom: 1px solid #edf1f6; }
  .payments th { color: #8492a6; font-weight: 700; }
  .payments .num { text-align: right; }
  .foot { margin-top: 26px; padding-top: 12px; border-top: 1px dashed #c9d3e0; color: #6b7a90; font-size: 10.5px; text-align: center; }
  @media print { .screen { padding: 0; background: #fff; } .screen .sheet { max-width: none; padding: 0; box-shadow: none; } }
`;

function invoiceHtml(detail, settings, { screen = false } = {}) {
  const c = invoiceContent(detail, settings);
  const { invoice } = c;
  const money = (value) => escapeHtml(value === null || value === undefined ? "—" : formatShillings(value));
  const policy = [settings?.depositPercent ? `A ${settings.depositPercent}% deposit confirms the booking.` : "", settings?.damagePolicy || ""].filter(Boolean).join(" ");
  const nameParts = c.business.name.split(" ");
  return `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(invoice.code)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Manrope:wght@700;800&display=swap" />
<style>${invoiceStyles}</style></head><body class="${screen ? "screen" : ""}"><div class="sheet">
  <header class="top">
    <div class="brand">
      <strong>${escapeHtml(nameParts[0])}<span>${escapeHtml(nameParts.slice(1).join(" ").toLowerCase() || "")}</span></strong>
      ${c.business.tagline ? `<small>${escapeHtml(c.business.tagline)}</small>` : ""}
    </div>
    <div class="title">
      <b>INVOICE</b>
      <em>${escapeHtml(invoice.code)}</em>
      <span class="stamp" style="color:${c.stamp[1]}">${c.stamp[0]}</span>
    </div>
  </header>
  <section class="parties">
    <div><h4>From</h4><p><strong>${escapeHtml(c.business.name)}</strong>${escapeHtml(c.business.address)}<br />${escapeHtml(c.business.phone)}<br />${escapeHtml(c.business.email)}${c.business.tin ? `<br />TIN ${escapeHtml(c.business.tin)}` : ""}</p></div>
    <div><h4>Bill to</h4><p><strong>${escapeHtml(c.customer.name || invoice.customer)}</strong>${escapeHtml(c.customer.phone || invoice.phone)}${c.customer.email ? `<br />${escapeHtml(c.customer.email)}` : ""}${c.venue ? `<br />${escapeHtml(c.venue)}` : ""}</p></div>
    <div><h4>Invoice details</h4><dl class="facts">
      <dt>Issued</dt><dd>${escapeHtml(shortDate(invoice.issuedOn))}</dd>
      <dt>Due</dt><dd>${escapeHtml(shortDate(invoice.dueOn))}</dd>
      <dt>Order</dt><dd>${escapeHtml(invoice.orderCode || "—")}</dd>
      <dt>Event</dt><dd>${escapeHtml(c.event)}</dd>
    </dl></div>
  </section>
  <table class="items">
    <thead><tr><th>#</th><th>Item</th><th class="num">Qty</th><th class="num">Rate / day</th><th class="num">Days</th><th class="num">Amount</th></tr></thead>
    <tbody>${c.items.length ? c.items.map((item) => `<tr><td class="muted">${item.no}</td><td>${escapeHtml(item.name)}</td><td class="num">${item.quantity.toLocaleString("en-US")}</td><td class="num">${money(item.rate)}</td><td class="num">${item.days}</td><td class="num">${money(item.amount)}</td></tr>`).join("") : `<tr><td colspan="6" class="muted">Rental services for ${escapeHtml(invoice.orderCode || "this booking")}</td></tr>`}</tbody>
  </table>
  <section class="summary">
    <div>
      ${c.howToPay.length ? `<div class="block"><h4>How to pay</h4><dl class="pay">${c.howToPay.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl><p class="ref">Please quote <b>${escapeHtml(invoice.code)}</b> as the payment reference.</p></div>` : ""}
      ${invoice.notes ? `<div class="block"><h4>Notes</h4><p>${escapeHtml(invoice.notes)}</p></div>` : ""}
      ${policy ? `<div class="block"><h4>Terms</h4><p>${escapeHtml(policy)}</p></div>` : ""}
    </div>
    <div>
      <table class="totals"><tbody>
        ${c.totals.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${value < 0 ? "− " : ""}${money(Math.abs(value))}</td></tr>`).join("")}
        <tr class="grand"><td>Invoice total</td><td>${money(invoice.amount)}</td></tr>
        <tr class="paid"><td>Paid</td><td>${invoice.paid ? "− " : ""}${money(invoice.paid)}</td></tr>
      </tbody></table>
      <div class="due ${invoice.balance > 0 ? "" : "settled"}"><span>${invoice.status === "Cancelled" ? "Cancelled" : invoice.balance > 0 ? "Balance due" : "Paid in full"}</span><strong>${money(invoice.status === "Cancelled" ? 0 : invoice.balance)}</strong></div>
    </div>
  </section>
  ${c.payments.length ? `<div class="block"><h4>Payments received</h4><table class="payments"><thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th>Status</th><th class="num">Amount</th></tr></thead><tbody>${c.payments.map((payment) => `<tr><td>${escapeHtml(payment.receipt)}</td><td>${escapeHtml(shortDate(payment.date))}</td><td>${escapeHtml(payment.method)}</td><td>${escapeHtml(payment.status)}</td><td class="num">${money(payment.amount)}</td></tr>`).join("")}</tbody></table></div>` : ""}
  <div class="foot">Thank you for renting with ${escapeHtml(c.business.name)}. Questions? Call ${escapeHtml(c.business.phone)}.</div>
</div></body></html>`;
}

function printInvoice(detail, settings) {
  printHtml(invoiceHtml(detail, settings));
}

async function downloadInvoicePdf(detail, settings = {}) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const c = invoiceContent(detail, settings);
  const { invoice } = c;
  const pdf = new jsPDF({ format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const left = 14;
  const right = width - 14;
  const ink = [28, 42, 63];
  const muted = [107, 122, 144];
  const blue = [38, 116, 237];
  const text = (value, x, y, { size = 9, bold = false, color = ink, align = "left" } = {}) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    pdf.text(String(value), x, y, { align });
  };
  const nameParts = c.business.name.split(" ");
  text(nameParts[0], left, 20, { size: 20, bold: true });
  text(nameParts.slice(1).join(" ").toLowerCase(), left + pdf.getTextWidth(nameParts[0]) + 0.5, 20, { size: 20, bold: true, color: blue });
  if (c.business.tagline) text(c.business.tagline, left, 26, { size: 8, color: muted });
  text("INVOICE", right, 18, { size: 18, bold: true, color: blue, align: "right" });
  text(invoice.code, right, 25, { size: 11, bold: true, align: "right" });
  const stampColor = c.stamp[1].match(/\w\w/g).map((hex) => parseInt(hex, 16));
  text(c.stamp[0], right, 31, { size: 8, bold: true, color: stampColor, align: "right" });
  pdf.setDrawColor(...blue);
  pdf.setLineWidth(0.8);
  pdf.line(left, 35, right, 35);

  const column = (x, title, lines) => {
    text(title.toUpperCase(), x, 44, { size: 7, bold: true, color: muted });
    lines.forEach((line, index) => text(line, x, 50 + index * 5, { size: index === 0 ? 10 : 8.5, bold: index === 0, color: index === 0 ? ink : [75, 93, 119] }));
  };
  const third = (right - left) / 3;
  column(left, "From", [c.business.name, c.business.address, c.business.phone, c.business.email, c.business.tin ? `TIN ${c.business.tin}` : ""].filter(Boolean));
  column(left + third, "Bill to", [c.customer.name || invoice.customer, c.customer.phone || invoice.phone, c.customer.email, c.venue].filter(Boolean));
  text("INVOICE DETAILS", left + third * 2, 44, { size: 7, bold: true, color: muted });
  [["Issued", shortDate(invoice.issuedOn)], ["Due", shortDate(invoice.dueOn)], ["Order", invoice.orderCode || "—"], ["Event", c.event]].forEach(([label, value], index) => {
    text(label, left + third * 2, 50 + index * 5, { size: 8.5, color: muted });
    text(value, right, 50 + index * 5, { size: 8.5, bold: true, align: "right" });
  });

  const money = (value) => (value === null || value === undefined ? "—" : formatShillings(value));
  autoTable(pdf, {
    startY: 78,
    margin: { left, right: 14 },
    head: [["#", "Item", "Qty", "Rate / day", "Days", "Amount"]],
    body: c.items.length ? c.items.map((item) => [item.no, item.name, item.quantity.toLocaleString("en-US"), money(item.rate), item.days, money(item.amount)]) : [["", `Rental services for ${invoice.orderCode || "this booking"}`, "", "", "", ""]],
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.6, textColor: ink, lineColor: [237, 241, 246], lineWidth: { bottom: 0.2 } },
    headStyles: { fillColor: [238, 245, 255], textColor: [42, 74, 120], fontStyle: "bold", fontSize: 7.5 },
    columnStyles: { 0: { cellWidth: 8, textColor: muted }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right", cellWidth: 14 }, 5: { halign: "right" } },
    didParseCell: (cell) => { if (cell.section === "head" && cell.column.index >= 2) cell.cell.styles.halign = "right"; },
  });
  let y = pdf.lastAutoTable.finalY + 8;
  const totalsX = right - 72;
  c.totals.forEach(([label, value]) => {
    text(label, totalsX, y, { size: 9, color: [75, 93, 119] });
    text(`${value < 0 ? "- " : ""}${money(Math.abs(value))}`, right, y, { size: 9, align: "right" });
    y += 5.5;
  });
  pdf.setDrawColor(...ink);
  pdf.setLineWidth(0.5);
  pdf.line(totalsX, y - 2, right, y - 2);
  y += 3;
  text("Invoice total", totalsX, y, { size: 10.5, bold: true });
  text(money(invoice.amount), right, y, { size: 10.5, bold: true, align: "right" });
  y += 6;
  text("Paid", totalsX, y, { size: 9, color: [31, 154, 106] });
  text(`${invoice.paid ? "- " : ""}${money(invoice.paid)}`, right, y, { size: 9, color: [31, 154, 106], align: "right" });
  y += 4;
  const settled = invoice.balance <= 0 || invoice.status === "Cancelled";
  pdf.setFillColor(...(settled ? [230, 246, 238] : [238, 245, 255]));
  pdf.roundedRect(totalsX - 3, y, right - totalsX + 3, 12, 2, 2, "F");
  text(invoice.status === "Cancelled" ? "CANCELLED" : settled ? "PAID IN FULL" : "BALANCE DUE", totalsX, y + 7.6, { size: 8, bold: true, color: settled ? [31, 138, 91] : [42, 74, 120] });
  text(money(invoice.status === "Cancelled" ? 0 : invoice.balance), right - 2, y + 8, { size: 12, bold: true, color: settled ? [31, 138, 91] : blue, align: "right" });

  let infoY = pdf.lastAutoTable.finalY + 8;
  const infoWidth = totalsX - left - 12;
  const infoBlock = (title, lines) => {
    if (!lines.length) return;
    text(title.toUpperCase(), left, infoY, { size: 7, bold: true, color: muted });
    infoY += 5;
    lines.forEach((line) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      const wrapped = pdf.splitTextToSize(line, infoWidth);
      pdf.setTextColor(75, 93, 119);
      pdf.text(wrapped, left, infoY);
      infoY += wrapped.length * 4.2;
    });
    infoY += 4;
  };
  if (c.howToPay.length) {
    text("HOW TO PAY", left, infoY, { size: 7, bold: true, color: muted });
    infoY += 5;
    c.howToPay.forEach(([label, value]) => {
      text(label, left, infoY, { size: 8.5, bold: true });
      pdf.setFont("helvetica", "normal");
      const wrapped = pdf.splitTextToSize(value, infoWidth - 28);
      pdf.setTextColor(75, 93, 119);
      pdf.text(wrapped, left + 28, infoY);
      infoY += wrapped.length * 4.2 + 0.8;
    });
    text(`Please quote ${invoice.code} as the payment reference.`, left, infoY + 1.5, { size: 8.5, color: [75, 93, 119] });
    infoY += 9;
  }
  if (invoice.notes) infoBlock("Notes", [invoice.notes]);

  y = Math.max(y + 22, infoY + 4);
  if (c.payments.length) {
    text("PAYMENTS RECEIVED", left, y, { size: 7, bold: true, color: muted });
    autoTable(pdf, {
      startY: y + 2,
      margin: { left, right: 14 },
      head: [["Receipt", "Date", "Method", "Status", "Amount"]],
      body: c.payments.map((payment) => [payment.receipt, shortDate(payment.date), payment.method, payment.status, money(payment.amount)]),
      theme: "plain",
      styles: { fontSize: 8, cellPadding: 1.8, textColor: ink, lineColor: [237, 241, 246], lineWidth: { bottom: 0.2 } },
      headStyles: { textColor: muted, fontStyle: "bold" },
      columnStyles: { 4: { halign: "right" } },
      didParseCell: (cell) => { if (cell.section === "head" && cell.column.index === 4) cell.cell.styles.halign = "right"; },
    });
    y = pdf.lastAutoTable.finalY + 10;
  }
  pdf.setDrawColor(201, 211, 224);
  pdf.setLineDashPattern([1, 1], 0);
  pdf.line(left, y, right, y);
  pdf.setLineDashPattern([], 0);
  text(`Thank you for renting with ${c.business.name}. Questions? Call ${c.business.phone}.`, width / 2, y + 6, { size: 8, color: muted, align: "center" });
  pdf.save(`${c.business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-invoice-${invoice.code.toLowerCase()}.pdf`);
}

// Invoice viewer with print, PDF, SMS, payment, edit and cancel.
function InvoiceView({ invoiceId, onClose, onChanged, onRecordPayment }) {
  const { call } = useApi();
  const [version, setVersion] = useState(0);
  const detail = useResource(`/invoices/${invoiceId}?v=${version}`);
  const settingsRes = useResource("/settings");
  const settings = settingsRes.data?.settings || {};
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ dueOn: "", notes: "" });
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useToast();
  const [ask, confirmDialog] = useConfirm();
  const frameRef = useRef(null);
  const data = detail.data;
  const invoice = data?.invoice;
  const html = useMemo(() => (data ? invoiceHtml(data, settings, { screen: true }) : ""), [data, settings]);
  const refresh = () => { setVersion((value) => value + 1); onChanged?.(); };

  function fitFrame() {
    const frame = frameRef.current;
    if (frame?.contentDocument?.body) frame.style.height = `${frame.contentDocument.documentElement.scrollHeight}px`;
  }

  async function act(name, work) {
    setBusy(name);
    try {
      await work();
    } catch (error) {
      setToast(error.message);
    } finally {
      setBusy("");
    }
  }

  const sendSms = () => act("sms", async () => {
    if (!(await ask({ title: `SMS ${invoice.code} to ${invoice.customer}?`, message: `${invoice.phone} gets the invoice total, amount paid${invoice.balance > 0 ? `, the balance of ${formatShillings(invoice.balance)} and how to pay` : ""}.`, confirmLabel: "Yes, send SMS" }))) return;
    const result = await call(`/invoices/${invoice.id}/send`, { method: "POST" });
    setToast(result.sms.status === "sent" ? `Invoice sent to ${invoice.phone}` : `SMS not sent (${result.sms.status === "not_configured" ? "SMS not set up" : result.sms.error || "failed"})`);
  });

  const saveEdit = (event) => {
    event.preventDefault();
    act("edit", async () => {
      if (!(await ask({ title: `Save changes to ${invoice.code}?`, message: `Due ${shortDate(form.dueOn)}${form.notes ? " · notes updated" : ""}.`, confirmLabel: "Yes, save" }))) return;
      await call(`/invoices/${invoice.id}`, { method: "PATCH", body: { dueOn: form.dueOn, notes: form.notes } });
      setEditing(false);
      setToast(`${invoice.code} updated`);
      refresh();
    });
  };

  const cancelInvoice = () => act("cancel", async () => {
    if (!(await ask({ title: `Cancel invoice ${invoice.code}?`, message: `${invoice.customer} will no longer owe ${formatShillings(invoice.amount)} on this invoice.`, confirmLabel: "Yes, cancel invoice", danger: true }))) return;
    await call(`/invoices/${invoice.id}`, { method: "PATCH", body: { cancel: true } });
    setToast(`${invoice.code} cancelled`);
    refresh();
  });

  return (
    <WsModal title={invoice ? `Invoice ${invoice.code}` : "Invoice"} kicker={invoice ? `${invoice.customer} · ${invoice.orderCode || "No order"}` : "INVOICES"} onClose={onClose} wide className="inv-view-modal">
      {!data ? (
        <div className="inv-view-body"><LoadState status={detail.status} error={detail.error} onRetry={detail.reload} /></div>
      ) : (
        <>
          <div className="inv-view-bar">
            <div className="inv-view-sum">
              <StatusPill tone={invoiceTone(invoice.status)}>{invoice.status}</StatusPill>
              <span>Total <b>{formatShillings(invoice.amount)}</b></span>
              <span>Paid <b>{formatShillings(invoice.paid)}</b></span>
              <span className={invoice.balance > 0 ? "due" : ""}>Balance <b>{formatShillings(invoice.balance)}</b></span>
            </div>
            <div className="inv-view-actions">
              <button type="button" className="button button-secondary" onClick={() => printInvoice(data, settings)}><Printer size={14} /> Print</button>
              <button type="button" className="button button-secondary" onClick={() => act("pdf", () => downloadInvoicePdf(data, settings))} disabled={busy === "pdf"}><Download size={14} /> PDF</button>
              {invoice.status !== "Cancelled" && <button type="button" className="button button-secondary" onClick={sendSms} disabled={busy === "sms"}><Send size={14} /> Send SMS</button>}
              {invoice.status !== "Cancelled" && <button type="button" className="button button-secondary" onClick={() => { setForm({ dueOn: String(invoice.dueOn).slice(0, 10), notes: invoice.notes }); setEditing((value) => !value); }}><PencilLine size={14} /> Edit</button>}
              {onRecordPayment && invoice.balance > 0 && invoice.status !== "Cancelled" && <button type="button" className="button button-primary" onClick={() => onRecordPayment(invoice, refresh)}><Banknote size={14} /> Record payment</button>}
              {invoice.status !== "Cancelled" && invoice.paid === 0 && <button type="button" className="button button-secondary cust-danger" onClick={cancelInvoice} disabled={busy === "cancel"}><X size={14} /> Cancel</button>}
            </div>
          </div>
          {editing && (
            <form className="inv-view-edit" onSubmit={saveEdit}>
              <label className="set-field"><span>Due date</span><input type="date" value={form.dueOn} onChange={(event) => setForm({ ...form, dueOn: event.target.value })} /></label>
              <label className="set-field"><span>Notes on the invoice <em>Optional</em></span><input value={form.notes} maxLength={300} placeholder="e.g. Deposit received at booking" onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
              <button type="submit" className="button button-primary" disabled={busy === "edit" || !form.dueOn}><Save size={14} /> Save</button>
              <button type="button" className="button button-secondary" onClick={() => setEditing(false)}>Close</button>
            </form>
          )}
          <iframe ref={frameRef} className="inv-view-frame" title={`Invoice ${invoice.code}`} srcDoc={html} onLoad={fitFrame} />
        </>
      )}
      {confirmDialog}
      {toast}
    </WsModal>
  );
}

function InvoiceCreateModal({ onClose, onSaved }) {
  const { call } = useApi();
  const orders = useResource("/orders");
  const [orderCode, setOrderCode] = useState("");
  const [amount, setAmount] = useState("");
  const [dueOn, setDueOn] = useState(shiftIsoDate(localTodayIso(), 7));
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const candidates = (orders.data?.orders || []).filter((order) => !order.invoice && order.status !== "Cancelled");
  const selected = candidates.find((order) => order.id === orderCode);
  const [ask, confirmDialog] = useConfirm();
  async function save(event) {
    event.preventDefault();
    if (selected && !(await ask({
      title: `Create an invoice for ${selected.id}?`,
      message: `${selected.customer.name} will be invoiced ${amount === "" ? "the order total" : formatShillings(Number(amount))}, due ${shortDate(dueOn)}.`,
      confirmLabel: "Yes, create invoice",
    }))) return;
    setBusy(true);
    setError("");
    try {
      const data = await call("/invoices", { method: "POST", body: { orderCode, amount: amount === "" ? undefined : Number(amount), dueOn, notes } });
      onSaved(data.invoice);
    } catch (saveError) {
      setError(saveError.message);
      setBusy(false);
    }
  }
  return (
    <WsModal title="Create invoice" kicker="INVOICES" onClose={onClose} busy={busy} className="inv-create-modal">
      <form className="team-form" onSubmit={save} noValidate>
        <label className="set-field">
          <span>Order</span>
          <select value={orderCode} onChange={(event) => { setOrderCode(event.target.value); const order = candidates.find((entry) => entry.id === event.target.value); setAmount(order?.total ? String(order.total) : ""); }}>
            <option value="">{orders.status === "loading" ? "Loading orders…" : candidates.length ? "Choose an order without an invoice" : "No orders to invoice"}</option>
            {candidates.map((order) => <option key={order.id} value={order.id}>{order.id} · {order.customer.name} · {order.total === null ? "not priced" : formatShillings(order.total)}</option>)}
          </select>
        </label>
        <div className="set-grid">
          <label className="set-field"><span>Amount (TSh)</span><input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={selected && selected.total === null ? "Enter amount" : ""} /></label>
          <label className="set-field"><span>Due date</span><input type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} /></label>
        </div>
        {selected && (
          <div className="inv-create-summary">
            <div><small>Customer</small><strong>{selected.customer.name}</strong><em>{selected.customer.phone}</em></div>
            <div><small>Event</small><strong>{orderDates(selected)}</strong><em>{selected.place || selected.area || "—"}</em></div>
            <div><small>Order total</small><strong>{selected.total === null ? "Not priced" : formatShillings(selected.total)}</strong><em>{selected.paid ? `${formatShillings(selected.paid)} already paid` : "Nothing paid yet"}</em></div>
            <p title={orderItemsText(selected.items)}>{orderItemsText(selected.items)}</p>
          </div>
        )}
        <label className="set-field"><span>Notes on the invoice <em>Optional</em></span><input value={notes} maxLength={300} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. Deposit received at booking" /></label>
        {selected && selected.total === null && <p className="team-form-note"><Info size={13} /> This order has no prices yet — enter the invoice amount, or price the order first.</p>}
        {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={busy || !orderCode}>{busy ? <><LoaderCircle size={15} className="auth-spin" /> Creating…</> : <><Receipt size={15} /> Create invoice</>}</button>
        </div>
      </form>
      {confirmDialog}
    </WsModal>
  );
}

function InvoicesPage({ query, settings, addOpen, setAddOpen }) {
  const { call } = useApi();
  const invoices = useResource("/invoices");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const issued = useDateRange();
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [toast, setToast] = useToast();
  const list = invoices.data?.invoices || [];
  const today = localTodayIso();

  useEffect(() => {
    if (addOpen) {
      setCreating(true);
      setAddOpen(false);
    }
  }, [addOpen, setAddOpen]);
  const daysBetween = (from, to) => Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000);
  const dueNote = (invoice) => {
    if (invoice.status === "Paid") return "Paid";
    if (invoice.status === "Cancelled") return "Cancelled";
    const days = daysBetween(today, String(invoice.dueOn).slice(0, 10));
    if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
    return days === 0 ? "Due today" : `Due in ${days} day${days === 1 ? "" : "s"}`;
  };
  async function withDetail(invoice, use) {
    try {
      const data = await call(`/invoices/${invoice.id}`);
      await use(data);
    } catch (error) {
      setToast(error.message);
    }
  }
  const words = `${query} ${search}`.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Search and date filters; the status tabs and cards count within this set.
  const scoped = list.filter((invoice) => issued.matches(invoice.issuedOn)
    && words.every((word) => `${invoice.code} ${invoice.orderCode} ${invoice.customer} ${invoice.phone}`.toLowerCase().includes(word)));
  const rows = scoped.filter((invoice) => status === "All" || invoice.status === status);
  const open = scoped.filter((invoice) => !["Paid", "Cancelled"].includes(invoice.status));
  const invoicesFiltered = Boolean(search) || status !== "All" || issued.active;
  const clearInvoiceFilters = () => { setSearch(""); setStatus("All"); issued.reset(); };
  const monthStart = `${localTodayIso().slice(0, 7)}-01`;

  return (
    <>
      <section className="inv-stats">
        {[
          [Receipt, "Outstanding", formatShillings(open.reduce((sum, invoice) => sum + invoice.balance, 0)), `${open.length} open invoice${open.length === 1 ? "" : "s"}`, "blue"],
          [CircleAlert, "Overdue", scoped.filter((invoice) => invoice.status === "Overdue").length, formatShillings(scoped.filter((invoice) => invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.balance, 0)), "orange"],
          [CircleCheck, "Paid in full", scoped.filter((invoice) => invoice.status === "Paid").length, invoicesFiltered ? "invoices matching filters" : "invoices", "mint"],
          ...(issued.active
            ? [[CalendarDays, "Issued in range", scoped.length, formatShillings(scoped.reduce((sum, invoice) => sum + invoice.amount, 0)), "purple"]]
            : [[CalendarDays, "Issued this month", scoped.filter((invoice) => invoice.issuedOn >= monthStart).length, formatShillings(scoped.filter((invoice) => invoice.issuedOn >= monthStart).reduce((sum, invoice) => sum + invoice.amount, 0)), "purple"]]),
        ].map(([Icon, label, value, hint, tone]) => (
          <article key={label} className="inv-stat"><span className={`inv-stat-icon ${tone}`}><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div></article>
        ))}
      </section>
      <section className="panel inv-panel">
        <div className="inv-toolbar">
          <div className="inv-tabs ws-scroll-tabs" role="tablist">
            {["All", "Unpaid", "Partially paid", "Overdue", "Paid", "Cancelled"].map((option) => (
              <button key={option} role="tab" aria-selected={status === option} className={status === option ? "active" : ""} onClick={() => setStatus(option)}>{option}<span>{option === "All" ? scoped.length : scoped.filter((invoice) => invoice.status === option).length}</span></button>
            ))}
          </div>
          <div className="inv-toolbar-actions">
            <label className="inv-search"><Search size={15} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice, order, customer" aria-label="Search invoices" /></label>
            <DateRangeFilter range={issued} label="Issued" />
            <ClearFiltersButton active={invoicesFiltered} onClear={clearInvoiceFilters} />
            <ExportMenu title="Invoices" columns={["Invoice", "Order", "Customer", "Issued", "Due", "Amount", "Paid", "Balance", "Status"]} rows={rows.map((invoice) => [invoice.code, invoice.orderCode || "", invoice.customer, invoice.issuedOn, invoice.dueOn, formatShillings(invoice.amount), formatShillings(invoice.paid), formatShillings(invoice.balance), invoice.status])} />
          </div>
        </div>
        <LoadState status={invoices.status} error={invoices.error} onRetry={invoices.reload} empty={invoices.status === "ready" && list.length === 0 ? "No invoices yet" : ""} emptyIcon={Receipt} emptyText="Create an invoice from any priced order." />
        {list.length > 0 && (
          <>
            <DataTable
              columns={[
                { key: "code", label: "INVOICE", render: (row) => <button type="button" className="inv-open" onClick={() => setViewing(row.id)} title="Open invoice"><span className="inv-open-icon"><FileText size={15} /></span><span className="ws-two-line"><strong className="report-id">{row.code}</strong><small>{row.orderCode || "No order"}</small></span></button> },
                { key: "customer", label: "CUSTOMER", render: (row) => <div className="ws-two-line"><strong>{row.customer}</strong><small>{row.phone}</small></div> },
                { key: "issuedOn", label: "ISSUED", render: (row) => <span className="team-muted">{shortDate(row.issuedOn)}</span> },
                { key: "dueOn", label: "DUE", render: (row) => <div className="ws-two-line"><span className="team-muted">{shortDate(row.dueOn)}</span><small className={`inv-due-note ${row.status === "Overdue" ? "late" : row.status === "Paid" ? "done" : ""}`}>{dueNote(row)}</small></div> },
                { key: "amount", label: "AMOUNT", render: (row) => {
                  const percent = row.amount ? Math.min(100, Math.round((row.paid / row.amount) * 100)) : 0;
                  return (
                    <div className="inv-pay-cell">
                      <div className="inv-pay-line"><strong>{formatShillings(row.amount)}</strong><small>{row.status === "Cancelled" ? "Cancelled" : row.balance ? `${formatShillings(row.balance)} due` : "Settled"}</small></div>
                      <span className="inv-pay-bar" title={`${percent}% paid`}><i style={{ width: `${percent}%` }} /></span>
                    </div>
                  );
                } },
                { key: "status", label: "STATUS", render: (row) => <StatusPill tone={invoiceTone(row.status)}>{row.status}</StatusPill> },
              ]}
              rows={rows}
              itemLabel="invoices"
              totalCount={list.length}
              rowKey="id"
              renderActions={(row) => [
                { label: "View invoice", onClick: () => setViewing(row.id) },
                { label: "Print", onClick: () => withDetail(row, (data) => printInvoice(data, settings)) },
                { label: "Download PDF", onClick: () => withDetail(row, (data) => downloadInvoicePdf(data, settings)) },
                ...(row.status !== "Cancelled" ? [{ label: "Send by SMS", confirm: { title: `SMS ${row.code} to ${row.customer}?`, message: `${row.phone} gets the invoice total, amount paid${row.balance > 0 ? `, the balance of ${formatShillings(row.balance)} and how to pay` : ""}.`, confirmLabel: "Yes, send SMS" }, onClick: async () => {
                  try {
                    const result = await call(`/invoices/${row.id}/send`, { method: "POST" });
                    setToast(result.sms.status === "sent" ? `${row.code} sent to ${row.phone}` : `SMS not sent (${result.sms.status === "not_configured" ? "SMS not set up" : result.sms.error || "failed"})`);
                  } catch (error) { setToast(error.message); }
                } }] : []),
                ...(row.balance > 0 && row.status !== "Cancelled" ? [{ label: "Record payment", onClick: () => setPaying(row) }] : []),
                ...(row.status !== "Cancelled" && row.paid === 0 ? [{ label: "Cancel invoice", danger: true, confirm: { title: `Cancel invoice ${row.code}?`, message: `${row.customer} will no longer owe ${formatShillings(row.amount)} on this invoice.`, confirmLabel: "Yes, cancel invoice" }, onClick: async () => {
                  try {
                    const data = await call(`/invoices/${row.id}`, { method: "PATCH", body: { cancel: true } });
                    invoices.setData((current) => ({ ...current, invoices: current.invoices.map((entry) => (entry.id === row.id ? data.invoice : entry)) }));
                    setToast(`${row.code} cancelled`);
                  } catch (error) { setToast(error.message); }
                } }] : []),
              ]}
            />
          </>
        )}
      </section>
      {creating && <InvoiceCreateModal onClose={() => setCreating(false)} onSaved={(invoice) => { setCreating(false); invoices.setData((current) => ({ ...current, invoices: [invoice, ...current.invoices] })); setToast(`Invoice ${invoice.code} created`); }} />}
      {viewing && (
        <InvoiceView
          invoiceId={viewing}
          onClose={() => setViewing(null)}
          onChanged={invoices.reload}
          onRecordPayment={(invoice, refreshView) => setPaying({ ...invoice, refreshView })}
        />
      )}
      {paying && <PaymentModal invoice={paying} settings={settings} onClose={() => setPaying(null)} onSaved={(data) => { paying.refreshView?.(); setPaying(null); invoices.reload(); setReceipt(data.payment); setToast(`Payment ${data.payment.receipt} recorded`); }} />}
      {receipt && <ReceiptPreview payment={receipt} onClose={() => setReceipt(null)} />}
      {toast}
    </>
  );
}

// ===== Finance =====
function ExpenseModal({ expense, meta, onClose, onSaved }) {
  const { call } = useApi();
  const [form, setForm] = useState({
    date: expense?.date || localTodayIso(), category: expense?.category || "", description: expense?.description || "",
    vendor: expense?.vendor || "", method: expense?.method || "Cash", amount: expense ? String(expense.amount) : "", status: expense?.status || "Approved",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const bind = (key) => ({ value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }), "aria-invalid": Boolean(errors[key]) });
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = { ...form, amount: Number(form.amount) };
      const data = expense ? await call(`/expenses/${expense.id}`, { method: "PATCH", body }) : await call("/expenses", { method: "POST", body });
      onSaved(data.expense, !expense);
    } catch (saveError) {
      setErrors(saveError.fields || {});
      setError(saveError.message);
      setBusy(false);
    }
  }
  return (
    <WsModal title={expense ? "Edit expense" : "Add expense"} kicker="FINANCE" onClose={onClose} busy={busy}>
      <form className="team-form" onSubmit={save} noValidate>
        <div className="set-grid">
          <label className="set-field"><span>Date</span><input type="date" {...bind("date")} /><FieldError message={errors.date} /></label>
          <label className="set-field"><span>Amount (TSh)</span><input type="number" min="1" {...bind("amount")} autoFocus /><FieldError message={errors.amount} /></label>
          <label className="set-field"><span>Category</span><select {...bind("category")}><option value="">Choose</option>{meta.categories.map((category) => <option key={category}>{category}</option>)}</select><FieldError message={errors.category} /></label>
          <label className="set-field"><span>Paid with</span><select {...bind("method")}>{meta.methods.map((method) => <option key={method}>{method}</option>)}</select></label>
          <label className="set-field set-span-2"><span>Description</span><input {...bind("description")} maxLength={120} placeholder="e.g. Tent repairs" /><FieldError message={errors.description} /></label>
          <label className="set-field"><span>Vendor <em>Optional</em></span><input {...bind("vendor")} maxLength={80} /></label>
          <label className="set-field"><span>Status</span><select {...bind("status")}><option>Approved</option><option>Pending</option></select></label>
        </div>
        {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? <><LoaderCircle size={15} className="auth-spin" /> Saving…</> : <><Save size={15} /> {expense ? "Save changes" : "Add expense"}</>}</button>
        </div>
      </form>
    </WsModal>
  );
}

function FinancePage({ query, session }) {
  const { call } = useApi();
  const range = useDateRange("This month");
  const today = localTodayIso();
  const from = range.from || "2000-01-01";
  const to = range.to || today;
  const summary = useResource(`/finance/summary?from=${from}&to=${to}`);
  const expenses = useResource("/expenses");
  const payments = useResource("/payments");
  const [tab, setTab] = useState("Expenses");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useToast();
  const s = summary.data;
  const words = `${query} ${search}`.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const inRange = (date) => date >= from && date <= to;
  const financeFiltered = Boolean(search) || range.active;
  const clearFinanceFilters = () => { setSearch(""); range.reset(); };
  const expenseRows = (expenses.data?.expenses || []).filter((expense) => inRange(expense.date) && words.every((word) => `${expense.category} ${expense.description} ${expense.vendor} ${expense.method}`.toLowerCase().includes(word)));
  const paymentRows = (payments.data?.payments || []).filter((payment) => inRange(payment.date) && words.every((word) => `${payment.receipt} ${payment.customer} ${payment.reference} ${payment.method} ${payment.transactionRef}`.toLowerCase().includes(word)));
  const maxMethod = Math.max(1, ...(s?.byMethod || []).map((row) => row.total));
  const maxCategory = Math.max(1, ...(s?.byCategory || []).map((row) => row.total));

  return (
    <>
      <div className="ws-period-bar">
        <span>Showing</span>
        <select className="inv-select" value={range.period} onChange={(event) => range.setPeriod(event.target.value)} aria-label="Finance period">{reportPeriods.map((option) => <option key={option}>{option}</option>)}</select>
        {range.period === "Custom range" && (
          <span className="inv-date-range">
            <input type="date" value={range.customFrom} max={range.customTo || undefined} onChange={(event) => range.setCustomFrom(event.target.value)} aria-label="Finance from" />
            <i>–</i>
            <input type="date" value={range.customTo} min={range.customFrom || undefined} onChange={(event) => range.setCustomTo(event.target.value)} aria-label="Finance to" />
          </span>
        )}
        <small>{range.period === "All time" ? "All records" : `${shortDate(from)} – ${shortDate(to)}`}</small>
        <ClearFiltersButton active={financeFiltered} onClear={clearFinanceFilters} />
      </div>
      <section className="inv-stats">
        {[
          [CircleDollarSign, "Revenue", s ? formatShillings(s.revenue) : "…", s ? `${s.payments} payment${s.payments === 1 ? "" : "s"}${s.refunded ? ` · ${formatShillings(s.refunded)} refunded` : ""}` : "", "mint"],
          [Sparkles, "Tithe & giving", s ? formatShillings(s.tithe + (s.giving || 0)) : "…", s ? `Tithe ${formatShillings(s.tithe)} · Giving ${formatShillings(s.giving || 0)}` : "", "purple"],
          [Wallet, "Expenses", s ? formatShillings(s.expenses) : "…", s ? `${s.pendingExpenses ? `${formatShillings(s.pendingExpenses)} pending` : `${s.expenseCount} entries`}` : "", "orange"],
          [ChartNoAxesCombined, "Net profit", s ? formatShillings(s.net) : "…", "revenue − tithe − giving − expenses", "blue"],
        ].map(([Icon, label, value, hint, tone]) => (
          <article key={label} className="inv-stat"><span className={`inv-stat-icon ${tone}`}><Icon size={18} /></span><div><small>{label}</small><strong className={label === "Net profit" && s?.net < 0 ? "negative-text" : ""}>{value}</strong><em>{hint}</em></div></article>
        ))}
      </section>
      <section className="panel inv-panel">
        <div className="inv-toolbar">
          <div className="inv-tabs" role="tablist">
            {[["Expenses", expenseRows.length], ["Payments", paymentRows.length], ["Breakdown", null]].map(([option, n]) => (
              <button key={option} role="tab" aria-selected={tab === option} className={tab === option ? "active" : ""} onClick={() => setTab(option)}>{option}{n !== null && <span>{n}</span>}</button>
            ))}
          </div>
          <div className="inv-toolbar-actions">
            {tab !== "Breakdown" && <label className="inv-search"><Search size={15} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${tab.toLowerCase()}`} aria-label={`Search ${tab}`} /></label>}
            {tab === "Expenses" && <ExportMenu title="Expenses" columns={["Date", "Category", "Description", "Vendor", "Paid with", "Amount", "Status"]} rows={expenseRows.map((expense) => [expense.date, expense.category, expense.description, expense.vendor, expense.method, formatShillings(expense.amount), expense.status])} />}
            {tab === "Payments" && <ExportMenu title="Payments" columns={["Receipt", "Date", "Customer", "Order", "Method", "Reference", "Amount", "Tithe", "Giving", "Status"]} rows={paymentRows.map((payment) => [payment.receipt, payment.date, payment.customer, payment.reference, payment.method, payment.transactionRef, formatShillings(payment.amount), formatShillings(payment.tithe), formatShillings(payment.giving || 0), payment.status])} />}
            {tab === "Expenses" && <button className="button button-primary inv-add-button" onClick={() => setEditing("new")}><Plus size={16} /> Add expense</button>}
          </div>
        </div>
        {tab === "Expenses" && (
          <>
            <LoadState status={expenses.status} error={expenses.error} onRetry={expenses.reload} empty={expenses.status === "ready" && expenseRows.length === 0 ? "No expenses in this period" : ""} emptyIcon={Wallet} emptyText="Record fuel, repairs, supplies and other costs to see your real profit." />
            {expenseRows.length > 0 && (
              <DataTable
                columns={[
                  { key: "date", label: "DATE", render: (row) => <span className="team-muted">{shortDate(row.date)}</span> },
                  { key: "description", label: "EXPENSE", render: (row) => <div className="ws-two-line"><strong>{row.description}</strong><small>{row.category}</small></div> },
                  { key: "vendor", label: "VENDOR", render: (row) => <span className="team-muted">{row.vendor || "—"}</span> },
                  { key: "method", label: "PAID WITH", render: (row) => <span className="team-muted">{row.method}</span> },
                  { key: "amount", label: "AMOUNT", render: (row) => <strong className="inv-qty">{formatShillings(row.amount)}</strong> },
                  { key: "status", label: "STATUS", render: (row) => <StatusPill tone={row.status === "Approved" ? "green" : "amber"}>{row.status}</StatusPill> },
                ]}
                rows={expenseRows}
                itemLabel="expenses"
                rowKey="id"
                renderActions={(row) => [
                  { label: "Edit expense", onClick: () => setEditing(row) },
                  ...(row.status === "Pending" ? [{ label: "Approve", confirm: { title: "Approve this expense?", message: `${row.description} · ${formatShillings(row.amount)} will count against profit.`, confirmLabel: "Yes, approve" }, onClick: async () => { try { const data = await call(`/expenses/${row.id}`, { method: "PATCH", body: { status: "Approved" } }); expenses.setData((current) => ({ ...current, expenses: current.expenses.map((entry) => (entry.id === row.id ? data.expense : entry)) })); summary.reload(); setToast("Expense approved"); } catch (error) { setToast(error.message); } } }] : []),
                  { label: "Delete expense", danger: true, onClick: () => setDeleting(row) },
                ]}
              />
            )}
          </>
        )}
        {tab === "Payments" && (
          <>
            <LoadState status={payments.status} error={payments.error} onRetry={payments.reload} empty={payments.status === "ready" && paymentRows.length === 0 ? "No payments in this period" : ""} emptyIcon={Banknote} emptyText="Record payments from Orders or Invoices." />
            {paymentRows.length > 0 && (
              <DataTable
                columns={[
                  { key: "receipt", label: "RECEIPT", render: (row) => <div className="ws-two-line"><strong className="report-id">{row.receipt}</strong><small>{shortDate(row.date)}</small></div> },
                  { key: "customer", label: "CUSTOMER", render: (row) => <div className="ws-two-line"><strong>{row.customer}</strong><small>{row.reference}</small></div> },
                  { key: "method", label: "METHOD", render: (row) => <div className="ws-two-line"><strong>{row.method}</strong><small>{row.transactionRef || "—"}</small></div> },
                  { key: "amount", label: "AMOUNT", render: (row) => <div className="ws-two-line"><strong>{formatShillings(row.amount)}</strong><small>Tithe {formatShillings(row.tithe)}{row.giving ? ` · Giving ${formatShillings(row.giving)}` : ""}</small></div> },
                  { key: "status", label: "STATUS", render: (row) => <StatusPill tone={row.status === "Paid" ? "green" : "red"}>{row.status}</StatusPill> },
                ]}
                rows={paymentRows}
                itemLabel="payments"
                rowKey="id"
                renderActions={(row) => [
                  { label: "View receipt", onClick: () => setReceipt(row) },
                  { label: "Print receipt", onClick: () => printReceipts([row]) },
                  ...(session.staffRole === "Admin" && row.status === "Paid" ? [{ label: "Mark refunded", danger: true, confirm: { title: `Mark ${row.receipt} as refunded?`, message: `${formatShillings(row.amount)} from ${row.customer} will be removed from revenue.`, confirmLabel: "Yes, mark refunded" }, onClick: async () => { try { await call(`/payments/${row.id}`, { method: "PATCH", body: { status: "Refunded" } }); payments.reload(); summary.reload(); setToast(`${row.receipt} marked refunded`); } catch (error) { setToast(error.message); } } }] : []),
                ]}
              />
            )}
          </>
        )}
        {tab === "Breakdown" && (
          <div className="ws-breakdown">
            <article>
              <h3>Revenue by payment method</h3>
              {(s?.byMethod || []).length === 0 ? <p className="team-muted">No payments in this period.</p> : s.byMethod.map((row) => (
                <div className="ws-bar-row" key={row.method}><span>{row.method}</span><i><b style={{ width: `${(row.total / maxMethod) * 100}%` }} /></i><strong>{formatShillings(row.total)}</strong></div>
              ))}
            </article>
            <article>
              <h3>Expenses by category</h3>
              {(s?.byCategory || []).length === 0 ? <p className="team-muted">No approved expenses in this period.</p> : s.byCategory.map((row) => (
                <div className="ws-bar-row expense" key={row.category}><span>{row.category}</span><i><b style={{ width: `${(row.total / maxCategory) * 100}%` }} /></i><strong>{formatShillings(row.total)}</strong></div>
              ))}
            </article>
            <article className="ws-net-card">
              <h3>Profit & loss</h3>
              <div><span>Revenue</span><strong>{formatShillings(s?.revenue)}</strong></div>
              <div><span>Tithe (Zaka)</span><strong>− {formatShillings(s?.tithe)}</strong></div>
              <div><span>Giving</span><strong>− {formatShillings(s?.giving || 0)}</strong></div>
              <div><span>Expenses</span><strong>− {formatShillings(s?.expenses)}</strong></div>
              <div className="total"><span>Net profit</span><strong className={s?.net < 0 ? "negative-text" : ""}>{formatShillings(s?.net)}</strong></div>
            </article>
          </div>
        )}
      </section>
      {editing && <ExpenseModal expense={editing === "new" ? null : editing} meta={expenses.data || { categories: [], methods: [] }} onClose={() => setEditing(null)} onSaved={(expense, created) => {
        expenses.setData((current) => ({ ...current, expenses: created ? [expense, ...current.expenses] : current.expenses.map((entry) => (entry.id === expense.id ? expense : entry)) }));
        summary.reload();
        setEditing(null);
        setToast(created ? "Expense added" : "Expense updated");
      }} />}
      {deleting && <InventoryConfirmDelete item={{ name: deleting.description, quantity: 0, sku: formatShillings(deleting.amount) }} onClose={() => setDeleting(null)} onConfirm={async () => {
        await call(`/expenses/${deleting.id}`, { method: "DELETE" });
        expenses.setData((current) => ({ ...current, expenses: current.expenses.filter((entry) => entry.id !== deleting.id) }));
        summary.reload();
        setDeleting(null);
        setToast("Expense deleted");
      }} />}
      {receipt && <ReceiptPreview payment={receipt} onClose={() => setReceipt(null)} />}
      {toast}
    </>
  );
}

// ===== SMS & notifications =====
const TEMPLATE_INFO = {
  bookingConfirmed: ["Booking confirmed", "Sent when an order is marked Confirmed."],
  outForDelivery: ["Out for delivery", "Sent when an order is marked Out for delivery."],
  completed: ["Thank you", "Sent when an order is marked Completed."],
  paymentReceived: ["Payment receipt", "Sent when you record a payment."],
};

function MessagingPage({ session, settingsResource }) {
  const { call } = useApi();
  const messages = useResource("/messages");
  const [tab, setTab] = useState("History");
  const [composing, setComposing] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useToast();
  const stats = messages.data?.stats;
  const list = messages.data?.messages || [];
  const currentTemplates = templates || settingsResource.data?.settings?.smsTemplates || {};
  const admin = session.staffRole === "Admin";

  async function saveTemplates() {
    setSaving(true);
    try {
      const data = await call("/settings", { method: "PUT", body: { settings: { smsTemplates: currentTemplates } } });
      settingsResource.setData((current) => ({ ...current, settings: data.settings }));
      setTemplates(null);
      setToast("Templates saved");
    } catch (error) {
      setToast(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {messages.data && !messages.data.smsConfigured && (
        <p className="set-notice ws-banner"><CircleAlert size={14} /> SMS sending is not set up on the server yet. Messages are recorded below as “not configured”. Add the Beem keys to GitHub secrets and redeploy.</p>
      )}
      <section className="inv-stats">
        {[
          [Send, "Sent (30 days)", stats?.month ?? "…", "all messages", "blue"],
          [CircleCheck, "Delivered to Beem", stats?.delivered ?? "…", "accepted for delivery", "mint"],
          [CircleAlert, "Not sent", stats?.not_sent ?? "…", "failed or not configured", "orange"],
          [MessageSquareText, "Templates", Object.keys(TEMPLATE_INFO).length, "automatic messages", "purple"],
        ].map(([Icon, label, value, hint, tone]) => (
          <article key={label} className="inv-stat"><span className={`inv-stat-icon ${tone}`}><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div></article>
        ))}
      </section>
      <section className="panel inv-panel">
        <div className="inv-toolbar">
          <div className="inv-tabs" role="tablist">
            {["History", "Templates"].map((option) => <button key={option} role="tab" aria-selected={tab === option} className={tab === option ? "active" : ""} onClick={() => setTab(option)}>{option}</button>)}
          </div>
          <div className="inv-toolbar-actions">
            <button className="button button-secondary" onClick={messages.reload}><RotateCcw size={14} /> Refresh</button>
            <button className="button button-primary inv-add-button" onClick={() => setComposing(true)}><Send size={15} /> Send SMS</button>
          </div>
        </div>
        {tab === "History" ? (
          <>
            <LoadState status={messages.status} error={messages.error} onRetry={messages.reload} empty={messages.status === "ready" && list.length === 0 ? "No messages yet" : ""} emptyIcon={MessageSquareText} emptyText="Every SMS the system sends — requests, bookings, receipts and invites — is listed here." />
            {list.length > 0 && (
              <DataTable
                columns={[
                  { key: "createdAt", label: "SENT", render: (row) => <span className="team-muted">{new Date(row.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
                  { key: "recipient", label: "TO", render: (row) => <div className="ws-two-line"><strong>{row.recipient}</strong><small>{row.phone}</small></div> },
                  { key: "message", label: "MESSAGE", render: (row) => <span className="ws-message" title={row.message}>{row.message}</span> },
                  { key: "kind", label: "TYPE", render: (row) => <span className="team-muted">{row.kind.replace(/_/g, " ")}{row.orderCode ? ` · ${row.orderCode}` : ""}</span> },
                  { key: "status", label: "STATUS", render: (row) => <StatusPill tone={row.status === "sent" ? "green" : row.status === "not_configured" ? "amber" : "red"}>{row.status === "sent" ? "Sent" : row.status === "not_configured" ? "Not configured" : "Failed"}</StatusPill> },
                ]}
                rows={list}
                itemLabel="messages"
                rowKey="id"
                renderActions={(row) => [{ label: "Copy message", onClick: () => navigator.clipboard?.writeText(row.message).then(() => setToast("Message copied")) }]}
              />
            )}
          </>
        ) : (
          <div className="ws-templates">
            <p className="team-muted">Use placeholders: {"{firstName} {order} {date} {total} {place} {amount} {receipt} {balance} {phone}"}. Turn each message on or off in Settings → Notifications.</p>
            {Object.entries(TEMPLATE_INFO).map(([key, [title, help]]) => (
              <label className="set-field" key={key}>
                <span>{title} <em>{help}</em></span>
                <textarea className="ws-textarea" rows="3" maxLength={480} value={currentTemplates[key] || ""} readOnly={!admin} onChange={(event) => setTemplates({ ...currentTemplates, [key]: event.target.value })} />
              </label>
            ))}
            {admin ? (
              <div className="modal-actions"><button className="button button-primary" onClick={saveTemplates} disabled={saving || !templates}>{saving ? "Saving…" : <><Save size={15} /> Save templates</>}</button></div>
            ) : <p className="team-muted">Only an Admin can change templates.</p>}
          </div>
        )}
      </section>
      {composing && <SmsModal onClose={() => setComposing(false)} onSent={(sms) => { setComposing(false); messages.reload(); setToast(sms.status === "sent" ? "SMS sent" : "SMS recorded but not sent"); }} />}
      {toast}
    </>
  );
}

// ===== Overview (dashboard) =====
function niceCeiling(value) {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= value) * magnitude;
  return step;
}

function compactShillings(value) {
  if (value >= 1e6) return `TSh ${(value / 1e6).toFixed(value % 1e6 ? 1 : 0)}M`;
  if (value >= 1e3) return `TSh ${(value / 1e3).toFixed(value % 1e3 ? 1 : 0)}K`;
  return `TSh ${value}`;
}

function OverviewPage({ onNavigate, onNewOrder }) {
  const { session } = useApi();
  const [period, setPeriod] = useState("week");
  const dash = useResource(`/dashboard?period=${period}`);
  const d = dash.data;
  if (!d) return <section className="panel inv-panel"><LoadState status={dash.status} error={dash.error} onRetry={dash.reload} /></section>;

  const inv = d.inventory;
  const units = inv.units || 0;
  const outPct = units ? Math.round((inv.out / units) * 100) : 0;
  const repairPct = units ? Math.round((inv.maintenanceUnits / units) * 100) : 0;
  const availablePct = Math.max(0, 100 - outPct - repairPct);
  const peak = niceCeiling(Math.max(...d.revenue.days.map((day) => day.total)));
  const best = Math.max(...d.revenue.days.map((day) => day.total));
  const labelEvery = d.revenue.days.length > 10 ? 5 : 1;
  const change = d.revenue.change;

  return (
    <>
      <section className="metrics-grid" aria-label="Business overview">
        <Metric icon={Package} label="Total units" value={units.toLocaleString("en-US")} change={`${inv.products} products`} kind="up" color="mint-icon" caption="in inventory" />
        <Metric icon={CalendarDays} label="Out on rent" value={inv.out.toLocaleString("en-US")} change={`${outPct}%`} kind="up" color="blue-icon" caption="of units today" />
        <Metric icon={Sparkles} label="Available now" value={inv.available.toLocaleString("en-US")} change={`${availablePct}%`} kind="up" color="purple-icon" caption="ready to rent" />
        <Metric icon={ShieldCheck} label="Needs attention" value={String(d.orders.new_requests + inv.maintenance)} change={`${d.orders.new_requests} new request${d.orders.new_requests === 1 ? "" : "s"}`} kind={d.orders.new_requests + inv.maintenance ? "down" : "up"} color="orange-icon" caption={`${inv.maintenance} in maintenance`} />
      </section>
      <section className="overview-grid">
        <article className="panel revenue-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-kicker">YOUR BUSINESS</div>
              <h2>Revenue overview</h2>
            </div>
            <select className="inv-select ws-period-select" value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Revenue period">
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
          <div className="revenue-total">
            <strong>{formatShillings(d.revenue.total)}</strong>
            {change !== null && (
              <span className={change >= 0 ? "positive-pill" : "positive-pill ws-negative-pill"}>
                {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {Math.abs(change).toFixed(1)}%
              </span>
            )}
            <small>{change === null ? "payments received" : `vs previous ${period === "week" ? "7" : "30"} days`}</small>
          </div>
          <div className="chart-wrap">
            <div className="chart-y-labels">
              {[1, 0.75, 0.5, 0.25, 0].map((fraction) => <span key={fraction}>{compactShillings(Math.round(peak * fraction))}</span>)}
            </div>
            <div className="chart-main">
              <div className="chart-gridlines"><i /><i /><i /><i /><i /></div>
              <div className="chart-bars" style={{ gridTemplateColumns: `repeat(${d.revenue.days.length}, 1fr)`, gap: d.revenue.days.length > 10 ? "3px" : undefined }}>
                {d.revenue.days.map((day, index) => {
                  const date = new Date(`${day.date}T00:00:00`);
                  return (
                    <div className="bar-column" key={day.date}>
                      <div className={`bar ${day.total && day.total === best ? "bar-emphasis" : ""}`} style={{ height: `${Math.max(2, (day.total / peak) * 100)}%` }}>
                        <span className="bar-tooltip">{formatShillings(day.total)}</span>
                      </div>
                      <span className="bar-label">{index % labelEvery === 0 || index === d.revenue.days.length - 1 ? (period === "week" ? date.toLocaleDateString("en-GB", { weekday: "short" }) : date.getDate()) : ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="chart-footer">
            <span><i className="legend-dot" /> Payments received</span>
            {isManager(session) && <button onClick={() => onNavigate("Finance")}>View finance <ArrowRight size={14} /></button>}
          </div>
        </article>
        <article className="panel availability-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-kicker">AT A GLANCE</div>
              <h2>Item availability</h2>
            </div>
          </div>
          <div className="availability-ring-wrap">
            <div className="availability-ring" style={{ background: units ? `conic-gradient(#4289ef 0 ${outPct}%, #72d3ae ${outPct}% ${outPct + availablePct}%, #ffb77c ${outPct + availablePct}% 100%)` : "#e8eef6" }}>
              <div><strong>{inv.out.toLocaleString("en-US")}</strong><span>of {units.toLocaleString("en-US")} out</span></div>
            </div>
            <div className="availability-key">
              <span><i className="key-dot rented-dot" />Out on rent <strong>{outPct}%</strong></span>
              <span><i className="key-dot available-dot" />Available <strong>{availablePct}%</strong></span>
              <span><i className="key-dot repair-dot" />In maintenance <strong>{inv.maintenanceUnits}</strong></span>
            </div>
          </div>
          <div className="availability-note">
            <span className="note-icon"><Sparkles size={15} /></span>
            <span>{units === 0 ? <><strong>Add your inventory</strong> to track availability.</> : d.orders.new_requests ? <><strong>{d.orders.new_requests} new request{d.orders.new_requests === 1 ? "" : "s"}</strong> waiting for a price.</> : <><strong>All caught up!</strong> {d.orders.upcoming} upcoming booking{d.orders.upcoming === 1 ? "" : "s"}.</>}</span>
          </div>
        </article>
      </section>
      <section className="panel bookings-panel">
        <div className="panel-heading bookings-heading">
          <div>
            <div className="panel-kicker">KEEP THINGS MOVING</div>
            <h2>Upcoming bookings <span className="heading-count">{d.orders.upcoming}</span></h2>
          </div>
          <div className="heading-actions">
            {isManager(session) && <button className="button button-primary ws-small-button" onClick={onNewOrder}><Plus size={14} /> New order</button>}
            <button className="text-action" onClick={() => onNavigate("Orders")}>See all orders <ArrowRight size={15} /></button>
          </div>
        </div>
        {d.upcoming.length === 0 ? (
          <LoadState status="ready" empty="No upcoming bookings" emptyIcon={CalendarDays} emptyText="New Rent Now requests and orders you create will show here." />
        ) : (
          <div className="table-scroll">
            <table className="booking-table ws-booking-table">
              <thead><tr><th>CUSTOMER</th><th>RENTAL</th><th>EVENT</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
              <tbody>
                {d.upcoming.map((order) => (
                  <tr key={order.id} onClick={() => onNavigate("Orders")}>
                    <td><div className="customer-cell"><div className="customer-avatar peach">{order.customer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><span><strong>{order.customer.name}</strong><small>{order.id} · {order.customer.phone}</small></span></div></td>
                    <td className="rental-cell">{orderItemsText(order.items)}</td>
                    <td className="date-cell">{orderDates(order)}</td>
                    <td className="amount-cell">{order.total === null ? "Quote pending" : formatShillings(order.total)}</td>
                    <td><StatusPill tone={orderTone(order.status)}>{order.status}</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="panel inventory-panel">
        <div className="panel-heading inventory-heading">
          <div>
            <div className="panel-kicker">MOST BOOKED</div>
            <h2>Popular inventory</h2>
          </div>
          <button className="text-action" onClick={() => onNavigate("Inventory")}>Manage inventory <ArrowRight size={15} /></button>
        </div>
        {d.popular.length === 0 ? (
          <LoadState status="ready" empty="No inventory yet" emptyIcon={Package} emptyText="Add your tents, chairs and equipment in Inventory." />
        ) : (
          <div className="inventory-cards">
            {d.popular.map((item) => {
              const Icon = categoryIcons[item.category] || Package;
              return (
                <article className="mini-item" key={item.id}>
                  <span className="inv-item-icon ws-mini-icon"><Icon size={20} /></span>
                  <div className="mini-item-copy">
                    <span className="mini-category">{item.category}</span>
                    <strong>{item.name}</strong>
                    <span className="mini-rate">{formatShillings(item.rate)}<small> / day</small></span>
                  </div>
                  <StatusPill tone={item.status === "Available" ? "green" : "amber"}>{item.ordered ? `${item.ordered} booked` : item.status}</StatusPill>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function PageSummary({ items, className = "" }) {
  return (
    <section className={`metrics-grid compact-metrics ${className}`}>
      {items.map((item) => (
        <Metric key={item.label} {...item} />
      ))}
    </section>
  );
}

const PAGE_SIZES = [10, 25, 50, 100];

// Page numbers to show, with "…" gaps: 1 … 4 5 6 … 12
function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const list = [1];
  const start = Math.max(2, Math.min(page - 1, pages - 4));
  const end = Math.min(pages - 1, Math.max(page + 1, 5));
  if (start > 2) list.push("…");
  for (let number = start; number <= end; number += 1) list.push(number);
  if (end < pages - 1) list.push("…");
  list.push(pages);
  return list;
}

function DataTable({ columns, rows, rowKey, renderActions, itemLabel = "rows", totalCount, footerExtra }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [panelPosition, setPanelPosition] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [ask, confirmDialog] = useConfirm();
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  const first = (current - 1) * pageSize;
  const pageRows = rows.slice(first, first + pageSize);

  // Filters and searches start again from the first page.
  useEffect(() => { setPage(1); }, [rows.length]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!event.target.closest(".row-action-wrap")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>{renderActions ? "ACTIONS" : ""}</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => {
            const actions = renderActions ? renderActions(row) : [];
            const rowId = row[rowKey];
            return (
              <tr key={rowId}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                <td className="row-actions-cell">
                  <div className="row-action-wrap">
                    <button
                      className="row-more"
                      aria-label={`More options for ${rowId}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        const rect = event.currentTarget.getBoundingClientRect();
                        const panelWidth = 190;
                        const panelHeight = 52 + actions.length * 28;
                        const gap = 12;
                        const roomLeft = rect.left;
                        const roomRight = window.innerWidth - rect.right;
                        const side =
                          roomRight >= panelWidth + gap
                            ? "right"
                            : roomLeft >= panelWidth + gap
                              ? "left"
                              : "right";
                        const left = Math.max(
                          12,
                          Math.min(
                            side === "left" ? rect.right - panelWidth : rect.left,
                            window.innerWidth - panelWidth - 12,
                          ),
                        );
                        const top = rect.top >= panelHeight + gap
                          ? rect.top - panelHeight - 8
                          : rect.bottom + 8;
                        setPanelPosition((current) => ({
                          ...current,
                          [rowId]: { top, left },
                        }));
                        setOpenMenuId((current) => (current === rowId ? null : rowId));
                      }}
                    >
                      <Ellipsis size={18} />
                    </button>
                    {actions.length > 0 && openMenuId === rowId && (
                      createPortal(
                        <div
                          className="anchored-panel"
                          style={panelPosition[rowId]}
                          role="menu"
                          aria-label={`Actions for ${rowId}`}
                        >
                          <div className="anchored-panel-header">Quick actions</div>
                          <div className="anchored-panel-list">
                            {actions.map(({ label, onClick, danger, confirm }) => (
                              <button
                                key={label}
                                type="button"
                                className={`panel-action-button ${danger ? "danger" : ""}`}
                                onClick={async (event) => {
                                  event.stopPropagation();
                                  setOpenMenuId(null);
                                  if (confirm && !(await ask({ danger, ...confirm }))) return;
                                  onClick?.(row);
                                }}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        ,
                        document.body,
                      )
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="empty-state">No results found.</div>
      )}
      <div className="table-bottom dt-pager">
        <span>
          {rows.length === 0 ? <>Showing <strong>0</strong></> : <>Showing <strong>{first + 1}–{first + pageRows.length}</strong> of <strong>{rows.length}</strong></>}
          {" "}{itemLabel}{totalCount !== undefined && totalCount !== rows.length ? ` (filtered from ${totalCount})` : ""}
        </span>
        {footerExtra}
        <div className="dt-pager-controls">
          <label className="dt-page-size">
            Rows per page
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Rows per page">
              {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <nav className="dt-pages" aria-label="Pages">
            <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={15} /></button>
            {pageList(current, pages).map((number, index) => (number === "…"
              ? <span key={`gap-${index}`} className="dt-gap">…</span>
              : <button type="button" key={number} className={number === current ? "active" : ""} aria-current={number === current ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>))}
            <button type="button" onClick={() => setPage(current + 1)} disabled={current === pages} aria-label="Next page"><ChevronRight size={15} /></button>
          </nav>
        </div>
      </div>
      {confirmDialog}
    </div>
  );
}

function ReportsPage() {
  const { call } = useApi();
  const [category, setCategory] = useState("All reports");
  const [reportQuery, setReportQuery] = useState("");
  const [activeReportId, setActiveReportId] = useState(null);
  const [reportRows, setReportRows] = useState({});
  const [loadStatus, setLoadStatus] = useState("loading");
  const loadReports = useCallback(() => {
    setLoadStatus("loading");
    Promise.all(reportDefinitions.map((report) => call(`/reports/${report.id}`).then((data) => [report.id, data.rows])))
      .then((entries) => {
        setReportRows(Object.fromEntries(entries));
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  }, [call]);
  useEffect(() => {
    loadReports();
  }, [loadReports]);
  const reports = reportDefinitions.map((report) => ({ ...report, rows: reportRows[report.id] || [] }));
  const activeReport = reports.find((report) => report.id === activeReportId);
  const categories = ["All reports", "Finance", "Inventory", "Customers", "Operations"];
  const rowsOf = (id) => reportRows[id] || [];
  const revenue = rowsOf("finance").filter((row) => row.status === "Paid").reduce((sum, row) => sum + row.amount, 0);
  const tithe = rowsOf("finance").filter((row) => row.status === "Paid").reduce((sum, row) => sum + (row.tithe || 0), 0);
  const completed = rowsOf("sales").filter((row) => row.status === "Completed").length;
  const stock = rowsOf("inventory").reduce((sum, row) => sum + row.quantity, 0);
  const out = rowsOf("inventory").reduce((sum, row) => sum + row.rented, 0);
  const activeCustomers = rowsOf("customers").filter((row) => row.status === "Active").length;
  const visibleReports = reports.filter((report) => {
    const matchesCategory = category === "All reports" || report.tag.toLowerCase() === category.toLowerCase();
    const matchesQuery = `${report.title} ${report.desc} ${report.tag}`.toLowerCase().includes(reportQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  function openReport(id) {
    setActiveReportId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (activeReport) {
    return (
      <ReportDetail
        key={activeReport.id}
        report={activeReport}
        onBack={() => setActiveReportId(null)}
        onSwitch={openReport}
      />
    );
  }

  return (
    <>
      <section className="report-performance">
        <div className="report-performance-heading">
          <div>
            <span className="panel-kicker">PERFORMANCE OVERVIEW</span>
            <h2>Business at a glance</h2>
            <p>All-time numbers from your live data. Open a report to filter by period.</p>
          </div>
          <button className="button button-secondary" onClick={loadReports} disabled={loadStatus === "loading"}><RotateCcw size={14} /> Refresh</button>
        </div>
        <div className="report-summary-stats">
          <article>
            <span>Total revenue</span>
            <strong>{loadStatus === "ready" ? formatShillings(revenue) : "…"}</strong>
            <small className="positive-text">{formatShillings(tithe)} set aside as tithe</small>
          </article>
          <article>
            <span>Orders completed</span>
            <strong>{loadStatus === "ready" ? completed : "…"}</strong>
            <small>{rowsOf("sales").length} orders in total</small>
          </article>
          <article>
            <span>Utilization today</span>
            <strong>{loadStatus === "ready" ? `${stock ? Math.round((out / stock) * 100) : 0}%` : "…"}</strong>
            <small>{out.toLocaleString("en-US")} of {stock.toLocaleString("en-US")} units out</small>
          </article>
          <article>
            <span>Active customers</span>
            <strong>{loadStatus === "ready" ? activeCustomers : "…"}</strong>
            <small>{rowsOf("customers").length} registered</small>
          </article>
        </div>
        {loadStatus === "error" && <p className="set-notice ws-banner"><CircleAlert size={14} /> Couldn’t load report data. <button className="auth-link" onClick={loadReports}>Try again</button></p>}
      </section>
      <section className="report-library panel">
        <div className="report-library-heading">
          <div>
            <span className="panel-kicker">REPORT LIBRARY</span>
            <h2>Explore reports <span className="heading-count">{visibleReports.length}</span></h2>
          </div>
          <label className="report-search">
            <Search size={14} />
            <input
              type="search"
              value={reportQuery}
              onChange={(event) => setReportQuery(event.target.value)}
              placeholder="Search reports"
              aria-label="Search reports"
            />
          </label>
        </div>
        <div className="report-category-tabs" role="tablist" aria-label="Report categories">
          {categories.map((option) => (
            <button
              key={option}
              role="tab"
              aria-selected={category === option}
              className={category === option ? "active" : ""}
              onClick={() => setCategory(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {visibleReports.length > 0 ? (
          <div className="report-grid">
            {visibleReports.map((report) => {
              const Icon = report.icon;
              const headline = report.metrics(report.rows)[0];
              return (
                <article className="panel report-card" key={report.id}>
                  <div className="report-card-top">
                    <span className="template-icon"><Icon size={17} /></span>
                    <span className="report-tag">{report.tag}</span>
                  </div>
                  <h3>{report.title}</h3>
                  <p>{report.desc}</p>
                  <div className="report-card-stat">
                    <span>{headline.label}</span>
                    <strong>{headline.value}</strong>
                  </div>
                  <div className="report-card-actions">
                    <button className="text-action" onClick={() => openReport(report.id)}>
                      Open report <ArrowRight size={14} />
                    </button>
                    {report.receipts && (
                      <span className="report-card-badge"><Printer size={11} /> Receipts</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No reports match your search.</div>
        )}
      </section>
    </>
  );
}

function ReportDetail({ report, onBack, onSwitch }) {
  const emptySelections = Object.fromEntries(report.filters.map((filter) => [filter.key, "All"]));
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
  // Monthly reports open on this month; changing any filter shows the filtered records instead.
  const defaultPeriod = report.monthlyCards ? "This month" : "All time";
  const [period, setPeriod] = useState(defaultPeriod);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [selections, setSelections] = useState(emptySelections);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sort, setSort] = useState({ key: report.dateKey || report.amountKey, dir: "desc" });
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [moreCards, setMoreCards] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const columnStore = `pendo-report-columns-${report.id}`;
  const defaultColumns = report.columns.filter((column) => !column.hidden).map((column) => column.key);
  // Chosen columns are remembered on this device for each report.
  const [shownKeys, setShownKeys] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(columnStore) || "null");
      const known = Array.isArray(stored) ? stored.filter((key) => report.columns.some((column) => column.key === key)) : [];
      return known.length ? known : defaultColumns;
    } catch {
      return defaultColumns;
    }
  });
  const columns = report.columns.filter((column) => shownKeys.includes(column.key));
  const plainMoney = (column) => report.currencyInHeader && column.type === "money";
  const heading = (column) => (plainMoney(column) ? `${column.label} (TSh)` : column.label);
  const cellText = (value, column) => (plainMoney(column)
    ? Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : formatReportValue(value, column.type));
  function chooseColumns(keys) {
    setShownKeys(keys);
    try { localStorage.setItem(columnStore, JSON.stringify(keys)); } catch { /* storage unavailable */ }
  }
  const toggleColumn = (key) => {
    if (shownKeys.includes(key)) {
      if (shownKeys.length > 1) chooseColumns(shownKeys.filter((entry) => entry !== key));
    } else {
      chooseColumns(report.columns.map((column) => column.key).filter((entry) => entry === key || shownKeys.includes(entry)));
    }
  };
  const Icon = report.icon;

  useEffect(() => {
    if (!columnsOpen) return undefined;
    const close = (event) => {
      if (!event.target.closest(".report-columns-wrap")) setColumnsOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [columnsOpen]);

  useEffect(() => {
    if (!exportOpen) return undefined;
    const close = (event) => {
      if (!event.target.closest(".report-export-wrap")) setExportOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [exportOpen]);

  const [from, to] = getPeriodRange(period, customFrom, customTo);
  // Reports without a date per row (e.g. items) recount their figures for the chosen period instead.
  const hasPeriod = Boolean(report.dateKey || report.periodRows);
  const baseRows = report.periodRows ? report.periodRows(report.rows, from, to) : report.rows;
  const filterOptions = Object.fromEntries(
    report.filters.map((filter) => [filter.key, [...new Set(report.rows.map((row) => row[filter.key]))].sort()]),
  );
  const filteredRows = baseRows.filter((row) => {
    const text = report.searchKeys.map((key) => row[key]).join(" ").toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (report.dateKey && from && row[report.dateKey] < from) return false;
    if (report.dateKey && to && row[report.dateKey] > to) return false;
    if (report.filters.some((filter) => selections[filter.key] !== "All" && row[filter.key] !== selections[filter.key])) return false;
    if (minAmount !== "" && Number(row[report.amountKey]) < Number(minAmount)) return false;
    if (maxAmount !== "" && Number(row[report.amountKey]) > Number(maxAmount)) return false;
    return true;
  });
  const sortedRows = [...filteredRows].sort((a, b) => {
    const left = a[sort.key];
    const right = b[sort.key];
    const result = typeof left === "number" && typeof right === "number"
      ? left - right
      : String(left).localeCompare(String(right));
    return sort.dir === "asc" ? result : -result;
  });

  const activeFilters = [
    query && `Search: “${query}”`,
    hasPeriod && period !== defaultPeriod && (period === "Custom range"
      ? `${report.dateLabel || "Date"}: ${from ? formatReportDate(from) : "start"} – ${to ? formatReportDate(to) : "today"}`
      : `${report.dateLabel || "Period"}: ${period}`),
    ...report.filters.filter((filter) => selections[filter.key] !== "All").map((filter) => `${filter.label}: ${selections[filter.key]}`),
    minAmount !== "" && `Min ${report.amountLabel.toLowerCase()}: ${formatTSh(minAmount)}`,
    maxAmount !== "" && `Max ${report.amountLabel.toLowerCase()}: ${formatTSh(maxAmount)}`,
  ].filter(Boolean);

  function clearFilters() {
    setQuery("");
    setPeriod(defaultPeriod);
    setCustomFrom("");
    setCustomTo("");
    setSelections(emptySelections);
    setMinAmount("");
    setMaxAmount("");
  }

  function toggleSort(key) {
    setSort((current) => ({ key, dir: current.key === key && current.dir === "desc" ? "asc" : "desc" }));
  }

  // With no filters, monthly reports show this month vs last month on the cards.
  const monthlyView = report.monthlyCards && report.dateKey && activeFilters.length === 0 && period === defaultPeriod;
  const today = localTodayIso();
  const monthStart = `${today.slice(0, 7)}-01`;
  const lastMonthEnd = shiftIsoDate(monthStart, -1);
  const lastMonthStart = `${lastMonthEnd.slice(0, 7)}-01`;
  const inRange = (row, start, end) => String(row[report.dateKey]).slice(0, 10) >= start && String(row[report.dateKey]).slice(0, 10) <= end;
  const monthName = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { month: "long" });
  const cardMetrics = monthlyView
    ? report.metrics(report.rows.filter((row) => inRange(row, monthStart, today)), report.rows.filter((row) => inRange(row, lastMonthStart, lastMonthEnd)))
    : report.metrics(sortedRows);
  const cardScope = monthlyView
    ? { title: `This month · ${monthName(monthStart)}`, detail: `Cards and table show 1–${Number(today.slice(8, 10))} ${monthName(monthStart)}, compared with ${monthName(lastMonthStart)}. Change any filter to see other records.` }
    : { title: "Filtered records", detail: `${sortedRows.length} record${sortedRows.length === 1 ? "" : "s"} matching your filters` };
  function compareMonths(metric) {
    if (!monthlyView || metric.current === undefined || metric.previous === undefined) return null;
    const { current, previous } = metric;
    const last = `${monthName(lastMonthStart).slice(0, 3)}: ${(metric.format || String)(previous)}`;
    if (previous === current) return { badge: "Same", last, tone: "flat" };
    if (previous === 0) return { badge: "New", last, tone: metric.lowerIsBetter ? "down" : "up" };
    const percent = Math.round(((current - previous) / Math.abs(previous)) * 100);
    const better = metric.lowerIsBetter ? current < previous : current > previous;
    return { badge: percent === 0 ? "≈ 0%" : `${percent > 0 ? "▲" : "▼"} ${Math.abs(percent)}%`, last, tone: better ? "up" : "down" };
  }

  // The table is paged; totals, exports and printing still cover every matching record.
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = sortedRows.slice(pageStart, pageStart + pageSize);
  const filterKey = JSON.stringify([query, period, customFrom, customTo, selections, minAmount, maxAmount, sort]);
  useEffect(() => { setPage(1); }, [filterKey]);

  const totalsRow = columns.map((column, index) => {
    if (column.total) return cellText(sumBy(sortedRows, column.key), column);
    return index === 0 ? `Total (${sortedRows.length})` : "";
  });

  async function exportReport(format) {
    setExporting(format);
    setExportError("");
    try {
      await downloadTableReport(
        report.title,
        columns.map(heading),
        sortedRows.map((row) => columns.map((column) => cellText(row[column.key], column))),
        format,
        {
          subtitle: `${activeFilters.length ? activeFilters.join(" · ") : "All records"} · ${sortedRows.length} rows · Generated ${new Date().toLocaleString("en-US")}`,
          footer: totalsRow,
        },
      );
      setExportOpen(false);
    } catch {
      setExportError("Export failed. Please try again.");
    } finally {
      setExporting("");
    }
  }

  return (
    <>
      <section className="report-detail-header panel">
        <div className="report-detail-title">
          <button className="report-back" onClick={onBack} aria-label="Back to all reports">
            <ArrowLeft size={15} />
          </button>
          <span className="template-icon"><Icon size={17} /></span>
          <div>
            <span className="panel-kicker">{report.tag} REPORT</span>
            <h2>{report.title}</h2>
            <p>{report.desc}</p>
          </div>
        </div>
        <div className="report-detail-actions">
          <label className="report-switcher">
            <span className="sr-only">Switch report</span>
            <select value={report.id} onChange={(event) => onSwitch(event.target.value)} aria-label="Switch report">
              {reportDefinitions.map((option) => (
                <option key={option.id} value={option.id}>{option.title}</option>
              ))}
            </select>
          </label>
          <div className="message-tabs report-view-toggle" role="tablist" aria-label="Report view">
            {[["table", "Table", Table2], ["analytics", "Analytics", ChartColumnBig]].map(([value, label, ViewIcon]) => (
              <button
                key={value}
                role="tab"
                aria-selected={view === value}
                className={view === value ? "active" : ""}
                onClick={() => setView(value)}
              >
                <ViewIcon size={13} /> {label}
              </button>
            ))}
          </div>
          <div className="report-columns-wrap">
            <button className="button button-secondary" onClick={() => setColumnsOpen((open) => !open)} aria-expanded={columnsOpen} aria-haspopup="true">
              <Table2 size={15} /> Columns <span className="report-columns-count">{columns.length}/{report.columns.length}</span> <ChevronDown size={13} />
            </button>
            {columnsOpen && (
              <div className="report-columns-menu" role="group" aria-label="Choose columns">
                <header><strong>Show columns</strong><small>Tick to add, untick to hide</small></header>
                <div className="report-columns-list">
                  {report.columns.map((column) => (
                    <label key={column.key} className="report-column-option">
                      <input type="checkbox" checked={shownKeys.includes(column.key)} onChange={() => toggleColumn(column.key)} disabled={shownKeys.length === 1 && shownKeys.includes(column.key)} />
                      <span>{column.label.charAt(0) + column.label.slice(1).toLowerCase()}</span>
                      {column.hidden && <em>Extra</em>}
                    </label>
                  ))}
                </div>
                <footer>
                  <button type="button" onClick={() => chooseColumns(report.columns.map((column) => column.key))}>Show all</button>
                  <button type="button" onClick={() => chooseColumns(defaultColumns)}>Reset</button>
                </footer>
              </div>
            )}
          </div>
          {report.receipts && (
            <button
              className="button button-secondary"
              onClick={() => printReceipts(sortedRows)}
              disabled={sortedRows.length === 0}
            >
              <Printer size={15} /> Print receipts ({sortedRows.length})
            </button>
          )}
          <div className="report-export-wrap">
            <button
              className="button button-primary"
              onClick={() => setExportOpen((open) => !open)}
              aria-expanded={exportOpen}
              disabled={sortedRows.length === 0}
            >
              <Download size={15} /> Export <ChevronDown size={13} />
            </button>
            {exportOpen && (
              <div className="report-export-menu" role="menu">
                <button role="menuitem" onClick={() => exportReport("excel")} disabled={Boolean(exporting)}>
                  <FileSpreadsheet size={16} />
                  <span><strong>{exporting === "excel" ? "Preparing…" : "Excel workbook"}</strong><small>.xlsx · {sortedRows.length} rows with totals</small></span>
                </button>
                <button role="menuitem" onClick={() => exportReport("pdf")} disabled={Boolean(exporting)}>
                  <FileText size={16} />
                  <span><strong>{exporting === "pdf" ? "Preparing…" : "PDF document"}</strong><small>Print-ready, filters noted</small></span>
                </button>
                {exportError && <p className="export-error" role="alert">{exportError}</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={`report-filter-panel panel report-filters-${report.id}`} aria-label="Report filters">
        <div className="report-filter-row">
          <label className="report-search report-filter-search">
            <Search size={14} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${report.searchKeys.join(", ")}`}
              aria-label="Search report"
            />
          </label>
          {hasPeriod && (
            <label className="report-filter-field">
              <span>{report.dateLabel || "Period"}</span>
              <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                {reportPeriods.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          )}
          {hasPeriod && period === "Custom range" && (
            <>
              <label className="report-filter-field">
                <span>From</span>
                <input type="date" value={customFrom} max={customTo || undefined} onChange={(event) => setCustomFrom(event.target.value)} />
              </label>
              <label className="report-filter-field">
                <span>To</span>
                <input type="date" value={customTo} min={customFrom || undefined} onChange={(event) => setCustomTo(event.target.value)} />
              </label>
            </>
          )}
          {report.filters.map((filter) => (
            <label className="report-filter-field" key={filter.key}>
              <span>{filter.label}</span>
              <select
                value={selections[filter.key]}
                onChange={(event) => setSelections((current) => ({ ...current, [filter.key]: event.target.value }))}
              >
                <option value="All">All</option>
                {filterOptions[filter.key].map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          ))}
          <label className="report-filter-field report-filter-amount">
            <span>{report.amountLabel} (TSh)</span>
            <span className="report-amount-range">
              <input type="number" min="0" inputMode="decimal" placeholder="Min" value={minAmount} onChange={(event) => setMinAmount(event.target.value)} aria-label={`Minimum ${report.amountLabel}`} />
              <i>–</i>
              <input type="number" min="0" inputMode="decimal" placeholder="Max" value={maxAmount} onChange={(event) => setMaxAmount(event.target.value)} aria-label={`Maximum ${report.amountLabel}`} />
            </span>
          </label>
        </div>
        <div className="report-filter-status">
          <span className="report-result-count">
            <ListFilter size={13} /> Showing <strong>{sortedRows.length}</strong> of {report.rows.length} records
          </span>
          {activeFilters.map((label) => <span className="report-chip" key={label}>{label}</span>)}
          {activeFilters.length > 0 && (
            <button className="report-clear" onClick={clearFilters}>
              <RotateCcw size={12} /> Clear all
            </button>
          )}
        </div>
      </section>

      <section className={`report-kpis ${cardMetrics.length > 4 ? "report-kpis-wide" : ""}`} aria-label={cardScope.title}>
        {report.monthlyCards && (
          <header className="report-kpis-scope">
            <strong>{cardScope.title}</strong>
            <small>{cardScope.detail}</small>
          </header>
        )}
        {(moreCards ? cardMetrics : cardMetrics.slice(0, 4)).map((metric) => {
          const change = compareMonths(metric);
          return (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <strong className={metric.tone === "negative" && metric.label === "Net" ? "negative-text" : ""}>{metric.value}</strong>
              <small className={metric.tone === "negative" && metric.label !== "Net" ? "negative-text" : ""}>{metric.hint}</small>
              {change && <span className="report-kpi-compare"><em className={`report-kpi-change ${change.tone}`}>{change.badge}</em><i>{change.last}</i></span>}
            </article>
          );
        })}
        {cardMetrics.length > 4 && (
          <button type="button" className="report-kpis-more" onClick={() => setMoreCards((open) => !open)} aria-expanded={moreCards}>
            {moreCards ? <>Show less <ChevronDown size={13} className="flip" /></> : <>View more analytics ({cardMetrics.length - 4}) <ChevronDown size={13} /></>}
          </button>
        )}
      </section>

      {view === "table" ? (
        <section className="panel report-table-panel">
          <div className="table-scroll">
            <table className={`data-table report-table report-table-${report.id}`}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className={["money", "number", "km", "percent"].includes(column.type) ? "numeric" : ""}>
                      <button className="report-sort" onClick={() => toggleSort(column.key)} aria-label={`Sort by ${column.label.toLowerCase()}`}>
                        {heading(column)}
                        {sort.key === column.key
                          ? sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                          : <ArrowUpDown size={11} className="report-sort-idle" />}
                      </button>
                    </th>
                  ))}
                  {report.receipts && <th className="report-receipt-head">RECEIPT</th>}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row[report.rowKey]}>
                    {columns.map((column) => (
                      <td key={column.key} className={["money", "number", "km", "percent"].includes(column.type) ? "numeric" : ""}>
                        {column.type === "status" ? (
                          <span className={`status-pill ${statusTones[row[column.key]] || "blue"}`}><i />{row[column.key]}</span>
                        ) : column.type === "money" ? (
                          <strong className="table-primary">{cellText(row[column.key], column)}</strong>
                        ) : column.type === "percent" ? (
                          <span className={`report-meter ${row[column.key] > 100 ? "over" : ""}`} title={row[column.key] > 100 ? "More units booked than in stock" : undefined}><span><i style={{ width: `${Math.min(100, row[column.key])}%` }} /></span>{row[column.key]}%</span>
                        ) : column.type === "id" ? (
                          <span className="report-id">{row[column.key]}</span>
                        ) : (
                          formatReportValue(row[column.key], column.type)
                        )}
                      </td>
                    ))}
                    {report.receipts && (
                      <td className="report-receipt-cell">
                        <button className="report-receipt-button" onClick={() => setReceipt(row)} aria-label={`View receipt ${row.receipt}`}>
                          <Receipt size={13} /> View
                        </button>
                        <button className="report-icon-button" onClick={() => printReceipts([row])} aria-label={`Print receipt ${row.receipt}`} title="Print receipt">
                          <Printer size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {sortedRows.length > 0 && (
                <tfoot>
                  <tr>
                    {totalsRow.map((value, index) => (
                      <td key={columns[index].key} className={columns[index].total ? "numeric" : ""}>{value}</td>
                    ))}
                    {report.receipts && <td />}
                  </tr>
                </tfoot>
              )}
            </table>
            {sortedRows.length === 0 && (
              <div className="empty-state report-empty">
                No records match these filters.
                <button className="text-action" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </div>
          {sortedRows.length > 0 && (
            <div className="table-bottom dt-pager report-pager">
              <span>Showing <strong>{pageStart + 1}–{pageStart + pageRows.length}</strong> of <strong>{sortedRows.length}</strong> records · totals cover all {sortedRows.length}</span>
              <div className="dt-pager-controls">
                <label className="dt-page-size">
                  Rows per page
                  <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} aria-label="Rows per page">
                    {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                </label>
                <nav className="dt-pages" aria-label="Report pages">
                  <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"><ChevronLeft size={15} /></button>
                  {pageList(currentPage, pageCount).map((number, index) => (number === "…"
                    ? <span key={`gap-${index}`} className="dt-gap">…</span>
                    : <button type="button" key={number} className={number === currentPage ? "active" : ""} aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>))}
                  <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount} aria-label="Next page"><ChevronRight size={15} /></button>
                </nav>
              </div>
            </div>
          )}
        </section>
      ) : (
        <ReportAnalytics report={report} rows={sortedRows} onClear={clearFilters} />
      )}

      {receipt && <ReceiptPreview payment={receipt} onClose={() => setReceipt(null)} />}
    </>
  );
}

function ReportAnalytics({ report, rows, onClear }) {
  if (rows.length === 0) {
    return (
      <section className="panel empty-state report-empty">
        No data to chart for these filters.
        <button className="text-action" onClick={onClear}>Clear filters</button>
      </section>
    );
  }
  const trend = report.dateKey
    ? groupTotals(rows, report.dateKey, report.amountKey).sort((a, b) => a.label.localeCompare(b.label))
    : groupTotals(rows, report.labelKey, report.amountKey);
  const peak = Math.max(...trend.map((entry) => entry.value), 1);
  const total = sumBy(rows, report.amountKey);

  return (
    <section className="report-analytics">
      <article className="panel report-chart-card">
        <div className="report-chart-heading">
          <div>
            <span className="panel-kicker">{report.dateKey ? "TREND" : "PER ITEM"}</span>
            <h3>{report.amountLabel} {report.dateKey ? `by ${(report.dateLabel || "date").toLowerCase()}` : "by item"}</h3>
          </div>
          <strong>{formatTSh(total)}</strong>
        </div>
        <div className="report-bars" role="img" aria-label={`${report.amountLabel} chart`}>
          {trend.map((entry) => (
            <div className="report-bar" key={entry.label} title={`${report.dateKey ? formatReportDate(entry.label) : entry.label}: ${formatTSh(entry.value)}`}>
              <span className="report-bar-value">{Math.round(entry.value).toLocaleString("en-US")}</span>
              <div className="report-bar-track">
                <i style={{ height: `${Math.max((entry.value / peak) * 100, 2)}%` }} className={entry.value === peak ? "peak" : ""} />
              </div>
              <span className="report-bar-label">
                {report.dateKey
                  ? new Date(`${entry.label}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : entry.label.split(" ").slice(-1)[0]}
              </span>
            </div>
          ))}
        </div>
      </article>
      <div className="report-breakdowns">
        {report.groupBy.map((group) => {
          const entries = groupTotals(rows, group.key, report.amountKey).slice(0, 6);
          return (
            <article className="panel report-breakdown" key={group.key}>
              <h3>{group.label}</h3>
              <ul>
                {entries.map((entry) => {
                  const share = total ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <li key={entry.label}>
                      <div>
                        <span>{entry.label} <small>· {entry.count}</small></span>
                        <strong>{formatTSh(entry.value)}</strong>
                      </div>
                      <span className="report-share">
                        <i style={{ width: `${share}%` }} />
                      </span>
                      <small className="report-share-label">{share}%</small>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReceiptPreview({ payment, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const tone = statusTones[payment.status] || "green";
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="modal receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">PAYMENT RECEIPT</span>
            <h2 id="receipt-title">{payment.receipt}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        <div className="receipt-sheet">
          <div className="receipt-sheet-head">
            <div>
              <strong className="receipt-wordmark">Pendo<span>rentals</span></strong>
              <small>{BUSINESS_INFO.workspace} · {BUSINESS_INFO.address}</small>
              <small>{BUSINESS_INFO.phone} · {BUSINESS_INFO.email}</small>
            </div>
            <span className={`receipt-stamp ${tone}`}>{payment.status}</span>
          </div>
          <dl className="receipt-fields">
            <div><dt>Received from</dt><dd>{payment.customer}</dd></div>
            <div><dt>Phone</dt><dd>{payment.phone}</dd></div>
            <div><dt>Date</dt><dd>{formatReportDate(payment.date)}</dd></div>
            <div><dt>Payment method</dt><dd>{payment.method}</dd></div>
            <div><dt>Order</dt><dd>{payment.reference}</dd></div>
            <div><dt>Invoice</dt><dd>{payment.invoice}</dd></div>
            <div><dt>Received by</dt><dd>{payment.cashier}</dd></div>
            <div><dt>Receipt no.</dt><dd>{payment.receipt}</dd></div>
          </dl>
          <div className="receipt-total">
            <span>Amount {payment.status === "Refunded" ? "refunded" : "received"}</span>
            <strong>{formatTSh(payment.amount)}</strong>
          </div>
          <p className="receipt-note">Thank you for renting with Pendo. Please keep this receipt for your records.</p>
        </div>
        <div className="modal-actions receipt-actions">
          <button
            className="button button-secondary"
            disabled={downloading}
            onClick={async () => {
              setDownloading(true);
              try {
                await downloadReceiptPdf(payment);
              } finally {
                setDownloading(false);
              }
            }}
          >
            <FileText size={15} /> {downloading ? "Preparing…" : "Download PDF"}
          </button>
          <button className="button button-primary" onClick={() => printReceipts([payment])}>
            <Printer size={15} /> Print receipt
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

const TEAM_ROLES = [
  {
    name: "Admin",
    tone: "blue",
    desc: "Full access, including finance, settings and team management.",
    access: ["Dashboard", "Orders", "Inventory", "Customers", "Invoices", "Finance & receipts", "Reports", "Users & roles", "Settings"],
  },
  {
    name: "Store manager",
    tone: "purple",
    desc: "Runs daily operations, bookings and customer payments.",
    access: ["Dashboard", "Orders", "Inventory", "Customers", "Invoices", "Finance & receipts", "Reports"],
  },
  {
    name: "Inventory staff",
    tone: "green",
    desc: "Keeps tents, chairs and equipment ready and in stock.",
    access: ["Dashboard", "Orders", "Inventory"],
  },
  {
    name: "Delivery staff",
    tone: "amber",
    desc: "Delivers and collects rentals; sees today’s orders.",
    access: ["Dashboard", "Orders"],
  },
  {
    name: "Customer",
    tone: "pink",
    customer: true,
    desc: "People who rent from Pendo. They sign up themselves and only see their own bookings and payments.",
    access: ["Browse rentals", "Book & request quotes", "My bookings", "My receipts & invoices", "Payment history", "My profile"],
  },
];

const STAFF_ROLES = TEAM_ROLES.filter((role) => !role.customer);

const ALL_PERMISSIONS = ["Dashboard", "Orders", "Inventory", "Customers", "Invoices", "Finance & receipts", "Reports", "Users & roles", "Settings"];
const CUSTOMER_PERMISSIONS = ["Browse rentals", "Book & request quotes", "My bookings", "My receipts & invoices", "Payment history", "My profile", "Other customers’ data", "Staff workspace"];


const memberTones = { Active: "green", Invited: "amber", Inactive: "red" };

function InviteMemberModal({ onClose, onInvite, existingPhones }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", role: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "Enter a first name.";
  if (!form.lastName.trim()) errors.lastName = "Enter a last name.";
  const phone = normalizePhone(form.phone);
  if (!/^0[67]\d{8}$/.test(phone)) errors.phone = "Enter a valid phone number.";
  else if (existingPhones.includes(phone)) errors.phone = "This number is already on the team.";
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email or leave it empty.";
  if (!form.role) errors.role = "Choose a role.";
  const show = (key) => submitted && errors[key] ? <small className="set-error"><CircleAlert size={12} /> {errors[key]}</small> : null;
  const bind = (key) => ({
    value: form[key],
    onChange: (event) => setForm((current) => ({ ...current, [key]: event.target.value })),
    "aria-invalid": Boolean(submitted && errors[key]),
  });
  const selectedRole = TEAM_ROLES.find((role) => role.name === form.role);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal team-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">TEAM ACCESS</span>
            <h2 id="invite-title">Invite team member</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </div>
        <form
          className="team-form"
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitted(true);
            if (Object.keys(errors).length || sending) return;
            setSending(true);
            setSendError("");
            try {
              await onInvite({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone, role: form.role });
            } catch (inviteError) {
              setSendError(inviteError.message);
              setSending(false);
            }
          }}
        >
          <div className="set-grid">
            <label className="set-field"><span>First name</span><input {...bind("firstName")} autoFocus />{show("firstName")}</label>
            <label className="set-field"><span>Last name</span><input {...bind("lastName")} />{show("lastName")}</label>
            <label className="set-field"><span>Phone number</span><input {...bind("phone")} inputMode="tel" placeholder="e.g. 0712 345 678" />{show("phone")}</label>
            <label className="set-field"><span>Email <em>Optional</em></span><input {...bind("email")} type="email" placeholder="name@example.com" />{show("email")}</label>
          </div>
          <div className="set-field">
            <span>Role</span>
            <div className="team-role-picker" role="radiogroup" aria-label="Role">
              {STAFF_ROLES.map((role) => (
                <button
                  key={role.name}
                  type="button"
                  role="radio"
                  aria-checked={form.role === role.name}
                  className={`team-role-option ${role.tone} ${form.role === role.name ? "selected" : ""}`}
                  onClick={() => setForm((current) => ({ ...current, role: role.name }))}
                >
                  <ShieldCheck size={14} />
                  <span><strong>{role.name}</strong><small>{role.access.length} areas</small></span>
                </button>
              ))}
            </div>
            {show("role")}
            {selectedRole && <small className="set-hint">{selectedRole.desc}</small>}
          </div>
          {sendError && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {sendError}</p>}
          <p className="team-form-note"><Info size={13} /> They’ll get an SMS invite on their phone to set a password. Customers create their own accounts from the Sign Up page.</p>
          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={sending}>{sending ? <><LoaderCircle size={14} className="auth-spin" /> Sending…</> : <><Send size={14} /> Send invite</>}</button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

function UsersPage({ query, session }) {
  const { call } = useApi();
  const teamRes = useResource("/team");
  const [credentials, setCredentials] = useState(null);
  const admin = session.staffRole === "Admin";
  const team = (teamRes.data?.team || []).map((member, index) => ({
    ...member,
    initials: `${member.firstName[0] || ""}${member.lastName[0] || ""}`.toUpperCase(),
    color: ["peach", "lilac", "mint", "blue"][index % 4],
    lastActive: member.status === "Invited"
      ? `Invite sent ${shortDate(member.createdAt)}`
      : member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never signed in",
  }));
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const text = `${query} ${search}`.trim().toLowerCase();
  const rows = team.filter((member) => {
    const haystack = `${member.name} ${member.email} ${member.phone} ${member.role}`.toLowerCase();
    return text.split(/\s+/).every((word) => haystack.includes(word))
      && (roleFilter === "All roles" || member.role === roleFilter)
      && (statusFilter === "All statuses" || member.status === statusFilter);
  });
  const count = (status) => team.filter((member) => member.status === status).length;
  async function update(member, changes, message) {
    try {
      const data = await call(`/team/${member.id}`, { method: "PATCH", body: changes });
      await teamRes.reload();
      if (data.temporaryPassword) setCredentials({ phone: data.member.phone, password: data.temporaryPassword });
      setToast(message + (data.sms ? (data.sms.status === "sent" ? " · SMS sent" : " · SMS not sent") : ""));
    } catch (error) {
      setToast(error.message);
    }
  }
  const activeRole = TEAM_ROLES.find((role) => role.name === selectedRole);
  const filtersActive = search || roleFilter !== "All roles" || statusFilter !== "All statuses";

  return (
    <>
      <PageSummary
        className="team-summary"
        items={[
          { icon: Users, label: "Team members", value: String(team.length), change: `${count("Active")} active`, kind: "up", color: "blue-icon", caption: "" },
          { icon: ShieldCheck, label: "Roles", value: String(TEAM_ROLES.length), change: `${STAFF_ROLES.length} staff · 1 customer`, kind: "up", color: "mint-icon", caption: "" },
          { icon: Clock3, label: "Pending invites", value: String(count("Invited")), change: count("Invited") ? "Awaiting sign-up" : "All accepted", kind: count("Invited") ? "down" : "up", color: "orange-icon", caption: "" },
          { icon: UserCog, label: "Inactive accounts", value: String(count("Inactive")), change: count("Inactive") ? "No access" : "None", kind: count("Inactive") ? "down" : "up", color: "purple-icon", caption: "" },
        ]}
      />

      <section className="panel workspace-table-panel team-panel">
        <div className="team-toolbar">
          <div>
            <div className="panel-kicker">TEAM ACCESS</div>
            <h2 className="toolbar-title">Team members <span className="heading-count">{rows.length}</span></h2>
          </div>
          <div className="team-toolbar-actions">
            <label className="report-search team-search">
              <Search size={14} />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone or email" aria-label="Search team" />
            </label>
            <select className="team-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role">
              {["All roles", ...STAFF_ROLES.map((role) => role.name)].map((option) => <option key={option}>{option}</option>)}
            </select>
            <select className="team-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
              {["All statuses", "Active", "Invited", "Inactive"].map((option) => <option key={option}>{option}</option>)}
            </select>
            {admin && (
              <button className="button button-primary" onClick={() => setInviteOpen(true)}>
                <Plus size={15} /> Invite user
              </button>
            )}
          </div>
        </div>
        <DataTable
          columns={[
            {
              key: "name",
              label: "TEAM MEMBER",
              render: (row) => (
                <div className="customer-cell">
                  <div className={`customer-avatar ${row.color}`}>{row.initials}</div>
                  <span>
                    <strong>{row.name}{row.id === session.id && <em className="team-you">You</em>}</strong>
                    <small>{row.email || "No email"}</small>
                  </span>
                </div>
              ),
            },
            { key: "phone", label: "PHONE", render: (row) => <span className="team-muted">{row.phone}</span> },
            {
              key: "role",
              label: "ROLE",
              render: (row) => {
                const role = TEAM_ROLES.find((item) => item.name === row.role);
                return <span className={`team-role-pill ${role?.tone || "blue"}`}><ShieldCheck size={11} /> {row.role}</span>;
              },
            },
            { key: "status", label: "STATUS", render: (row) => <span className={`status-pill ${memberTones[row.status]}`}><i />{row.status}</span> },
            { key: "lastActive", label: "LAST ACTIVE", render: (row) => <span className="team-muted">{row.lastActive}</span> },
          ]}
          rows={rows}
          itemLabel="team members"
          totalCount={team.length}
          footerExtra={filtersActive && (
            <button className="report-clear" onClick={() => { setSearch(""); setRoleFilter("All roles"); setStatusFilter("All statuses"); }}>
              <RotateCcw size={12} /> Clear filters
            </button>
          )}
          rowKey="id"
          renderActions={(row) => {
            if (row.id === session.id) return [{ label: "This is you", onClick: () => {} }];
            if (!admin) return [{ label: "Only an Admin can change team members", onClick: () => {} }];
            const first = row.firstName;
            return [
              ...STAFF_ROLES.filter((role) => role.name !== row.role).map((role) => ({
                label: `Make ${role.name}`,
                confirm: { title: `Make ${row.name} ${role.name}?`, message: `Their access will change to what a ${role.name} can see and do.`, confirmLabel: "Yes, change role" },
                onClick: () => update(row, { role: role.name }, `${first} is now ${role.name}`),
              })),
              { label: row.status === "Invited" ? "Resend invite (new password)" : "Reset password", confirm: { title: `Reset ${first}’s password?`, message: `A new password will be sent by SMS to ${row.phone}. The old one stops working.`, confirmLabel: "Yes, reset password" }, onClick: () => update(row, { resetPassword: true }, `New password sent to ${row.phone}`) },
              row.status === "Inactive"
                ? { label: "Reactivate", confirm: { title: `Reactivate ${row.name}?`, message: "They will be able to sign in again.", confirmLabel: "Yes, reactivate" }, onClick: () => update(row, { status: "Active" }, `${first} reactivated`) }
                : { label: "Deactivate", danger: true, confirm: { title: `Deactivate ${row.name}?`, message: "They will be signed out and can’t sign in until reactivated.", confirmLabel: "Yes, deactivate" }, onClick: () => update(row, { status: "Inactive" }, `${first} deactivated`) },
              { label: "Remove from team", danger: true, confirm: { title: `Remove ${row.name} from the team?`, message: "Their account will be deleted. This can’t be undone.", confirmLabel: "Yes, remove" }, onClick: async () => {
                try {
                  await call(`/team/${row.id}`, { method: "DELETE" });
                  await teamRes.reload();
                  setToast(`${row.name} removed`);
                } catch (error) {
                  setToast(error.message);
                }
              } },
            ];
          }}
        />
      </section>

      <section className="panel team-roles">
        <div className="team-roles-head">
          <div className="panel-kicker">ROLES & PERMISSIONS</div>
          <h2 className="toolbar-title">What each role can access</h2>
        </div>
        <div className="team-roles-body">
          <div className="team-role-list" role="tablist" aria-label="Roles">
            {TEAM_ROLES.map((role) => {
              const members = role.customer
                ? Array.from({ length: teamRes.data?.customerCount || 0 }, (_, index) => ({ id: `c${index}`, initials: "", color: "blue" }))
                : team.filter((member) => member.role === role.name);
              const noun = role.customer ? "customer" : "member";
              return (
                <button
                  key={role.name}
                  role="tab"
                  aria-selected={selectedRole === role.name}
                  className={`team-role-card ${role.tone} ${selectedRole === role.name ? "active" : ""}`}
                  onClick={() => setSelectedRole(role.name)}
                >
                  <span className="team-role-icon"><ShieldCheck size={16} /></span>
                  <span className="team-role-copy">
                    <strong>{role.name}</strong>
                    <small>{members.length} {noun}{members.length === 1 ? "" : "s"} · {role.access.length} areas</small>
                  </span>
                  <span className="team-role-avatars" aria-hidden="true">
                    {(role.customer ? [] : members).slice(0, 3).map((member) => <i key={member.id} className={member.color}>{member.initials}</i>)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="team-permissions" role="tabpanel" aria-label={`${activeRole.name} permissions`}>
            <div className="team-permissions-head">
              <span className={`team-role-pill ${activeRole.tone}`}><ShieldCheck size={11} /> {activeRole.name}</span>
              <p>{activeRole.desc}</p>
            </div>
            <ul>
              {(activeRole.customer ? CUSTOMER_PERMISSIONS : ALL_PERMISSIONS).map((permission) => {
                const allowed = activeRole.access.includes(permission);
                return (
                  <li key={permission} className={allowed ? "allowed" : ""}>
                    <span>{allowed ? <Check size={12} /> : <X size={12} />}</span>
                    {permission}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {inviteOpen && (
        <InviteMemberModal
          onClose={() => setInviteOpen(false)}
          existingPhones={team.map((member) => normalizePhone(member.phone))}
          onInvite={async (member) => {
            const data = await call("/team", { method: "POST", body: member });
            await teamRes.reload();
            setInviteOpen(false);
            if (data.temporaryPassword) setCredentials({ phone: data.member.phone, password: data.temporaryPassword });
            setToast(`${data.member.name} added${data.sms.status === "sent" ? " · invite sent by SMS" : " · SMS not sent"}`);
          }}
        />
      )}
      {credentials && (
        <WsModal title="Login details" kicker="TEAM ACCESS" onClose={() => setCredentials(null)}>
          <div className="team-form"><TempPasswordNote phone={credentials.phone} password={credentials.password} /><div className="modal-actions"><button className="button button-primary" onClick={() => setCredentials(null)}>Done</button></div></div>
        </WsModal>
      )}
      {toast && <div className="set-toast" role="status"><Check size={15} /> {toast}</div>}
    </>
  );
}


const DEFAULT_SETTINGS = {
  businessName: BUSINESS_INFO.name,
  tagline: "Rent · Celebrate · Grow",
  businessType: "Event & outdoor rentals",
  tin: "",
  phone: BUSINESS_INFO.phone,
  whatsapp: BUSINESS_INFO.phone,
  email: BUSINESS_INFO.email,
  address: "Kayenze",
  region: "Geita",
  weekdayOpen: "08:00",
  weekdayClose: "18:00",
  saturdayOpen: "09:00",
  saturdayClose: "16:00",
  sundayOpen: false,
  firstName: "Pendo",
  lastName: "Mbolela",
  accountEmail: "pendo@pendorentals.com",
  alertEmail: true,
  alertSms: true,
  alertNewBooking: true,
  alertPayment: true,
  alertLowStock: true,
  alertDailySummary: false,
  customerConfirm: true,
  customerReminders: true,
  reminderLead: "1 day before",
  customerDelivery: true,
  customerThanks: true,
  smsSender: "PENDO",
  minDays: "1",
  depositPercent: "30",
  advanceDays: "180",
  lateFee: "10000",
  gracePeriod: "2",
  damagePolicy: "Customers pay the repair or replacement cost for items returned damaged or missing.",
  freeCancelHours: "48",
  refundPercent: "50",
  deliveryFee: "15000",
  perKmFee: "1000",
  freeDeliveryArea: "Kayenze",
  payMpesa: true,
  payTigo: true,
  payAirtel: true,
  payCash: true,
  payBank: true,
  payCard: false,
  lipaNumber: "",
  lipaName: BUSINESS_INFO.name,
  bankName: "CRDB Bank",
  bankAccountName: BUSINESS_INFO.name,
  bankAccountNumber: "",
  vatEnabled: false,
  vatRate: "18",
  titheEnabled: true,
  tithePercent: "10",
  givingEnabled: false,
  givingPercent: "5",
  receiptPrefix: "RCT-",
  invoicePrefix: "INV-",
  receiptFooter: "Thank you for renting with Pendo. Please keep this receipt for your records.",
  paymentMethods: [],
};

const settingsSections = [
  { id: "profile", icon: Building2, title: "Business profile", desc: "Name, contacts and opening hours" },
  { id: "account", icon: UserCog, title: "Account & security", desc: "Your profile and password" },
  { id: "notifications", icon: Bell, title: "Notifications", desc: "Team alerts and customer SMS" },
  { id: "categories", icon: Layers, title: "Inventory categories", desc: "Categories and their dimensions" },
  { id: "areas", icon: MapPin, title: "Service areas", desc: "Areas used on orders and Rent Now" },
  { id: "policies", icon: ScrollText, title: "Rental policies", desc: "Deposits, fees and returns" },
  { id: "payments", icon: CreditCard, title: "Payments & receipts", desc: "Methods, tax and receipt format" },
  { id: "integrations", icon: Plug, title: "Integrations", desc: "SMS, M-Pesa and backups" },
];

function validateSettings(values) {
  const errors = {};
  if (!values.businessName.trim()) errors.businessName = "Business name is required.";
  if (!/^0[67]\d{8}$/.test(normalizePhone(values.phone))) errors.phone = "Enter a valid phone number, e.g. 0622 882 278.";
  if (values.whatsapp && !/^0[67]\d{8}$/.test(normalizePhone(values.whatsapp))) errors.whatsapp = "Enter a valid WhatsApp number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.accountEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.accountEmail.trim())) errors.accountEmail = "Enter a valid email address.";
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!/^[A-Za-z0-9 ]{3,11}$/.test(values.smsSender)) errors.smsSender = "3–11 letters or numbers.";
  if (Number(values.depositPercent) < 0 || Number(values.depositPercent) > 100) errors.depositPercent = "Between 0 and 100.";
  if (Number(values.refundPercent) < 0 || Number(values.refundPercent) > 100) errors.refundPercent = "Between 0 and 100.";
  if (values.vatEnabled && !(Number(values.vatRate) > 0 && Number(values.vatRate) <= 100)) errors.vatRate = "Enter a VAT rate.";
  if (values.titheEnabled && !(values.tithePercent !== "" && Number(values.tithePercent) > 0 && Number(values.tithePercent) <= 100)) errors.tithePercent = "Enter a percentage between 0.1 and 100.";
  if (values.givingEnabled && !(values.givingPercent !== "" && Number(values.givingPercent) > 0 && Number(values.givingPercent) <= 100)) errors.givingPercent = "Enter a percentage between 0.1 and 100.";
  const methods = values.paymentMethods || [];
  const names = methods.map((method) => method.name.trim().toLowerCase());
  if (methods.some((method) => method.name.trim().length < 2)) errors.paymentMethods = "Give every payment method a name.";
  else if (names.some((name, index) => names.indexOf(name) !== index)) errors.paymentMethods = "Two payment methods have the same name.";
  else if (methods.length && !methods.some((method) => method.enabled)) errors.paymentMethods = "Keep at least one payment method switched on.";
  return errors;
}

function SettingSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`set-switch ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <i />
    </button>
  );
}

function SettingsCard({ title, desc, children, aside }) {
  return (
    <section className="set-card">
      <header>
        <div>
          <h3>{title}</h3>
          {desc && <p>{desc}</p>}
        </div>
        {aside}
      </header>
      <div className="set-card-body">{children}</div>
    </section>
  );
}

function CategoryModal({ category, units, onClose, onSaved }) {
  const { call } = useApi();
  const [name, setName] = useState(category?.name || "");
  const [fields, setFields] = useState(() => (category?.dimensions || []).map((field, index) => ({ ...field, rowKey: `f${index}` })));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const updateField = (rowKey, changes) => setFields((current) => current.map((field) => (field.rowKey === rowKey ? { ...field, ...changes } : field)));

  async function save(event) {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Enter a category name.");
    if (fields.some((field) => !field.label.trim())) return setError("Give every dimension a name, or remove it.");
    setBusy(true);
    setError("");
    try {
      const body = { name: name.trim(), dimensions: fields.map(({ key, label, unit }) => ({ ...(key ? { key } : {}), label: label.trim(), unit })) };
      const data = category
        ? await call(`/inventory-categories/${category.id}`, { method: "PATCH", body })
        : await call("/inventory-categories", { method: "POST", body });
      onSaved(data.category, !category);
    } catch (saveError) {
      setError(saveError.message);
      setBusy(false);
    }
  }

  return (
    <WsModal title={category ? `Edit ${category.name}` : "New category"} kicker="INVENTORY CATEGORIES" onClose={onClose} busy={busy}>
      <form className="team-form" onSubmit={save} noValidate>
        <label className="set-field"><span>Category name</span><input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="e.g. Stages" autoFocus /></label>
        {category?.itemCount > 0 && name.trim() !== category.name && <p className="team-form-note"><Info size={13} /> {category.itemCount} item{category.itemCount === 1 ? "" : "s"} will move to the new name.</p>}
        <div className="set-field">
          <span>Dimension fields <em>Optional — shown when adding items in this category</em></span>
          <div className="cat-fields">
            {fields.length === 0 && <p className="team-muted">No dimensions. Items in this category will only have name, rate and quantity.</p>}
            {fields.map((field, index) => (
              <div className="cat-field-row" key={field.rowKey}>
                <input value={field.label} maxLength={30} placeholder="e.g. Length" onChange={(event) => updateField(field.rowKey, { label: event.target.value })} aria-label={`Dimension ${index + 1} name`} />
                <select value={field.unit} onChange={(event) => updateField(field.rowKey, { unit: event.target.value })} aria-label={`Dimension ${index + 1} unit`}>
                  <option value="">No unit</option>
                  {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
                <button type="button" className="inv-row-remove" onClick={() => setFields((current) => current.filter((entry) => entry.rowKey !== field.rowKey))} aria-label={`Remove dimension ${index + 1}`}><X size={14} /></button>
              </div>
            ))}
          </div>
          {fields.length < 8 && (
            <button type="button" className="inv-add-another" onClick={() => setFields((current) => [...current, { rowKey: `n${Date.now()}`, label: "", unit: "m" }])}><Plus size={14} /> Add dimension</button>
          )}
        </div>
        {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={busy}>{busy ? <><LoaderCircle size={15} className="auth-spin" /> Saving…</> : <><Save size={15} /> {category ? "Save category" : "Add category"}</>}</button>
        </div>
      </form>
    </WsModal>
  );
}

function AreaManager({ session }) {
  const { call } = useApi();
  const areas = useAreas();
  const [status, setStatus] = useState(areasCache ? "ready" : "loading");
  const [loadError, setLoadError] = useState("");
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();
  const [ask, confirmDialog] = useConfirm();
  const canManage = isManager(session);

  const load = useCallback(() => {
    setStatus("loading");
    refreshAreas().then(() => setStatus("ready")).catch((loadFailure) => { setLoadError(loadFailure.message); setStatus("error"); });
  }, []);
  useEffect(() => { load(); }, [load]);

  async function run(work, message) {
    setBusy(true);
    setError("");
    try {
      await work();
      await refreshAreas();
      setToast(message);
      return true;
    } catch (failure) {
      setError(failure.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add(event) {
    event.preventDefault();
    const name = newName.trim();
    if (name.length < 2) return setError("Enter an area name.");
    if (!(await ask({ title: `Add “${name}” as a service area?`, message: "It will appear on orders, customers and the Rent Now form.", confirmLabel: "Yes, add area" }))) return undefined;
    if (await run(() => call("/areas", { method: "POST", body: { name } }), `${name} added`)) setNewName("");
    return undefined;
  }

  async function rename(area) {
    const name = renaming.name.trim();
    if (name === area.name) return setRenaming(null);
    const used = area.customerCount + area.orderCount;
    if (!(await ask({ title: `Rename “${area.name}” to “${name}”?`, message: used ? `${area.customerCount} customer${area.customerCount === 1 ? "" : "s"} and ${area.orderCount} order${area.orderCount === 1 ? "" : "s"} will be updated to the new name.` : "Nothing uses this area yet.", confirmLabel: "Yes, rename" }))) return undefined;
    if (await run(() => call(`/areas/${area.id}`, { method: "PATCH", body: { name } }), `Renamed to ${name}`)) setRenaming(null);
    return undefined;
  }

  async function remove(area) {
    const used = area.customerCount + area.orderCount;
    if (!(await ask({ title: `Remove “${area.name}”?`, message: used ? `It leaves the list for new orders. ${area.customerCount} customer${area.customerCount === 1 ? "" : "s"} and ${area.orderCount} order${area.orderCount === 1 ? "" : "s"} keep it as their area.` : "It will no longer appear in area lists.", confirmLabel: "Yes, remove", danger: true }))) return;
    await run(() => call(`/areas/${area.id}`, { method: "DELETE" }), `${area.name} removed`);
  }

  return (
    <SettingsCard title="Service areas" desc="The places you deliver to and set up events. Used on orders, customers, Rent Now and free delivery.">
      {canManage && (
        <form className="area-add" onSubmit={add}>
          <label className="set-field">
            <span>New area</span>
            <input value={newName} maxLength={40} placeholder="e.g. Nyamalembo" onChange={(event) => { setNewName(event.target.value); setError(""); }} disabled={busy} />
          </label>
          <button type="submit" className="button button-primary" disabled={busy || !newName.trim()}><Plus size={14} /> Add area</button>
        </form>
      )}
      {error && <p className="inv-form-error" role="alert"><CircleAlert size={14} /> {error}</p>}
      <LoadState status={status} error={loadError} onRetry={load} empty={status === "ready" && areas.length === 0 ? "No areas yet" : ""} emptyIcon={MapPin} />
      <div className="cat-list">
        {areas.map((area) => (
          <div className="cat-row area-row" key={area.id}>
            <span className="set-row-icon"><MapPin size={15} /></span>
            {renaming?.id === area.id ? (
              <form className="area-rename" onSubmit={(event) => { event.preventDefault(); rename(area); }}>
                <input value={renaming.name} maxLength={40} autoFocus onChange={(event) => setRenaming({ ...renaming, name: event.target.value })} aria-label={`New name for ${area.name}`} disabled={busy} />
                <button type="submit" className="button button-primary" disabled={busy || renaming.name.trim().length < 2}>Save</button>
                <button type="button" className="button button-secondary" onClick={() => setRenaming(null)} disabled={busy}>Cancel</button>
              </form>
            ) : (
              <span className="set-row-copy">
                <strong>{area.name}</strong>
                <small>{area.customerCount} customer{area.customerCount === 1 ? "" : "s"} · {area.orderCount} order{area.orderCount === 1 ? "" : "s"}</small>
              </span>
            )}
            {canManage && renaming?.id !== area.id && (
              <span className="cat-actions">
                <button type="button" className="report-icon-button" onClick={() => { setRenaming({ id: area.id, name: area.name }); setError(""); }} aria-label={`Rename ${area.name}`} title="Rename" disabled={busy}><PencilLine size={13} /></button>
                <button type="button" className="report-icon-button cat-delete" onClick={() => remove(area)} aria-label={`Remove ${area.name}`} title="Remove" disabled={busy}><X size={13} /></button>
              </span>
            )}
          </div>
        ))}
        <div className="cat-row area-row area-builtin">
          <span className="set-row-icon"><MapPin size={15} /></span>
          <span className="set-row-copy"><strong>{OTHER_AREA}</strong><small>Always available — the customer types the place</small></span>
        </div>
      </div>
      {!canManage && <p className="team-muted">Only an Admin or Store manager can change areas.</p>}
      {confirmDialog}
      {toast}
    </SettingsCard>
  );
}

function CategoryManager({ session }) {
  const { call } = useApi();
  const resource = useResource("/inventory-categories");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useToast();
  const canManage = isManager(session);
  const categories = resource.data?.categories || [];

  return (
    <SettingsCard
      title="Inventory categories"
      desc="Used when adding items. Each category can have its own optional dimension fields."
      aside={canManage && <button type="button" className="button button-primary" onClick={() => setEditing("new")}><Plus size={14} /> New category</button>}
    >
      <LoadState status={resource.status} error={resource.error} onRetry={resource.reload} empty={resource.status === "ready" && categories.length === 0 ? "No categories yet" : ""} emptyIcon={Layers} />
      <div className="cat-list">
        {categories.map((category) => {
          const Icon = categoryIcons[category.name] || Package;
          return (
            <div className="cat-row" key={category.id}>
              <span className="set-row-icon"><Icon size={15} /></span>
              <span className="set-row-copy">
                <strong>{category.name}</strong>
                <small>{category.itemCount} item{category.itemCount === 1 ? "" : "s"}</small>
              </span>
              <span className="cat-chips">
                {category.dimensions.length === 0
                  ? <span className="cat-chip empty">No dimensions</span>
                  : category.dimensions.map((field) => <span className="cat-chip" key={field.key}>{field.label}{field.unit ? ` (${field.unit})` : ""}</span>)}
              </span>
              {canManage && (
                <span className="cat-actions">
                  <button type="button" className="report-icon-button" onClick={() => setEditing(category)} aria-label={`Edit ${category.name}`} title="Edit"><PencilLine size={13} /></button>
                  <button type="button" className="report-icon-button cat-delete" onClick={() => setDeleting(category)} aria-label={`Delete ${category.name}`} title={category.itemCount ? "In use — move its items first" : "Delete"} disabled={category.itemCount > 0}><X size={13} /></button>
                </span>
              )}
            </div>
          );
        })}
      </div>
      {!canManage && <p className="team-muted">Only an Admin or Store manager can change categories.</p>}
      {editing && (
        <CategoryModal
          category={editing === "new" ? null : editing}
          units={resource.data?.units || []}
          onClose={() => setEditing(null)}
          onSaved={(category, created) => {
            setEditing(null);
            resource.reload();
            setToast(`${category.name} ${created ? "added" : "saved"}`);
          }}
        />
      )}
      {deleting && (
        <InventoryConfirmDelete
          item={{ name: `the “${deleting.name}” category`, quantity: 0, sku: `${deleting.dimensions.length} dimension field${deleting.dimensions.length === 1 ? "" : "s"}` }}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await call(`/inventory-categories/${deleting.id}`, { method: "DELETE" });
            setDeleting(null);
            resource.reload();
            setToast(`${deleting.name} deleted`);
          }}
        />
      )}
      {toast}
    </SettingsCard>
  );
}

function PaymentMethodsEditor({ methods, onChange, error }) {
  const [ask, confirmDialog] = useConfirm();
  const update = (id, changes) => onChange(methods.map((method) => (method.id === id ? { ...method, ...changes } : method)));
  const move = (index, step) => {
    const next = [...methods];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  };
  const add = () => onChange([...methods, { id: `m${Date.now()}`, name: "", type: "mobile", provider: "", number: "", phone: "", payTo: "lipa", accountName: BUSINESS_INFO.name, enabled: true }]);
  async function remove(method) {
    if (!(await ask({ title: `Remove ${method.name || "this payment method"}?`, message: "It disappears from invoices and the payment form once you save. Past payments keep their method name.", confirmLabel: "Yes, remove", danger: true }))) return;
    onChange(methods.filter((entry) => entry.id !== method.id));
  }
  const numberLabel = (type) => ({ mobile: "Lipa Namba", bank: "Account number" }[type] || "Number / details");
  const icon = (type) => ({ mobile: Smartphone, bank: Landmark, cash: Banknote, card: CreditCard }[type] || Wallet);

  return (
    <SettingsCard
      title="Payment methods"
      desc="How customers can pay you. Switched-on methods appear on the payment form, on invoices under “How to pay” and in invoice SMS. Changes apply when you save."
      aside={<button type="button" className="button button-primary" onClick={add}><Plus size={14} /> Add method</button>}
    >
      <div className="pm-list">
        {methods.map((method, index) => {
          const Icon = icon(method.type);
          return (
            <div key={method.id} className={`pm-row ${method.enabled ? "" : "off"}`}>
              <div className="pm-head">
                <span className="set-row-icon"><Icon size={15} /></span>
                <input className="pm-name" value={method.name} maxLength={30} placeholder="Method name, e.g. HaloPesa" onChange={(event) => update(method.id, { name: event.target.value })} aria-label={`Payment method ${index + 1} name`} />
                <select value={method.type} onChange={(event) => update(method.id, { type: event.target.value })} aria-label={`${method.name || "Method"} type`}>
                  {PAYMENT_METHOD_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <span className="pm-tools">
                  <button type="button" className="report-icon-button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${method.name} up`} title="Move up"><ArrowUp size={13} /></button>
                  <button type="button" className="report-icon-button" onClick={() => move(index, 1)} disabled={index === methods.length - 1} aria-label={`Move ${method.name} down`} title="Move down"><ArrowDown size={13} /></button>
                  <button type="button" className="report-icon-button cat-delete" onClick={() => remove(method)} aria-label={`Remove ${method.name}`} title="Remove"><Trash2 size={13} /></button>
                  <SettingSwitch checked={method.enabled} onChange={(value) => update(method.id, { enabled: value })} label={`${method.name || "Method"} on or off`} />
                </span>
              </div>
              {method.type === "mobile" && (
                <div className="pm-payto" role="radiogroup" aria-label={`How customers pay with ${method.name || "this method"}`}>
                  <span>Customers pay by</span>
                  {[["lipa", "Lipa Namba"], ["phone", "Phone number"], ["both", "Both"]].map(([value, label]) => (
                    <button key={value} type="button" role="radio" aria-checked={(method.payTo || "lipa") === value} className={(method.payTo || "lipa") === value ? "active" : ""} onClick={() => update(method.id, { payTo: value })}>{label}</button>
                  ))}
                </div>
              )}
              {method.type === "mobile" && (
                <div className={`pm-fields ${(method.payTo || "lipa") === "both" ? "bank" : ""}`}>
                  {(method.payTo || "lipa") !== "phone" && (
                    <label className="set-field"><span>Lipa Namba</span><input value={method.number} maxLength={40} inputMode="numeric" placeholder="e.g. 5123456" onChange={(event) => update(method.id, { number: event.target.value })} /></label>
                  )}
                  {(method.payTo || "lipa") !== "lipa" && (
                    <label className="set-field"><span>Phone number</span><input value={method.phone || ""} maxLength={20} inputMode="tel" placeholder="e.g. 0622 882 278" onChange={(event) => update(method.id, { phone: event.target.value })} /></label>
                  )}
                  <label className="set-field"><span>Registered name</span><input value={method.accountName} maxLength={60} onChange={(event) => update(method.id, { accountName: event.target.value })} /></label>
                </div>
              )}
              {["bank", "other"].includes(method.type) && (
                <div className={`pm-fields ${method.type === "bank" ? "bank" : ""}`}>
                  {method.type === "bank" && (
                    <label className="set-field"><span>Bank</span><input value={method.provider} maxLength={40} list="pm-banks" placeholder="e.g. CRDB Bank" onChange={(event) => update(method.id, { provider: event.target.value })} /></label>
                  )}
                  <label className="set-field"><span>{numberLabel(method.type)}</span><input value={method.number} maxLength={40} inputMode={method.type === "other" ? "text" : "numeric"} placeholder={method.type === "mobile" ? "e.g. 5123456" : method.type === "bank" ? "e.g. 0150 1234 5678 00" : ""} onChange={(event) => update(method.id, { number: event.target.value })} /></label>
                  <label className="set-field"><span>{method.type === "bank" ? "Account name" : "Name"}</span><input value={method.accountName} maxLength={60} onChange={(event) => update(method.id, { accountName: event.target.value })} /></label>
                </div>
              )}
              <p className="pm-preview"><Eye size={12} /> On invoices: <b>{method.name || "—"}</b> · {paymentMethodDetail(method)}{method.enabled ? "" : " (hidden while off)"}</p>
            </div>
          );
        })}
      </div>
      <datalist id="pm-banks">{["CRDB Bank", "NMB Bank", "NBC Bank", "Equity Bank", "Stanbic Bank", "Exim Bank", "Azania Bank", "DTB Bank"].map((bank) => <option key={bank} value={bank} />)}</datalist>
      {error}
      {confirmDialog}
    </SettingsCard>
  );
}

function SettingsPage({ onLogout, session, settingsResource }) {
  const { call } = useApi();
  const admin = session.staffRole === "Admin";
  const [active, setActive] = useState("profile");
  const [saved, setSaved] = useState(() => {
    const [firstName, ...rest] = session.name.split(" ");
    return { ...DEFAULT_SETTINGS, ...settingsResource.data.settings, firstName, lastName: rest.join(" "), accountEmail: "" };
  });
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState("");
  const [notice, setNotice] = useState("");
  const [logo, setLogo] = useState("");
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  const errors = validateSettings(draft);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const section = settingsSections.find((item) => item.id === active);
  const SectionIcon = section.icon;

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => logo && URL.revokeObjectURL(logo), [logo]);

  const set = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));
  const bind = (key) => ({
    value: draft[key],
    onChange: (event) => set(key)(event.target.value),
    "aria-invalid": Boolean(showErrors && errors[key]),
  });
  const error = (key) => showErrors && errors[key] ? <small className="set-error"><CircleAlert size={12} /> {errors[key]}</small> : null;
  const sectionHasErrors = (id) => showErrors && Object.keys(errors).some((key) => settingsFieldSection[key] === id);

  async function save() {
    if (Object.keys(errors).length) {
      setShowErrors(true);
      const firstKey = Object.keys(errors)[0];
      setActive(settingsFieldSection[firstKey] || active);
      return;
    }
    setSaving(true);
    try {
      const { firstName: _firstName, lastName: _lastName, accountEmail: _accountEmail, ...workspace } = draft;
      const data = await call("/settings", { method: "PUT", body: { settings: workspace } });
      const next = { ...draft, ...data.settings };
      setSaved(next);
      setDraft(next);
      settingsResource.setData((current) => ({ ...current, settings: data.settings }));
      applyBusinessInfo(data.settings);
      setShowErrors(false);
      setToast("Settings saved");
    } catch (saveError) {
      setToast(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setDraft(saved);
    setShowErrors(false);
  }

  function changeSection(id) {
    setActive(id);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const toggleRow = (key, title, detail, Icon) => (
    <div className="set-toggle-row" key={key}>
      {Icon && <span className="set-row-icon"><Icon size={15} /></span>}
      <span className="set-row-copy">
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </span>
      <SettingSwitch checked={draft[key]} onChange={set(key)} label={title} />
    </div>
  );

  return (
    <div className="set-layout">
      <nav className="set-nav" aria-label="Settings sections">
        <span className="set-nav-kicker">SETTINGS</span>
        {settingsSections.map(({ id, icon: Icon, title, desc }) => (
          <button
            key={id}
            type="button"
            className={`set-nav-item ${active === id ? "active" : ""}`}
            onClick={() => changeSection(id)}
            aria-current={active === id ? "page" : undefined}
          >
            <span className="set-nav-icon"><Icon size={16} /></span>
            <span className="set-nav-copy">
              <strong>{title}</strong>
              <small>{desc}</small>
            </span>
            {sectionHasErrors(id) && <span className="set-nav-alert" aria-label="Has errors" />}
          </button>
        ))}
      </nav>

      <div className="set-main">
        <header className="set-head">
          <span className="set-head-icon"><SectionIcon size={20} /></span>
          <div>
            <span className="set-kicker">WORKSPACE PREFERENCES</span>
            <h2>{section.title}</h2>
            <p>{section.desc}</p>
          </div>
        </header>

        {notice && <p className="set-notice" role="status"><Info size={14} /> {notice}</p>}

        {active === "profile" && (
          <>
            <SettingsCard title="Brand" desc="Shown on receipts, invoices and the sign-in page.">
              <div className="set-brand">
                <div className="set-logo">
                  {logo ? <img src={logo} alt="Business logo preview" /> : <BrandMark />}
                </div>
                <div className="set-brand-copy">
                  <strong>{draft.businessName || "Your business"}</strong>
                  <small>{draft.tagline}</small>
                  <label className="set-upload">
                    <Upload size={14} /> Upload logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setLogo(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                  <small className="set-hint">PNG, JPG or SVG, at least 256 × 256 px. Preview only for now.</small>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard title="Business details">
              <div className="set-grid">
                <label className="set-field">
                  <span>Business name</span>
                  <input {...bind("businessName")} />
                  {error("businessName")}
                </label>
                <label className="set-field">
                  <span>Tagline</span>
                  <input {...bind("tagline")} />
                </label>
                <label className="set-field">
                  <span>Business type</span>
                  <select {...bind("businessType")}>
                    {["Event & outdoor rentals", "Event rentals", "Outdoor & camping rentals", "Party supplies"].map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="set-field">
                  <span>TIN number <em>Optional</em></span>
                  <input {...bind("tin")} placeholder="e.g. 123-456-789" />
                </label>
              </div>
            </SettingsCard>

            <SettingsCard title="Contact & location" desc="Customers see these on receipts and in SMS messages.">
              <div className="set-grid">
                <label className="set-field">
                  <span>Phone number</span>
                  <span className="set-input-icon"><Phone size={14} /><input {...bind("phone")} inputMode="tel" /></span>
                  {error("phone")}
                </label>
                <label className="set-field">
                  <span>WhatsApp number</span>
                  <span className="set-input-icon"><MessageCircle size={14} /><input {...bind("whatsapp")} inputMode="tel" /></span>
                  {error("whatsapp")}
                </label>
                <label className="set-field set-span-2">
                  <span>Email address</span>
                  <span className="set-input-icon"><Mail size={14} /><input {...bind("email")} type="email" /></span>
                  {error("email")}
                </label>
                <label className="set-field">
                  <span>Street / village</span>
                  <span className="set-input-icon"><MapPin size={14} /><input {...bind("address")} /></span>
                </label>
                <label className="set-field">
                  <span>Region</span>
                  <select {...bind("region")}>
                    {["Geita", "Mwanza", "Shinyanga", "Kagera", "Dar es Salaam", "Dodoma", "Arusha"].map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </SettingsCard>

            <SettingsCard title="Opening hours" desc="Used for pickup and return times.">
              <div className="set-hours">
                {[["Monday – Friday", "weekdayOpen", "weekdayClose"], ["Saturday", "saturdayOpen", "saturdayClose"]].map(([day, open, close]) => (
                  <div className="set-hours-row" key={day}>
                    <strong>{day}</strong>
                    <input type="time" {...bind(open)} aria-label={`${day} opening time`} />
                    <i>to</i>
                    <input type="time" {...bind(close)} aria-label={`${day} closing time`} />
                  </div>
                ))}
                <div className="set-hours-row">
                  <strong>Sunday</strong>
                  <span className={`set-pill ${draft.sundayOpen ? "open" : ""}`}>{draft.sundayOpen ? "Open by appointment" : "Closed"}</span>
                  <SettingSwitch checked={draft.sundayOpen} onChange={set("sundayOpen")} label="Open on Sunday" />
                </div>
              </div>
            </SettingsCard>
          </>
        )}

        {active === "account" && (
          <>
            <SettingsCard title="Your profile">
              <div className="set-profile">
                <span className="set-avatar">{(draft.firstName[0] || "P").toUpperCase()}{(draft.lastName[0] || "M").toUpperCase()}</span>
                <div>
                  <strong>{draft.firstName} {draft.lastName}</strong>
                  <small>Signed in with {BUSINESS_INFO.phone}</small>
                </div>
                <span className="set-role"><ShieldCheck size={13} /> Admin</span>
              </div>
              <div className="set-grid">
                <label className="set-field">
                  <span>First name</span>
                  <input {...bind("firstName")} readOnly className="set-readonly" />
                  {error("firstName")}
                </label>
                <label className="set-field">
                  <span>Last name</span>
                  <input {...bind("lastName")} readOnly className="set-readonly" />
                  {error("lastName")}
                </label>
                <label className="set-field">
                  <span>Login phone number</span>
                  <input value={BUSINESS_INFO.phone} readOnly className="set-readonly" />
                  <small className="set-hint">Contact support to change your login number.</small>
                </label>
                <label className="set-field">
                  <span>Role</span>
                  <input value={session.staffRole} readOnly className="set-readonly" />
                  {error("accountEmail")}
                </label>
              </div>
            </SettingsCard>

            <SettingsCard title="Change password" desc="Use at least 8 characters with a mix of letters and numbers.">
              <form
                className="set-grid"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setPasswordBusy(true);
                  setNotice("");
                  try {
                    await call("/me/password", { method: "POST", body: { currentPassword: passwords.current, newPassword: passwords.next } });
                    setPasswords({ current: "", next: "", confirm: "" });
                    setToast("Password changed · other devices signed out");
                  } catch (passwordError) {
                    setNotice(passwordError.message);
                  } finally {
                    setPasswordBusy(false);
                  }
                }}
              >
                <label className="set-field set-span-2">
                  <span>Current password</span>
                  <input type="password" autoComplete="current-password" value={passwords.current} onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))} />
                </label>
                <label className="set-field">
                  <span>New password</span>
                  <input type="password" autoComplete="new-password" value={passwords.next} onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))} />
                  {passwords.next && passwords.next.length < 8 && <small className="set-error"><CircleAlert size={12} /> Use at least 8 characters.</small>}
                </label>
                <label className="set-field">
                  <span>Confirm new password</span>
                  <input type="password" autoComplete="new-password" value={passwords.confirm} onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))} />
                  {passwords.confirm && passwords.confirm !== passwords.next && <small className="set-error"><CircleAlert size={12} /> Passwords do not match.</small>}
                </label>
                <div className="set-span-2 set-inline-actions">
                  <button
                    type="submit"
                    className="button button-secondary"
                    disabled={passwordBusy || !passwords.current || passwords.next.length < 8 || passwords.next !== passwords.confirm}
                  >
                    <KeyRound size={14} /> Update password
                  </button>
                </div>
              </form>
            </SettingsCard>

            <SettingsCard title="Signed-in devices">
              <div className="set-device">
                <span className="set-row-icon"><Globe size={15} /></span>
                <span className="set-row-copy">
                  <strong>This browser</strong>
                  <small>Active now · Kayenze, Geita</small>
                </span>
                <span className="set-pill open">Current</span>
              </div>
              <div className="set-inline-actions">
                <button type="button" className="button button-secondary set-danger" onClick={onLogout}>
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </SettingsCard>
          </>
        )}

        {active === "notifications" && (
          <>
            <SettingsCard title="Team alerts" desc="How Pendo staff hear about activity in the workspace.">
              <div className="set-channel-row">
                {[["alertEmail", "Email", Mail], ["alertSms", "SMS", Smartphone]].map(([key, label, Icon]) => (
                  <button key={key} type="button" className={`set-channel ${draft[key] ? "on" : ""}`} onClick={() => set(key)(!draft[key])} aria-pressed={draft[key]}>
                    <Icon size={15} /> {label}
                    {draft[key] && <Check size={13} />}
                  </button>
                ))}
              </div>
              {toggleRow("alertNewBooking", "New bookings", "When a customer books or an order is created", CalendarCheck)}
              {toggleRow("alertPayment", "Payments received", "M-Pesa, cash and bank payments", Wallet)}
              {toggleRow("alertLowStock", "Low stock", "When an item drops below 20% availability", Package)}
              {toggleRow("alertDailySummary", "Daily summary", "One message each evening with the day’s totals", ChartNoAxesCombined)}
            </SettingsCard>

            <SettingsCard title="Customer SMS" desc="Automatic messages sent to customers.">
              {toggleRow("customerConfirm", "Booking confirmation", "Sent as soon as a booking is confirmed", Check)}
              <div className="set-toggle-row">
                <span className="set-row-icon"><Clock3 size={15} /></span>
                <span className="set-row-copy">
                  <strong>Return reminders</strong>
                  <small>Reminds customers before items are due back</small>
                </span>
                <select className="set-mini-select" {...bind("reminderLead")} disabled={!draft.customerReminders}>
                  {["Same day", "1 day before", "2 days before"].map((option) => <option key={option}>{option}</option>)}
                </select>
                <SettingSwitch checked={draft.customerReminders} onChange={set("customerReminders")} label="Return reminders" />
              </div>
              {toggleRow("customerDelivery", "Delivery updates", "When a driver is on the way or has delivered", Truck)}
              {toggleRow("customerThanks", "Thank-you message", "After items are returned", Sparkles)}
              <label className="set-field set-sender">
                <span>SMS sender name</span>
                <input {...bind("smsSender")} maxLength={11} />
                {error("smsSender") || <small className="set-hint">Shown as the sender on customers’ phones (max 11 characters).</small>}
              </label>
            </SettingsCard>
          </>
        )}

        {active === "categories" && <CategoryManager session={session} />}
        {active === "areas" && <AreaManager session={session} />}

        {active === "policies" && (
          <>
            <SettingsCard title="Bookings">
              <div className="set-grid set-grid-3">
                <label className="set-field">
                  <span>Minimum rental</span>
                  <span className="set-affix"><input type="number" min="1" {...bind("minDays")} /><i>days</i></span>
                </label>
                <label className="set-field">
                  <span>Deposit</span>
                  <span className="set-affix"><input type="number" min="0" max="100" {...bind("depositPercent")} /><i>%</i></span>
                  {error("depositPercent")}
                </label>
                <label className="set-field">
                  <span>Book up to</span>
                  <span className="set-affix"><input type="number" min="1" {...bind("advanceDays")} /><i>days ahead</i></span>
                </label>
              </div>
            </SettingsCard>

            <SettingsCard title="Returns & late fees">
              <div className="set-grid">
                <label className="set-field">
                  <span>Late fee</span>
                  <span className="set-affix"><b>TSh</b><input type="number" min="0" {...bind("lateFee")} /><i>per day</i></span>
                </label>
                <label className="set-field">
                  <span>Grace period</span>
                  <span className="set-affix"><input type="number" min="0" {...bind("gracePeriod")} /><i>hours</i></span>
                </label>
                <label className="set-field set-span-2">
                  <span>Damage & loss policy</span>
                  <textarea rows="3" {...bind("damagePolicy")} />
                </label>
              </div>
            </SettingsCard>

            <SettingsCard title="Cancellations">
              <div className="set-grid">
                <label className="set-field">
                  <span>Free cancellation</span>
                  <select {...bind("freeCancelHours")}>
                    {[["24", "Up to 24 hours before"], ["48", "Up to 48 hours before"], ["72", "Up to 72 hours before"], ["168", "Up to 7 days before"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="set-field">
                  <span>Refund after that</span>
                  <span className="set-affix"><input type="number" min="0" max="100" {...bind("refundPercent")} /><i>% of deposit</i></span>
                  {error("refundPercent")}
                </label>
              </div>
            </SettingsCard>

            <SettingsCard title="Delivery">
              <div className="set-grid set-grid-3">
                <label className="set-field">
                  <span>Base delivery fee</span>
                  <span className="set-affix"><b>TSh</b><input type="number" min="0" {...bind("deliveryFee")} /></span>
                </label>
                <label className="set-field">
                  <span>Per kilometre</span>
                  <span className="set-affix"><b>TSh</b><input type="number" min="0" {...bind("perKmFee")} /></span>
                </label>
                <label className="set-field">
                  <span>Free delivery in</span>
                  <select {...bind("freeDeliveryArea")}>
                    <option value="No free area">No free area</option>
                    <AreaOptions current={draft.freeDeliveryArea === "No free area" ? "" : draft.freeDeliveryArea} other={false} />
                  </select>
                </label>
              </div>
            </SettingsCard>
          </>
        )}

        {active === "payments" && (
          <>
            <PaymentMethodsEditor methods={draft.paymentMethods || []} onChange={set("paymentMethods")} error={error("paymentMethods")} />

            <SettingsCard title="Currency & tax">
              <div className="set-toggle-row">
                <span className="set-row-icon"><Banknote size={15} /></span>
                <span className="set-row-copy"><strong>Currency</strong><small>All amounts are shown in Tanzanian shillings</small></span>
                <span className="set-pill open">TSh</span>
              </div>
              <div className="set-toggle-row">
                <span className="set-row-icon"><Percent size={15} /></span>
                <span className="set-row-copy"><strong>Charge VAT</strong><small>Adds VAT to invoices and receipts</small></span>
                {draft.vatEnabled && (
                  <span className="set-affix set-affix-small"><input type="number" min="0" max="100" {...bind("vatRate")} aria-label="VAT rate" /><i>%</i></span>
                )}
                <SettingSwitch checked={draft.vatEnabled} onChange={set("vatEnabled")} label="Charge VAT" />
              </div>
              {error("vatRate")}
            </SettingsCard>

            <SettingsCard
              title="Tithe (Zaka)"
              desc="Set aside a share of every customer payment as tithe."
              aside={<SettingSwitch checked={draft.titheEnabled} onChange={set("titheEnabled")} label="Set aside tithe" />}
            >
              {draft.titheEnabled ? (
                <div className="set-tithe">
                  <label className="set-field">
                    <span>Tithe percentage</span>
                    <span className="set-affix"><input type="number" min="0.1" max="100" step="0.5" {...bind("tithePercent")} aria-label="Tithe percentage" /><i>% of each payment</i></span>
                    {error("tithePercent") || <small className="set-hint">Applied to every payment received from customers. Usually 10%.</small>}
                    <span className="set-presets">
                      {["5", "10", "15", "20"].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={draft.tithePercent === value ? "active" : ""}
                          onClick={() => set("tithePercent")(value)}
                        >
                          {value}%
                        </button>
                      ))}
                    </span>
                  </label>
                  {(() => {
                    const payment = 248000;
                    const rate = Number(draft.tithePercent) || 0;
                    const tithe = Math.round(payment * rate) / 100;
                    const givingRate = draft.givingEnabled ? Number(draft.givingPercent) || 0 : 0;
                    const giving = Math.round(payment * givingRate) / 100;
                    return (
                      <div className="set-tithe-example" aria-label="Tithe example">
                        <small>Example payment</small>
                        <div><span>Customer pays</span><strong>{formatTSh(payment)}</strong></div>
                        <div className="tithe"><span>Tithe ({rate}%)</span><strong>− {formatTSh(tithe)}</strong></div>
                        {givingRate > 0 && <div className="tithe"><span>Giving ({givingRate}%)</span><strong>− {formatTSh(giving)}</strong></div>}
                        <div className="net"><span>Remaining for business</span><strong>{formatTSh(payment - tithe - giving)}</strong></div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <p className="set-off-note"><Info size={14} /> Tithe is turned off. Payments are not set aside.</p>
              )}
            </SettingsCard>

            <SettingsCard
              title="Giving"
              desc="Set aside another share of every customer payment as giving (offerings, charity, support)."
              aside={<SettingSwitch checked={draft.givingEnabled} onChange={set("givingEnabled")} label="Set aside giving" />}
            >
              {draft.givingEnabled ? (
                <label className="set-field set-giving">
                  <span>Giving percentage</span>
                  <span className="set-affix"><input type="number" min="0.1" max="100" step="0.5" {...bind("givingPercent")} aria-label="Giving percentage" /><i>% of each payment</i></span>
                  {error("givingPercent") || <small className="set-hint">Worked out when a payment is recorded and kept with that payment, like tithe. Changing it later doesn’t alter past payments.</small>}
                  <span className="set-presets">
                    {["2", "5", "10", "15"].map((value) => (
                      <button key={value} type="button" className={draft.givingPercent === value ? "active" : ""} onClick={() => set("givingPercent")(value)}>{value}%</button>
                    ))}
                  </span>
                </label>
              ) : (
                <p className="set-off-note"><Info size={14} /> Giving is turned off. Nothing extra is set aside from payments.</p>
              )}
            </SettingsCard>

            <SettingsCard title="Receipts & invoices">
              <div className="set-receipt-layout">
                <div className="set-grid">
                  <label className="set-field">
                    <span>Receipt number prefix</span>
                    <input {...bind("receiptPrefix")} maxLength={8} />
                  </label>
                  <label className="set-field">
                    <span>Invoice number prefix</span>
                    <input {...bind("invoicePrefix")} maxLength={8} />
                  </label>
                  <label className="set-field set-span-2">
                    <span>Receipt footer</span>
                    <textarea rows="3" {...bind("receiptFooter")} />
                  </label>
                </div>
                <div className="set-receipt-preview" aria-label="Receipt preview">
                  <span className="set-receipt-top">
                    <strong>Pendo<b>rentals</b></strong>
                    <small>{draft.receiptPrefix || "RCT-"}0159</small>
                  </span>
                  <small>{draft.address}, {draft.region} · {draft.phone}</small>
                  <span className="set-receipt-amount"><small>Amount received</small><strong>TSh 248,000</strong></span>
                  {draft.vatEnabled && <small>Includes VAT {draft.vatRate}%</small>}
                  <p>{draft.receiptFooter}</p>
                </div>
              </div>
            </SettingsCard>
          </>
        )}

        {active === "integrations" && (
          <SettingsCard title="Connected services" desc="Connect these once the Pendo server is set up.">
            <div className="set-integrations">
              {[
                [MessageSquareText, "SMS gateway", "Send booking and reminder SMS through Beem Africa or Africa’s Talking."],
                [Smartphone, "M-Pesa payments", "Confirm Lipa Namba payments automatically and issue receipts."],
                [Cloud, "Google Drive backup", "Daily backup of orders, customers and receipts."],
                [HardDriveDownload, "Data export", "Download all workspace data as Excel files."],
              ].map(([Icon, title, text]) => (
                <article className="set-integration" key={title}>
                  <span className="set-integration-icon"><Icon size={18} /></span>
                  <strong>{title}</strong>
                  <p>{text}</p>
                  <div>
                    <span className="set-pill"><CircleDot size={10} /> Not connected</span>
                    <button type="button" className="button button-secondary" onClick={() => setNotice(`${title} needs the Pendo server. Call ${BUSINESS_INFO.phone} to request setup.`)}>
                      Set up
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </SettingsCard>
        )}

        {!admin && <p className="set-notice"><Info size={14} /> Only an Admin can change workspace settings. You can change your own password under Account & security.</p>}
        {admin && (dirty || showErrors) && (
          <div className="set-savebar" role="region" aria-label="Unsaved changes">
            <span>
              {showErrors && Object.keys(errors).length
                ? <><CircleAlert size={15} /> Fix the highlighted fields to save</>
                : <><Info size={15} /> You have unsaved changes</>}
            </span>
            <button type="button" className="button button-secondary" onClick={discard}>Discard</button>
            <button type="button" className="button button-primary" onClick={save} disabled={saving}>{saving ? <><LoaderCircle size={14} className="auth-spin" /> Saving…</> : <><Save size={14} /> Save changes</>}</button>
          </div>
        )}

        {toast && <div className="set-toast" role="status"><Check size={15} /> {toast}</div>}
      </div>
    </div>
  );
}

const settingsFieldSection = {
  businessName: "profile", phone: "profile", whatsapp: "profile", email: "profile",
  firstName: "account", lastName: "account", accountEmail: "account",
  smsSender: "notifications",
  depositPercent: "policies", refundPercent: "policies",
  vatRate: "payments", tithePercent: "payments", givingPercent: "payments", paymentMethods: "payments",
};

function Modal({ type, onClose, saved, onSave, onExport, exportError, exportTitle, onLogout, session }) {
  const isItem = type === "item";
  const isBooking = type === "booking";
  const formTitles = {
    item: "Add a new item",
    booking: "Create a booking",
    customer: "Add customer",
    invoice: "Create invoice",
    expense: "Add expense",
    template: "Edit SMS template",
    user: "Invite team member",
  };
  const isForm = Boolean(formTitles[type]);
  const isExport = type === "report" || type === "orders-export";
  const title = formTitles[type] || (isExport
    ? type === "orders-export" ? "Export orders" : `Export ${exportTitle || "report"}`
    : type === "notifications"
    ? "Notifications"
    : type === "profile"
      ? "Your account"
      : type === "help"
        ? "How can we help?"
        : "Export report");
  const successMessage = {
    item: "Item added",
    booking: "Booking created",
    customer: "Customer added",
    invoice: "Invoice created",
    expense: "Expense recorded",
    template: "Template saved",
    user: "Invitation sent",
  }[type];
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">PENDO RENTALS</span>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        {saved ? (
          <div className="success-state">
            <div>
              <Check size={22} />
            </div>
            <strong>{successMessage}</strong>
            <span>Your workspace is up to date.</span>
            <button className="button button-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : isExport ? (
          <div className="export-format-options">
            <p>Choose a format to download this report.</p>
            <button className="export-format-button" onClick={() => onExport("excel")}>
              <span className="export-format-icon">XLSX</span>
              <span><strong>Excel workbook</strong><small>.xlsx spreadsheet</small></span>
              <Download size={16} />
            </button>
            <button className="export-format-button" onClick={() => onExport("pdf")}>
              <span className="export-format-icon pdf">PDF</span>
              <span><strong>PDF document</strong><small>Print-ready order list</small></span>
              <Download size={16} />
            </button>
            {exportError && <p className="export-error" role="alert">{exportError}</p>}
          </div>
        ) : isForm ? (
          <form
            className="modal-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
          >
            {(isItem || isBooking || type === "customer" || type === "user" || type === "invoice") && (
              <label>
                {isItem ? "Item name" : type === "user" ? "Team member name" : type === "invoice" ? "Customer name" : "Customer name"}
                <input required placeholder={isItem ? "e.g. Canvas bell tent" : "Full name"} />
              </label>
            )}
            {(type === "customer" || type === "user") && <label>Email address<input required type="email" placeholder="name@example.com" /></label>}
            {type === "customer" && <label>Phone number<input type="tel" placeholder="+1 (555) 000-0000" /></label>}
            {isItem && <div className="form-row"><label>Category<select required defaultValue=""><option value="" disabled>Choose category</option><option>Shelter</option><option>Furniture</option><option>Lighting</option><option>Outdoor gear</option></select></label><label>Daily rate<input required type="number" min="1" placeholder="TSh 0.00" /></label></div>}
            {isBooking && <div className="form-row"><label>Start date<input required type="date" defaultValue="2026-10-03" /></label><label>Duration (days)<input required type="number" min="1" placeholder="2" /></label></div>}
            {type === "invoice" && <div className="form-row"><label>Amount<input required type="number" min="1" placeholder="TSh 0.00" /></label><label>Due date<input required type="date" defaultValue="2026-10-08" /></label></div>}
            {type === "expense" && <><label>Category<select required defaultValue=""><option value="" disabled>Choose category</option><option>Maintenance</option><option>Delivery &amp; transport</option><option>Supplies</option><option>Other</option></select></label><label>Description<input required placeholder="What was this expense for?" /></label><div className="form-row"><label>Amount<span className="currency-input"><span>TSh</span><input required type="number" min="1" placeholder="0.00" /></span></label><label>Date<input required type="date" defaultValue="2026-10-01" /></label></div></>}
            {type === "template" && <><label>Template name<input required defaultValue="Booking confirmation" /></label><label>Message<textarea required rows="4" defaultValue="Your booking is confirmed! We can’t wait to help you get outside." /></label><label>Send this message<select defaultValue="Booking confirmed"><option>Booking confirmed</option><option>Rental return reminder</option><option>After item return</option></select></label></>}
            {type === "user" && <label>Role<select required defaultValue=""><option value="" disabled>Select a role</option><option>Store manager</option><option>Inventory staff</option><option>Delivery staff</option></select></label>}
            {isItem && (
              <label>
                Quantity available
                <input type="number" min="1" placeholder="1" />
              </label>
            )}
            {isBooking && (
              <label>
                Search inventory
                <input placeholder="Find items to add" />
              </label>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`button button-primary ${isBooking ? "booking-submit-button" : ""}`}
                type="submit"
              >
                <Plus size={16} />
                {type === "item" ? "Add item" : type === "booking" ? "Create booking" : type === "customer" ? "Add customer" : type === "invoice" ? "Create invoice" : type === "expense" ? "Save expense" : type === "template" ? "Save template" : "Send invite"}
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-message">
            <div className="modal-message-icon">
              {type === "notifications" ? (
                <Bell size={20} />
              ) : type === "profile" ? (
                <Users size={20} />
              ) : type === "help" ? (
                <CircleHelp size={20} />
              ) : (
                <Download size={20} />
              )}
            </div>
            <p>
              {type === "notifications"
                ? "You’re all caught up. New Rent Now requests will show here."
                : type === "profile"
                  ? `Signed in as ${session?.name} (${session?.phone?.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3")}), ${session?.staffRole}.`
                  : type === "help"
                    ? `Need help with the workspace? Call ${BUSINESS_INFO.phone} or email ${BUSINESS_INFO.email}.`
                    : "Your report is ready to export for the selected date range."}
            </p>
            {type === "profile" ? (
              <div className="modal-actions profile-actions">
                <button className="button button-secondary logout-button" onClick={onLogout}>
                  <LogOut size={15} /> Log out
                </button>
                <button className="button button-primary" onClick={onClose}>Got it</button>
              </div>
            ) : (
              <button className="button button-primary" onClick={onClose}>
                {type === "help" ? "Contact support" : "Got it"}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
