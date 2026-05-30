"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMockDb } from "../../context/MockDbContext";
import { useToast } from "../../context/ToastContext";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { Delete, ArrowBack } from "@mui/icons-material";

interface SelectedProductRow {
  id: string;
  name: string;
  amount: number;
  quantity: number;
}

export default function AddLeadPage() {
  const router = useRouter();
  const { leads, products, users, statuses, couriers, addLead, convertToOrder } = useMockDb();
  const toast = useToast();

  const [isAddingLead, setIsAddingLead] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Open");
  const [statusTwo, setStatusTwo] = useState("CNR");
  const [noteText, setNoteText] = useState("");
  const [assignee, setAssignee] = useState(users[0]?.name || "");
  const [orderStatus, setOrderStatus] = useState(false);
  const [reminder, setReminder] = useState("");

  // Product Selection Table States
  const [modalSelectedProducts, setModalSelectedProducts] = useState<SelectedProductRow[]>([]);
  const [currentSelectedProduct, setCurrentSelectedProduct] = useState(products[0]?.name || "");

  // Convert to Order default
  const [paymentType, setPaymentType] = useState<"COD" | "Prepaid">("COD");
  const [selectedCourier, setSelectedCourier] = useState(couriers[0]?.name || "Shiprocket");
  const [transactionId, setTransactionId] = useState("TXN-AUTO");

  const handleAddProduct = () => {
    if (!currentSelectedProduct) return;
    const prod = products.find(p => p.name === currentSelectedProduct);
    if (!prod) return;

    if (modalSelectedProducts.some(p => p.name === prod.name)) {
      toast.warning("Product already added to list!");
      return;
    }

    setModalSelectedProducts([
      ...modalSelectedProducts,
      { id: prod.id, name: prod.name, amount: prod.amount, quantity: 1 }
    ]);
  };

  const handleRemoveProduct = (id: string) => {
    setModalSelectedProducts(modalSelectedProducts.filter(p => p.id !== id));
  };

  const handleQtyChange = (id: string, qty: number) => {
    setModalSelectedProducts(
      modalSelectedProducts.map(p => p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)
    );
  };

  const totalAmount = modalSelectedProducts.reduce((sum, p) => sum + p.amount * p.quantity, 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalSelectedProducts.length === 0) {
      toast.warning("Please add at least one product!");
      return;
    }

    setIsAddingLead(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const productNames = modalSelectedProducts.map(p => p.name).join(", ");
    
    addLead({
      name,
      phone_number: phone,
      product: productNames,
      amount: totalAmount,
      quantity: modalSelectedProducts.reduce((sum, p) => sum + p.quantity, 0),
      assgin: assignee,
      status,
      reason_call: statusTwo,
      note: noteText
    });

    if (orderStatus) {
      setTimeout(() => {
        // Find newly added lead and convert it (naive approach for mock DB)
        const lastLead = leads[leads.length - 1]; // This is fragile in real-world, fine for mock
        if (lastLead) {
          convertToOrder(lastLead.id, {
            paymentType: paymentType,
            courier: selectedCourier,
            transactionId: transactionId
          });
        }
      }, 100);
    }

    toast.success(`Lead created successfully for ${name || "Customer"}!`);
    setIsAddingLead(false);
    
    // Navigate back
    router.push("/lead-list");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-md shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <button 
            onClick={() => router.push("/lead-list")}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors"
          >
            <ArrowBack className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              Add New Lead
            </h2>
            <p className="text-xs text-zinc-500 font-medium">Fill out the details to register a new lead in the system.</p>
          </div>
        </div>

        <form onSubmit={handleAddSubmit} className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter Name" />
            <Input label="Phone Number" type="number" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Enter Phone Number" />
            <Select
              label="Reason Call"
              value={statusTwo}
              onChange={(e) => setStatusTwo(e.target.value)}
              options={[
                { value: "CNR", label: "CNR" },
                { value: "Call Busy", label: "Call Busy" },
                { value: "Number off", label: "Number off" },
                { value: "vichari ne kese", label: "vichari ne kese" },
                { value: "Soch k Batyge", label: "Soch k Batyge" },
                { value: "Friends k liye tha", label: "Friends k liye tha" },
                { value: "Bija mate Hatu", label: "Bija mate Hatu" },
                { value: "Thodi var pachi call back kare", label: "Thodi var pachi call back kare" }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "Select Status", label: "Select Status" },
                { value: "Open", label: "Open" },
                { value: "Inprogress", label: "Inprogress" },
                { value: "Close", label: "Close" },
                { value: "Reject", label: "Reject" }
              ]}
            />
            <Select
              label="Assgin By"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              options={users.map(u => ({ value: u.name, label: u.name }))}
            />
            <Input label="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter Note" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={orderStatus}
                onChange={(e) => setOrderStatus(e.target.checked)}
                className="w-4 h-4 text-indigo-650 rounded border-zinc-300"
              />
              Convert to Order automatically
            </label>
            <Input label="Reminder" type="date" value={reminder} onChange={(e) => setReminder(e.target.value)} />
          </div>

          <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-3 text-left">
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Select Products</h4>
            <div className="flex gap-2.5 items-end">
              <div className="flex-1">
                <Select
                  value={currentSelectedProduct}
                  onChange={(e) => setCurrentSelectedProduct(e.target.value)}
                  options={products.map(p => ({ value: p.name, label: `${p.name} (₹${p.amount})` }))}
                />
              </div>
              <Button type="button" variant="success" onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Selected Products</h4>
            <div className="border border-zinc-200 dark:border-zinc-850 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-500 uppercase">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                  {modalSelectedProducts.length > 0 ? (
                    modalSelectedProducts.map((row) => (
                      <tr key={row.id}>
                        <td className="p-3 font-medium text-zinc-800 dark:text-zinc-200">{row.name}</td>
                        <td className="p-3 font-medium text-zinc-700 dark:text-zinc-300">₹{row.amount}</td>
                        <td className="p-3 w-24">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleQtyChange(row.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-center"
                          />
                        </td>
                        <td className="p-3 font-black text-zinc-800 dark:text-zinc-200">₹{row.amount * row.quantity}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(row.id)}
                            className="p-1 hover:bg-red-50 text-red-500 hover:text-red-600 rounded transition-colors"
                          >
                            <Delete className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-zinc-400 font-medium">
                        No products selected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-800 pt-4 mt-2">
            <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">
              Total Amount: ₹{totalAmount}
            </span>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => router.push("/lead-list")}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isAddingLead}>
                Save Lead
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
