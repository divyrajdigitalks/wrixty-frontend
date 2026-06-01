"use client";

import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { Table, Column } from "../../components/common/Table";
import { Select } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Close } from "@mui/icons-material";
import { FiEdit, FiTrash2, FiRefreshCcw } from "react-icons/fi";
import { fetchProducts } from "../../services/productService";
import { fetchUsers } from "../../services/userService";

export interface Order {
  id: string;
  leadId: string;
  name: string;
  phone_number: string;
  product: string;
  amount: number;
  quantity: number;
  subtotal: number;
  grandTotal: number;
  date: string;
  paymentType: "COD" | "Prepaid";
  courier: string;
  assginTo: string;
  transactionId: string;
  returnType?: string;
  repartOrderTotal?: number;
  status: string; // Converted, Dispatched, Delivered, Returned
}

interface SelectedProductRow {
  id: string;
  name: string;
  amount: number;
  quantity: number;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([
    { id: "1", leadId: "4", name: "Ramesh Patel", phone_number: "9012345678", product: "Wrixty Brahmi Mind Focus", amount: 890, quantity: 3, subtotal: 2670, grandTotal: 2670, date: "2026-05-28", paymentType: "COD", courier: "Delhivery", assginTo: "Vikram Singh", transactionId: "TXN90283019", status: "Dispatched" }
  ]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([
    { id: "1", name: "Delhivery" },
    { id: "2", name: "BlueDart" },
    { id: "3", name: "XpressBees" },
    { id: "4", name: "DHL Express" }
  ]);

  React.useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [usersRes, prodsRes] = await Promise.all([
          fetchUsers({ page: 1, limit: 100 }),
          fetchProducts({ page: 1, limit: 100 })
        ]);
        setUsers(usersRes.data);
        setProducts(prodsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMasterData();
  }, []);

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const updateOrder = (id: string, updated: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
  };

  const addOrder = (o: Omit<Order, "id">) => {
    setOrders(prev => [...prev, { ...o, id: Date.now().toString() }]);
  };

  const toast = useToast();

  // Selected Leads for bulk options (if needed, but not in screenshot)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters State (matching screenshot 1)
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterCourier, setFilterCourier] = useState("all");

  const [isFetchingData, setIsFetchingData] = useState(false);

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Modal Form States (Shared between Edit and Repeat, though instantiated differently on open)
  const [paymentType, setPaymentType] = useState<"COD" | "Prepaid">("COD");
  const [txnId, setTxnId] = useState("");
  const [courier, setCourier] = useState("");
  
  // Products within Modal
  const [modalSelectedProducts, setModalSelectedProducts] = useState<SelectedProductRow[]>([]);
  const [modalProductSelect, setModalProductSelect] = useState("");
  
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isRepeatingOrder, setIsRepeatingOrder] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const filteredOrders = React.useMemo(() => {
    return orders
      .filter(o => filterProduct === "all" || o.product === filterProduct)
      .filter(o => filterAssignee === "all" || o.assginTo === filterAssignee)
      .filter(o => filterCourier === "all" || o.courier === filterCourier);
  }, [orders, filterProduct, filterAssignee, filterCourier]);

  // Handle adding product to modal table
  const handleAddProduct = () => {
    if (!modalProductSelect) return;
    const prod = products.find(p => p.name === modalProductSelect);
    if (!prod) return;

    if (modalSelectedProducts.some(p => p.id === prod.id)) {
      toast.warning("Product already added!");
      return;
    }

    setModalSelectedProducts([
      ...modalSelectedProducts,
      {
        id: prod.id,
        name: prod.name,
        amount: prod.amount,
        quantity: 1
      }
    ]);
    setModalProductSelect("");
  };

  const handleQtyChange = (id: string, qty: number) => {
    setModalSelectedProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, qty) } : p));
  };

  const handleRemoveProduct = (id: string) => {
    setModalSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const totalAmount = modalSelectedProducts.reduce((sum, p) => sum + p.amount * p.quantity, 0);

  // --- EDIT ORDER LOGIC ---
  const openEdit = (order: Order) => {
    setActiveOrder(order);
    setPaymentType(order.paymentType === "Prepaid" ? "Prepaid" : "COD");
    setTxnId(order.transactionId || "");
    setCourier(order.courier || "");
    
    // Simulate parsing existing products (assuming order.product is comma separated)
    // For a real app, orders should store structured product data. We'll mock it based on products DB.
    const existingProds = products.filter(p => order.product.includes(p.name));
    setModalSelectedProducts(existingProds.map(p => ({
      id: p.id,
      name: p.name,
      amount: p.amount,
      quantity: 1 // Assuming 1 for mock
    })));

    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    if (modalSelectedProducts.length === 0) {
      toast.warning("At least one product is required!");
      return;
    }

    setIsUpdatingOrder(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    updateOrder(activeOrder.id, {
      paymentType,
      transactionId: txnId,
      courier,
      product: modalSelectedProducts.map(p => p.name).join(", "),
      grandTotal: totalAmount
    });
    
    toast.success(`Order details updated successfully.`);
    setIsUpdatingOrder(false);
    setEditOpen(false);
  };

  // --- REPEAT ORDER LOGIC ---
  const openRepeat = (order: Order) => {
    setActiveOrder(order);
    setPaymentType("COD");
    setTxnId("");
    setCourier(couriers[0]?.name || "");
    setModalSelectedProducts([]); // Empty state as requested
    setRepeatOpen(true);
  };

  const handleRepeatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    if (modalSelectedProducts.length === 0) {
      toast.warning("Please add products for the repeat order!");
      return;
    }

    setIsRepeatingOrder(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addOrder({
      leadId: activeOrder.leadId,
      name: activeOrder.name,
      phone_number: activeOrder.phone_number,
      product: modalSelectedProducts.map(p => p.name).join(", "),
      amount: modalSelectedProducts.length > 0 ? modalSelectedProducts[0].amount : 0,
      quantity: modalSelectedProducts.reduce((sum, p) => sum + p.quantity, 0),
      subtotal: totalAmount,
      grandTotal: totalAmount,
      date: new Date().toISOString().split("T")[0],
      paymentType,
      courier,
      assginTo: activeOrder.assginTo,
      transactionId: txnId,
      status: "Dispatched"
    });
    
    toast.success(`Repeat Order created successfully for ${activeOrder.name}!`);
    setIsRepeatingOrder(false);
    setRepeatOpen(false);
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id: string) => {
    setIsDeletingOrder(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    deleteOrder(id);
    toast.warning("Order deleted.");
    setIsDeletingOrder(false);
  };

  const columns: Column<Order>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Lead Name", render: (val) => <span className="uppercase font-semibold text-[11px]">{val}</span> },
    { key: "product", header: "Product Name" },
    { key: "grandTotal", header: "Grand Total", render: (val) => `₹${val.toLocaleString("en-IN")}` },
    { key: "phone_number", header: "Phone Number" },
    { key: "date", header: "Date" },
    { key: "paymentType", header: "Payment Type" },
    { key: "courier", header: "Courier" },
    { key: "assginTo", header: "Assign To" },
    { key: "transactionId", header: "Transaction ID" },
    { key: "status", header: "Return Type", render: (val) => val === "Returned" ? val : "-" },
    { key: "id", header: "Repart Order Total", render: (_, __, i) => i + 1 }, // Mock calculation
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-2 text-text-secondary hover:text-primary-teal hover:bg-primary-teal/5 rounded-lg transition-all inline-flex items-center justify-center"
            title="Edit Order"
          >
            <FiEdit className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-all inline-flex items-center justify-center"
            title="Delete Order"
          >
            <FiTrash2 className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => openRepeat(row)}
            className="p-2 text-text-secondary hover:text-success hover:bg-success/5 rounded-lg transition-all inline-flex items-center justify-center"
            title="Repeat Order"
          >
            <FiRefreshCcw className="w-4.5 h-4.5" />
          </button>
        </div>
      )
    }
  ];

  // Helper renderer for Modal Body shared between Edit and Repeat
  const renderModalBody = () => (
    <div className="space-y-6 text-left">
      {/* Payment Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Payment Type
        </label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-650 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="COD"
              checked={paymentType === "COD"}
              onChange={() => setPaymentType("COD")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            COD Discount
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-650 cursor-pointer">
            <input
              type="radio"
              name="paymentType"
              value="Prepaid"
              checked={paymentType === "Prepaid"}
              onChange={() => setPaymentType("Prepaid")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            Prepaid Discount
          </label>
        </div>
      </div>

      {/* Transaction ID & Courier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Transaction ID"
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          placeholder="e.g. TXN12345"
          required
        />
        <Select
          label="Select Courier"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          options={[
            { value: "", label: "Select Courier" },
            ...couriers.map(c => ({ value: c.name, label: c.name }))
          ]}
        />
      </div>

      {/* Select Products */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-700  uppercase tracking-wider">
          Select Products
        </label>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Select
              value={modalProductSelect}
              onChange={(e) => setModalProductSelect(e.target.value)}
              options={[
                { value: "", label: "Select a Product" },
                ...products.map(p => ({ value: p.name, label: p.name }))
              ]}
            />
          </div>
          <Button
            type="button"
            variant="success"
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Selected Products Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-700  uppercase tracking-wider">
          Selected Products
        </h4>
        <div className="border border-zinc-200  rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50  border-b border-zinc-200  font-semibold text-zinc-500">
                <th className="p-3">Product Name</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 ">
              {modalSelectedProducts.length > 0 ? (
                modalSelectedProducts.map((row) => (
                  <tr key={row.id}>
                    <td className="p-3 font-medium text-zinc-800 ">{row.name}</td>
                    <td className="p-3 font-medium text-zinc-700 ">{row.amount}</td>
                    <td className="p-3 w-28">
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleQtyChange(row.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white  border border-zinc-200  rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td className="p-3 font-medium text-zinc-800 ">{row.amount * row.quantity}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(row.id)}
                        className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-sm text-[10px] transition-all"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-400 font-medium text-sm border-t-2 border-orange-500/30 bg-orange-50/20 ">
                    No products selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Main Container without white card background */}
      <div className="space-y-6">
        
        {/* Header with Title and Date Range */}
        <div className="flex items-center justify-between pb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Order List
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-text-secondary bg-background px-4 py-2 rounded-lg border border-border-ui/50">
              📅 May 30, 2026 - May 30, 2026
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pb-6">
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
              value={filterCourier}
              onChange={(e) => setFilterCourier(e.target.value)}
              options={[
                { value: "all", label: "Select Courier" },
                ...couriers.map(c => ({ value: c.name, label: c.name }))
              ]}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              className="rounded-lg px-6"
            >
              Apply Filter
            </Button>
            <Button
              variant="outline"
              className="rounded-lg px-6"
              onClick={() => {
                setFilterProduct("all");
                setFilterAssignee("all");
                setFilterCourier("all");
              }}
            >
              Clear Filter
            </Button>
            <Button
              variant="outline"
              className="rounded-lg px-6"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Table database */}
        <Table data={filteredOrders} columns={columns} selectable isLoading={isFetchingData} />
      </div>

      {/* Edit Order Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Order" sizeClass="max-w-4xl" isLoading={isUpdatingOrder}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {renderModalBody()}
          <div className="flex items-center justify-end gap-4 border-t border-zinc-150  pt-4 mt-2">
            <span className="text-sm font-semibold text-zinc-700  mr-auto">
              Total Amount: {totalAmount.toFixed(2)}
            </span>
            <Button
              type="button"
              variant="danger"
              className="bg-[#c2624c] hover:bg-[#b0523d] focus:ring-[#c2624c]"
              onClick={() => setEditOpen(false)}
              disabled={isUpdatingOrder}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800"
              isLoading={isUpdatingOrder}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Repeat Order Modal */}
      <Modal isOpen={repeatOpen} onClose={() => setRepeatOpen(false)} title={`Repeat Order(${activeOrder?.name || "Customer"})`} sizeClass="max-w-4xl" isLoading={isRepeatingOrder}>
        <form onSubmit={handleRepeatSubmit} className="space-y-4">
          {renderModalBody()}
          <div className="flex items-center justify-end gap-4 border-t border-zinc-150  pt-4 mt-2">
            <span className="text-sm font-semibold text-zinc-700  mr-auto">
              Total Amount: {totalAmount}
            </span>
            <Button
              type="button"
              variant="danger"
              className="bg-[#c2624c] hover:bg-[#b0523d] focus:ring-[#c2624c]"
              onClick={() => setRepeatOpen(false)}
              disabled={isRepeatingOrder}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800"
              isLoading={isRepeatingOrder}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
