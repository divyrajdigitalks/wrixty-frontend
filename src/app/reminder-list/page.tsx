"use client";

import React, { useState } from "react";
import { CalendarToday } from "@mui/icons-material";
import { Table, Column } from "../../components/common/Table";
import { FiTrash2 } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";
import { usePermission } from "../../utils/permissionUtils";
import { fetchLeads, deleteLeadApi } from "../../services/leadService";
import { DateRangePicker } from "../../components/common/DateRangePicker";


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
    const { hasPermission } = usePermission();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState<string | null>(getTodayString());
  const [endDate, setEndDate] = useState<string | null>(getTodayString());

  const toast = useToast();

  const loadRemindersData = async (assigneeFilter?: string, searchOverride?: string, overrideDates?: { start: string | null, end: string | null }) => {
    setIsFetchingData(true);
    try {
      const searchToUse = searchOverride !== undefined ? searchOverride : searchQuery;
      const startToUse = overrideDates !== undefined ? overrideDates.start : startDate;
      const endToUse = overrideDates !== undefined ? overrideDates.end : endDate;
      
      const res = await fetchLeads({
        page: 1,
        limit: 100,
        assgin: assigneeFilter,
        search: searchToUse || undefined,
        reminderStartDate: startToUse || undefined,
        reminderEndDate: endToUse || undefined
      });
      const data = res.data.filter((l: any) => l.reminder).map((l: any) => ({
        id: l._id || l.id,
        leadId: l._id || l.id,
        title: l.note || `Reminder for ${l.name}`,
        name: l.name,
        phone_number: l.phone_number,
        reminderDate: l.reminder ? (() => {
          const d = new Date(l.reminder);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = String(d.getFullYear()).slice(-2);
          return `${day}/${month}/${year}`;
        })() : "N/A",
        product: l.products?.map((p: any) => p.name).join(", ") || l.product || "Unknown Product",
        amount: l.amount || 0,
        quantity: l.quantity || 1,
        subtotal: l.subtotal || 0,
        assgin: l.assgin?.name || l.assgin || "N/A"
      }));
      setReminders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingData(false);
    }
  };

  React.useEffect(() => {
    const userStr = localStorage.getItem("wrixty_authenticated_user");
    let initialAssigneeFilter = undefined;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        const admin = user?.roles?.some((r: string) => r.toLowerCase().includes('admin'));
        setIsAdmin(admin);
        if (!admin) {
          initialAssigneeFilter = user._id || user.id;
        }
      } catch(e) {}
    }
    loadRemindersData(initialAssigneeFilter);
  }, []);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteLeadApi(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success("Reminder (Lead) deleted.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete reminder");
    } finally {
      setIsDeleting(null);
    }
  };

  const columns: Column<Reminder>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "title", header: "Note / Title", render: (val) => val || "N/A" },
    { key: "name", header: "Customer Name", render: (val) => val || "N/A" },
    { key: "phone_number", header: "Phone Number" },
    { key: "assgin", header: "Assign To" },
    { key: "reminderDate", header: "Reminder Date" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {hasPermission("Reminder-edit") && (
            <button
              onClick={() => handleDelete(row.id)}
              disabled={isDeleting === row.id}
              className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
              title="Delete Reminder"
            >
              {isDeleting === row.id ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiTrash2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
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
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              loadRemindersData(isAdmin ? undefined : (currentUser?._id || currentUser?.id), undefined, { start, end });
            }} 
          />
        </div>

        {/* Table Element */}
        <Table
          data={reminders}
          columns={columns}
          selectable={false}
          isLoading={isFetchingData}
          searchable={true}
          searchPlaceholder="Search reminders..."
          onSearchChange={(val) => {
            setSearchQuery(val);
            // Table already debounces 400ms, then calls this
            loadRemindersData(isAdmin ? undefined : (currentUser?._id || currentUser?.id), val);
          }}
        />
      </div>
    </div>
  );
}
