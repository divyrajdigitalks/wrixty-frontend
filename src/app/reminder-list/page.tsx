"use client";

import React, { useState } from "react";
import { Table, Column } from "../../components/common/Table";
import { FiTrash2 } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";

export interface Reminder {
  id: string;
  title: string;
  leadId: string;
  name: string;
  phone_number: string;
  reminderDate: string;
  product: string;
  amount: number;
  quantity: number;
  subtotal: number;
}

export default function ReminderListPage() {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", title: "Follow-up for Ashwagandha pack", leadId: "1", name: "Rajesh Kumar", phone_number: "9988776655", reminderDate: "2026-05-31", product: "Wrixty Ashwagandha Gold", amount: 1200, quantity: 2, subtotal: 2400 }
  ]);
  const toast = useToast();

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    await new Promise(res => setTimeout(res, 500));
    deleteReminder(id);
    toast.warning("Reminder deleted.");
    setIsDeleting(null);
  };

  const columns: Column<Reminder>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "title", header: "Title", render: (val) => val || "Reminder Lead Not Available" },
    { key: "name", header: "Assign To", render: (val) => val || "N/A" },
    { key: "phone_number", header: "Phone Number" },
    { key: "reminderDate", header: "Reminder Date" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleDelete(row.id)}
            disabled={isDeleting === row.id}
            className="p-2 text-text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-all inline-flex items-center justify-center disabled:opacity-50"
            title="Delete Reminder"
          >
            {isDeleting === row.id ? (
              <div className="w-4.5 h-4.5 border-2 border-error border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiTrash2 className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card-bg p-8 border border-border-ui rounded-lg shadow-soft space-y-6">
        
        {/* Header and Date Range */}
        <div className="flex items-center justify-between border-b border-border-ui/50 pb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Reminder List
          </h2>
          <span className="text-xs font-semibold text-text-secondary bg-background px-4 py-2 rounded-lg border border-border-ui/50">
            📅 May 30, 2026 - May 30, 2026
          </span>
        </div>

        {/* Table Element */}
        <Table data={reminders} columns={columns} selectable={false} />
      </div>
    </div>
  );
}
