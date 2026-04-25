export type PortalInvoiceStatus = "PAID" | "PENDING" | "OVERDUE";

export type PortalInvoice = {
  id: string;
  date: string; // YYYY-MM-DD
  status: PortalInvoiceStatus;
  amount: number;
  currency: string;
};

export type PortalMessage = {
  id: string;
  threadId: string;
  from: "CLIENT" | "ADMIN";
  body: string;
  createdAt: string; // ISO
};

export type PortalAccount = {
  userId: string;
  email: string | null;
  status: "ACTIVE" | "LIMITED";
};

export async function getInvoices(): Promise<PortalInvoice[]> {
  const res = await fetch("/api/invoices", { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  const rows = (await res.json()) as {
    id: string;
    amount: number;
    status: string;
    issuedAt: string;
    account?: { id: string; userId: string; company: string | null };
  }[];

  return rows.map((inv) => ({
    id: inv.id,
    date: new Date(inv.issuedAt).toISOString().slice(0, 10),
    status: inv.status?.toUpperCase() === "PAID" ? "PAID" : inv.status?.toUpperCase() === "OVERDUE" ? "OVERDUE" : "PENDING",
    amount: inv.amount,
    currency: "MRU",
  }));
}

export async function getMessages(): Promise<PortalMessage[]> {
  const res = await fetch("/api/messages", { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  const rows = (await res.json()) as { id: string; content: string; isAdmin: boolean; createdAt: string }[];
  return rows.map((m) => ({
    id: m.id,
    threadId: "thread_support",
    from: m.isAdmin ? "ADMIN" : "CLIENT",
    body: m.content,
    createdAt: m.createdAt,
  }));
}

export async function getAccount(userId: string, email: string | null): Promise<PortalAccount> {
  return { userId, email, status: "ACTIVE" };
}

