"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import { Table, Column } from "../../components/common/Table";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import {
  fetchCouriers,
  createCourier,
  updateCourier,
  deleteCourier,
  Courier
} from "../../services/courierService";
import { usePermission } from "../../utils/permissionUtils";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

export default function CourierListPage() {
  const { hasPermission } = usePermission();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Server-side pagination + search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeCourier, setActiveCourier] = useState<Courier | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [courierToDelete, setCourierToDelete] = useState<Courier | null>(null);

  const [name, setName] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  const loadCouriers = useCallback(async () => {
    try {
      setLoading(true);
      
      const res = await fetchCouriers({ page, limit, search });
      setCouriers(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load couriers. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadCouriers();
  }, [loadCouriers]);

  const validate = () => {
    const errors: { name?: string } = {};
    if (!name.trim()) errors.name = "Courier name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createCourier({ name });
      setModalOpen(false);
      setName("");
      setFormErrors({});
      loadCouriers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create courier.");
    }
  };

  const openEdit = (courier: Courier) => {
    setActiveCourier(courier);
    setName(courier.name);
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!activeCourier) return;
    try {
      await updateCourier(activeCourier._id, { name });
      setEditOpen(false);
      setName("");
      setActiveCourier(null);
      setFormErrors({});
      loadCouriers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update courier.");
    }
  };

  const handleDeleteClick = (courier: Courier) => {
    setCourierToDelete(courier);
    setDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!courierToDelete) return;
    try {
      await deleteCourier(courierToDelete._id);
      setDeleteOpen(false);
      setCourierToDelete(null);
      loadCouriers();
    } catch {
      toast.error("Failed to delete courier.");
    }
  };

  const columns: Column<Courier>[] = [
    { key: "_id", header: "No", render: (_, __, i) => (page - 1) * limit + i + 1, sortable: false },
    { key: "name", header: "Name" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {hasPermission("Currier-edit") && (
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 bg-primary-teal hover:bg-primary-teal text-white rounded-lg transition-all shadow-sm"
              title="Edit"
            >
              <FiEdit className="w-3.5 h-3.5" />
            </button>
          )}
          {hasPermission("Currier-delete") && (
            <button
              onClick={() => handleDeleteClick(row)}
              className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm"
              title="Delete"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-800 ">
            Courier List
          </h2>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Manage dispatch delivery partners
          </p>
        </div>
        {hasPermission("Currier-add") && (
          <Button
            variant="primary"
            onClick={() => {
              setName("");
              setFormErrors({});
              setModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-lg"
          >
            <FiPlus className="w-4 h-4" /> Add Courier
          </Button>
        )}
      </div>

      

      <Table
        data={couriers}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search couriers..."
        idField="_id"
        isLoading={loading}
        serverSide={true}
        totalCount={total}
        currentPage={page}
        rowsPerPage={limit}
        onPageChange={(p, l) => { setPage(p); setLimit(l); }}
        onSearchChange={(s) => { setSearch(s); setPage(1); }}
      />

      {/* Add Courier Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setName(""); setFormErrors({}); }} title="Add Courier Partner">
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          <div>
            <Input label="Courier Name" value={name} onChange={(e) => { setName(e.target.value); setFormErrors(p => ({ ...p, name: undefined })); }} required placeholder="e.g. FedEx India" />
            {formErrors.name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>}
          </div>
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
            >
              Register Courier
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Courier Modal */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setName(""); setActiveCourier(null); setFormErrors({}); }} title="Edit Courier Partner">
        <form onSubmit={handleEdit} className="space-y-4" noValidate>
          <div>
            <Input label="Courier Name" value={name} onChange={(e) => { setName(e.target.value); setFormErrors(p => ({ ...p, name: undefined })); }} required />
            {formErrors.name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>}
          </div>
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={executeDelete}
        title="Delete Courier"
        itemName={courierToDelete?.name}
        itemType="courier"
      />
    </div>
  );
}
