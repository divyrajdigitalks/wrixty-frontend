"use client";

import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { Table, Column } from "../../components/common/Table";
import { Select } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { Close, CalendarToday } from "@mui/icons-material";
import { FiEdit, FiTrash2, FiRefreshCcw } from "react-icons/fi";
import { fetchProducts } from "../../services/productService";
import { fetchUsers } from "../../services/userService";
import { fetchOrders, createOrderApi, updateOrderApi, deleteOrderApi, exportOrders } from "../../services/orderService";
import { usePermission } from "../../utils/permissionUtils";
import { fetchCouriers } from "../../services/courierService";
import { DateRangePicker } from "../../components/common/DateRangePicker";

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
  assginToId?: string;
  transactionId: string;
  returnType?: string;
  repartOrderTotal?: number;
  status: string; // Converted, Dispatched, Delivered, Returned
  _products?: any[];
  products?: any[];
}

interface SelectedProductRow {
  id: string;
  productId?: string;
  name: string;
  amount: number;
  quantity: number;
  subtotal?: number;
}

export default function OrderListPage() {
  const { hasPermission } = usePermission();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState<string | null>(getTodayString());
  const [endDate, setEndDate] = useState<string | null>(getTodayString());

  const loadOrdersData = async (searchOverride?: string, overrideDates?: { start: string | null, end: string | null }) => {
    try {
      setIsFetchingData(true);
      const searchToUse = searchOverride !== undefined ? searchOverride : searchQuery;
      const startToUse = overrideDates !== undefined ? overrideDates.start : startDate;
      const endToUse = overrideDates !== undefined ? overrideDates.end : endDate;
      
      const ordersRes = await fetchOrders({ 
        page: 1, 
        limit: 100,
        search: searchToUse || undefined,
        product: filterProduct !== 'all' ? filterProduct : undefined,
        assginTo: filterAssignee !== 'all' ? filterAssignee : undefined,
        courier: filterCourier !== 'all' ? filterCourier : undefined,
        startDate: startToUse || undefined,
        endDate: endToUse || undefined
      });
      // Map backend orders to frontend format
      const mapped = ordersRes.data.map((o: any) => ({
        id: o._id || o.id,
        leadId: o.leadId?._id || o.leadId || "",
        name: o.name,
        phone_number: o.phone_number,
        product: o.product || (o.products?.map((p: any) => p.name).join(", ") || ""),
        amount: o.amount || 0,
        quantity: o.quantity || 1,
        subtotal: o.amount || 0,
        grandTotal: o.grandTotal || o.subtotal || (o.products?.length ? o.products.reduce((acc: number, p: any) => acc + (p.subtotal || (p.amount * (p.quantity || 1)) || 0), 0) : (o.amount || 0)),
        date: o.createdAt ? (() => {
          const d = new Date(o.createdAt);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = String(d.getFullYear()).slice(-2);
          return `${day}/${month}/${year}`;
        })() : "",
        paymentType: o.paymentType || "COD",
        courier: o.courier || "",
        assginTo: o.assginTo?.name || o.assginTo || "",
        assginToId: typeof o.assginTo === 'object' ? (o.assginTo?._id || o.assginTo?.id || "") : (o.assginTo || ""),
        transactionId: o.transactionId || "",
        status: o.status || "Dispatched",
        // Store raw products array for edit modal
        _products: o.products || []
      }));
      setOrders(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingData(false);
    }
  };

  React.useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [usersRes, prodsRes, couriersRes] = await Promise.all([
          fetchUsers({ page: 1, limit: 100 }),
          fetchProducts({ page: 1, limit: 100 }),
          fetchCouriers({ page: 1, limit: 100 })
        ]);
        setUsers(usersRes.data);
        setProducts(prodsRes.data);
        if (couriersRes?.data) setCouriers(couriersRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMasterData();
    loadOrdersData();
  }, []);

  const deleteOrder = async (id: string) => {
    try {
      await deleteOrderApi(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.warning("Order deleted.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  const updateOrder = async (id: string, updated: Partial<Order>) => {
    try {
      await updateOrderApi(id, updated as any);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update order");
    }
  };

  const addOrder = async (o: Omit<Order, "id">) => {
    try {
      const created = await createOrderApi(o as any);
      const createdId = (created as any)._id || Date.now().toString();
      
      setOrders(prev => {
        const existingIdx = prev.findIndex(p => p.id === createdId);
        if (existingIdx >= 0) {
          // If the backend merged this order into an existing one, update the existing row
          const updated = [...prev];
          // We map the returned backend object to the frontend format to get accurate totals
          const oData = created as any;
          updated[existingIdx] = {
            ...updated[existingIdx],
            product: oData.product || (oData.products?.map((p: any) => p.name).join(", ") || ""),
            amount: oData.amount || 0,
            quantity: oData.quantity || 1,
            subtotal: oData.amount || 0,
            grandTotal: oData.grandTotal || oData.subtotal || (oData.products?.length ? oData.products.reduce((acc: number, p: any) => acc + (p.subtotal || (p.amount * (p.quantity || 1)) || 0), 0) : (oData.amount || 0)),
            _products: oData.products || []
          };
          return updated;
        }
        // Otherwise, append as a new order
        return [...prev, { ...o, id: createdId }];
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create order");
      throw err;
    }
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
  const [isExporting, setIsExporting] = useState(false);

  const filteredOrders = React.useMemo(() => {
    return orders;
  }, [orders]);

  // Handle adding product to modal table
  const handleAddProduct = () => {
    if (!modalProductSelect) return;
    const prod = products.find(p => (p._id || p.id) === modalProductSelect);
    if (!prod) return;

    const existingIdx = modalSelectedProducts.findIndex(p => p.id === (prod._id || prod.id));
    if (existingIdx >= 0) {
      // Increment quantity if already added
      const updated = [...modalSelectedProducts];
      updated[existingIdx].quantity += 1;
      updated[existingIdx].subtotal = updated[existingIdx].amount * updated[existingIdx].quantity;
      setModalSelectedProducts(updated);
      toast.success("Product quantity incremented!");
      return;
    }

    setModalSelectedProducts([
      ...modalSelectedProducts,
      {
        id: prod._id || prod.id,
        productId: prod._id || prod.id,
        name: prod.name,
        amount: prod.amount,
        quantity: 1,
        subtotal: prod.amount
      }
    ]);
    setModalProductSelect("");
  };

  const handleQtyChange = (id: string, qty: number) => {
    setModalSelectedProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, qty), subtotal: p.amount * Math.max(1, qty) } : p));
  };

  const handleRemoveProduct = (id: string) => {
    setModalSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const totalAmount = modalSelectedProducts.reduce((sum, p) => sum + p.amount * p.quantity, 0);

  // --- EDIT ORDER LOGIC ---
  const openEdit = (order: any) => {
    setActiveOrder(order);
    setPaymentType(order.paymentType === "Prepaid" ? "Prepaid" : "COD");
    setTxnId(order.transactionId || "");
    setCourier(order.courier || "");
    
    // Use structured products array if available from backend
    const rawProducts: any[] = order._products || [];
    if (rawProducts.length > 0) {
      setModalSelectedProducts(rawProducts.map((p: any) => ({
        id: p.productId?._id || p.productId || p._id || p.id || Math.random().toString(),
        productId: p.productId?._id || p.productId || p._id || p.id,
        name: p.productId?.name || p.name || "",
        amount: p.productId?.amount || p.amount || 0,
        quantity: p.quantity || 1,
        subtotal: p.subtotal || ((p.productId?.amount || p.amount || 0) * (p.quantity || 1))
      })));
    } else {
      // Fallback: parse from product name string
      const existingProds = products.filter(p => order.product.includes(p.name));
      setModalSelectedProducts(existingProds.map(p => ({
        id: p._id || p.id,
        productId: p._id || p.id,
        name: p.name,
        amount: p.amount,
        quantity: 1,
        subtotal: p.amount
      })));
    }

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
    try {
      await updateOrder(activeOrder.id, {
        paymentType,
        transactionId: txnId,
        courier,
        product: modalSelectedProducts.map(p => p.name).join(", "),
        products: modalSelectedProducts.map((p) => ({
          productId: p.productId || p.id,
          name: p.name,
          amount: p.amount,
          quantity: p.quantity,
          subtotal: p.subtotal
        })),
        _products: modalSelectedProducts.map((p) => ({
          productId: p.productId || p.id,
          name: p.name,
          amount: p.amount,
          quantity: p.quantity,
          subtotal: p.subtotal
        })),
        grandTotal: totalAmount
      });
      toast.success(`Order details updated successfully.`);
      setEditOpen(false);
    } catch (_) {
      // error toast shown inside updateOrder
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // --- REPEAT ORDER LOGIC ---
  const openRepeat = (order: Order) => {
    setActiveOrder(order);
    setPaymentType(order.paymentType === "Prepaid" ? "Prepaid" : "COD");
    setTxnId(order.transactionId || "");
    setCourier(order.courier || couriers[0]?.name || "");

    const rawProducts: any[] = (order as any)._products || [];
    if (rawProducts.length > 0) {
      setModalSelectedProducts(rawProducts.map((p: any) => ({
        id: p.productId?._id || p.productId || p._id || p.id || Math.random().toString(),
        productId: p.productId?._id || p.productId || p._id || p.id,
        name: p.productId?.name || p.name || "",
        amount: p.productId?.amount || p.amount || 0,
        quantity: p.quantity || 1,
        subtotal: p.subtotal || ((p.productId?.amount || p.amount || 0) * (p.quantity || 1))
      })));
    } else {
      const existingProds = products.filter((p) => (order.product || "").includes(p.name));
      setModalSelectedProducts(existingProds.map((p) => ({
        id: p._id || p.id,
        productId: p._id || p.id,
        name: p.name,
        amount: p.amount,
        quantity: 1,
        subtotal: p.amount
      })));
    }

    setModalProductSelect("");
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
    try {
      const resolvedAssigneeId =
        (activeOrder as any).assginToId ||
        (typeof (activeOrder as any).assginTo === 'object'
          ? ((activeOrder as any).assginTo?._id || (activeOrder as any).assginTo?.id)
          : null) ||
        users.find((u) => u.name === activeOrder.assginTo || u._id === activeOrder.assginTo || u.id === activeOrder.assginTo)?._id ||
        users.find((u) => u.name === activeOrder.assginTo || u._id === activeOrder.assginTo || u.id === activeOrder.assginTo)?.id ||
        activeOrder.assginTo;

      await addOrder({
        leadId: activeOrder.leadId,
        name: activeOrder.name,
        phone_number: activeOrder.phone_number,
        products: modalSelectedProducts.map((p) => ({
          productId: p.productId || p.id,
          name: p.name,
          amount: p.amount,
          quantity: p.quantity,
          subtotal: (p.amount || 0) * (p.quantity || 1)
        })),
        product: modalSelectedProducts.map((p) => p.name).join(", "),
        amount: modalSelectedProducts.reduce((sum, p) => sum + (p.amount || 0), 0),
        quantity: modalSelectedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0),
        subtotal: totalAmount,
        grandTotal: totalAmount,
        date: new Date().toISOString().split("T")[0],
        paymentType,
        courier,
        assginTo: resolvedAssigneeId,
        transactionId: txnId,
        status: "Dispatched"
      });
      toast.success(`Repeat Order created for ${activeOrder.name}!`);
      setRepeatOpen(false);
    } catch (_) {
      // error shown in addOrder
    } finally {
      setIsRepeatingOrder(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id: string) => {
    setIsDeletingOrder(true);
    await deleteOrder(id);
    setIsDeletingOrder(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportOrders({
        search: searchQuery || undefined,
        product: filterProduct !== 'all' ? filterProduct : undefined,
        assginTo: filterAssignee !== 'all' ? filterAssignee : undefined,
        courier: filterCourier !== 'all' ? filterCourier : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Export successful!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  const columns: Column<Order>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Lead Name", render: (val) => <span className="uppercase font-semibold text-[11px]">{val}</span> },
    { key: "product", header: "Product Name" },
    { key: "grandTotal", header: "Grand Total", render: (val) => `₹${(Number(val) || 0).toLocaleString("en-IN")}` },
    { key: "phone_number", header: "Phone Number" },
    { key: "date", header: "Date" },
    { key: "paymentType", header: "Payment Type", render: (val) => val || "COD" },
    { key: "courier", header: "Courier" },
    { key: "assginTo", header: "Assign To" },
    { key: "transactionId", header: "Transaction ID", render: (val) => val || "-" },
    { key: "status", header: "Return Type", render: (val) => val === "Returned" ? val : "-" },
    { key: "repartOrderTotal", header: "Repart Order Total", render: (_, __, i) => i + 1 }, // Mock calculation
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {hasPermission("Order-edit") && (
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 bg-primary-teal hover:bg-primary-teal text-white rounded-lg transition-all shadow-sm"
              title="Edit Order"
            >
              <FiEdit className="w-3.5 h-3.5" />
            </button>
          )}
          {hasPermission("Order-delete") && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm"
              title="Delete Order"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {hasPermission("Repart-order") && (
            <button
              onClick={() => openRepeat(row)}
              className="p-1.5 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-all shadow-sm"
              title="Repeat Order"
            >
              <FiRefreshCcw className="w-3.5 h-3.5" />
            </button>
          )}
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
                ...products.map(p => ({ value: p._id || p.id, label: `${p.name} (₹${p.amount})` }))
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
            <DateRangePicker 
              startDate={startDate} 
              endDate={endDate} 
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
                loadOrdersData(undefined, { start, end });
              }} 
            />
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
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="bg-primary-teal hover:bg-primary-teal/90" onClick={() => loadOrdersData()}>
              Apply Filter
            </Button>
            <Button variant="danger" className="bg-error hover:bg-error/90" onClick={() => {
              setFilterProduct("all");
              setFilterAssignee("all");
              setFilterCourier("all");
              setSearchQuery("");
              setStartDate(null);
              setEndDate(null);
              fetchOrders({ page: 1, limit: 100 }).then(res => {
                 const mapped = res.data.map((o: any) => ({
                    id: o._id || o.id,
                    leadId: o.leadId?._id || o.leadId || "",
                    name: o.name,
                    phone_number: o.phone_number,
                    product: o.product || (o.products?.map((p: any) => p.name).join(", ") || ""),
                    amount: o.amount || 0,
                    quantity: o.quantity || 1,
                    subtotal: o.amount || 0,
                    grandTotal: o.grandTotal || o.amount || 0,
                    date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : "",
                    paymentType: o.paymentType || "COD",
                    courier: o.courier || "",
                    assginTo: o.assginTo?.name || o.assginTo || "",
                    assginToId: typeof o.assginTo === 'object' ? (o.assginTo?._id || o.assginTo?.id || "") : (o.assginTo || ""),
                    transactionId: o.transactionId || "",
                    status: o.status || "Dispatched",
                    _products: o.products || []
                  }));
                  setOrders(mapped);
              });
            }}>
              Clear Filter
            </Button>
            <Button
              variant="outline"
              className="rounded-lg px-6"
              onClick={handleExport}
              isLoading={isExporting}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Table database */}
        <Table 
           data={filteredOrders} 
           columns={columns} 
           selectable 
           isLoading={isFetchingData} 
           searchable={true}
           onSearchChange={(val) => {
             setSearchQuery(val);
             loadOrdersData(val);
           }}
        />
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
