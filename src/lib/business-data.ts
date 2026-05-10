export type BusinessKey = "snow" | "lawn"

export type InvoiceStatus = "Paid" | "Due" | "Overdue" | "Draft"

export const businesses = [
  {
    key: "snow" as const,
    name: "Frozen Solution",
    service: "Snow Removal",
    email: "frozensolutions92@gmail.com",
    phone: "+1 647-212-3424",
    secondaryPhone: "+1 647-854-5652",
    image: "/frozen-solution-snow.jpeg",
    accent: "text-sky-700 bg-sky-500/10",
  },
  {
    key: "lawn" as const,
    name: "Primecut Services",
    service: "Fresh Cut Services",
    email: "freshcutservices92@gmail.com",
    phone: "+1 647-765-0949",
    secondaryPhone: "+1 647-854-5652",
    image: "/primecut-lawn.jpeg",
    accent: "text-emerald-700 bg-emerald-500/10",
  },
]

export const customers = [
  {
    id: "CUS-1001",
    name: "M. Thompson",
    email: "m.thompson@example.com",
    phone: "+1 416-555-0184",
    address: "22 Maple Ridge Dr, Toronto",
    business: "Frozen Solution",
    plan: "Gold Snow Contract",
    status: "Active",
    balance: 900,
    lastService: "May 6, 2026",
  },
  {
    id: "CUS-1002",
    name: "Greenway Dental",
    email: "office@greenway.example",
    phone: "+1 647-555-0147",
    address: "140 Weston Rd, Toronto",
    business: "Primecut Services",
    plan: "Commercial Lawn Care",
    status: "Active",
    balance: 0,
    lastService: "May 8, 2026",
  },
  {
    id: "CUS-1003",
    name: "S. Patel",
    email: "spatel@example.com",
    phone: "+1 905-555-0122",
    address: "8 Riverstone Ct, Mississauga",
    business: "Frozen Solution",
    plan: "Silver Snow Contract",
    status: "Due",
    balance: 400,
    lastService: "Apr 27, 2026",
  },
  {
    id: "CUS-1004",
    name: "A. Williams",
    email: "awilliams@example.com",
    phone: "+1 437-555-0188",
    address: "61 Pine Ave, Brampton",
    business: "Primecut Services",
    plan: "Residential Lawn Care",
    status: "New lead",
    balance: 50,
    lastService: "Scheduled May 14, 2026",
  },
]

export const servicePackages = [
  {
    name: "Silver Snow",
    business: "Frozen Solution",
    price: 400,
    billing: "Monthly",
    includes: ["Snow blowing", "Snow shoveling", "Salting or sanding", "Residential driveway and sidewalk"],
  },
  {
    name: "Gold Snow",
    business: "Frozen Solution",
    price: 900,
    billing: "Monthly",
    includes: ["Snow plowing", "Ice removal", "Priority 24/7 service", "Residential and commercial coverage"],
  },
  {
    name: "Residential Lawn",
    business: "Primecut Services",
    price: 50,
    billing: "Starting price",
    includes: ["Lawn mowing", "Edging", "Lawn cleanup", "Driveway and yard service"],
  },
  {
    name: "Commercial Lawn",
    business: "Primecut Services",
    price: 180,
    billing: "Per visit",
    includes: ["Scheduled mowing", "Fertilization", "Weed control", "Service photos and notes"],
  },
]

export const invoices = [
  {
    id: "INV-2026-041",
    customer: "M. Thompson",
    business: "Frozen Solution",
    email: "m.thompson@example.com",
    service: "Gold Snow Contract",
    issued: "May 1, 2026",
    due: "May 15, 2026",
    amount: 900,
    paid: 0,
    status: "Due" as InvoiceStatus,
  },
  {
    id: "INV-2026-042",
    customer: "Greenway Dental",
    business: "Primecut Services",
    email: "office@greenway.example",
    service: "Commercial Lawn Care",
    issued: "May 4, 2026",
    due: "May 9, 2026",
    amount: 360,
    paid: 360,
    status: "Paid" as InvoiceStatus,
  },
  {
    id: "INV-2026-043",
    customer: "S. Patel",
    business: "Frozen Solution",
    email: "spatel@example.com",
    service: "Silver Snow Contract",
    issued: "Apr 1, 2026",
    due: "Apr 15, 2026",
    amount: 400,
    paid: 0,
    status: "Overdue" as InvoiceStatus,
  },
  {
    id: "INV-2026-044",
    customer: "A. Williams",
    business: "Primecut Services",
    email: "awilliams@example.com",
    service: "Residential Lawn Care",
    issued: "May 10, 2026",
    due: "May 14, 2026",
    amount: 50,
    paid: 0,
    status: "Draft" as InvoiceStatus,
  },
]

export const payments = [
  { id: "PAY-7781", invoice: "INV-2026-042", customer: "Greenway Dental", method: "E-transfer", amount: 360, date: "May 9, 2026", business: "Primecut Services" },
  { id: "PAY-7780", invoice: "INV-2026-039", customer: "M. Thompson", method: "Credit card", amount: 900, date: "Apr 15, 2026", business: "Frozen Solution" },
  { id: "PAY-7779", invoice: "INV-2026-036", customer: "S. Patel", method: "Cash", amount: 400, date: "Mar 15, 2026", business: "Frozen Solution" },
]

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value)
