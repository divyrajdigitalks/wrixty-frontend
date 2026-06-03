  "use client";

import React, { useState } from "react";
import { Table, Column } from "../../components/common/Table";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { usePermission } from "../../utils/permissionUtils";
import { fetchUsers } from "../../services/userService";
import { fetchProducts } from "../../services/productService";
import { fetchOrders } from "../../services/orderService";
import { fetchReturnOrders, createReturnOrderApi, deleteReturnOrderApi, fetchReturnOrderById, updateReturnOrderApi, exportReturnOrders } from "../../services/returnOrderService";
import { DateRangePicker } from "../../components/common/DateRangePicker";
import { Close } from "@mui/icons-material";

export interface ReturnOrder {
  id: string;
  customerName: string;
  phone_number: string;
  assginTo: string;
  orderDate: string;
  returnDate: string;
  product: string;
  amount: number;
  quantity: number;
  subtotal: number;
  type: string;
  _products?: any[];
  assginToId?: string;
}

export default function ReturnOrderPage() {
  const { hasPermission } = usePermission();
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const toast = useToast();
  
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState<string | null>(getTodayString());
  const [endDate, setEndDate] = useState<string | null>(getTodayString());

  const [filterAssign, setFilterAssign] = useState("all");
  const [filterOrder, setFilterOrder] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadReturnOrdersData = async (searchOverride?: string, overrideDates?: { start: string | null, end: string | null }) => {
    try {
      setIsFetchingData(true);
      const searchToUse = searchOverride !== undefined ? searchOverride : searchQuery;
      const startToUse = overrideDates !== undefined ? overrideDates.start : startDate;
      const endToUse = overrideDates !== undefined ? overrideDates.end : endDate;
      
      const res = await fetchReturnOrders({
        page: 1, limit: 100,
        search: searchToUse || undefined,
        assginTo: filterAssign !== "all" ? filterAssign : undefined,
        product: filterProduct !== "all" ? filterProduct : undefined,
        startDate: startToUse || undefined,
        endDate: endToUse || undefined
      });
      // fetchReturnOrders returns raw axios response; backend returns { data: [...] } or array
      const rawData = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped = list.map((r: any) => ({
        id: r._id || r.id,
        customerName: r.customerName,
        phone_number: r.phone_number,
        assginTo: r.assginTo?.name || r.assginTo || "",
        assginToId: r.assginTo?._id || r.assginTo?.id || r.assginTo || "",
        orderDate: r.createdAt ? (() => {
          const d = new Date(r.createdAt);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = String(d.getFullYear()).slice(-2);
          return `${day}/${month}/${year}`;
        })() : "-",
        returnDate: r.createdAt ? (() => {
          const d = new Date(r.createdAt);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = String(d.getFullYear()).slice(-2);
          return `${day}/${month}/${year}`;
        })() : "",
        product: r.products?.map((p: any) => p.name).join(", ") || "",
        amount: r.amount || 0,
        quantity: r.products?.reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0,
        subtotal: r.amount || 0,
        type: r.type || "RTO",
        _products: r.products || []
      }));
      setReturnOrders(mapped);
    } catch(err) { console.error(err); }
    finally { setIsFetchingData(false); }
  }

  React.useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [usersRes, prodsRes, ordersRes] = await Promise.all([
          fetchUsers({ page: 1, limit: 100 }),
          fetchProducts({ page: 1, limit: 100 }),
          fetchOrders({ page: 1, limit: 1000 })
        ]);
        setUsers(usersRes.data);
        setProducts(prodsRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMasterData();
  }, []);

  React.useEffect(() => {
    loadReturnOrdersData();
  }, [filterAssign, filterProduct]);

  const deleteReturnOrder = async (id: string) => {
    try {
      await deleteReturnOrderApi(id);
      setReturnOrders(prev => prev.filter(r => r.id !== id));
      toast.warning("Return Order deleted.");
    } catch(err: any) { toast.error("Failed to delete return order"); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportReturnOrders({
        search: searchQuery || undefined,
        assginTo: filterAssign !== "all" ? filterAssign : undefined,
        product: filterProduct !== "all" ? filterProduct : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `return_orders_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Export successful!");
    } catch (err: any) {
      toast.error("Failed to export return orders");
    } finally {
      setIsExporting(false);
    }
  };

  // Modal States
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ReturnOrder | null>(null);

  // Add Modal Form State
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState("");
  const [type, setType] = useState("");
  const [assign, setAssign] = useState("");

  const [currentSelectedProductId, setCurrentSelectedProductId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const handleAddProduct = () => {
    if (!currentSelectedProductId) return;
    const prod = products.find(p => (p._id || p.id) === currentSelectedProductId);
    if (!prod) return;
    const existing = selectedProducts.find(p => p.productId === currentSelectedProductId);
    if (existing) {
      setSelectedProducts(prev => prev.map(p => p.productId === currentSelectedProductId ? { ...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * p.amount } : p));
    } else {
      setSelectedProducts(prev => [...prev, { productId: currentSelectedProductId, name: prod.name, amount: prod.amount, quantity: 1, subtotal: prod.amount }]);
    }
    setCurrentSelectedProductId("");
  };

  const handleRemoveProduct = (id: string) => setSelectedProducts(prev => prev.filter(p => p.productId !== id));
  const handleQtyChange = (id: string, qty: number) => {
    const safeQty = Math.max(1, qty || 1);
    setSelectedProducts(prev => prev.map(p => p.productId === id ? { ...p, quantity: safeQty, subtotal: safeQty * p.amount } : p));
  };

  const convertTotalAmount = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmitReturnOrder = async () => {
    if(!customer || selectedProducts.length === 0) return toast.error("Please fill customer and add products");
    if (phone.length !== 10) return toast.error("Phone number must be exactly 10 digits!");
    try {
      const payload = {
        customerName: customer,
        phone_number: phone,
        type: type || "RTO",
        assginTo: assign || undefined,
        amount: convertTotalAmount,
        products: selectedProducts
      };
      
      if (activeOrder) {
         await updateReturnOrderApi(activeOrder.id, payload);
         toast.success("Return Order updated successfully");
      } else {
         await createReturnOrderApi(payload);
         toast.success("Return Order created successfully");
      }
      setAddOpen(false);
      loadReturnOrdersData();
      setCustomer(""); setPhone(""); setSelectedProducts([]);
      setActiveOrder(null);
    } catch(err: any) { toast.error(activeOrder ? "Failed to update return order" : "Failed to create return order"); }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    await new Promise(res => setTimeout(res, 500));
    deleteReturnOrder(id);
    toast.warning("Return Order deleted.");
    setIsDeleting(null);
  };

  const handleOpenEdit = async (order: ReturnOrder) => {
    try {
      let payload: any = {};
      try {
        const res = await fetchReturnOrderById(order.id);
        payload = res?.data?.data || res?.data || {};
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Fallback to row data if the backend GET route does not exist
          payload = {
            customerName: order.customerName,
            phone_number: order.phone_number,
            type: order.type,
            assginTo: order.assginToId,
            products: order._products || []
          };
        } else {
          throw err;
        }
      }
      
      setCustomer(payload.customerName || order.customerName || "");
      setPhone(payload.phone_number || order.phone_number || "");
      setType(payload.type || order.type || "RTO");
      setAssign(payload.assginTo?._id || payload.assginTo?.id || payload.assginTo || "");
      
      if (payload.products && Array.isArray(payload.products)) {
        setSelectedProducts(payload.products.map((p: any) => ({
          productId: p.productId?._id || p.productId || p._id || p.id,
          name: p.name || p.productId?.name,
          amount: p.amount,
          quantity: p.quantity,
          subtotal: p.subtotal || p.amount * p.quantity
        })));
      } else {
        setSelectedProducts([]);
      }
      
      setActiveOrder(order);
      setAddOpen(true);
    } catch(err) {
      toast.error("Failed to fetch order details");
    }
  };

  const openAddModal = () => {
    setActiveOrder(null);
    setCustomer("");
    setPhone("");
    setType("RTO");
    setAssign("");
    setSelectedProducts([]);
    setAddOpen(true);
  };

  const filteredOrders = returnOrders;

  const columns: Column<ReturnOrder>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "phone_number", header: "Mobile Number" },
    { key: "assginTo", header: "Assgin To" },
    { key: "orderDate", header: "Order Date", render: (val) => val === "2026-05-20" ? "01/01/1970" : val },
    { key: "product", header: "Product Name" },
    { key: "amount", header: "Amount" },
    { key: "returnDate", header: "Return Order Date" },
    { key: "customerName", header: "Customer Name" },
    { key: "type", header: "Type", render: () => "RTO" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {hasPermission("Return-order-edit") && (
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 bg-primary-teal hover:bg-primary-teal text-white rounded-lg transition-all shadow-sm"
              title="Edit Return Order"
            >
              <FiEdit className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            disabled={isDeleting === row.id}
            className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
            title="Delete Return Order"
          >
            {isDeleting === row.id ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiTrash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white  p-6 border border-zinc-200  rounded-lg shadow-sm space-y-6">

        {/* Top Header Row with Dates and Add Button */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-100  pb-4 gap-4">
          <h2 className="text-xl font-bold text-zinc-800  min-w-[200px]">
            Return Order List
          </h2>

          <div className="flex flex-wrap items-center gap-6 flex-1 justify-center">
            <DateRangePicker 
              startDate={startDate} 
              endDate={endDate} 
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
                loadReturnOrdersData(undefined, { start, end });
              }} 
            />
          </div>

          {hasPermission("Return-order-add") && (
            <Button
              variant="primary"
              className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800 whitespace-nowrap"
              onClick={openAddModal}
            >
              Add Return<br />Order
            </Button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100  pb-4">
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterAssign}
              onChange={(e) => setFilterAssign(e.target.value)}
              options={[
                { value: "all", label: "Select Assgin" },
                ...users.map(u => ({ value: u.name, label: u.name }))
              ]}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 min-w-[160px]">
            <Select
              value={filterOrder}
              onChange={(e) => setFilterOrder(e.target.value)}
              options={[
                { value: "all", label: "Select Order" }
              ]}
            />
          </div>
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

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="bg-teal-800 hover:bg-teal-700" onClick={() => loadReturnOrdersData()}>
              Apply Filter
            </Button>
            <Button variant="danger" className="bg-rose-500 hover:bg-rose-600" onClick={() => { setFilterAssign("all"); setFilterOrder("all"); setFilterProduct("all"); setSearchQuery(""); loadReturnOrdersData(""); }}>
              Clear Filter
            </Button>
            <Button variant="success" onClick={handleExport} isLoading={isExporting}>
              Export
            </Button>
          </div>
        </div>

        {/* Table Element */}
        <Table 
    data={filteredOrders} 
    columns={columns} 
    selectable={false} 
    isLoading={isFetchingData}
    searchable={true}
    onSearchChange={(val) => {
      setSearchQuery(val);
      loadReturnOrdersData(val);
    }}
  />
      </div>

      {/* Add/Edit Return Order Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={activeOrder ? "Edit Return Order" : "Add Return Order"} sizeClass="max-w-5xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500">Customer Name</label>
              <Select 
                 options={[{ value: "", label: "Select Customer" }, ...Array.from(new Map(orders.map(o => [o.name, o])).values()).map((o: any) => ({ value: o.name, label: o.name }))]}
                 value={customer} 
                 onChange={e => {
                   setCustomer(e.target.value);
                   const o = orders.find(ord => ord.name === e.target.value);
                   if (o) setPhone(o.phone_number);
                 }} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500">Phone Number</label>
              <Input placeholder="Enter Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500">Type</label>
              <Select options={[{ value: "", label: "Select Type" }, { value: "RTO", label: "RTO" }]} value={type} onChange={e => setType(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="text-[10px] font-bold text-zinc-500">Assgin to</label>
              <Select 
                options={[{ value: "", label: "Select Assignee" }, ...users.map(u => ({ value: u._id || u.id, label: u.name }))]}
                value={assign} 
                onChange={e => setAssign(e.target.value)} 
              />
            </div>
          </div>

          <div className="border-t border-zinc-150 pt-4 space-y-3">
            <h4 className="text-sm font-bold text-zinc-700">Select Products</h4>
            <div className="flex gap-2.5 items-end">
              <div className="flex-1">
                <Select
                  value={currentSelectedProductId}
                  onChange={(e) => setCurrentSelectedProductId(e.target.value)}
                  options={[
                    { value: "", label: "Select a Product" },
                    ...products.map(p => ({ value: p._id || p.id, label: `${p.name} (₹${p.amount})` }))
                  ]}
                />
              </div>
              <Button type="button" variant="success" className="bg-teal-500 hover:bg-teal-600 border-none px-6 py-2.5" onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-700 ">Selected Products</h4>
            <div className="border border-zinc-200  rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b border-zinc-200 text-zinc-600 uppercase">
                    <th className="p-3 font-semibold">Product Name</th>
                    <th className="p-3 font-semibold">Amount</th>
                    <th className="p-3 font-semibold w-24">Quantity</th>
                    <th className="p-3 font-semibold">Subtotal</th>
                    <th className="p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white ">
                  {selectedProducts.length > 0 ? selectedProducts.map(row => (
                    <tr key={row.productId} className="border-b border-zinc-100 ">
                      <td className="p-3">{row.name}</td>
                      <td className="p-3">{row.amount}</td>
                      <td className="p-3">
                        <input type="number" min="1" className="w-16 border border-zinc-200 outline-none rounded px-2 py-1" value={row.quantity} onChange={e => handleQtyChange(row.productId, Number(e.target.value))} />
                      </td>
                      <td className="p-3">{row.subtotal}</td>
                      <td className="p-3">
                         <button onClick={() => handleRemoveProduct(row.productId)} className="text-red-500 hover:text-red-700"><Close className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan={5} className="p-6 text-center text-zinc-500 font-medium">No products selected</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 pt-4">
            <div className="text-sm font-semibold text-zinc-700 ">
              Grand Total: ₹{convertTotalAmount.toFixed(2)}
            </div>
            <Button
              variant="primary"
              className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800 px-6"
              onClick={handleSubmitReturnOrder}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Return Details Modal */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Order Return Details" sizeClass="max-w-2xl">
        <div className="space-y-4">
          <div className="border border-zinc-200  rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200  text-zinc-600  bg-white ">
                  <th className="p-3 font-semibold">Product Name</th>
                  <th className="p-3 font-semibold">Qty</th>
                  <th className="p-3 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white ">
                <tr className="border-b border-zinc-100 ">
                  <td className="p-3 font-medium text-zinc-800 ">{activeOrder?.product}</td>
                  <td className="p-3 text-zinc-600 ">{activeOrder?.quantity}</td>
                  <td className="p-3 text-zinc-600 ">{activeOrder?.amount?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-4 pt-4">
            <div className="text-xs font-semibold text-zinc-800  border border-zinc-200  rounded-lg px-3 py-1.5 flex gap-2">
              <span>Grand Total:</span>
              <span>{activeOrder?.amount}</span>
            </div>
            <Button
              variant="danger"
              className="bg-[#c2624c] hover:bg-[#b0523d] focus:ring-[#c2624c] px-6"
              onClick={() => setViewOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
