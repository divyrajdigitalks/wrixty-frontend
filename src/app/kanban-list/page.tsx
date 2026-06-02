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
        <h2 className="text-2xl font-bold text-[#1f2f3e]">
          Kanban Board
        </h2>
        <p className="text-sm text-text-secondary font-medium tracking-wide">
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
              className="w-80 shrink-0 bg-white border border-border-ui rounded-lg p-4 space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-ui pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stageColor }} />
                  <h4 className="text-sm font-bold text-[#1f2f3e] uppercase tracking-wide">
                    {stage.name}
                  </h4>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-background text-[#1f2f3e] rounded-lg border border-border-ui">
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
                      className={`group relative p-4 bg-background/50 border border-border-ui/50 rounded-lg shadow-sm text-left transition-all ${
                        hasPermission("Kanban-update") 
                          ? "cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary-teal/30" 
                          : "cursor-default"
                      } ${draggedLeadId === lead.id ? 'opacity-50 border-dashed' : ''}`}
                    >
                      {/* Left side color border matching status column color */}
                      <div 
                        className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full" 
                        style={{ backgroundColor: stageColor }}
                      />

                      {/* Default Visible Content */}
                      <div className="pl-4 space-y-1">
                        <h5 className="text-[14px] font-bold text-[#1f2f3e] uppercase tracking-wide leading-tight">
                          {lead.name || lead.assginName || "-"}
                        </h5>
                        <div className="flex flex-col gap-0.5">
                          {lead.assginName && (
                             <p className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                              Assigned: {lead.assginName}
                            </p>
                          )}
                          {lead.assginEmail && (
                            <p className="text-[11px] text-primary-teal font-semibold truncate">
                              ✉ {lead.assginEmail}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Hover Expanded Content */}
                      <div className="hidden group-hover:block pt-3 mt-3 space-y-3 border-t border-border-ui animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] px-2 py-0.5 bg-primary-teal/10 text-primary-teal font-bold rounded-lg uppercase">
                            {lead.productName}
                          </span>
                          <span className="text-xs font-bold text-[#1f2f3e]">
                            ₹{lead.subtotal}
                          </span>
                        </div>

                        {lead.note && (
                          <p className="text-[11px] text-text-secondary line-clamp-3 bg-white p-2.5 rounded-lg border border-border-ui/30 italic">
                            {lead.note}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                          <span>Qty: {lead.quantity}</span>
                          <span>{lead.date}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[120px] border-2 border-dashed border-border-ui rounded-lg bg-background/30 text-xs text-text-secondary font-bold uppercase tracking-widest">
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