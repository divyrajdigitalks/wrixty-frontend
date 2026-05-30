"use client";

import React, { useState } from "react";
import { useMockDb, Product } from "../../context/MockDbContext";
import { Table, Column } from "../../components/common/Table";
import { Delete, Edit } from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export default function ProductPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useMockDb();

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [codDiscount, setCodDiscount] = useState(0);
  const [prepaidDiscount, setPrepaidDiscount] = useState(0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name,
      amount,
      cod_dicount: codDiscount,
      prepad_disocount: prepaidDiscount
    });
    setModalOpen(false);
    clear();
  };

  const openEdit = (product: Product) => {
    setActiveProduct(product);
    setName(product.name);
    setAmount(product.amount);
    setCodDiscount(product.cod_dicount);
    setPrepaidDiscount(product.prepad_disocount);
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    updateProduct(activeProduct.id, {
      name,
      amount,
      cod_dicount: codDiscount,
      prepad_disocount: prepaidDiscount
    });
    setEditOpen(false);
    clear();
  };

  const clear = () => {
    setName("");
    setAmount(0);
    setCodDiscount(0);
    setPrepaidDiscount(0);
  };

  const columns: Column<Product>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Name" },
    { key: "amount", header: "Amount", render: (val) => val.toString() },
    { key: "cod_dicount", header: "Cod Discount", render: (val) => val.toString() },
    { key: "prepad_disocount", header: "Prepaid Discount", render: (val) => val.toString() },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all shadow-sm"
            title="Edit Product"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteProduct(row.id)}
            className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded transition-all shadow-sm"
            title="Delete Product"
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
            Product List
          </h2>
          <Button
            onClick={() => {
              clear();
              setModalOpen(true);
            }}
            variant="primary"
          >
            Add Product
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

        <Table data={products} columns={columns} searchable={false} />
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Product">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Amount" type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cod Discount" type="number" value={codDiscount || ""} onChange={(e) => setCodDiscount(Number(e.target.value))} required />
            <Input label="Prepaid Discount" type="number" value={prepaidDiscount || ""} onChange={(e) => setPrepaidDiscount(Number(e.target.value))} required />
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

      {/* Edit Product Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Product">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Amount" type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cod Discount" type="number" value={codDiscount || ""} onChange={(e) => setCodDiscount(Number(e.target.value))} required />
            <Input label="Prepaid Discount" type="number" value={prepaidDiscount || ""} onChange={(e) => setPrepaidDiscount(Number(e.target.value))} required />
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
    </div>
  );
}
