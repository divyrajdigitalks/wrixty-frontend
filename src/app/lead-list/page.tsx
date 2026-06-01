"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMockDb, Lead } from "../../context/MockDbContext";
import { useToast } from "../../context/ToastContext";
import { Table, Column } from "../../components/common/Table";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { Add, SwapHoriz, Delete, Edit, Assignment, Note } from "@mui/icons-material";

interface SelectedProductRow {
  id: string;
  name: string;
  amount: number;
  quantity: number;
}

export default function LeadListPage() {
  const { leads, products, users, statuses, couriers, addLead, updateLead, deleteLead, convertToOrder } = useMockDb();
  const toast = useToast();

  const router = useRouter();

  // Selected Leads for bulk options
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Loading states
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);
  const [isConvertingLead, setIsConvertingLead] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  // Form states for Edit
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Open");
  const [statusTwo, setStatusTwo] = useState("CNR");
  const [noteText, setNoteText] = useState("");
  const [assignee, setAssignee] = useState("");
  const [reminder, setReminder] = useState("");

  // Form states for Convert to Order
  const [paymentType, setPaymentType] = useState<"COD" | "Prepaid">("COD");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Filters State
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterReason, setFilterReason] = useState("all");

  // 1. Filtering logic
  const filteredLeads = React.useMemo(() => {
    return leads
      .filter(l => !l.isDeleted)
      .filter(l => filterProduct === "all" || l.product === filterProduct)
      .filter(l => filterAssignee === "all" || l.assgin === filterAssignee)
      .filter(l => filterStatus === "all" || l.status === filterStatus)
      .filter(l => filterReason === "all" || l.reason_call === filterReason);
  }, [leads, filterProduct, filterAssignee, filterStatus, filterReason]);



  const openNoteModal = (lead: Lead) => {
    setActiveLead(lead);
    setNoteText(lead.note || "");
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    
    updateLead(activeLead.id, { note: noteText });
    toast.success("Note saved successfully!");
    setNoteModalOpen(false);
  };

  const openEditModal = (lead: Lead) => {
    setActiveLead(lead);
    setName(lead.name);
    setPhone(lead.phone_number);
    setStatus(lead.status);
    setStatusTwo(lead.reason_call || "CNR");
    setNoteText(lead.note);
    setAssignee(lead.assgin);
    setReminder(lead.reminderDate || "");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;

    setIsUpdatingLead(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    updateLead(activeLead.id, {
      name,
      phone_number: phone,
      assgin: assignee,
      status,
      reason_call: statusTwo,
      note: noteText,
      reminderDate: reminder
    });
    toast.info(`Lead configuration updated.`);
    setIsUpdatingLead(false);
    setEditModalOpen(false);
  };

  const openConvertModal = (lead: Lead) => {
    setActiveLead(lead);
    setPaymentType("COD");
    setSelectedCourier(couriers[0]?.name || "Shiprocket");
    setTransactionId("");
    setConvertModalOpen(true);
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    
    setIsConvertingLead(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    convertToOrder(activeLead.id, {
      paymentType,
      courier: selectedCourier,
      transactionId
    });
    toast.success(`Successfully converted ${activeLead.name || "Customer"} to order!`);
    setIsConvertingLead(false);
    setConvertModalOpen(false);
  };

  const handleBulkDelete = async () => {
    setIsDeletingLead(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    selectedIds.forEach(id => deleteLead(id));
    toast.warning(`Soft-deleted ${selectedIds.length} lead records.`);
    setSelectedIds([]);
    setIsDeletingLead(false);
  };

  // Columns matching screenshot exactly
  const columns: Column<Lead>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Customer Name", render: (val) => val || "-" },
    { key: "phone_number", header: "Phone Number" },
    { key: "product", header: "Product Name" },
    { key: "subtotal", header: "Total", render: (val) => `₹${val}` },
    { key: "assgin", header: "Assign By" },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (val) => {
        let badgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"; // Open / New
        if (val === "Inprogress" || val === "In-Progress") {
          badgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20";
        }
        if (val === "Close" || val === "Closed") {
          badgeClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20";
        }
        
        return (
          <span className={`inline-block whitespace-nowrap px-2.5 py-1 text-[11px] font-bold rounded-md text-center ${badgeClass}`}>
            {val}
          </span>
        );
      }
    },
    {
      key: "reason_call",
      header: "Reason Call",
      render: (val) => (
        <span className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded font-semibold text-xs">
          {val || "CNR"}
        </span>
      )
    },
    {
      key: "convert",
      header: "Convert Order",
      sortable: false,
      render: (_, row) => (
        <Button
          onClick={() => openConvertModal(row)}
          variant="primary"
          size="sm"
          className="text-[11px]"
        >
          Convert To Order
        </Button>
      )
    },
    {
      key: "note",
      header: "Note",
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => openNoteModal(row)}
          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded transition-all border border-amber-500/20 shadow-sm inline-flex items-center justify-center"
          title={row.note || "No note"}
        >
          <Note className="w-4 h-4" />
        </button>
      )
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 rounded border border-indigo-500/20 transition-all inline-flex items-center justify-center"
            title="Edit Lead"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteLead(row.id)}
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded border border-rose-500/20 transition-all inline-flex items-center justify-center"
            title="Delete Lead"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Lead List Main White Card matching screenshots */}
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-md shadow-sm space-y-6">
        
        {/* Card Header title and Add button */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            Lead List
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded border border-zinc-200/50 dark:border-zinc-800">
              📅 May 30, 2026 - May 30, 2026
            </span>
            <Button
              onClick={() => router.push("/add-lead")}
              variant="primary"
            >
              Add Lead
            </Button>
          </div>
        </div>

        {/* Inline Filters & Action Buttons exactly matching first screenshot layout */}
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              options={[
                { value: "all", label: "Select Product" },
                ...products.map(p => ({ value: p.name, label: p.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              options={[
                { value: "all", label: "Select Assign" },
                ...users.map(u => ({ value: u.name, label: u.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "all", label: "Select Status" },
                ...statuses.map(s => ({ value: s.name, label: s.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              options={[
                { value: "all", label: "Select Reason Call" },
                { value: "CNR", label: "CNR" },
                { value: "Call Busy", label: "Call Busy" },
                { value: "Number off", label: "Number off" },
                { value: " vichari ne kese", label: " vichari ne kese" }
              ]}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              onClick={() => toast.info("Filter parameters applied successfully.")}
            >
              Apply Filter
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilterProduct("all");
                setFilterAssignee("all");
                setFilterStatus("all");
                setFilterReason("all");
                toast.info("Filters cleared.");
              }}
            >
              Clear Filter
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info("Assigned lead workflow initiated.")}
            >
              Assign Lead
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("Lead data successfully exported to Excel!")}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Selected ids bulk deletes */}
        {selectedIds.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              isLoading={isDeletingLead}
            >
              Bulk Delete ({selectedIds.length})
            </Button>
          </div>
        )}

        {/* Entries & Search row */}
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-2">
          <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
            Show
            <select className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded py-1 px-1 text-xs">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            entries
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
            Search:
            <input
              type="text"
              placeholder=""
              className="bg-zinc-55 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded py-1 px-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Table database */}
        <Table
          data={filteredLeads}
          columns={columns}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchable={false}
          isLoading={isFetchingData}
        />
      </div>



      {/* Edit Lead Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Lead Details" isLoading={isUpdatingLead}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Customer Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assign Staff"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              options={users.map(u => ({ value: u.name, label: u.name }))}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statuses.map(s => ({ value: s.name, label: s.name }))}
            />
          </div>
          <Input label="Reason Call" value={statusTwo} onChange={(e) => setStatusTwo(e.target.value)} />
          <Input label="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <Input label="Reminder" type="date" value={reminder} onChange={(e) => setReminder(e.target.value)} />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isUpdatingLead}
          >
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Convert to Order Modal */}
      <Modal isOpen={convertModalOpen} onClose={() => setConvertModalOpen(false)} title="Convert Lead to Order" isLoading={isConvertingLead}>
        <form onSubmit={handleConvertSubmit} className="space-y-4">
          <p className="text-xs text-zinc-500 font-medium">
            You are converting <span className="font-bold text-zinc-700 dark:text-zinc-300">{activeLead?.name || "Customer"}</span>'s lead into a final dispatched order.
          </p>
          <Select
            label="Payment Type"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as any)}
            options={[
              { value: "COD", label: "Cash on Delivery (COD)" },
              { value: "Prepaid", label: "Prepaid Online" }
            ]}
          />
          <Select
            label="Courier Partner"
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            options={couriers.map(c => ({ value: c.name, label: c.name }))}
          />
          <Input
            label="Transaction / Tracking ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            placeholder="e.g. TXN90283019"
          />
          <Button
            type="submit"
            variant="success"
            fullWidth
            isLoading={isConvertingLead}
          >
            Approve & Dispatch Order
          </Button>
        </form>
      </Modal>

      {/* Note Modal */}
      <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Lead Note">
        <form onSubmit={handleSaveNote} className="space-y-4">
          <p className="text-xs text-zinc-500 font-medium">
            Adding a note for <span className="font-bold text-zinc-700 dark:text-zinc-300">{activeLead?.name || "Customer"}</span>
          </p>
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Note Details</label>
            <textarea
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none"
              rows={4}
              placeholder="Write your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
          >
            Save Note
          </Button>
        </form>
      </Modal>
    </div>
  );
}
