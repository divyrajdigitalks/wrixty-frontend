"use client";

import React, { useState } from "react";
import { Table, Column } from "../../components/common/Table";
import { Delete, Visibility, Close } from "@mui/icons-material";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { fetchUsers } from "../../services/userService";
import { fetchProducts } from "../../services/productService";

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
}

export default function ReturnOrderPage() {
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([
    { id: "1", customerName: "Anil Saxena", phone_number: "9123456780", assginTo: "Aman Sharma", orderDate: "2026-05-20", returnDate: "2026-05-25", product: "Wrixty Neem Blood Purify", amount: 450, quantity: 2, subtotal: 900, type: "Wrong Product Delivered" }
  ]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const toast = useToast();

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

  const deleteReturnOrder = (id: string) => {
    setReturnOrders(prev => prev.filter(r => r.id !== id));
  };

  const [filterAssign, setFilterAssign] = useState("all");
  const [filterOrder, setFilterOrder] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Modal States
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ReturnOrder | null>(null);

  // Add Modal Form State
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState("");
  const [type, setType] = useState("");
  const [assign, setAssign] = useState("");
  
  // For the Add Modal Product Table mock
  const [selectedProducts, setSelectedProducts] = useState([
    { id: "1", name: "", date: "", quantity: 0, subtotal: 0 }
  ]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    await new Promise(res => setTimeout(res, 500));
    deleteReturnOrder(id);
    toast.warning("Return Order deleted.");
    setIsDeleting(null);
  };

  const handleOpenView = (order: ReturnOrder) => {
    setActiveOrder(order);
    setViewOpen(true);
  };

  const filteredOrders = React.useMemo(() => {
    return returnOrders
      .filter(o => filterAssign === "all" || o.assginTo === filterAssign)
      .filter(o => filterProduct === "all" || o.product === filterProduct);
  }, [returnOrders, filterAssign, filterProduct]);

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
          <button
            onClick={() => handleOpenView(row)}
            className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all shadow-sm"
            title="View Details"
          >
            <Visibility className="w-3.5 h-3.5" />
          </button>
          <Button
            variant="danger"
            size="sm"
            className="p-1.5"
            onClick={() => handleDelete(row.id)}
            isLoading={isDeleting === row.id}
            title="Delete Return Order"
          >
            {isDeleting !== row.id && <Delete className="w-3.5 h-3.5" />}
          </Button>
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
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Order Date :</span>
              <span className="text-xs font-semibold text-zinc-600 bg-zinc-50  px-3 py-1.5 rounded-lg border border-zinc-200/50 ">
                📅 May 30, 2026 - May 30, 2026
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Return Order Date :</span>
              <span className="text-xs font-semibold text-zinc-600 bg-zinc-50  px-3 py-1.5 rounded-lg border border-zinc-200/50 ">
                📅 May 30, 2026 - May 30, 2026
              </span>
            </div>
          </div>

          <Button 
            variant="primary" 
            className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800 whitespace-nowrap"
            onClick={() => setAddOpen(true)}
          >
            Add Return<br/>Order
          </Button>
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
            <Button variant="secondary" className="bg-teal-800 hover:bg-teal-700">
              Apply Filter
            </Button>
            <Button variant="danger" className="bg-rose-500 hover:bg-rose-600">
              Clear Filter
            </Button>
            <Button variant="success">
              Export
            </Button>
          </div>
        </div>

        {/* Table Element */}
        <Table data={filteredOrders} columns={columns} selectable={false} />
      </div>

      {/* Add Return Order Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Return Order" sizeClass="max-w-5xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500">Phone Number</label>
              <Input placeholder="Enter Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500">Customer Name</label>
              <Input placeholder="Enter Customer Name" value={customer} onChange={e => setCustomer(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500">Type</label>
              <Select options={[{ value: "", label: "Select Type" }, { value: "RTO", label: "RTO" }]} value={type} onChange={e => setType(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="text-[10px] font-bold text-zinc-500">Assgin to</label>
              <Input placeholder="Enter Assgin Name" value={assign} onChange={e => setAssign(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-700 ">Selected Products</h4>
            <div className="border border-zinc-200  rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white  border-b border-zinc-200  text-zinc-600 ">
                    <th className="p-3 font-semibold w-24">Select</th>
                    <th className="p-3 font-semibold">Product Name</th>
                    <th className="p-3 font-semibold">Order Date</th>
                    <th className="p-3 font-semibold">Quantity</th>
                    <th className="p-3 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white ">
                  <tr className="border-b border-zinc-100 ">
                    <td className="p-3">
                      <input type="checkbox" className="rounded-lg text-teal-800 focus:ring-teal-800" />
                    </td>
                    <td className="p-3"></td>
                    <td className="p-3"></td>
                    <td className="p-3"></td>
                    <td className="p-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 pt-4">
            <div className="text-sm font-semibold text-zinc-700 ">
              Grand Total: 0.00
            </div>
            <Button 
              variant="primary" 
              className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800 px-6"
              onClick={() => {
                toast.success("Return Order created.");
                setAddOpen(false);
              }}
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
