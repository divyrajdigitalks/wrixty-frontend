"use client";

import React, { useState } from "react";
import { useMockDb, Status } from "../../context/MockDbContext";
import { Table, Column } from "../../components/common/Table";
import { Delete, Edit } from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export default function StatusPage() {
  const { statuses, addStatus, updateStatus, deleteStatus } = useMockDb();

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<Status | null>(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addStatus({ name, color });
    setModalOpen(false);
    clear();
  };

  const openEdit = (status: Status) => {
    setActiveStatus(status);
    setName(status.name);
    setColor(status.color);
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStatus) return;
    updateStatus(activeStatus.id, { name, color });
    setEditOpen(false);
    clear();
  };

  const clear = () => {
    setName("");
    setColor("#3b82f6");
  };

  const columns: Column<Status>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Name" },
    {
      key: "color",
      header: "Color",
      render: (val) => (
        <span className="inline-block w-8 h-5 rounded-sm shadow-sm" style={{ backgroundColor: val }} />
      )
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all shadow-sm"
            title="Edit Status"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteStatus(row.id)}
            className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded transition-all shadow-sm"
            title="Delete Status"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-md shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            Status List
          </h2>
          <Button
            onClick={() => {
              clear();
              setModalOpen(true);
            }}
            variant="primary"
          >
            Add Status
          </Button>
        </div>

        {/* Table Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <div className="flex items-center gap-1.5">
            <Button variant="primary" size="sm" className="px-3 text-xs">Copy</Button>
            <Button variant="primary" size="sm" className="px-3 text-xs">Excel</Button>
            <Button variant="primary" size="sm" className="px-3 text-xs">CSV</Button>
            <Button variant="primary" size="sm" className="px-3 text-xs">PDF</Button>
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
            Search:
            <input
              type="text"
              placeholder=""
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded py-1.5 px-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <Table data={statuses} columns={columns} searchable={false} />
      </div>

      {/* Add Status Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Status">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Color</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 border border-zinc-250 rounded-md cursor-pointer bg-white"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              className="px-8"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Status Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Status">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Color</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 border border-zinc-250 rounded-md cursor-pointer bg-white"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              className="bg-teal-800 hover:bg-teal-700 px-8"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
