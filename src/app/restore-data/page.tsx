"use client";

import React from "react";
import { Table, Column } from "../../components/common/Table";
import { Restore } from "@mui/icons-material";

export interface Lead {
  id: string;
  name: string;
  phone_number: string;
  product: string;
  amount: number;
  quantity: number;
  subtotal: number;
  assgin: string;
  date: string;
  time?: string;
  status: string;
  status_two?: string;
  reason_call?: string;
  note: string;
  isDeleted?: boolean;
  deleteDate?: string;
  reminderDate?: string;
}

export default function RestoreDataPage() {
  const [leads, setLeads] = React.useState<Lead[]>([
    { id: "1", name: "Rajesh Kumar", phone_number: "9988776655", product: "Wrixty Ashwagandha Gold", amount: 1200, quantity: 2, subtotal: 2400, assgin: "Aman Sharma", date: "2026-05-29", time: "10:30", status: "New", note: "Interested in stress relief products.", isDeleted: true, deleteDate: "2026-05-30" }
  ]);

  const restoreLead = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, isDeleted: false } : l));
  };

  const deletedLeads = React.useMemo(() => leads.filter(l => l.isDeleted), [leads]);

  const columns: Column<Lead>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Customer Name" },
    { key: "phone_number", header: "Phone Number" },
    { key: "product", header: "Product Name" },
    { key: "subtotal", header: "Total", render: (val) => `₹${val}` },
    { key: "date", header: "Lead Date" },
    { key: "deleteDate", header: "Delete Date" },
    { key: "reason_call", header: "Reason Call", render: (val) => val || "-" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => restoreLead(row.id)}
          className="flex items-center gap-1 py-1 px-2.5 bg-primary-teal/10 border border-primary-teal/20 hover:bg-primary-teal hover:text-white text-[10px] font-extrabold uppercase tracking-wider text-primary-teal rounded-lg transition-all"
        >
          <Restore className="w-3.5 h-3.5" /> Restore
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="space-y-1">
        <h2 className="text-xl font-black uppercase tracking-wider text-zinc-900 ">
          Restore Deleted Data
        </h2>
        <p className="text-xs text-zinc-500  font-semibold uppercase tracking-wider">
          Inspect and restore soft-deleted leads
        </p>
      </div>

      <Table data={deletedLeads} columns={columns} />
    </div>
  );
}
