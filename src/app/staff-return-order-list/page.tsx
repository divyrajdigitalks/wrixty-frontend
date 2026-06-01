"use client";

import React from "react";
import { Table, Column } from "../../components/common/Table";

export default function StaffReturnOrderListPage() {

  const staffStats = React.useMemo(() => {
    // Generate mock list according to screenshot
    const data = [
      { id: "1", name: "Dhruvi Dhameliya", returns: 5 },
      { id: "2", name: "Vibha-1", returns: 0 },
      { id: "3", name: "Dhara patel", returns: 4 },
      { id: "4", name: "priyanka patel", returns: 0 },
      { id: "5", name: "akta patel", returns: 0 },
      { id: "6", name: "Mansi Rawat", returns: 0 },
      { id: "7", name: "nikita chand", returns: 0 },
      { id: "8", name: "sanjana patel", returns: 0 },
      { id: "9", name: "apexa patel", returns: 0 },
      { id: "10", name: "Dipali", returns: 0 },
    ];
    return data;
  }, []);

  const columns: Column<typeof staffStats[0]>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Staff Name" },
    { key: "returns", header: "Return Order" },
  ];

  return (
    <div className="space-y-6">
      {/* White Card Container */}
      <div className="bg-white  p-6 border border-zinc-200  rounded-lg shadow-sm space-y-6">
        
        {/* Header and Date Range */}
        <div className="flex items-center justify-between border-b border-zinc-100  pb-4">
          <h2 className="text-xl font-bold text-zinc-800 ">
            Return Order Report List
          </h2>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100  px-3 py-2 rounded-lg border border-zinc-200/50 ">
            📅 May 30, 2026 - May 30, 2026
          </span>
        </div>

        <Table data={staffStats} columns={columns} selectable={false} />
      </div>
    </div>
  );
}
