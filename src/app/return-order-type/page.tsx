"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchReturnOrderTypes,
  createReturnOrderType,
  updateReturnOrderType,
  deleteReturnOrderType,
  ReturnOrderType,
} from "../../services/returnOrderTypeService";
import { Table, Column } from "../../components/common/Table";
import { Delete, Edit, AssignmentReturn, Add } from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export default function ReturnOrderTypePage() {
  const [types, setTypes] = useState<ReturnOrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination + search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeType, setActiveType] = useState<ReturnOrderType | null>(null);
  const [name, setName] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  const loadTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchReturnOrderTypes({ page, limit, search });
      setTypes(res.data);
      setTotal(res.total);
    } catch {
      setError("Failed to load return order types. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const validate = () => {
    const errors: { name?: string } = {};
    if (!name.trim()) errors.name = "Return order type name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createReturnOrderType({ name });
      setModalOpen(false);
      setName("");
      setFormErrors({});
      loadTypes();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create return order type.");
    }
  };

  const openEdit = (type: ReturnOrderType) => {
    setActiveType(type);
    setName(type.name);
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!activeType) return;
    try {
      await updateReturnOrderType(activeType._id, { name });
      setEditOpen(false);
      setName("");
      setActiveType(null);
      setFormErrors({});
      loadTypes();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update return order type.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReturnOrderType(id);
      loadTypes();
    } catch {
      setError("Failed to delete return order type.");
    }
  };

  const columns: Column<ReturnOrderType>[] = [
    { key: "_id", header: "No", render: (_, __, i) => (page - 1) * limit + i + 1, sortable: false },
    { 
      key: "name", 
      header: "Type Name",
      render: (val) => (
        <div className="flex items-center gap-2">
          <AssignmentReturn className="text-primary-teal w-4 h-4" />
          <span className="font-semibold">{val}</span>
        </div>
      )
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openEdit(row)} className="p-1.5 bg-primary-teal hover:bg-primary-teal text-white rounded-lg transition-all shadow-sm" title="Edit">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm" title="Delete">
            <Delete className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-6">

        {/* Header Block */}
        <div className="pb-4">
          <h2 className="text-xl font-bold text-zinc-800 ">Return Order Type List</h2>
          <Button onClick={() => { setName(""); setFormErrors({}); setModalOpen(true); }} variant="primary">Add Return Order Type</Button>
        </div>

        {error && (
          <div className="text-sm text-rose-500 bg-rose-50  border border-rose-200  rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <Table
          data={types}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search return order types..."
          idField="_id"
          isLoading={loading}
          serverSide={true}
          totalCount={total}
          currentPage={page}
          rowsPerPage={limit}
          onPageChange={(p, l) => { setPage(p); setLimit(l); }}
          onSearchChange={(s) => { setSearch(s); setPage(1); }}
        />
      </div>

      {/* Add Type Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setName(""); setFormErrors({}); }} title="Add Return Order Type">
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          <div>
            <Input label="Name" value={name} onChange={(e) => { setName(e.target.value); setFormErrors(p => ({ ...p, name: undefined })); }} />
            {formErrors.name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>}
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="px-8">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Type Modal */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setName(""); setActiveType(null); setFormErrors({}); }} title="Edit Return Order Type">
        <form onSubmit={handleEdit} className="space-y-4" noValidate>
          <div>
            <Input label="Name" value={name} onChange={(e) => { setName(e.target.value); setFormErrors(p => ({ ...p, name: undefined })); }} />
            {formErrors.name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>}
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="px-8">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
