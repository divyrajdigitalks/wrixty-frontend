"use client";

import React, { useState } from "react";
import { useMockDb } from "../../context/MockDbContext";
import { Table, Column } from "../../components/common/Table";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";

export default function ActivityLogPage() {
  const { leads, orders, users } = useMockDb();

  const [filterUser, setFilterUser] = useState("all");

  
  const logs = React.useMemo(() => {
    const list: { id: string; date: string; user: string; lead: string; message: string }[] = [];
    
    
    list.push({ id: "log-1", date: "30/05/2026 12:55 pm", user: "Dhruvi Dhameliya", lead: "AJAYBHAI SOLANKI", message: "Lead Created successfully" });
    list.push({ id: "log-2", date: "30/05/2026 12:35 pm", user: "Dhara patel", lead: "HEMA PATEL", message: "Lead Created successfully" });
    list.push({ id: "log-3", date: "30/05/2026 12:35 pm", user: "Dhara patel", lead: "N/A", message: "Lead Convert To Order successfully" });
    list.push({ id: "log-4", date: "30/05/2026 12:33 pm", user: "Dipali", lead: "N/A", message: "Lead Status Two Change successfully" });
    list.push({ id: "log-5", date: "30/05/2026 12:33 pm", user: "Dhara patel", lead: "N/A", message: "Lead Status Change successfully" });
    list.push({ id: "log-6", date: "30/05/2026 12:33 pm", user: "Dhara patel", lead: "N/A", message: "Lead Status Two Change successfully" });
    list.push({ id: "log-7", date: "30/05/2026 12:32 pm", user: "Dipali", lead: "N/A", message: "Lead Created successfully" });
    list.push({ id: "log-8", date: "30/05/2026 12:29 pm", user: "Dhara patel", lead: "N/A", message: "Lead Status Change successfully" });
    list.push({ id: "log-9", date: "30/05/2026 12:29 pm", user: "Dhara patel", lead: "N/A", message: "Lead Status Two Change successfully" });
    list.push({ id: "log-10", date:"30/05/2026 12:26 pm", user: "Dhara patel", lead: "N/A", message: "Lead Created successfully" });

    leads.forEach((l, i) => {
      list.push({
        id: `lead-init-${i}`,
        date: `${l.date} ${l.time || "10:00 am"}`,
        user: l.assgin || "System",
        lead: l.name,
        message: `Lead Created successfully`
      });
      if (l.isDeleted) {
        list.push({
          id: `lead-del-${i}`,
          date: `${l.deleteDate || l.date} 12:00 pm`,
          user: "Super Admin",
          lead: l.name,
          message: "Soft-deleted from main database."
        });
      }
    });

    orders.forEach((o, i) => {
      list.push({
        id: `order-conv-${i}`,
        date: `${o.date} 02:00 pm`,
        user: o.assginTo || "Super Admin",
        lead: o.name,
        message: `Lead Convert To Order successfully`
      });
    });

    // Simple sort just to keep some order, though mock data has hardcoded dates
    return list.filter(l => filterUser === "all" || l.user === filterUser).sort((a, b) => b.id.localeCompare(a.id));
  }, [leads, orders, filterUser]);

  const columns: Column<typeof logs[0]>[] = [
    { key: "date", header: "Date" },
    { key: "user", header: "User" },
    { key: "lead", header: "Lead" },
    { key: "message", header: "Message" }
  ];

  return (
    <div className="space-y-6">
    
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-md shadow-sm space-y-6">
        
       
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <div className="w-full sm:w-auto min-w-[160px]">
            <Select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              options={[
                { value: "all", label: "Select Assign" },
                ...users.map(u => ({ value: u.name, label: u.name })),
                { value: "Dhruvi Dhameliya", label: "Dhruvi Dhameliya" },
                { value: "Dhara patel", label: "Dhara patel" },
                { value: "Dipali", label: "Dipali" }
              ]}
            />
          </div>
          
          <Button variant="primary">
            Apply Filter
          </Button>
          <Button variant="outline" onClick={() => setFilterUser("all")}>
            Clear Filter
          </Button>
          
          <div className="flex items-center gap-3 ml-2">
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded border border-zinc-200/50 dark:border-zinc-800">
              📅 May 30, 2026 - May 30, 2526
            </span>
          </div>

          <Button variant="outline">
            Export
          </Button>
        </div>

        {/* Table Element */}
        <Table data={logs} columns={columns} selectable={false} />
      </div>
    </div>
  );
}
