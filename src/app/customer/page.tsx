"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchCustomers,
  updateCustomerApi,
  deleteCustomerApi,
  Customer,
} from "../../services/customerService";
import { Table, Column } from "../../components/common/Table";
import { Person } from "@mui/icons-material";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string, phone?: string }>({});

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchCustomers();
      if (res && Array.isArray(res.data)) {
        setCustomers(res.data);
      } else if (res && Array.isArray(res)) {
        setCustomers(res);
      }
    } catch {
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const validate = () => {
    const errors: { name?: string, phone?: string } = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!phone.trim()) {
      errors.phone = "Phone is required";
    } else if (phone.length !== 10) {
      errors.phone = "Phone number must be exactly 10 digits";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openEdit = (customer: Customer) => {
    setActiveCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone_number.replace(/\D/g, "").slice(0, 10));
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!activeCustomer || !activeCustomer._id) return;
    try {
      await updateCustomerApi(activeCustomer._id, { name, phone_number: phone });
      setEditOpen(false);
      clear();
      toast.success("Customer updated successfully.");
      loadCustomers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update customer.");
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await deleteCustomerApi(id);
      toast.success("Customer deleted successfully.");
      loadCustomers();
    } catch {
      toast.error("Failed to delete customer.");
    }
  };

  const clear = () => {
    setName("");
    setPhone("");
    setActiveCustomer(null);
    setFormErrors({});
  };

  const columns: Column<Customer>[] = [
    { key: "_id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { 
      key: "name", 
      header: "Name",
      render: (val) => (
        <div className="flex items-center gap-2">
          <Person className="text-primary-teal w-4 h-4" />
          <span className="font-semibold">{val}</span>
        </div>
      )
    },
    { key: "phone_number", header: "Phone Number" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openEdit(row)} className="p-1.5 bg-primary-teal hover:bg-primary-teal text-white rounded-lg transition-all shadow-sm" title="Edit Customer">
            <FiEdit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm" title="Delete Customer">
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-800">Customer Master</h2>
          </div>
        </div>

        <Table
          data={customers}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search customers..."
          idField="_id"
          isLoading={loading}
          serverSide={false}
        />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); clear(); }} title="Edit Customer">
        <form onSubmit={handleEditSubmit} className="space-y-4" noValidate>
          <div>
            <Input label="Name" value={name} onChange={(e) => { setName(e.target.value); setFormErrors(p => ({ ...p, name: undefined })); }} />
            {formErrors.name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <Input 
              label="Phone Number" 
              type="text" 
              value={phone} 
              onChange={(e) => { 
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 10) {
                  setPhone(val); 
                  setFormErrors(p => ({ ...p, phone: undefined })); 
                }
              }} 
            />
            {formErrors.phone && <p className="text-rose-500 text-[11px] mt-1">{formErrors.phone}</p>}
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="bg-teal-800 hover:bg-teal-700 px-8">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
