"use client";

import React, { useState } from "react";
import { Table, Column } from "../../components/common/Table";
import { Delete, Edit } from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export default function ReturnOrderTypePage() {
  const [types, setTypes] = useState([
    { id: "1", name: "RTO" },
    { id: "2", name: "Damaged Item" },
    { id: "3", name: "Customer Return" }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeType, setActiveType] = useState<typeof types[0] | null>(null);
  const [name, setName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setTypes([...types, { id: Date.now().toString(), name }]);
    setModalOpen(false);
    setName("");
  };

  const openEdit = (type: typeof types[0]) => {
    setActiveType(type);
    setName(type.name);
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeType) return;
    setTypes(types.map(t => t.id === activeType.id ? { ...t, name } : t));
    setEditOpen(false);
    setName("");
  };

  const handleDelete = (id: string) => {
    setTypes(types.filter(t => t.id !== id));
  };

  const columns: Column<typeof types[0]>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Name" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all shadow-sm"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded transition-all shadow-sm"
            title="Delete"
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
            Retrun Order Type List
          </h2>
          <Button
            onClick={() => {
              setName("");
              setModalOpen(true);
            }}
            variant="primary"
          >
            Add Retrun Order Type
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

        <Table data={types} columns={columns} searchable={false} />
      </div>

      {/* Add Type Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Retrun Order Type">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
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

      {/* Edit Type Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Retrun Order Type">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
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
    </div>
  );
}
