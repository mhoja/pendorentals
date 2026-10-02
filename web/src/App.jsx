import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  SlidersHorizontal,
  Sparkles,
  Truck,
  Users,
  X,
  Receipt,
  Wallet,
  UserCog,
  Wrench,
  ClipboardList,
  Send,
  CalendarClock,
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
  KeyRound,
  Tent,
  BadgeCheck,
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
  { label: "Login / Splash Screen", icon: LayoutDashboard },
  { label: "Mobile App", icon: Package },
];

const inventory = [
  {
    name: "Canvas Bell Tent",
    category: "Shelter",
    sku: "SHE-1042",
    image: "photo-1478131143081-80f7f84ca84d",
    rate: 85,
    quantity: 12,
    status: "Available",
    tone: "green",
  },
  {
    name: "Oak Folding Table",
    category: "Furniture",
    sku: "FUR-2081",
    image: "photo-1499933374294-4584851497cc",
    rate: 24,
    quantity: 18,
    status: "Available",
    tone: "green",
  },
  {
    name: "Alpine Camp Chair",
    category: "Furniture",
    sku: "FUR-1064",
    image: "photo-1504851149312-7a075b496cc7",
    rate: 12,
    quantity: 6,
    status: "Rented",
    tone: "blue",
  },
  {
    name: "Warm Glow Lantern",
    category: "Lighting",
    sku: "LGT-3016",
    image: "photo-1500530855697-b586d89ba3ee",
    rate: 16,
    quantity: 9,
    status: "Available",
    tone: "green",
  },
];

const bookings = [
  {
    initials: "JM",
    name: "Jordan Mitchell",
    detail: "Weekend camping · 4 items",
    item: "Bell tent, chairs + 2",
    date: "Today, 10:30 am",
    amount: "$248",
    status: "Ready for pickup",
    tone: "amber",
    color: "peach",
  },
  {
    initials: "AS",
    name: "Avery Sinclair",
    detail: "Backyard gathering · 8 items",
    item: "Tables, linens + more",
    date: "Today, 1:00 pm",
    amount: "$412",
    status: "Out for delivery",
    tone: "blue",
    color: "lilac",
  },
  {
    initials: "RL",
    name: "Riley Lawson",
    detail: "Coastal weekend · 3 items",
    item: "Paddleboards + gear",
    date: "Tomorrow, 9:00 am",
    amount: "$186",
    status: "Confirmed",
    tone: "green",
    color: "mint",
  },
  {
    initials: "SK",
    name: "Sam Kim",
    detail: "Garden dinner · 12 items",
    item: "Tables, chairs + lights",
    date: "Oct 04, 2:00 pm",
    amount: "$568",
    status: "Confirmed",
    tone: "green",
    color: "blue",
  },
];

const chartData = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 66 },
  { day: "Wed", value: 50 },
  { day: "Thu", value: 77 },
  { day: "Fri", value: 58 },
  { day: "Sat", value: 91 },
  { day: "Sun", value: 72 },
];

const ordersData = [
  {
    id: "ORD-1048",
    customer: "Jordan Mitchell",
    items: "Canvas bell tent, 2 chairs",
    date: "Oct 01 – Oct 03",
    total: "TSh 248.00",
    status: "Ready for pickup",
    tone: "amber",
  },
  {
    id: "ORD-1047",
    customer: "Avery Sinclair",
    items: "Oak tables, linens, lights",
    date: "Oct 01 – Oct 02",
    total: "TSh 412.00",
    status: "Out for delivery",
    tone: "blue",
  },
  {
    id: "ORD-1046",
    customer: "Riley Lawson",
    items: "Paddleboards, safety kit",
    date: "Oct 02 – Oct 05",
    total: "TSh 186.00",
    status: "Confirmed",
    tone: "green",
  },
  {
    id: "ORD-1045",
    customer: "Sam Kim",
    items: "Tables, chairs, festoon lights",
    date: "Oct 04 – Oct 05",
    total: "TSh 568.00",
    status: "Confirmed",
    tone: "green",
  },
  {
    id: "ORD-1044",
    customer: "Morgan Lee",
    items: "Camp kitchen, cooler",
    date: "Oct 05 – Oct 07",
    total: "TSh 132.00",
    status: "Awaiting payment",
    tone: "amber",
  },
];

const customersData = [
  {
    name: "Jordan Mitchell",
    email: "jordan.m@email.com",
    phone: "+1 (415) 555-0124",
    address: "1842 Pine Street, San Francisco, CA 94109",
    lastOrder: "2026-10-01",
    orders: 12,
    spent: "TSh 2,480",
    initials: "JM",
    color: "peach",
  },
  {
    name: "Avery Sinclair",
    email: "avery.s@email.com",
    phone: "+1 (415) 555-0182",
    address: "725 Valencia Street, San Francisco, CA 94110",
    lastOrder: "2026-09-29",
    orders: 8,
    spent: "TSh 1,920",
    initials: "AS",
    color: "lilac",
  },
  {
    name: "Riley Lawson",
    email: "riley.l@email.com",
    phone: "+1 (415) 555-0156",
    address: "310 Ocean Avenue, San Francisco, CA 94112",
    lastOrder: "2026-09-26",
    orders: 6,
    spent: "TSh 1,145",
    initials: "RL",
    color: "mint",
  },
  {
    name: "Sam Kim",
    email: "sam.k@email.com",
    phone: "+1 (415) 555-0109",
    address: "91 Clement Street, San Francisco, CA 94118",
    lastOrder: "2026-09-20",
    orders: 5,
    spent: "TSh 980",
    initials: "SK",
    color: "blue",
  },
];

const invoicesData = [
  {
    id: "INV-000125",
    customer: "Jordan Mitchell",
    issued: "Oct 01, 2026",
    due: "Oct 08, 2026",
    amount: "TSh 248.00",
    status: "Paid",
    tone: "green",
  },
  {
    id: "INV-000124",
    customer: "Avery Sinclair",
    issued: "Oct 01, 2026",
    due: "Oct 08, 2026",
    amount: "TSh 412.00",
    status: "Due soon",
    tone: "amber",
  },
  {
    id: "INV-000123",
    customer: "Riley Lawson",
    issued: "Sep 29, 2026",
    due: "Oct 06, 2026",
    amount: "TSh 186.00",
    status: "Paid",
    tone: "green",
  },
  {
    id: "INV-000122",
    customer: "Morgan Lee",
    issued: "Sep 28, 2026",
    due: "Oct 05, 2026",
    amount: "TSh 132.00",
    status: "Overdue",
    tone: "red",
  },
];

const usersData = [
  {
    name: "Pendo Mbolela",
    email: "pendo@pendorentals.com",
    role: "Admin",
    status: "Active",
    initials: "PM",
    color: "peach",
  },
  {
    name: "Grace Chen",
    email: "grace@pendorentals.com",
    role: "Store manager",
    status: "Active",
    initials: "GC",
    color: "lilac",
  },
  {
    name: "Daniel Kim",
    email: "daniel@pendorentals.com",
    role: "Inventory staff",
    status: "Active",
    initials: "DK",
    color: "mint",
  },
  {
    name: "Ava Patel",
    email: "ava@pendorentals.com",
    role: "Delivery staff",
    status: "Invited",
    initials: "AP",
    color: "blue",
  },
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

function getReportData(page, orders) {
  if (page === "Customers") {
    return {
      title: "Customers",
      columns: ["Name", "Email", "Phone", "Address", "Orders", "Last order", "Lifetime spend"],
      rows: customersData.map((customer) => [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.orders,
        customer.lastOrder,
        customer.spent,
      ]),
    };
  }
  if (page === "Inventory") {
    return {
      title: "Inventory",
      columns: ["Item", "Category", "SKU", "Rate (TSh/day)", "Quantity", "Status"],
      rows: inventory.map((item) => [item.name, item.category, item.sku, `TSh ${item.rate}`, item.quantity, item.status]),
    };
  }
  if (page === "Invoices") {
    return {
      title: "Invoices",
      columns: ["Invoice", "Customer", "Issued", "Due", "Amount", "Status"],
      rows: invoicesData.map((invoice) => [invoice.id, invoice.customer, invoice.issued, invoice.due, invoice.amount, invoice.status]),
    };
  }
  return {
    title: "Orders",
    columns: ["Order", "Customer", "Rental items", "Rental dates", "Total", "Status"],
    rows: orders.map(({ id, customer, items, date, total, status }) => [id, customer, items, date, total, status]),
  };
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

const REPORT_TODAY = "2026-10-01";
const BUSINESS_INFO = {
  name: "Pendo Rentals",
  workspace: "Pendo Outdoors",
  email: "hello@pendooutdoors.com",
  phone: "0622 882 278",
  address: "Kayenze, Geita, Tanzania",
};

const paymentsData = [
  { receipt: "RCT-0158", date: "2026-10-01", customer: "Jordan Mitchell", phone: "+255 754 120 124", reference: "ORD-1048", invoice: "INV-000125", method: "M-Pesa", amount: 248, status: "Paid", cashier: "Pendo Mbolela" },
  { receipt: "RCT-0157", date: "2026-10-01", customer: "Avery Sinclair", phone: "+255 713 555 182", reference: "ORD-1047", invoice: "INV-000124", method: "Card", amount: 200, status: "Partially paid", cashier: "Grace Chen" },
  { receipt: "RCT-0156", date: "2026-09-30", customer: "Riley Lawson", phone: "+255 684 555 156", reference: "ORD-1046", invoice: "INV-000123", method: "Cash", amount: 186, status: "Paid", cashier: "Pendo Mbolela" },
  { receipt: "RCT-0155", date: "2026-09-29", customer: "Sam Kim", phone: "+255 765 555 109", reference: "ORD-1045", invoice: "INV-000121", method: "Bank transfer", amount: 568, status: "Paid", cashier: "Grace Chen" },
  { receipt: "RCT-0154", date: "2026-09-27", customer: "Morgan Lee", phone: "+255 715 555 141", reference: "ORD-1044", invoice: "INV-000122", method: "M-Pesa", amount: 66, status: "Partially paid", cashier: "Daniel Kim" },
  { receipt: "RCT-0153", date: "2026-09-24", customer: "Taylor Brooks", phone: "+255 744 555 177", reference: "ORD-1041", invoice: "INV-000119", method: "Cash", amount: 320, status: "Paid", cashier: "Pendo Mbolela" },
  { receipt: "RCT-0152", date: "2026-09-20", customer: "Jordan Mitchell", phone: "+255 754 120 124", reference: "ORD-1038", invoice: "INV-000116", method: "M-Pesa", amount: 154, status: "Refunded", cashier: "Grace Chen" },
  { receipt: "RCT-0151", date: "2026-09-15", customer: "Casey Nguyen", phone: "+255 787 555 163", reference: "ORD-1035", invoice: "INV-000113", method: "Card", amount: 412, status: "Paid", cashier: "Daniel Kim" },
  { receipt: "RCT-0150", date: "2026-09-08", customer: "Avery Sinclair", phone: "+255 713 555 182", reference: "ORD-1031", invoice: "INV-000109", method: "Bank transfer", amount: 275, status: "Paid", cashier: "Pendo Mbolela" },
  { receipt: "RCT-0149", date: "2026-08-29", customer: "Riley Lawson", phone: "+255 684 555 156", reference: "ORD-1027", invoice: "INV-000104", method: "M-Pesa", amount: 198, status: "Paid", cashier: "Grace Chen" },
];

const salesReportData = [
  { order: "ORD-1048", date: "2026-10-01", customer: "Jordan Mitchell", items: "Canvas bell tent, 2 chairs", category: "Shelter", channel: "Walk-in", days: 3, total: 248, status: "Active" },
  { order: "ORD-1047", date: "2026-10-01", customer: "Avery Sinclair", items: "Oak tables, linens, lights", category: "Furniture", channel: "Online", days: 2, total: 412, status: "Active" },
  { order: "ORD-1046", date: "2026-09-30", customer: "Riley Lawson", items: "Paddleboards, safety kit", category: "Outdoor gear", channel: "Phone", days: 4, total: 186, status: "Active" },
  { order: "ORD-1045", date: "2026-09-29", customer: "Sam Kim", items: "Tables, chairs, festoon lights", category: "Furniture", channel: "Online", days: 2, total: 568, status: "Completed" },
  { order: "ORD-1044", date: "2026-09-27", customer: "Morgan Lee", items: "Camp kitchen, cooler", category: "Outdoor gear", channel: "Walk-in", days: 3, total: 132, status: "Completed" },
  { order: "ORD-1041", date: "2026-09-24", customer: "Taylor Brooks", items: "Bell tent, lanterns", category: "Shelter", channel: "Online", days: 2, total: 320, status: "Completed" },
  { order: "ORD-1038", date: "2026-09-20", customer: "Jordan Mitchell", items: "Folding chairs x10", category: "Furniture", channel: "Phone", days: 1, total: 154, status: "Cancelled" },
  { order: "ORD-1035", date: "2026-09-15", customer: "Casey Nguyen", items: "Lanterns, string lights", category: "Lighting", channel: "Online", days: 2, total: 412, status: "Completed" },
  { order: "ORD-1031", date: "2026-09-08", customer: "Avery Sinclair", items: "Bell tent, rugs", category: "Shelter", channel: "Walk-in", days: 3, total: 275, status: "Completed" },
  { order: "ORD-1027", date: "2026-08-29", customer: "Riley Lawson", items: "Kayak, dry bags", category: "Outdoor gear", channel: "Phone", days: 2, total: 198, status: "Completed" },
];

const expenseReportData = [
  { date: "2026-10-01", category: "Equipment maintenance", description: "Tent repairs & cleaning", vendor: "CleanCanvas Ltd", method: "Business card", amount: 420, status: "Approved" },
  { date: "2026-09-30", category: "Delivery & transport", description: "Fuel and vehicle costs", vendor: "Puma Energy", method: "Business card", amount: 285.5, status: "Approved" },
  { date: "2026-09-28", category: "Supplies", description: "Replacement tent pegs", vendor: "Geita Hardware", method: "Bank transfer", amount: 128, status: "Approved" },
  { date: "2026-09-25", category: "Marketing", description: "Instagram promotion", vendor: "Meta", method: "Business card", amount: 150, status: "Approved" },
  { date: "2026-09-22", category: "Delivery & transport", description: "Driver allowance", vendor: "Staff", method: "M-Pesa", amount: 90, status: "Pending" },
  { date: "2026-09-18", category: "Equipment maintenance", description: "Lantern battery packs", vendor: "Geita Hardware", method: "Cash", amount: 64, status: "Approved" },
  { date: "2026-09-12", category: "Rent & utilities", description: "Warehouse electricity", vendor: "TANESCO", method: "Bank transfer", amount: 210, status: "Approved" },
  { date: "2026-09-05", category: "Supplies", description: "Cleaning detergents", vendor: "Geita Supermarket", method: "Cash", amount: 46, status: "Approved" },
  { date: "2026-08-30", category: "Rent & utilities", description: "Warehouse rent", vendor: "Kayenze Properties", method: "Bank transfer", amount: 900, status: "Pending" },
];

const inventoryReportData = [
  { name: "Canvas Bell Tent", category: "Shelter", sku: "SHE-1042", quantity: 12, rented: 9, utilization: 75, revenue: 1843, status: "Available" },
  { name: "Oak Folding Table", category: "Furniture", sku: "FUR-2081", quantity: 18, rented: 11, utilization: 61, revenue: 980, status: "Available" },
  { name: "Alpine Camp Chair", category: "Furniture", sku: "FUR-1064", quantity: 6, rented: 6, utilization: 100, revenue: 642, status: "Rented" },
  { name: "Warm Glow Lantern", category: "Lighting", sku: "LGT-3016", quantity: 9, rented: 4, utilization: 44, revenue: 388, status: "Available" },
  { name: "Festoon String Lights", category: "Lighting", sku: "LGT-3022", quantity: 14, rented: 10, utilization: 71, revenue: 712, status: "Available" },
  { name: "Inflatable Paddleboard", category: "Outdoor gear", sku: "OUT-4410", quantity: 5, rented: 3, utilization: 60, revenue: 534, status: "Available" },
  { name: "Two-Person Kayak", category: "Outdoor gear", sku: "OUT-4415", quantity: 3, rented: 0, utilization: 0, revenue: 198, status: "Maintenance" },
  { name: "Camp Kitchen Set", category: "Outdoor gear", sku: "OUT-4302", quantity: 4, rented: 2, utilization: 50, revenue: 264, status: "Available" },
];

const customerReportData = [
  { name: "Jordan Mitchell", phone: "+255 754 120 124", segment: "VIP", lastOrder: "2026-10-01", orders: 12, spent: 2480, status: "Active" },
  { name: "Avery Sinclair", phone: "+255 713 555 182", segment: "VIP", lastOrder: "2026-10-01", orders: 8, spent: 1920, status: "Active" },
  { name: "Riley Lawson", phone: "+255 684 555 156", segment: "Regular", lastOrder: "2026-09-30", orders: 6, spent: 1145, status: "Active" },
  { name: "Sam Kim", phone: "+255 765 555 109", segment: "Regular", lastOrder: "2026-09-29", orders: 5, spent: 980, status: "Active" },
  { name: "Casey Nguyen", phone: "+255 787 555 163", segment: "Regular", lastOrder: "2026-09-15", orders: 3, spent: 640, status: "Active" },
  { name: "Taylor Brooks", phone: "+255 744 555 177", segment: "New", lastOrder: "2026-09-24", orders: 1, spent: 320, status: "Active" },
  { name: "Morgan Lee", phone: "+255 715 555 141", segment: "New", lastOrder: "2026-09-27", orders: 1, spent: 132, status: "Active" },
  { name: "Jamie Ortiz", phone: "+255 719 555 120", segment: "Regular", lastOrder: "2026-06-14", orders: 4, spent: 710, status: "Inactive" },
];

const deliveryReportData = [
  { id: "DLV-0312", date: "2026-10-01", customer: "Avery Sinclair", area: "Kayenze", driver: "Ava Patel", distance: 3.2, fee: 25, status: "In transit" },
  { id: "DLV-0311", date: "2026-10-01", customer: "Jordan Mitchell", area: "Geita Town", driver: "Daniel Kim", distance: 14.6, fee: 20, status: "Scheduled" },
  { id: "DLV-0310", date: "2026-09-30", customer: "Riley Lawson", area: "Katoro", driver: "Ava Patel", distance: 38.5, fee: 45, status: "Delivered" },
  { id: "DLV-0309", date: "2026-09-29", customer: "Sam Kim", area: "Kalangalala", driver: "Daniel Kim", distance: 12.8, fee: 25, status: "Delivered" },
  { id: "DLV-0308", date: "2026-09-27", customer: "Morgan Lee", area: "Nyankumbu", driver: "Ava Patel", distance: 16.4, fee: 30, status: "Delivered" },
  { id: "DLV-0307", date: "2026-09-24", customer: "Taylor Brooks", area: "Nyarugusu", driver: "Daniel Kim", distance: 27.3, fee: 40, status: "Failed" },
  { id: "DLV-0306", date: "2026-09-15", customer: "Casey Nguyen", area: "Kayenze", driver: "Ava Patel", distance: 3.5, fee: 25, status: "Delivered" },
  { id: "DLV-0305", date: "2026-09-08", customer: "Avery Sinclair", area: "Geita Town", driver: "Daniel Kim", distance: 14.6, fee: 25, status: "Delivered" },
  { id: "DLV-0304", date: "2026-08-29", customer: "Riley Lawson", area: "Katoro", driver: "Ava Patel", distance: 38.5, fee: 45, status: "Delivered" },
];

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
    rows: paymentsData,
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
      { key: "reference", label: "ORDER" },
      { key: "invoice", label: "INVOICE" },
      { key: "method", label: "METHOD" },
      { key: "cashier", label: "RECEIVED BY" },
      { key: "status", label: "STATUS", type: "status" },
      { key: "amount", label: "AMOUNT", type: "money", total: true },
    ],
    groupBy: [
      { key: "method", label: "Collections by payment method" },
      { key: "status", label: "By payment status" },
      { key: "customer", label: "Top paying customers" },
    ],
    metrics: (rows) => {
      const kept = rows.filter((row) => row.status !== "Refunded");
      const collected = sumBy(kept, "amount");
      return [
        { label: "Total collected", value: formatTSh(collected), hint: `${kept.length} payments` },
        { label: "Receipts issued", value: rows.length, hint: "in selection" },
        { label: "Average receipt", value: formatTSh(kept.length ? collected / kept.length : 0), hint: "excluding refunds" },
        { label: "Refunded", value: formatTSh(sumBy(rows.filter((row) => row.status === "Refunded"), "amount")), hint: `${rows.filter((row) => row.status === "Refunded").length} refund${rows.filter((row) => row.status === "Refunded").length === 1 ? "" : "s"}`, tone: "negative" },
      ];
    },
  },
  {
    id: "sales",
    icon: CircleDollarSign,
    title: "Sales report",
    desc: "Revenue, order volume, channels and top-performing categories.",
    tag: "FINANCE",
    rows: salesReportData,
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
    rows: expenseReportData,
    rowKey: "description",
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
    rows: inventoryReportData,
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
      { key: "rented", label: "RENTED", type: "number", total: true },
      { key: "utilization", label: "UTILIZATION", type: "percent" },
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
      return [
        { label: "Units in stock", value: quantity, hint: `${rows.length} items` },
        { label: "Units rented", value: rented, hint: `${quantity - rented} available` },
        { label: "Utilization", value: `${quantity ? Math.round((rented / quantity) * 100) : 0}%`, hint: "rented / in stock" },
        { label: "Rental revenue", value: formatTSh(sumBy(rows, "revenue")), hint: "lifetime" },
      ];
    },
  },
  {
    id: "customers",
    icon: Users,
    title: "Customer report",
    desc: "Customer activity, segments, retention and lifetime value.",
    tag: "CUSTOMERS",
    rows: customerReportData,
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
    desc: "Delivery schedules, completion rate, drivers and distance.",
    tag: "OPERATIONS",
    rows: deliveryReportData,
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
      { key: "distance", label: "DISTANCE", type: "km", total: true },
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
        { label: "Distance covered", value: `${sumBy(rows, "distance").toFixed(1)} km`, hint: "all trips" },
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
  const monthStart = `${REPORT_TODAY.slice(0, 7)}-01`;
  const lastMonthEnd = shiftIsoDate(monthStart, -1);
  if (period === "Today") return [REPORT_TODAY, REPORT_TODAY];
  if (period === "Last 7 days") return [shiftIsoDate(REPORT_TODAY, -6), REPORT_TODAY];
  if (period === "Last 30 days") return [shiftIsoDate(REPORT_TODAY, -29), REPORT_TODAY];
  if (period === "This month") return [monthStart, REPORT_TODAY];
  if (period === "Last month") return [`${lastMonthEnd.slice(0, 7)}-01`, lastMonthEnd];
  if (period === "This year") return [`${REPORT_TODAY.slice(0, 4)}-01-01`, REPORT_TODAY];
  if (period === "Custom range") return [from, to];
  return ["", ""];
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

function printReceipts(payments) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const frameDocument = frame.contentDocument;
  frameDocument.open();
  frameDocument.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Pendo receipts</title><style>${receiptPrintStyles}</style></head><body>${payments.map(receiptMarkup).join("")}</body></html>`);
  frameDocument.close();
  const cleanup = () => setTimeout(() => frame.remove(), 500);
  frame.contentWindow.onafterprint = cleanup;
  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.isConnected && frame.remove(), 60000);
  }, 150);
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

// UI-testing credentials only — replace with API authentication before real use.
const TEST_LOGIN = { username: "0622882278", password: "12345" };
const SESSION_KEY = "pendo-session";

function normalizePhone(value) {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+255")) return `0${digits.slice(4)}`;
  if (digits.startsWith("255") && digits.length === 12) return `0${digits.slice(3)}`;
  return digits;
}

function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSession(username, remember) {
  try {
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, username);
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

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      if (normalizePhone(username) === TEST_LOGIN.username && password === TEST_LOGIN.password) {
        writeSession(TEST_LOGIN.username, remember);
        onLogin(TEST_LOGIN.username);
        return;
      }
      setSubmitting(false);
      setAttempt((count) => count + 1);
      setError("Incorrect phone number or password. Please try again.");
    }, 650);
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase" aria-hidden="true">
        <div className="auth-showcase-glow" />
        <div className="auth-brand">
          <BrandMark />
          <span className="brand-lockup">
            <span className="brand-name">Pendo<span>rentals</span></span>
            <span className="brand-caption">RENTAL WORKSPACE</span>
          </span>
        </div>
        <div className="auth-showcase-copy">
          <span className="auth-eyebrow"><Tent size={13} /> RENT · CELEBRATE · GROW</span>
          <h2>Everything your rental business needs, in one place.</h2>
          <p>Track inventory, bookings, deliveries and payments — then print receipts and reports in a click.</p>
          <ul className="auth-features">
            <li><BadgeCheck size={15} /> Live availability for every tent, table and light</li>
            <li><BadgeCheck size={15} /> Receipts, invoices and M-Pesa collections</li>
            <li><BadgeCheck size={15} /> Finance, sales and delivery reports</li>
          </ul>
        </div>
        <div className="auth-stat-row">
          <div><strong>248</strong><span>items tracked</span></div>
          <div><strong>72%</strong><span>utilization</span></div>
          <div><strong>1,284</strong><span>customers</span></div>
        </div>
        <footer className="auth-showcase-foot">
          <span>Kayenze, Geita · Tanzania</span>
          <span>© 2026 Pendo Rentals</span>
        </footer>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-card-brand">
            <BrandMark />
            <span className="brand-name">Pendo<span>rentals</span></span>
          </div>
          <span className="auth-kicker">WELCOME BACK</span>
          <h1>Sign in to your workspace</h1>
          <p className="auth-lede">Use your registered phone number and password.</p>

          <label className="auth-field">
            <span>Phone number</span>
            <span className={`auth-input ${error ? "has-error" : ""}`}>
              <Phone size={15} />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="username"
                placeholder="e.g. 0622 882 278"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                required
                autoFocus
              />
            </span>
          </label>

          <label className="auth-field">
            <span>Password</span>
            <span className={`auth-input ${error ? "has-error" : ""}`}>
              <Lock size={15} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                required
              />
              <button
                type="button"
                className="auth-reveal"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
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
              onClick={() => setError(`Forgot your password? Call ${BUSINESS_INFO.phone} to reset it.`)}
            >
              Forgot password?
            </button>
          </div>

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={submitting || !username || !password}
          >
            {submitting ? (
              <><LoaderCircle size={16} className="auth-spin" /> Signing in…</>
            ) : (
              <>Sign in <ArrowRight size={16} /></>
            )}
          </button>

          <div className="auth-test-hint">
            <KeyRound size={14} />
            <span>
              <strong>Test account</strong>
              <small>0622882278 · 12345</small>
            </span>
            <button
              type="button"
              onClick={() => {
                setUsername(TEST_LOGIN.username);
                setPassword(TEST_LOGIN.password);
                setError("");
              }}
            >
              Fill in
            </button>
          </div>

          <small className="auth-terms">
            <ShieldCheck size={12} /> Secure workspace for Pendo Rentals staff only.
          </small>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(readSession);

  if (!user) return <LoginScreen onLogin={setUser} />;
  return (
    <Workspace
      onLogout={() => {
        clearSession();
        setUser(null);
      }}
    />
  );
}

function Workspace({ onLogout }) {
  const [activePage, setActivePage] = useState("Overview");
  const [viewedOrder, setViewedOrder] = useState(null);
  const [orders, setOrders] = useState(ordersData);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [period, setPeriod] = useState("This week");
  const [saved, setSaved] = useState(false);
  const [exportError, setExportError] = useState("");

  const filteredInventory = inventory.filter((item) =>
    `${item.name} ${item.category} ${item.sku}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const isInventory = activePage === "Inventory";

  function changePage(label) {
    setActivePage(label);
    setViewedOrder(null);
    setMobileNav(false);
    setQuery("");
  }

  function handleExport() {
    if (activePage === "Orders") {
      setModal("orders-export");
      return;
    }
    setModal("report");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <a
          className="brand"
          href="#overview"
          onClick={() => changePage("Overview")}
        >
          <BrandMark />
          <span className="brand-lockup">
            <span className="brand-name">Pendo<span>rentals</span></span>
            <span className="brand-caption">RENTAL WORKSPACE</span>
          </span>
        </a>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, count }) => (
            <button
              key={label}
              className={`nav-link ${activePage === label ? "active" : ""}`}
              onClick={() => changePage(label)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {count && (
                <span
                  className={`nav-count ${label === "SMS & Notifications" ? "count-highlight" : ""}`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-caption manage-caption">MANAGE</div>
        <nav className="main-nav" aria-label="Management navigation">
          {managementNavigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-link ${activePage === label ? "active" : ""}`}
              onClick={() => changePage(label)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-panel">
            <div className="help-icon">
              <CircleHelp size={17} />
            </div>
            <strong>Need a hand?</strong>
            <span>We’re here to help you grow.</span>
            <button onClick={() => setModal("help")}>
              Visit help center <ArrowRight size={13} />
            </button>
          </div>
          <button
            className="profile-button"
            onClick={() => setModal("profile")}
          >
            <div className="profile-avatar">PM</div>
            <span>
              <strong>Pendo Mbolela</strong>
              <small>Admin</small>
            </span>
            <Ellipsis size={19} />
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={19} />
            </button>
            <div className="breadcrumbs">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{viewedOrder?.id || activePage}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search anything..."
              />
              <kbd>⌘ K</kbd>
            </label>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => setModal("notifications")}
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="top-divider" />
            <button className="top-profile" onClick={() => setModal("profile")}>
              <div className="profile-avatar small-avatar">PM</div>
              <span>
                <strong>Pendo Mbolela</strong>
                <small>Admin</small>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="page-wrap">
          {viewedOrder ? (
            <section className="welcome-row order-page-heading">
              <div>
                <div className="eyebrow">ORDER DETAILS</div>
                <h1>{viewedOrder.id}</h1>
                <p>Review the rental, customer, and payment details.</p>
              </div>
            </section>
          ) : (
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" /> THURSDAY, OCTOBER 1, 2026
              </div>
              <h1>
                {isInventory
                  ? "Inventory"
                  : activePage === "Overview"
                    ? "Good morning, Pendo"
                    : activePage}
              </h1>
              <p>
                {isInventory
                  ? "Keep your gear ready for the next great adventure."
                  : activePage === "Overview"
                    ? "Here’s what’s happening with your rentals today."
                    : `Stay on top of ${activePage.toLowerCase()} for your rental business.`}
              </p>
            </div>
            <div className="welcome-actions">
              {activePage !== "Reports" && (
                <button
                  className="button button-secondary"
                  onClick={handleExport}
                  aria-label={activePage === "Orders" ? "Export orders" : "Export report"}
                >
                  <Download size={16} /> Export
                </button>
              )}
              {(isInventory || activePage === "Overview") && (
                <button
                  className="button button-primary"
                  onClick={() => setModal(isInventory ? "item" : "booking")}
                >
                  <Plus size={17} /> {isInventory ? "Add an item" : "New booking"}
                </button>
              )}
            </div>
          </section>
          )}

          {isInventory ? (
            <InventoryView
              items={filteredInventory}
              onAdd={() => setModal("item")}
            />
          ) : activePage === "Overview" ? (
            <>
              <section className="metrics-grid" aria-label="Business overview">
                <Metric
                  icon={Package}
                  label="Total items"
                  value="248"
                  change="12.8%"
                  kind="up"
                  color="mint-icon"
                  caption="vs last month"
                />
                <Metric
                  icon={CalendarDays}
                  label="Rented out"
                  value="72"
                  change="8.2%"
                  kind="up"
                  color="blue-icon"
                  caption="vs last month"
                />
                <Metric
                  icon={Sparkles}
                  label="Available now"
                  value="176"
                  change="4.6%"
                  kind="up"
                  color="purple-icon"
                  caption="vs last month"
                />
                <Metric
                  icon={ShieldCheck}
                  label="Needs attention"
                  value="12"
                  change="2 items"
                  kind="down"
                  color="orange-icon"
                  caption="need inspection"
                />
              </section>
              <section className="overview-grid">
                <article className="panel revenue-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">YOUR BUSINESS</div>
                      <h2>Revenue overview</h2>
                    </div>
                    <button
                      className="select-button"
                      onClick={() =>
                        setPeriod(
                          period === "This week" ? "This month" : "This week",
                        )
                      }
                    >
                      {period}
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="revenue-total">
                    <strong>$8,420</strong>
                    <span className="positive-pill">
                      <ArrowUpRight size={13} /> 12.8%
                    </span>
                    <small>compared to last week</small>
                  </div>
                  <div className="chart-wrap">
                    <div className="chart-y-labels">
                      <span>$2,000</span>
                      <span>$1,500</span>
                      <span>$1,000</span>
                      <span>$500</span>
                      <span>$0</span>
                    </div>
                    <div className="chart-main">
                      <div className="chart-gridlines">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                      <div className="chart-bars">
                        {chartData.map((item, index) => (
                          <div className="bar-column" key={item.day}>
                            <div
                              className={`bar ${index === 5 ? "bar-emphasis" : ""}`}
                              style={{ height: `${item.value}%` }}
                            >
                              <span className="bar-tooltip">
                                ${(item.value * 18).toLocaleString()}
                              </span>
                            </div>
                            <span className="bar-label">{item.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="chart-footer">
                    <span>
                      <i className="legend-dot" /> Rental income
                    </span>
                    <button onClick={() => changePage("Reports")}>
                      View detailed report <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
                <article className="panel availability-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">AT A GLANCE</div>
                      <h2>Item availability</h2>
                    </div>
                    <button
                      className="icon-button subtle-button"
                      aria-label="More availability options"
                    >
                      <Ellipsis size={19} />
                    </button>
                  </div>
                  <div className="availability-ring-wrap">
                    <div className="availability-ring">
                      <div>
                        <strong>72</strong>
                        <span>of 248 rented</span>
                      </div>
                    </div>
                    <div className="availability-key">
                      <span>
                        <i className="key-dot rented-dot" />
                        Rented out <strong>29%</strong>
                      </span>
                      <span>
                        <i className="key-dot available-dot" />
                        Available <strong>71%</strong>
                      </span>
                      <span>
                        <i className="key-dot repair-dot" />
                        In service <strong>5</strong>
                      </span>
                    </div>
                  </div>
                  <div className="availability-note">
                    <span className="note-icon">
                      <Sparkles size={15} />
                    </span>
                    <span>
                      <strong>Looking good!</strong> Your availability is up 6%
                      this week.
                    </span>
                  </div>
                </article>
              </section>
              <section className="panel bookings-panel">
                <div className="panel-heading bookings-heading">
                  <div>
                    <div className="panel-kicker">KEEP THINGS MOVING</div>
                    <h2>
                      Upcoming bookings <span className="heading-count">8</span>
                    </h2>
                  </div>
                  <div className="heading-actions">
                    <button
                      className="icon-button subtle-button filter-button"
                      aria-label="Filter bookings"
                    >
                      <SlidersHorizontal size={17} />
                    </button>
                    <button
                      className="text-action"
                      onClick={() => changePage("Bookings")}
                    >
                      See all bookings <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="booking-table">
                    <thead>
                      <tr>
                        <th>CUSTOMER</th>
                        <th>RENTAL</th>
                        <th>STARTS</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.name}>
                          <td>
                            <div className="customer-cell">
                              <div
                                className={`customer-avatar ${booking.color}`}
                              >
                                {booking.initials}
                              </div>
                              <span>
                                <strong>{booking.name}</strong>
                                <small>{booking.detail}</small>
                              </span>
                            </div>
                          </td>
                          <td className="rental-cell">{booking.item}</td>
                          <td className="date-cell">{booking.date}</td>
                          <td className="amount-cell">{booking.amount}</td>
                          <td>
                            <span className={`status-pill ${booking.tone}`}>
                              <i />
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="row-more"
                              aria-label={`More options for ${booking.name}`}
                            >
                              <Ellipsis size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-bottom">
                  <span>
                    Showing <strong>4</strong> of <strong>8</strong> upcoming
                    bookings
                  </span>
                  <div className="pagination">
                    <button aria-label="Previous page">
                      <ChevronLeft size={16} />
                    </button>
                    <span>1</span>
                    <button aria-label="Next page">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>
              <section className="panel inventory-panel">
                <div className="panel-heading inventory-heading">
                  <div>
                    <div className="panel-kicker">
                      READY FOR THE NEXT ADVENTURE
                    </div>
                    <h2>Popular inventory</h2>
                  </div>
                  <button
                    className="text-action"
                    onClick={() => changePage("Inventory")}
                  >
                    Manage inventory <ArrowRight size={15} />
                  </button>
                </div>
                <div className="inventory-cards">
                  {inventory.slice(0, 3).map((item) => (
                    <InventoryCard key={item.sku} item={item} />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <WorkspacePage
              page={activePage}
              query={query}
              onModal={setModal}
              onNavigate={changePage}
                onOrderView={setViewedOrder}
                orders={orders}
                setOrders={setOrders}
            />
          )}
          <footer className="page-footer">
            <span>© 2026 Pendo Rentals</span>
            <span>
              <i className="online-dot" /> All systems operational
            </span>
            <button onClick={() => setModal("help")}>
              Help &amp; support <ArrowRight size={13} />
            </button>
          </footer>
        </div>
      </main>
      {modal && (
        <Modal
          type={modal}
          onClose={() => {
            setModal("");
            setSaved(false);
          }}
          saved={saved}
          onSave={() => setSaved(true)}
          onExport={async (format) => {
            try {
              const report = getReportData(activePage, orders);
              await downloadTableReport(report.title, report.columns, report.rows, format);
              setExportError("");
              setModal("");
            } catch (error) {
              setExportError(error instanceof Error ? error.message : "Export failed. Please try again.");
            }
          }}
          exportError={exportError}
          exportTitle={activePage}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}

function InventoryView({ items, onAdd }) {
  const [filter, setFilter] = useState("All items");
  const visibleItems =
    filter === "All items"
      ? items
      : items.filter((item) => item.status === filter);
  return (
    <section className="panel full-inventory-panel">
      <div className="inventory-toolbar">
        <div className="filter-tabs">
          {["All items", "Available", "Rented"].map((option) => (
            <button
              key={option}
              className={filter === option ? "selected" : ""}
              onClick={() => setFilter(option)}
            >
              {option}
              <span>
                {option === "All items"
                  ? 248
                  : option === "Available"
                    ? 176
                    : 72}
              </span>
            </button>
          ))}
        </div>
        <button className="button button-secondary" onClick={onAdd}>
          <Plus size={15} /> Add item
        </button>
      </div>
      <div className="table-scroll">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ITEM</th>
              <th>SKU</th>
              <th>CATEGORY</th>
              <th>DAILY RATE</th>
              <th>QUANTITY</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item.sku}>
                <td>
                  <div className="item-cell">
                    <img
                      src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=100&q=80`}
                      alt=""
                    />
                    <strong>{item.name}</strong>
                  </div>
                </td>
                <td className="sku-cell">{item.sku}</td>
                <td>{item.category}</td>
                <td className="amount-cell">
                  ${item.rate}.00 <small>/ day</small>
                </td>
                <td>{item.quantity} units</td>
                <td>
                  <span className={`status-pill ${item.tone}`}>
                    <i />
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="row-more"
                    aria-label={`More options for ${item.name}`}
                  >
                    <Ellipsis size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleItems.length === 0 && (
          <div className="empty-state">No items match this search.</div>
        )}
      </div>
      <div className="table-bottom">
        <span>
          Showing <strong>{visibleItems.length}</strong> items
        </span>
        <div className="pagination">
          <button aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          <span>1</span>
          <button aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function InventoryCard({ item }) {
  return (
    <article className="mini-item">
      <img
        src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=240&q=85`}
        alt={item.name}
      />
      <div className="mini-item-copy">
        <span className="mini-category">{item.category}</span>
        <strong>{item.name}</strong>
        <span className="mini-rate">
          ${item.rate}
          <small> / day</small>
        </span>
      </div>
      <span className={`status-pill ${item.tone}`}>
        <i />
        {item.status}
      </span>
    </article>
  );
}

function WorkspacePage({ page, query, onModal, onNavigate, onOrderView, orders, setOrders }) {
  const [tab, setTab] = useState("All");
  const [period, setPeriod] = useState("This month");
  const [settings, setSettings] = useState({
    email: true,
    sms: true,
    reminders: true,
    delivery: false,
  });
  const [signedIn, setSignedIn] = useState(false);

  if (page === "Orders")
    return (
      <OrdersPage
        query={query}
        onCreate={() => onModal("booking")}
        onOrderView={onOrderView}
        orders={orders}
        setOrders={setOrders}
      />
    );
  if (page === "Customers")
    return <CustomersPage query={query} onAdd={() => onModal("customer")} />;
  if (page === "Invoices")
    return <InvoicesPage query={query} onCreate={() => onModal("invoice")} />;
  if (page === "Finance")
    return (
      <FinancePage
        tab={tab}
        setTab={setTab}
        period={period}
        setPeriod={setPeriod}
        onAdd={() => onModal("expense")}
      />
    );
  if (page === "SMS & Notifications")
    return <MessagingPage onEdit={() => onModal("template")} />;
  if (page === "Reports")
    return <ReportsPage period={period} setPeriod={setPeriod} />;
  if (page === "Users & Roles")
    return <UsersPage query={query} onInvite={() => onModal("user")} />;
  if (page === "Settings")
    return <SettingsPage settings={settings} setSettings={setSettings} />;
  if (page === "Login / Splash Screen")
    return <LoginPreview signedIn={signedIn} setSignedIn={setSignedIn} />;
  if (page === "Mobile App") return <MobilePreview onNavigate={onNavigate} />;
  return (
    <section className="panel empty-page">
      <div className="empty-illustration">
        <ClipboardList size={26} />
      </div>
      <h2>{page}</h2>
      <p>This workspace view is ready for your rental team.</p>
      <button
        className="button button-primary"
        onClick={() => onModal("booking")}
      >
        <Plus size={15} /> Create a booking
      </button>
    </section>
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

function DataTable({ columns, rows, rowKey, renderActions }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [panelPosition, setPanelPosition] = useState({});

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
          {rows.map((row) => {
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
                            {actions.map(({ label, onClick, danger }) => (
                              <button
                                key={label}
                                type="button"
                                className={`panel-action-button ${danger ? "danger" : ""}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onClick?.(row);
                                  setOpenMenuId(null);
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
    </div>
  );
}

function OrdersPage({ query, onCreate, onOrderView, orders, setOrders }) {
  const [status, setStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [draft, setDraft] = useState(null);

  const rows = orders.filter(
    (order) =>
      (status === "All" || order.status === status) &&
      `${order.id} ${order.customer} ${order.items}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  const handleOrderAction = (order, action) => {
    if (action === "view" || action === "contact") {
      setDraft(null);
      setSelectedOrder(order);
      onOrderView(order);
      return;
    }

    if (action === "edit") {
      setDraft({ ...order });
      setSelectedOrder(order);
      onOrderView(order);
      return;
    }

    if (action === "ready") {
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? { ...item, status: "Ready for pickup", tone: "amber" }
            : item,
        ),
      );
      setSelectedOrder(null);
      setDraft(null);
      return;
    }

    if (action === "cancel") {
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setSelectedOrder(null);
      setDraft(null);
    }
  };

  const saveDraftOrder = () => {
    if (!draft) return;

    setOrders((current) =>
      current.map((item) =>
        item.id === draft.id
          ? {
              ...item,
              customer: draft.customer,
              items: draft.items,
              date: draft.date,
              total: draft.total,
              status: draft.status,
              tone: draft.tone,
            }
          : item,
      ),
    );
    setSelectedOrder(null);
    setDraft(null);
    onOrderView(null);
  };

  const returnToOrders = () => {
    setSelectedOrder(null);
    setDraft(null);
    onOrderView(null);
  };

  return (
    <>
      {selectedOrder ? (
        <>
          <button className="order-back-link" onClick={returnToOrders}>
            <ChevronLeft size={16} /> Back to orders
          </button>
          <section className="panel order-detail-panel">
            <div className="order-detail-header">
              <div>
                <div className="panel-kicker">RENTAL BOOKING</div>
                <h2>{selectedOrder.customer}</h2>
              </div>
            </div>

          {draft ? (
            <div className="order-detail-form">
              <label>
                Customer
                <input
                  value={draft.customer}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, customer: event.target.value }))
                  }
                />
              </label>
              <label>
                Rental items
                <input
                  value={draft.items}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, items: event.target.value }))
                  }
                />
              </label>
              <label>
                Rental dates
                <input
                  value={draft.date}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, date: event.target.value }))
                  }
                />
              </label>
              <label>
                Total
                <input
                  value={draft.total}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, total: event.target.value }))
                  }
                />
              </label>
              <label>
                Status
                <select
                  value={draft.status}
                  onChange={(event) => {
                    const nextStatus = event.target.value;
                    const toneMap = {
                      Confirmed: "green",
                      "Ready for pickup": "amber",
                      "Out for delivery": "blue",
                      "Awaiting payment": "amber",
                    };
                    setDraft((current) => ({
                      ...current,
                      status: nextStatus,
                      tone: toneMap[nextStatus] || "green",
                    }));
                  }}
                >
                  <option>Confirmed</option>
                  <option>Ready for pickup</option>
                  <option>Out for delivery</option>
                  <option>Awaiting payment</option>
                </select>
              </label>
              <div className="modal-actions compact-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setDraft(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={saveDraftOrder}
                >
                  Save changes
                </button>
              </div>
            </div>
          ) : (
            <div className="order-detail-summary">
              <div className="summary-card">
                <span>Customer</span>
                <strong>{selectedOrder.customer}</strong>
              </div>
              <div className="summary-card">
                <span>Rental items</span>
                <strong>{selectedOrder.items}</strong>
              </div>
              <div className="summary-card">
                <span>Dates</span>
                <strong>{selectedOrder.date}</strong>
              </div>
              <div className="summary-card">
                <span>Total</span>
                <strong>{selectedOrder.total}</strong>
              </div>
              <div className="summary-card">
                <span>Status</span>
                <strong> {selectedOrder.status}</strong>
              </div>
              <button
                className="button button-primary"
                onClick={() => setDraft({ ...selectedOrder })}
              >
                Edit order
              </button>
            </div>
          )}
          </section>
        </>
      ) : (
      <>
      <PageSummary
        className="orders-summary"
        items={[
          {
            icon: ClipboardList,
            label: "Total orders",
            value: "186",
            change: "14.2%",
            kind: "up",
            color: "blue-icon",
            caption: "this month",
          },
          {
            icon: CalendarClock,
            label: "Active rentals",
            value: "24",
            change: "6",
            kind: "up",
            color: "mint-icon",
            caption: "due this week",
          },
          {
            icon: Clock3,
            label: "Awaiting pickup",
            value: "8",
            change: "Today",
            kind: "up",
            color: "orange-icon",
            caption: "",
          },
          {
            icon: CircleDollarSign,
            label: "Order value",
            value: "TSh 8,420",
            change: "12.8%",
            kind: "up",
            color: "purple-icon",
            caption: "this month",
          },
        ]}
      />
      <section className="panel workspace-table-panel">
        <div className="workspace-toolbar">
          <div className="filter-tabs">
            {[
              "All",
              "Confirmed",
              "Ready for pickup",
              "Out for delivery",
              "Awaiting payment",
            ].map((option) => (
              <button
                key={option}
                className={status === option ? "selected" : ""}
                onClick={() => setStatus(option)}
              >
                {option}
                <span>
                  {option === "All"
                    ? 186
                    : option === "Confirmed"
                      ? 42
                      : option === "Ready for pickup"
                        ? 8
                        : option === "Out for delivery"
                          ? 6
                          : 4}
                </span>
              </button>
            ))}
          </div>
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={15} /> Create order
          </button>
        </div>
        <DataTable
          columns={[
            {
              key: "id",
              label: "ORDER",
              render: (row) => (
                <div className="order-id-cell">
                  <strong className="table-primary">{row.id}</strong>
                  <small>Booking</small>
                </div>
              ),
            },
            { key: "customer", label: "CUSTOMER" },
            { key: "items", label: "RENTAL ITEMS" },
            { key: "date", label: "RENTAL DATES" },
            {
              key: "total",
              label: "TOTAL",
              render: (row) => (
                <strong className="table-primary">{row.total}</strong>
              ),
            },
            {
              key: "status",
              label: "STATUS",
              render: (row) => (
                <span className={`status-pill ${row.tone}`}>
                  <i />
                  {row.status}
                </span>
              ),
            },
          ]}
          rows={rows}
          rowKey="id"
          renderActions={(order) => [
            { label: "View order", onClick: () => handleOrderAction(order, "view") },
            { label: "Edit details", onClick: () => handleOrderAction(order, "edit") },
            { label: "Contact customer", onClick: () => handleOrderAction(order, "contact") },
            { label: "Mark as ready", onClick: () => handleOrderAction(order, "ready") },
            { label: "Cancel order", onClick: () => handleOrderAction(order, "cancel"), danger: true },
          ]}
        />
        <div className="table-bottom">
          <span>
            Showing <strong>{rows.length}</strong> orders
          </span>
          <Pagination />
        </div>
      </section>
        </>
        )}
    </>
  );
}

function CustomersPage({ query, onAdd }) {
  const [nameQuery, setNameQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const search = `${query} ${nameQuery}`.trim().toLowerCase();
  const rows = customersData.filter((customer) => {
    const matchesName = `${customer.name} ${customer.email} ${customer.phone} ${customer.address}`
      .toLowerCase()
      .includes(search);
    const matchesStart = !startDate || customer.lastOrder >= startDate;
    const matchesEnd = !endDate || customer.lastOrder <= endDate;
    return matchesName && matchesStart && matchesEnd;
  });
  return (
    <>
      <PageSummary
        className="customers-summary"
        items={[
          {
            icon: Users,
            label: "Total customers",
            value: "1,284",
            change: "8.4%",
            kind: "up",
            color: "blue-icon",
            caption: "this month",
          },
          {
            icon: Sparkles,
            label: "Returning customers",
            value: "68%",
            change: "4.2%",
            kind: "up",
            color: "mint-icon",
            caption: "vs last month",
          },
          {
            icon: CircleDollarSign,
            label: "Average lifetime value",
            value: "TSh 486",
            change: "11.6%",
            kind: "up",
            color: "purple-icon",
            caption: "vs last month",
          },
          {
            icon: UserCog,
            label: "New customers",
            value: "96",
            change: "12.4%",
            kind: "up",
            color: "orange-icon",
            caption: "this month",
          },
        ]}
      />
      <section className="panel workspace-table-panel">
        <div className="workspace-toolbar">
          <div className="customer-toolbar-copy">
            <div className="panel-kicker">YOUR COMMUNITY</div>
            <h2 className="toolbar-title">
              Customers <span className="heading-count">{rows.length}</span>
            </h2>
          </div>
          <div className="customer-toolbar-controls">
            <label className="customer-name-filter">
              <Search size={14} />
              <input
                type="search"
                value={nameQuery}
                onChange={(event) => setNameQuery(event.target.value)}
                placeholder="Filter by name"
                aria-label="Filter customers by name"
              />
            </label>
            <label className="customer-date-filter">
              <span>From</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                aria-label="Last order from date"
              />
            </label>
            <label className="customer-date-filter">
              <span>To</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                aria-label="Last order to date"
              />
            </label>
            <button
              className="button button-secondary customer-clear-filters"
              onClick={() => {
                setNameQuery("");
                setStartDate("");
                setEndDate("");
              }}
              disabled={!nameQuery && !startDate && !endDate}
            >
              Clear
            </button>
          </div>
          <button className="button button-primary" onClick={onAdd}>
            <Plus size={15} /> Add customer
          </button>
        </div>
        <div className="customer-table-gap" />
        <DataTable
          columns={[
            {
              key: "name",
              label: "CUSTOMER",
              render: (row) => (
                <div className="customer-cell">
                  <div className={`customer-avatar ${row.color}`}>
                    {row.initials}
                  </div>
                  <span>
                    <strong>{row.name}</strong>
                    <small>{row.email}</small>
                  </span>
                </div>
              ),
            },
            { key: "phone", label: "PHONE" },
            { key: "address", label: "ADDRESS" },
            { key: "orders", label: "ORDERS" },
            {
              key: "lastOrder",
              label: "LAST ORDER",
              render: (row) => new Date(`${row.lastOrder}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }),
            },
            {
              key: "spent",
              label: "LIFETIME SPEND",
              render: (row) => (
                <strong className="table-primary">{row.spent}</strong>
              ),
            },
          ]}
          rows={rows}
          rowKey="email"
        />
        <div className="table-bottom">
          <span>
            Showing <strong>{rows.length}</strong> of {customersData.length} customers
          </span>
          <Pagination />
        </div>
      </section>
    </>
  );
}

function InvoicesPage({ query, onCreate }) {
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const search = `${query} ${invoiceQuery}`.trim().toLowerCase();
  const rows = invoicesData.filter((invoice) => {
    const matchesSearch = `${invoice.id} ${invoice.customer} ${invoice.status}`
      .toLowerCase()
      .includes(search);
    const dueDate = new Date(`${invoice.due} 00:00:00`).toISOString().slice(0, 10);
    const matchesStatus = statusFilter === "All statuses" || invoice.status === statusFilter;
    const matchesFrom = !dueFrom || dueDate >= dueFrom;
    const matchesTo = !dueTo || dueDate <= dueTo;
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });
  return (
    <>
      <PageSummary
        className="invoices-summary"
        items={[
          {
            icon: Receipt,
            label: "Paid this month",
            value: "TSh 12,840",
            change: "18.2%",
            kind: "up",
            color: "mint-icon",
            caption: "vs last month",
          },
          {
            icon: Clock3,
            label: "Outstanding",
            value: "TSh 2,460",
            change: "8 invoices",
            kind: "up",
            color: "orange-icon",
            caption: "",
          },
          {
            icon: CircleDollarSign,
            label: "Overdue",
            value: "TSh 540",
            change: "2 invoices",
            kind: "down",
            color: "blue-icon",
            caption: "",
          },
          {
            icon: Receipt,
            label: "Invoices issued",
            value: "124",
            change: "9.1%",
            kind: "up",
            color: "purple-icon",
            caption: "this month",
          },
        ]}
      />
      <section className="panel workspace-table-panel">
        <div className="workspace-toolbar">
          <div className="invoice-toolbar-copy">
            <div className="panel-kicker">BILLING</div>
            <h2 className="toolbar-title">
              Invoices <span className="heading-count">{rows.length}</span>
            </h2>
          </div>
          <div className="invoice-toolbar-controls">
            <label className="customer-name-filter">
              <Search size={14} />
              <input
                type="search"
                value={invoiceQuery}
                onChange={(event) => setInvoiceQuery(event.target.value)}
                placeholder="Invoice or customer"
                aria-label="Search invoices or customers"
              />
            </label>
            <select
              className="invoice-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter invoices by status"
            >
              {["All statuses", ...new Set(invoicesData.map((invoice) => invoice.status))].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <label className="invoice-date-filter">
              <span>Due from</span>
              <input type="date" value={dueFrom} onChange={(event) => setDueFrom(event.target.value)} aria-label="Due date from" />
            </label>
            <label className="invoice-date-filter">
              <span>To</span>
              <input type="date" value={dueTo} onChange={(event) => setDueTo(event.target.value)} aria-label="Due date to" />
            </label>
            <button
              className="button button-secondary invoice-clear-filters"
              onClick={() => {
                setInvoiceQuery("");
                setStatusFilter("All statuses");
                setDueFrom("");
                setDueTo("");
              }}
              disabled={!invoiceQuery && statusFilter === "All statuses" && !dueFrom && !dueTo}
            >
              Clear
            </button>
          </div>
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={15} /> Create invoice
          </button>
        </div>
        <div className="invoice-table-gap" />
        <DataTable
          columns={[
            {
              key: "id",
              label: "INVOICE",
              render: (row) => (
                <strong className="table-primary">{row.id}</strong>
              ),
            },
            { key: "customer", label: "CUSTOMER" },
            { key: "issued", label: "ISSUED" },
            { key: "due", label: "DUE DATE" },
            {
              key: "amount",
              label: "AMOUNT",
              render: (row) => (
                <strong className="table-primary">{row.amount}</strong>
              ),
            },
            {
              key: "status",
              label: "STATUS",
              render: (row) => (
                <span className={`status-pill ${row.tone}`}>
                  <i />
                  {row.status}
                </span>
              ),
            },
          ]}
          rows={rows}
          rowKey="id"
        />
        <div className="table-bottom">
          <span>
            Showing <strong>{rows.length}</strong> invoices
          </span>
          <Pagination />
        </div>
      </section>
    </>
  );
}

function FinancePage({ tab, setTab, period, setPeriod, onAdd }) {
  const [expenseQuery, setExpenseQuery] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("All categories");
  const [expenseMethod, setExpenseMethod] = useState("All methods");
  const [expenseFrom, setExpenseFrom] = useState("");
  const [expenseTo, setExpenseTo] = useState("");
  const expenses = [
    {
      category: "Equipment maintenance",
      description: "Tent repairs & cleaning",
      amount: "TSh 420.00",
      date: "2026-10-01",
      method: "Business card",
    },
    {
      category: "Delivery & transport",
      description: "Fuel and vehicle costs",
      amount: "TSh 285.50",
      date: "2026-09-30",
      method: "Business card",
    },
    {
      category: "Supplies",
      description: "Replacement tent pegs",
      amount: "TSh 128.00",
      date: "2026-09-28",
      method: "Bank transfer",
    },
  ];
  const filteredExpenses = expenses.filter((expense) => {
    const matchesQuery = `${expense.category} ${expense.description} ${expense.method}`
      .toLowerCase()
      .includes(expenseQuery.toLowerCase());
    const matchesCategory = expenseCategory === "All categories" || expense.category === expenseCategory;
    const matchesMethod = expenseMethod === "All methods" || expense.method === expenseMethod;
    const matchesFrom = !expenseFrom || expense.date >= expenseFrom;
    const matchesTo = !expenseTo || expense.date <= expenseTo;
    return matchesQuery && matchesCategory && matchesMethod && matchesFrom && matchesTo;
  });
  return (
    <>
      <PageSummary
        className="finance-summary"
        items={[
          {
            icon: CircleDollarSign,
            label: "Total revenue",
            value: "TSh 24,680",
            change: "12.8%",
            kind: "up",
            color: "mint-icon",
            caption: "this month",
          },
          {
            icon: Wallet,
            label: "Total expenses",
            value: "TSh 6,240",
            change: "3.6%",
            kind: "down",
            color: "orange-icon",
            caption: "this month",
          },
          {
            icon: ChartNoAxesCombined,
            label: "Net profit",
            value: "TSh 18,440",
            change: "16.4%",
            kind: "up",
            color: "blue-icon",
            caption: "this month",
          },
          {
            icon: Wallet,
            label: "Cash flow",
            value: "TSh 18,440",
            change: "Positive",
            kind: "up",
            color: "purple-icon",
            caption: period.toLowerCase(),
          },
        ]}
      />
      <section className="panel finance-panel">
        <div className="finance-heading">
          <div className="finance-heading-copy">
            <div className="panel-kicker">MONEY IN, MONEY OUT</div>
            <h2>Finance &amp; expenses</h2>
            <p>Track rental revenue, operating costs, and net cash flow.</p>
          </div>
          <button
            className="select-button"
            onClick={() =>
              setPeriod(period === "This month" ? "Last month" : "This month")
            }
          >
            {period}
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="finance-tabs">
          {["Expenses", "Summary"].map((option) => (
            <button
              key={option}
              className={tab === option ? "active" : ""}
              onClick={() => setTab(option)}
            >
              {option}
            </button>
          ))}
          <button className="button button-primary" onClick={onAdd}>
            <Plus size={14} /> Add expense
          </button>
        </div>
        {tab === "Expenses" && (
          <div className="finance-filters" aria-label="Filter expenses">
            <label className="finance-search-filter">
              <Search size={14} />
              <input
                type="search"
                value={expenseQuery}
                onChange={(event) => setExpenseQuery(event.target.value)}
                placeholder="Search expenses"
                aria-label="Search expenses"
              />
            </label>
            <select
              className="finance-category-filter"
              value={expenseCategory}
              onChange={(event) => setExpenseCategory(event.target.value)}
              aria-label="Filter by expense category"
            >
              {["All categories", ...new Set(expenses.map((expense) => expense.category))].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <select
              className="finance-category-filter finance-method-filter"
              value={expenseMethod}
              onChange={(event) => setExpenseMethod(event.target.value)}
              aria-label="Filter by payment method"
            >
              {["All methods", ...new Set(expenses.map((expense) => expense.method))].map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
            <label className="finance-date-filter">
              <span>From</span>
              <input type="date" value={expenseFrom} onChange={(event) => setExpenseFrom(event.target.value)} aria-label="Expense date from" />
            </label>
            <label className="finance-date-filter">
              <span>To</span>
              <input type="date" value={expenseTo} onChange={(event) => setExpenseTo(event.target.value)} aria-label="Expense date to" />
            </label>
            <button
              className="button button-secondary finance-clear-filters"
              onClick={() => {
                setExpenseQuery("");
                setExpenseCategory("All categories");
                setExpenseMethod("All methods");
                setExpenseFrom("");
                setExpenseTo("");
              }}
              disabled={!expenseQuery && expenseCategory === "All categories" && expenseMethod === "All methods" && !expenseFrom && !expenseTo}
            >
              Clear
            </button>
            <span className="finance-filter-count">{filteredExpenses.length} expenses</span>
          </div>
        )}
        <div className="finance-content-gap" />
        {tab === "Expenses" ? (
          <DataTable
            columns={[
              { key: "category", label: "CATEGORY" },
              { key: "description", label: "DESCRIPTION" },
              {
                key: "amount",
                label: "AMOUNT",
                render: (row) => (
                  <strong className="table-primary">{row.amount}</strong>
                ),
              },
              {
                key: "date",
                label: "DATE",
                render: (row) => new Date(`${row.date}T00:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }),
              },
              { key: "method", label: "PAID WITH" },
            ]}
            rows={filteredExpenses}
            rowKey="description"
          />
        ) : (
          <FinanceSummary />
        )}
      </section>
    </>
  );
}

function FinanceSummary() {
  return (
    <div className="summary-content">
      <div className="summary-row">
        <span>Rental income</span>
        <strong>TSh 24,680.00</strong>
      </div>
      <div className="summary-row">
        <span>Operating expenses</span>
        <strong>−TSh 6,240.00</strong>
      </div>
      <div className="summary-row">
        <span>Tax collected</span>
        <strong>TSh 1,974.40</strong>
      </div>
      <div className="summary-row summary-total">
        <span>Net operating profit</span>
        <strong>TSh 18,440.00</strong>
      </div>
    </div>
  );
}

function MessagingPage({ onEdit }) {
  const [channel, setChannel] = useState("SMS templates");
  const templates = [
    {
      icon: CalendarDays,
      title: "Booking confirmation",
      text: "Your booking is confirmed! We can’t wait to help you get outside.",
      usage: "Sent after order confirmation",
    },
    {
      icon: Clock3,
      title: "Return reminder",
      text: "A friendly reminder: your rental is due back tomorrow. See you soon!",
      usage: "Sent one day before return",
    },
    {
      icon: Sparkles,
      title: "Thank you",
      text: "Thanks for renting with Pendo. We hope your adventure was a great one!",
      usage: "Sent after item return",
    },
  ];
  return (
    <>
      <PageSummary
        className="messaging-summary"
        items={[
          {
            icon: MessageSquareText,
            label: "Active templates",
            value: "3",
            change: "All enabled",
            kind: "up",
            color: "blue-icon",
            caption: "",
          },
          {
            icon: Send,
            label: "Messages sent",
            value: "248",
            change: "This month",
            kind: "up",
            color: "mint-icon",
            caption: "",
          },
          {
            icon: Check,
            label: "Delivery rate",
            value: "98.4%",
            change: "Healthy",
            kind: "up",
            color: "purple-icon",
            caption: "",
          },
          {
            icon: Clock3,
            label: "Queued",
            value: "2",
            change: "Sending shortly",
            kind: "up",
            color: "orange-icon",
            caption: "",
          },
        ]}
      />
      <section className="panel messaging-panel">
        <div className="messaging-toolbar">
          <div>
            <div className="panel-kicker">CUSTOMER COMMUNICATIONS</div>
            <h2>{channel === "SMS templates" ? "SMS templates" : "Notification history"}</h2>
            <p>{channel === "SMS templates" ? "Automated messages for every step of a rental." : "Recent messages sent to your customers."}</p>
          </div>
          <div className="message-tabs" role="tablist" aria-label="Messaging views">
            {["SMS templates", "Notification history"].map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={channel === item}
                className={channel === item ? "active" : ""}
                onClick={() => setChannel(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      {channel === "SMS templates" ? (
        <section className="template-grid">
          {templates.map(({ icon: Icon, title, text, usage }) => (
            <article className="panel template-card" key={title}>
              <div className="template-top">
                <span className="template-icon">
                  <Icon size={17} />
                </span>
                <span className="status-pill green">
                  <i />
                  Active
                </span>
              </div>
              <div className="template-card-body">
                <span className="template-trigger">AUTOMATION</span>
                <h3>{title}</h3>
                <p>“{text}”</p>
              </div>
              <div className="template-bottom">
                <span>{usage}</span>
                <button className="button button-secondary" onClick={onEdit}>
                  Edit template
                </button>
              </div>
            </article>
          ))}
          <button className="add-template" onClick={onEdit}>
            <Plus size={20} />
            <strong>Create template</strong>
            <span>Write a message for your customers</span>
          </button>
        </section>
      ) : (
        <section className="message-history">
          <div className="message-history-heading">
            <div>
              <strong>Recent activity</strong>
              <span>Latest SMS delivery attempts</span>
            </div>
            <span className="history-count">2 messages</span>
          </div>
          <div className="panel workspace-table-panel">
          <DataTable
            columns={[
              { key: "id", label: "CUSTOMER" },
              { key: "template", label: "MESSAGE" },
              { key: "date", label: "SENT" },
              { key: "status", label: "STATUS" },
            ]}
            rows={[
              {
                id: "Jordan Mitchell",
                template: "Booking confirmation",
                date: "Today, 9:42 am",
                status: "Delivered",
              },
              {
                id: "Avery Sinclair",
                template: "Booking confirmation",
                date: "Today, 8:15 am",
                status: "Delivered",
              },
            ]}
            rowKey="id"
          />
          </div>
        </section>
      )}
      <section className="panel channel-settings">
        <div className="template-icon">
          <Send size={16} />
        </div>
        <div>
          <strong>SMS delivery</strong>
          <span>Connected and sending with your configured SMS provider.</span>
        </div>
        <span className="status-pill green">
          <i />
          Connected
        </span>
      </section>
      </section>
    </>
  );
}

function ReportsPage({ period, setPeriod }) {
  const [category, setCategory] = useState("All reports");
  const [reportQuery, setReportQuery] = useState("");
  const [activeReportId, setActiveReportId] = useState(null);
  const activeReport = reportDefinitions.find((report) => report.id === activeReportId);
  const categories = ["All reports", "Finance", "Inventory", "Customers", "Operations"];
  const visibleReports = reportDefinitions.filter((report) => {
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
            <p>Review the key numbers for your rental operation.</p>
          </div>
          <label className="report-period-control">
            <span>Period</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Reporting period">
              {["This week", "This month", "Last month", "Last 30 days", "This year"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="report-summary-stats">
          <article>
            <span>Total revenue</span>
            <strong>TSh 24,680</strong>
            <small className="positive-text">↑ 12.8% vs previous period</small>
          </article>
          <article>
            <span>Orders fulfilled</span>
            <strong>186</strong>
            <small className="positive-text">↑ 8.4% vs previous period</small>
          </article>
          <article>
            <span>Utilization</span>
            <strong>72%</strong>
            <small className="positive-text">↑ 4.2% vs previous period</small>
          </article>
          <article>
            <span>Active customers</span>
            <strong>1,284</strong>
            <small className="positive-text">↑ 8.4% vs previous period</small>
          </article>
        </div>
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
  const [period, setPeriod] = useState("All time");
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
  const Icon = report.icon;

  useEffect(() => {
    if (!exportOpen) return undefined;
    const close = (event) => {
      if (!event.target.closest(".report-export-wrap")) setExportOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [exportOpen]);

  const [from, to] = getPeriodRange(period, customFrom, customTo);
  const filterOptions = Object.fromEntries(
    report.filters.map((filter) => [filter.key, [...new Set(report.rows.map((row) => row[filter.key]))].sort()]),
  );
  const filteredRows = report.rows.filter((row) => {
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
    report.dateKey && period !== "All time" && (period === "Custom range"
      ? `${report.dateLabel || "Date"}: ${from ? formatReportDate(from) : "start"} – ${to ? formatReportDate(to) : "today"}`
      : `${report.dateLabel || "Period"}: ${period}`),
    ...report.filters.filter((filter) => selections[filter.key] !== "All").map((filter) => `${filter.label}: ${selections[filter.key]}`),
    minAmount !== "" && `Min ${report.amountLabel.toLowerCase()}: ${formatTSh(minAmount)}`,
    maxAmount !== "" && `Max ${report.amountLabel.toLowerCase()}: ${formatTSh(maxAmount)}`,
  ].filter(Boolean);

  function clearFilters() {
    setQuery("");
    setPeriod("All time");
    setCustomFrom("");
    setCustomTo("");
    setSelections(emptySelections);
    setMinAmount("");
    setMaxAmount("");
  }

  function toggleSort(key) {
    setSort((current) => ({ key, dir: current.key === key && current.dir === "desc" ? "asc" : "desc" }));
  }

  const totalsRow = report.columns.map((column, index) => {
    if (column.total) return formatReportValue(sumBy(sortedRows, column.key), column.type);
    return index === 0 ? `Total (${sortedRows.length})` : "";
  });

  async function exportReport(format) {
    setExporting(format);
    setExportError("");
    try {
      await downloadTableReport(
        report.title,
        report.columns.map((column) => column.label),
        sortedRows.map((row) => report.columns.map((column) => formatReportValue(row[column.key], column.type))),
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

      <section className="report-filter-panel panel" aria-label="Report filters">
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
          {report.dateKey && (
            <label className="report-filter-field">
              <span>{report.dateLabel || "Period"}</span>
              <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                {reportPeriods.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          )}
          {report.dateKey && period === "Custom range" && (
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

      <section className="report-kpis">
        {report.metrics(sortedRows).map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small className={metric.tone === "negative" ? "negative-text" : ""}>{metric.hint}</small>
          </article>
        ))}
      </section>

      {view === "table" ? (
        <section className="panel report-table-panel">
          <div className="table-scroll">
            <table className="data-table report-table">
              <thead>
                <tr>
                  {report.columns.map((column) => (
                    <th key={column.key} className={["money", "number", "km", "percent"].includes(column.type) ? "numeric" : ""}>
                      <button className="report-sort" onClick={() => toggleSort(column.key)} aria-label={`Sort by ${column.label.toLowerCase()}`}>
                        {column.label}
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
                {sortedRows.map((row) => (
                  <tr key={row[report.rowKey]}>
                    {report.columns.map((column) => (
                      <td key={column.key} className={["money", "number", "km", "percent"].includes(column.type) ? "numeric" : ""}>
                        {column.type === "status" ? (
                          <span className={`status-pill ${statusTones[row[column.key]] || "blue"}`}><i />{row[column.key]}</span>
                        ) : column.type === "money" ? (
                          <strong className="table-primary">{formatReportValue(row[column.key], column.type)}</strong>
                        ) : column.type === "percent" ? (
                          <span className="report-meter"><span><i style={{ width: `${row[column.key]}%` }} /></span>{row[column.key]}%</span>
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
                      <td key={report.columns[index].key} className={report.columns[index].total ? "numeric" : ""}>{value}</td>
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

function UsersPage({ query, onInvite }) {
  const rows = usersData.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageSummary
        items={[
          {
            icon: Users,
            label: "Team members",
            value: "6",
            change: "1 invited",
            kind: "up",
            color: "blue-icon",
            caption: "",
          },
          {
            icon: ShieldCheck,
            label: "Roles",
            value: "4",
            change: "Configured",
            kind: "up",
            color: "mint-icon",
            caption: "",
          },
          {
            icon: Clock3,
            label: "Pending invites",
            value: "1",
            change: "Expires in 6 days",
            kind: "down",
            color: "orange-icon",
            caption: "",
          },
        ]}
      />
      <section className="panel workspace-table-panel">
        <div className="workspace-toolbar">
          <div>
            <div className="panel-kicker">TEAM ACCESS</div>
            <h2 className="toolbar-title">Users &amp; roles</h2>
          </div>
          <button className="button button-primary" onClick={onInvite}>
            <Plus size={15} /> Invite user
          </button>
        </div>
        <DataTable
          columns={[
            {
              key: "name",
              label: "TEAM MEMBER",
              render: (row) => (
                <div className="customer-cell">
                  <div className={`customer-avatar ${row.color}`}>
                    {row.initials}
                  </div>
                  <span>
                    <strong>{row.name}</strong>
                    <small>{row.email}</small>
                  </span>
                </div>
              ),
            },
            { key: "role", label: "ROLE" },
            {
              key: "status",
              label: "STATUS",
              render: (row) => (
                <span
                  className={`status-pill ${row.status === "Active" ? "green" : "amber"}`}
                >
                  <i />
                  {row.status}
                </span>
              ),
            },
          ]}
          rows={rows}
          rowKey="email"
        />
        <div className="table-bottom">
          <span>
            Showing <strong>{rows.length}</strong> team members
          </span>
          <Pagination />
        </div>
      </section>
      <section className="role-strip">
        {[
          "Admin",
          "Store manager",
          "Inventory staff",
          "Delivery staff",
        ].map((role) => (
          <div className="role-chip" key={role}>
            <ShieldCheck size={15} />
            <span>{role}</span>
            <ChevronRight size={14} />
          </div>
        ))}
      </section>
    </>
  );
}

function SettingsPage({ settings, setSettings }) {
  const toggle = (key) =>
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  return (
    <div className="settings-layout">
      <nav className="panel settings-nav">
        {[
          "Business profile",
          "Notifications",
          "Rental policies",
          "Payments",
          "Integrations",
        ].map((section, index) => (
          <button className={index === 0 ? "active" : ""} key={section}>
            {section}
            <ChevronRight size={14} />
          </button>
        ))}
      </nav>
      <section className="panel settings-content">
        <div className="panel-kicker">WORKSPACE PREFERENCES</div>
        <h2>Business profile</h2>
        <p>Manage your store details and customer-facing information.</p>
        <div className="settings-form">
          <label>
            Business name
            <input defaultValue="Pendo Outdoors" />
          </label>
          <div className="form-row">
            <label>
              Contact email
              <input defaultValue="hello@pendooutdoors.com" />
            </label>
            <label>
              Phone number
              <input defaultValue="+1 (415) 555-0100" />
            </label>
          </div>
          <label>
            Store address
            <input defaultValue="245 Summit Avenue, San Francisco, CA" />
          </label>
          <div className="settings-separator" />
          <h3>Notifications</h3>
          <p>Choose which updates your team receives.</p>
          {[
            ["email", "Email updates", "Booking, payment, and return updates"],
            ["sms", "SMS alerts", "Urgent booking and delivery changes"],
            [
              "reminders",
              "Return reminders",
              "Notify customers before rentals are due",
            ],
            [
              "delivery",
              "Delivery status",
              "Updates when drivers complete deliveries",
            ],
          ].map(([key, title, detail]) => (
            <button
              className="toggle-row"
              key={key}
              onClick={() => toggle(key)}
            >
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
              <i className={`toggle ${settings[key] ? "on" : ""}`} />
            </button>
          ))}
          <div className="settings-actions">
            <button className="button button-secondary">Cancel</button>
            <button className="button button-primary">Save changes</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoginPreview({ signedIn, setSignedIn }) {
  return (
    <section className="login-preview panel">
      <div className="login-art">
        <div className="login-brand">
          <BrandMark />
          <strong>Pendo Rentals</strong>
          <small>Rent · Celebrate · Grow</small>
        </div>
        <div className="login-art-copy">
          <span>MADE FOR THE MOMENTS OUTSIDE</span>
          <h2>Your one-stop rental solution</h2>
          <p>
            From tents and tables to lighting, bikes and more, we make your
            adventures and projects easier.
          </p>
        </div>
        <div className="login-art-bottom">
          <span>Rent more. Worry less.</span>
          <span>© 2026 Pendo Rentals</span>
        </div>
      </div>
      <form
        className="login-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSignedIn(true);
        }}
      >
        <div className="login-form-brand">
          <BrandMark />
          <strong>Pendo Rentals</strong>
          <span>Rent · Celebrate · Grow</span>
        </div>
        <h1>{signedIn ? "You’re signed in" : "Welcome back"}</h1>
        <p>
          {signedIn
            ? "Your workspace is ready."
            : "Log in to your account to manage your rentals with ease."}
        </p>
        {!signedIn && (
          <>
            <label>
              Username or email
              <input type="email" required placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                placeholder="Enter your password"
              />
            </label>
            <div className="login-remember">
              <label>
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <button type="button">Forgot password?</button>
            </div>
            <button
              className="button button-primary login-submit"
              type="submit"
            >
              Log in <ArrowRight size={15} />
            </button>
          </>
        )}
        {signedIn && (
          <button
            className="button button-primary login-submit"
            type="button"
            onClick={() => setSignedIn(false)}
          >
            Back to login
          </button>
        )}
        <small className="login-terms">
          By continuing, you agree to Pendo Rentals’ terms and privacy policy.
        </small>
      </form>
    </section>
  );
}

function MobilePreview({ onNavigate }) {
  return (
    <section className="mobile-preview-page">
      <div className="mobile-preview-heading">
        <div>
          <div className="panel-kicker">PENDO RENTALS ON THE GO</div>
          <h2>Mobile app experience</h2>
          <p>Booking and rental management, wherever the day takes you.</p>
        </div>
        <span className="status-pill green">
          <i />
          Installable PWA
        </span>
      </div>
      <div className="phone-gallery">
        <PhoneMockup title="Welcome" />
        <PhoneMockup title="Sign in" />
        <PhoneMockup title="My orders" />
        <PhoneMockup title="Inventory" />
      </div>
      <div className="pwa-note panel">
        <span className="template-icon">
          <Download size={17} />
        </span>
        <div>
          <strong>Ready to install</strong>
          <span>
            Customers can add Pendo Rentals to their home screen directly from
            their browser.
          </span>
        </div>
        <button
          className="button button-primary"
          onClick={() => onNavigate("Login / Splash Screen")}
        >
          Preview login
        </button>
      </div>
    </section>
  );
}

function PhoneMockup({ title }) {
  return (
    <article className="phone-mockup">
      <div className="phone-screen">
        <div className="phone-notch" />
        <div className="phone-mini-brand">
          <BrandMark />
          <strong>Pendo</strong>
        </div>
        {title === "Welcome" ? (
          <>
            <div className="phone-hero-image" />
            <h3>Make room for adventure.</h3>
            <p>Everything you need for your next great day outside.</p>
            <button>Get started</button>
          </>
        ) : title === "Sign in" ? (
          <>
            <h3>Welcome back</h3>
            <p>Log in to your account</p>
            <span className="phone-input">Email address</span>
            <span className="phone-input">Password</span>
            <button>Log in</button>
          </>
        ) : (
          <>
            <h3>{title === "My orders" ? "Your orders" : "Explore gear"}</h3>
            <p>
              {title === "My orders"
                ? "Your next adventure is coming up."
                : "Find something for your next outing."}
            </p>
            <div className="phone-product">
              <img
                src={`https://images.unsplash.com/${title === "Inventory" ? inventory[0].image : inventory[2].image}?auto=format&fit=crop&w=150&q=80`}
                alt=""
              />
              <span>
                <strong>
                  {title === "Inventory"
                    ? inventory[0].name
                    : "Coastal weekend"}
                </strong>
                <small>
                  {title === "Inventory" ? "$85 / day" : "Oct 02 – Oct 05"}
                </small>
              </span>
            </div>
            <div className="phone-product">
              <img
                src={`https://images.unsplash.com/${inventory[1].image}?auto=format&fit=crop&w=150&q=80`}
                alt=""
              />
              <span>
                <strong>
                  {title === "Inventory" ? inventory[1].name : "Order details"}
                </strong>
                <small>
                  {title === "Inventory" ? "$24 / day" : "3 items · Confirmed"}
                </small>
              </span>
            </div>
            <div className="phone-bottom-nav">
              <span>⌂</span>
              <span>▦</span>
              <span>♡</span>
              <span>○</span>
            </div>
          </>
        )}
      </div>
      <span className="phone-caption">{title}</span>
    </article>
  );
}

function Pagination() {
  return (
    <div className="pagination">
      <button aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      <span>1</span>
      <button aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function Modal({ type, onClose, saved, onSave, onExport, exportError, exportTitle, onLogout }) {
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
            {isItem && <div className="form-row"><label>Category<select required defaultValue=""><option value="" disabled>Choose category</option><option>Shelter</option><option>Furniture</option><option>Lighting</option><option>Outdoor gear</option></select></label><label>Daily rate<input required type="number" min="1" placeholder="$ 0.00" /></label></div>}
            {isBooking && <div className="form-row"><label>Start date<input required type="date" defaultValue="2026-10-03" /></label><label>Duration (days)<input required type="number" min="1" placeholder="2" /></label></div>}
            {type === "invoice" && <div className="form-row"><label>Amount<input required type="number" min="1" placeholder="$ 0.00" /></label><label>Due date<input required type="date" defaultValue="2026-10-08" /></label></div>}
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
                ? "You’re all caught up. New booking and inventory updates will show here."
                : type === "profile"
                  ? "Signed in as Pendo Mbolela (0622 882 278), Admin."
                  : type === "help"
                    ? "Our support team is ready to help with your rentals, bookings, and workspace."
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
