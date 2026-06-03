import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { createLeadApi, updateLeadApi, fetchLeadById } from "../../services/leadService";
import { createOrderApi } from "../../services/orderService";
import { fetchCouriers } from "../../services/courierService";
import { useToast } from "../../context/ToastContext";

interface SelectedProductRow {
  productId: string;
  name: string;
  amount: number;
  quantity: number;
  subtotal: number;
}

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeLead?: any | null;
  users: any[];
  products: any[];
  statusesOptions: any[];
  reasonCallOptions: any[];
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activeLead,
  users,
  products,
  statusesOptions,
  reasonCallOptions
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [statusTwo, setStatusTwo] = useState("");
  const [noteText, setNoteText] = useState("");
  const [assignee, setAssignee] = useState("");
  const [orderStatus, setOrderStatus] = useState(false);
  const [reminder, setReminder] = useState("");

  // Product Selection Table States
  const [modalSelectedProducts, setModalSelectedProducts] = useState<SelectedProductRow[]>([]);
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState("");

  const [paymentType, setPaymentType] = useState<"COD" | "Prepaid">("COD");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [couriers, setCouriers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    fetchCouriers({ limit: 100, page: 1 }).then(res => {
      if (res && res.data) setCouriers(res.data);
    }).catch(err => console.error(err));

    import("../../services/customerService").then(mod => {
      mod.fetchCustomers().then(res => {
        if (res && res.data) setCustomers(res.data);
      });
    });

    const userStr = localStorage.getItem("wrixty_authenticated_user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setCurrentUser(parsed);
        setIsAdmin(parsed?.roles?.some((r: string) => r.toLowerCase().includes('admin') || r.toLowerCase() === 'superadmin') || parsed?.email === 'superadmin@gmail.com');
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (activeLead) {
        // Edit Mode
        setIsLoading(true);
        fetchLeadById(activeLead.id).then((res: any) => {
          const fetchedData = res?.data || res;
          setName(fetchedData.name || "");
          setPhone(fetchedData.phone_number || "");
          setStatus(fetchedData.statusId || fetchedData.status?._id || fetchedData.status || "");
          setStatusTwo(fetchedData.reasonCallId || fetchedData.reason_call?._id || fetchedData.reason_call || "");
          setNoteText(fetchedData.note || "");
          setAssignee(fetchedData.assginId || fetchedData.assgin?._id || fetchedData.assgin || "");
          setReminder(fetchedData.reminderDate || fetchedData.reminder || "");
          const isOrder = Boolean(fetchedData.orderStatus) && fetchedData.orderStatus !== "false";
          setOrderStatus(isOrder);
          
          if (isOrder) {
            setPaymentType(fetchedData.paymentType || "COD");
            setSelectedCourier(fetchedData.courier || "");
            setTransactionId(fetchedData.transactionId || "");
          }

          if (fetchedData.products && Array.isArray(fetchedData.products)) {
            setModalSelectedProducts(fetchedData.products.map((p: any) => ({
              productId: p.productId || p._id,
              name: p.name,
              amount: p.amount,
              quantity: p.quantity,
              subtotal: p.subtotal || (p.amount * p.quantity)
            })));
          } else {
            setModalSelectedProducts([]);
          }
        }).catch(err => {
          toast.error("Failed to fetch lead details");
          console.error(err);
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        // Add Mode
        setName("");
        setPhone("");
        setStatus(statusesOptions[0]?._id || statusesOptions[0]?.id || "");
        setStatusTwo(reasonCallOptions[0]?._id || reasonCallOptions[0]?.id || "");
        setNoteText("");
        setReminder("");
        setOrderStatus(false);
        setPaymentType("COD");
        setSelectedCourier("");
        setTransactionId("");
        setModalSelectedProducts([]);
        
        // Handle Default Assignee
        if (currentUser) {
          if (!isAdmin) {
            const loggedInMember = users.find(u => u._id === currentUser?._id || u.id === currentUser?._id || (currentUser?.email && u.email?.toLowerCase() === currentUser?.email?.toLowerCase()));
            setAssignee(loggedInMember?._id || loggedInMember?.id || currentUser?._id || currentUser?.id || "");
          } else {
            setAssignee(users[0]?._id || users[0]?.id || "");
          }
        } else {
          setAssignee(users[0]?._id || users[0]?.id || "");
        }
      }
      setCurrentSelectedProductId(products[0]?._id || products[0]?.id || "");
    }
  }, [isOpen, activeLead, users, products, statusesOptions, reasonCallOptions, currentUser]);

  const handleAddProduct = () => {
    if (!currentSelectedProductId) return;
    const prod = products.find(p => (p._id || p.id) === currentSelectedProductId);
    if (!prod) return;

    const existingIndex = modalSelectedProducts.findIndex(p => p.productId === currentSelectedProductId);
    if (existingIndex >= 0) {
      // Increment quantity instead of showing error
      const updated = [...modalSelectedProducts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].amount * updated[existingIndex].quantity;
      setModalSelectedProducts(updated);
      toast.success("Product quantity incremented!");
    } else {
      setModalSelectedProducts([
        ...modalSelectedProducts,
        { 
          productId: prod._id || prod.id, 
          name: prod.name, 
          amount: prod.amount, 
          quantity: 1, 
          subtotal: prod.amount 
        }
      ]);
      toast.success("Product added!");
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setModalSelectedProducts(modalSelectedProducts.filter(p => p.productId !== productId));
  };

  const handleQtyChange = (productId: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    setModalSelectedProducts(
      modalSelectedProducts.map(p => p.productId === productId ? { ...p, quantity: safeQty, subtotal: safeQty * p.amount } : p)
    );
  };

  const totalAmount = modalSelectedProducts.reduce((sum, p) => sum + p.subtotal, 0);
  const totalQuantity = modalSelectedProducts.reduce((sum, p) => sum + p.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !status || !statusTwo || !assignee) {
      toast.warning("Please fill all compulsory fields (Name, Phone, Status, Reason Call, Assign Staff)!");
      return;
    }
    if (phone.length !== 10) {
      toast.warning("Phone number must be exactly 10 digits!");
      return;
    }
    if (orderStatus && !selectedCourier) {
      toast.warning("Please select a Courier Partner!");
      return;
    }
    if (modalSelectedProducts.length === 0) {
      toast.warning("Please add at least one product!");
      return;
    }

    setIsLoading(true);

    const leadPayload: any = {
      name,
      phone_number: phone,
      products: modalSelectedProducts.map(p => ({
        productId: p.productId,
        name: p.name,
        amount: p.amount,
        quantity: p.quantity,
        subtotal: p.subtotal
      })),
      assgin: assignee,
      status: status,
      reason_call: statusTwo,
      note: noteText,
      reminder: reminder,
      orderStatus: orderStatus,
      paymentType: orderStatus ? paymentType : undefined,
      courier: orderStatus ? selectedCourier : undefined,
      transactionId: orderStatus ? transactionId : undefined
    };

    try {
      if (activeLead) {
        await updateLeadApi(activeLead.id, leadPayload);
        toast.success(`Lead updated successfully!`);
      } else {
        const createdLead = await createLeadApi(leadPayload);
        toast.success(`Lead created successfully!`);
        
        if (orderStatus) {
          try {
            await createOrderApi({
              leadId: (createdLead as any)._id,
              name,
              phone_number: phone,
              products: leadPayload.products,
              paymentType,
              courier: selectedCourier,
              assginTo: assignee,
              transactionId: transactionId || "TXN-AUTO",
              status: "Dispatched"
            });
            toast.success("Order created automatically!");
          } catch (orderErr: any) {
            toast.error("Lead saved but order creation failed: " + (orderErr.response?.data?.message || ""));
          }
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save lead");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activeLead ? "Edit Lead Details" : "Add New Lead"} isLoading={isLoading} sizeClass="max-w-6xl">
      <form onSubmit={handleSubmit} className="space-y-5 text-left max-w-5xl mx-auto pr-1">
        <p className="text-xs text-text-secondary font-medium">Fill out the details to {activeLead ? 'update the' : 'register a new'} lead in the system.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select 
              label="Name" 
              value={name} 
              onChange={(e) => {
                const selVal = e.target.value;
                setName(selVal);

                const selected = customers.find(c => c.name === selVal);
                if (selected?.phone_number) {
                  const safePhone = selected.phone_number.replace(/\D/g, "").slice(0, 10);
                  setPhone(safePhone);
                } else {
                  setPhone("");
                }
              }} 
              required
              allowCustom={true}
              options={customers.map(c => ({ value: c.name, label: c.name }))}
            />
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
                }
              }} 
              required 
              placeholder="Enter 10-digit Phone Number" 
            />
          </div>
          <Select
            label="Reason Call"
            value={statusTwo}
            onChange={(e) => setStatusTwo(e.target.value)}
            required
            options={[
              { value: "", label: "Select Reason" },
              ...reasonCallOptions.map(r => ({ value: r._id || r.id, label: r.name }))
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            options={[
              { value: "", label: "Select Status" },
              ...statusesOptions.map(s => ({ value: s._id || s.id, label: s.name }))
            ]}
          />
          <Select
            label="Assign Staff"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            required
            disabled={!isAdmin}
            options={[
              { value: "", label: "Select User" },
              ...(isAdmin
                ? users
                : users.filter(u => u._id === currentUser?._id || u.id === currentUser?._id || (currentUser?.email && u.email?.toLowerCase() === currentUser?.email?.toLowerCase()))
              ).map(u => ({ value: u._id || u.id, label: u.name }))
            ]}
          />
          <Input label="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Enter Note" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={orderStatus}
              onChange={(e) => setOrderStatus(e.target.checked)}
              className="w-4 h-4 text-primary-teal rounded-lg border-zinc-300"
            />
            Convert to Order automatically
          </label>
          <Input label="Reminder" type="date" value={reminder} onChange={(e) => setReminder(e.target.value)} />
        </div>

        {orderStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gradient-subtle rounded-xl border border-primary-teal/20 items-center shadow-soft">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-primary-teal uppercase tracking-wide">Payment Type</label>
              <div className="flex items-center gap-5 mt-1.5">
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer font-medium">
                  <input type="radio" name="modalPaymentType" value="COD" checked={paymentType === 'COD'} onChange={(e) => setPaymentType(e.target.value as any)} className="w-4 h-4 text-primary-teal" />
                  COD Discount
                </label>
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer font-medium">
                  <input type="radio" name="modalPaymentType" value="Prepaid" checked={paymentType === 'Prepaid'} onChange={(e) => setPaymentType(e.target.value as any)} className="w-4 h-4 text-primary-teal" />
                  Prepaid Discount
                </label>
              </div>
            </div>
            <Select
              label="Courier Partner"
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              required
              options={[
                { value: "", label: "Select Courier Partner" },
                ...couriers.map(c => ({ value: c.name, label: c.name }))
              ]}
            />
            <Input
              label="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN90283019"
            />
          </div>
        )}

        <div className="border-t border-zinc-150 pt-4 space-y-3">
          <h4 className="text-sm font-bold text-zinc-700">Select Products</h4>
          <div className="flex gap-2.5 items-end">
            <div className="flex-1">
              <Select
                value={currentSelectedProductId}
                onChange={(e) => setCurrentSelectedProductId(e.target.value)}
                options={[
                  { value: "", label: "Select a product" },
                  ...products.map(p => ({ value: p._id || p.id, label: `${p.name} (₹${p.amount})` }))
                ]}
              />
            </div>
            <Button type="button" variant="success" onClick={handleAddProduct}>
              Add Product
            </Button>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <h4 className="text-sm font-bold text-zinc-700">Selected Products</h4>
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-500 uppercase">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {modalSelectedProducts.length > 0 ? (
                  modalSelectedProducts.map((row) => (
                    <tr key={row.productId}>
                      <td className="p-3 font-medium text-zinc-800">{row.name}</td>
                      <td className="p-3 font-medium text-zinc-700">₹{row.amount}</td>
                      <td className="p-3 w-24">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => handleQtyChange(row.productId, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-primary-teal outline-none text-center"
                        />
                      </td>
                      <td className="p-3 font-black text-zinc-800">₹{row.subtotal}</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(row.productId)}
                          className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm"
                          title="Remove Product"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
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

        <div className="flex items-center justify-between border-t border-zinc-150 pt-4 mt-2">
          <span className="text-sm font-black text-zinc-700">
            Total Amount: ₹{totalAmount.toFixed(2)}
          </span>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Lead
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
