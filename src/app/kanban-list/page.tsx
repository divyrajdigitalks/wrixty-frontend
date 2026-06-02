"use client";

import React, { useState, useEffect } from "react";
import { fetchStatuses } from "../../services/statusService";
import { fetchLeads, updateLeadApi } from "../../services/leadService";
import { usePermission } from "../../utils/permissionUtils";

export default function KanbanListPage() {
  const { hasPermission } = usePermission();
  const [statuses, setStatuses] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statusesRes, leadsRes] = await Promise.all([
          fetchStatuses({ page: 1, limit: 100 }),
          fetchLeads({ page: 1, limit: 500 }) // fetching more for kanban board
        ]);
        setStatuses(statusesRes.data);
        const mappedLeads = leadsRes.data.map((l: any) => ({
          ...l,
          id: l._id || l.id,
          statusName: l.status?.name || l.status || "Open",
          productName: l.product || (l.products?.map((p:any) => p.name).join(", ") || "No Product")
        }));
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
    <div className="space-y-8 p-1">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-ui pb-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-gradient-primary">
            Lead Kanban Board
          </h2>
          <p className="text-sm text-text-secondary font-medium">
            Quickly advance leads across stages visually via drag & drop.
          </p>
        </div>
      </div>

      {/* Board Scrollable container */}
      <div className="flex gap-6 overflow-x-auto pb-6 items-start select-none no-scrollbar">
        {statuses.map((stage) => {
          const stageLeads = activeLeads.filter(l => l.statusName === stage.name);
          const stageColor = stage.color || "#0F766E";
          
          return (
            <div
              key={stage.id || stage._id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="w-80 shrink-0 bg-card-bg border border-border-ui rounded-xl p-5 space-y-4 shadow-soft"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border-ui/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shadow-sm animate-pulse" style={{ backgroundColor: stageColor }} />
                  <h4 className="text-sm font-bold text-text-primary">
                    {stage.name}
                  </h4>
                </div>
                <span 
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full border" 
                  style={{ 
                    color: stageColor, 
                    borderColor: `${stageColor}30`, 
                    backgroundColor: `${stageColor}08` 
                  }}
                >
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3.5 min-h-[250px] max-h-[70vh] overflow-y-auto pr-1">
                {stageLeads.length > 0 ? (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable={hasPermission("Kanban-update")}
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className={`group relative p-4 bg-card-bg border border-border-ui/80 rounded-xl shadow-sm hover:shadow-soft transition-all duration-200 text-left ${
                        hasPermission("Kanban-update") 
                          ? "cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:border-primary-teal/40" 
                          : "cursor-default"
                      } ${draggedLeadId === lead.id ? 'opacity-30 border-dashed border-primary-teal bg-primary-teal/5' : ''}`}
                    >
                      {/* Left color bar accent matching status color */}
                      <div 
                        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-lg" 
                        style={{ backgroundColor: stageColor }}
                      />

                      {/* Header Info */}
                      <div className="pl-2 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-text-primary uppercase tracking-wide line-clamp-1 group-hover:text-primary-teal transition-colors">
                            {lead.name}
                          </h5>
                          {lead.subtotal !== undefined && (
                            <span className="text-xs font-extrabold text-text-primary shrink-0">
                              ₹{lead.subtotal}
                            </span>
                          )}
                        </div>

                        {/* Product Tag */}
                        {lead.productName && (
                          <div className="flex">
                            <span className="text-[10px] px-2.5 py-0.5 bg-gradient-subtle text-primary-teal font-bold rounded-lg border border-primary-teal/10">
                              {lead.productName}
                            </span>
                          </div>
                        )}

                        {/* Contact details */}
                        <div className="flex items-center justify-between text-[10px] text-text-secondary font-semibold pt-2.5 border-t border-border-ui/50">
                          <span className="flex items-center gap-1.5 hover:text-text-primary transition-colors">
                            <span className="text-xs">📞</span> {lead.phone_number}
                          </span>
                          {lead.date && (
                            <span className="text-text-secondary/70 text-[9px]">{lead.date}</span>
                          )}
                        </div>

                        {/* Note preview */}
                        {lead.note && (
                          <p className="text-[10px] text-text-secondary bg-background/50 p-2.5 rounded-lg border border-border-ui/60 line-clamp-2 italic">
                            {lead.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border-ui/80 rounded-xl bg-background/40 text-text-secondary p-4 text-center">
                    <span className="text-2xl mb-2 animate-bounce">✨</span>
                    <p className="text-xs font-bold text-text-primary">Drop leads here</p>
                    <p className="text-[10px] text-text-secondary/80 mt-1">Ready to receive opportunities</p>
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
