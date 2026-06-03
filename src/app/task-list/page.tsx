"use client";

import React, { useState } from "react";
import { CalendarToday } from "@mui/icons-material";
import { Table, Column } from "../../components/common/Table";
import { FiTrash2 } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";
import { DateRangePicker } from "../../components/common/DateRangePicker";

export interface Task {
  id: string;
  date: string;
  assginUser: string;
  lead: string;
  phone_number: string;
  addedBy: string;
  message: string;
  status: "Pending" | "Completed";
}

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", date: "2026-05-30", assginUser: "Aman Sharma", lead: "Rajesh Kumar", phone_number: "9988776655", addedBy: "Super Admin", message: "Call regarding bulk order requirements", status: "Pending" },
    { id: "2", date: "2026-05-29", assginUser: "Priya Patel", lead: "Suresh Gupta", phone_number: "8877665544", addedBy: "Super Admin", message: "Confirm delivery details", status: "Completed" }
  ]);
  
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState<string | null>(getTodayString());
  const [endDate, setEndDate] = useState<string | null>(getTodayString());
  const toast = useToast();

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    await new Promise(res => setTimeout(res, 500));
    deleteTask(id);
    toast.warning("Record deleted successfully.");
    setIsDeleting(null);
  };

  const filteredTasks = React.useMemo(() => {
    if (!startDate && !endDate) return tasks;
    return tasks.filter(t => {
      const taskDate = new Date(t.date);
      let isValid = true;
      if (startDate) {
        const start = new Date(startDate);
        if (taskDate < start) isValid = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (taskDate > end) isValid = false;
      }
      return isValid;
    });
  }, [tasks, startDate, endDate]);

  const columns: Column<Task>[] = [
    { key: "date", header: "Date", render: (val) => `${val} 09:55 am` },
    { key: "assginUser", header: "Assign User" },
    { key: "lead", header: "Lead", render: (val) => val || "N/A" },
    { key: "phone_number", header: "Phone Number" },
    { key: "addedBy", header: "Added By" },
    { key: "message", header: "Message" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDelete(row.id)}
            disabled={isDeleting === row.id}
            className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
            title="Delete Record"
          >
            {isDeleting === row.id ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiTrash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        
        {/* Date Range Top Right */}
        <div className="flex items-center justify-end pb-6">
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }} 
          />
        </div>

        {/* Table Element */}
        <Table data={filteredTasks} columns={columns} selectable={false} />
      </div>
    </div>
  );
}
