"use client";

import React, { useState, useEffect } from "react";
import { fetchStatuses } from "../../services/statusService";
import { fetchLeads, updateLeadApi } from "../../services/leadService";
import { fetchUsers } from "../../services/userService";
import { usePermission } from "../../utils/permissionUtils";

export default function KanbanListPage() {
  const { hasPermission } = usePermission();
  const [statuses, setStatuses] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statusesRes, leadsRes, usersRes] = await Promise.all([
          fetchStatuses({ page: 1, limit: 100 }),
          fetchLeads({ page: 1, limit: 500 }), // fetching more for kanban board
          fetchUsers({ page: 1, limit: 100 })
        ]);
        setStatuses(statusesRes.data);
        setUsers(usersRes.data);
        const usersLookup: Record<string, { name: string; email: string }> = {};
        usersRes.data.forEach((u: any) => {
          usersLookup[u._id || u.id] = { name: u.name || "", email: u.email || "" };
        });
        const mappedLeads = leadsRes.data.map((l: any) => {
          // assgin may be a populated object OR a raw ID string
          const assginId  = l.assgin?._id || (typeof l.assgin === "string" ? l.assgin : "") || "";
          const fromObj   = { name: l.assgin?.name || "", email: l.assgin?.email || "" };
          const fromLookup = assginId ? (usersLookup[assginId] || { name: "", email: "" }) : { name: "", email: "" };
          return {
            ...l,
            id: l._id || l.id,
            statusName:  l.status?.name || l.status || "Open",
            productName: l.product || (l.products?.map((p: any) => p.name).join(", ") || "No Product"),
            assginId,
            assginName:  fromObj.name  || fromLookup.name,
            assginEmail: fromObj.email || fromLookup.email,
          };
        });
        setLeads(mappedLeads);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const updateLeadLocally = (id: string, updated: Partial<any>) => {
    setLeads(prev => prev.map(l => (l._id || l.id) === id ? { ...l, ...updated } : l));
  };

  const activeLeads = React.useMemo(() => leads.filter(l => !l.isDeleted), [leads]);

  // Drag and Drop State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, statusObj: any) => {
    e.preventDefault();
    if (!hasPermission("Kanban-update")) {
      setDraggedLeadId(null);
      return;
    }
    if (draggedLeadId) {
      // Optimistic update locally
      updateLeadLocally(draggedLeadId, { statusName: statusObj.name });
      
      try {
        await updateLeadApi(draggedLeadId, { status: statusObj._id || statusObj.id });
      } catch (err) {
        console.error("Failed to update status on backend:", err);
      }
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-zinc-900">
          Kanban Board
        </h2>
        <p className="text-xs text-zinc-500 font-medium tracking-wide">
          Quickly advance leads across stages visually via drag & drop
        </p>
      </div>

      {/* Board Scrollable container */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
        {statuses.map((stage) => {
          const stageLeads = activeLeads.filter(l => l.statusName === stage.name);
          const stageColor = stage.color || "#0F766E";
          
          return (
            <div
              key={stage.id || stage._id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="w-72 shrink-0 bg-white border border-zinc-200 rounded-lg p-4 space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stageColor }} />
                  <h4 className="text-xs font-semibold text-zinc-700">
                    {stage.name}
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-50 text-zinc-500 rounded-lg border border-zinc-200">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 min-h-[150px] max-h-[70vh] overflow-y-auto pr-1">
                {stageLeads.length > 0 ? (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable={hasPermission("Kanban-update")}
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className={`group relative p-3.5 bg-zinc-50 border border-zinc-200/50 rounded-lg shadow-sm text-left transition-all ${
                        hasPermission("Kanban-update") 
                          ? "cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary-teal/30" 
                          : "cursor-default"
                      } ${draggedLeadId === lead.id ? 'opacity-50 border-dashed' : ''}`}
                    >
                      {/* Left side color border matching status column color */}
                      <div 
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full" 
                        style={{ backgroundColor: stageColor }}
                      />

                      {/* Default Visible Content */}
                      <div className="pl-3 space-y-0.5">
                        <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                          {lead.assginName || lead.name || "-"}
                        </h5>
                        {lead.assginEmail && (
                          <p className="text-[10px] text-primary-teal font-medium truncate">
                            ✉ {lead.assginEmail}
                          </p>
                        )}
                        {/* <p className="text-[10px] text-zinc-500 font-semibold">
                          📞 {lead.phone_number}
                        </p> */}
                      </div>

                      {/* Hover Expanded Content */}
                      <div className="hidden group-hover:block pt-3 mt-3 space-y-2.5 border-t border-zinc-200 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary-teal/10 text-primary-teal font-bold rounded-lg">
                            {lead.productName}
                          </span>
                          <span className="text-[10px] font-black text-zinc-700">
                            ₹{lead.subtotal}
                          </span>
                        </div>

                        {lead.note && (
                          <p className="text-[10px] text-zinc-500 line-clamp-3 bg-zinc-100 p-2 rounded-lg">
                            {lead.note}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                          <span>Qty: {lead.quantity}</span>
                          <span>{lead.date}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[100px] border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-[10px] text-zinc-400 font-medium tracking-wide">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}