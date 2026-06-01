"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, Column } from "../../components/common/Table";
import { FiEdit, FiTrash2, FiUserCheck } from "react-icons/fi";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { useRouter } from "next/navigation";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "../../services/userService";
import { fetchRoles, Role as BackendRole } from "../../services/roleService";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination + search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [companyNo, setCompanyNo] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [bankNo, setBankNo] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [backendRoles, setBackendRoles] = useState<BackendRole[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchUsers({ page, limit, search });
      setUsers(res.data);
      setTotal(res.total);
    } catch {
      setError("Failed to load users. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const loadBackendRoles = async () => {
      try {
        const res = await fetchRoles({ page: 1, limit: 100 });
        setBackendRoles(res.data);
        if (res.data.length > 0) {
          setRole(res.data[0].name);
        }
      } catch (err) {
        console.error("Failed to load roles:", err);
      }
    };
    loadBackendRoles();
  }, []);

  const handleMobileChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      setMobile(cleaned);
      setFormErrors(prev => ({ ...prev, mobile: "" }));
    }
  };

  const handleAadharChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length <= 12) {
      setAadhar(cleaned);
      setFormErrors(prev => ({ ...prev, aadhar: "" }));
    }
  };

  const handleBankChange = (val: string) => {
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, "");
    setBankNo(cleaned);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required";
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (mobile.trim() && mobile.length !== 10) {
      errors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (aadhar.trim() && aadhar.length !== 12) {
      errors.aadhar = "Aadhar card must be exactly 12 digits";
    }

    if (modalOpen && !password) {
      errors.password = "Password is required";
    } else if (password && password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createUser({
        name,
        email,
        password,
        mobile_number: mobile,
        company_number: companyNo,
        aadhar_card: aadhar,
        bank_number: bankNo,
        roles: [role]
      });
      setModalOpen(false);
      clear();
      loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create user.");
    }
  };

  const openEdit = (user: User) => {
    setActiveUser(user);
    setName(user.name);
    setEmail(user.email);
    setMobile(user.mobile_number || "");
    setCompanyNo(user.company_number || "");
    setAadhar(user.aadhar_card || "");
    setBankNo(user.bank_number || "");
    setPassword("");
    setRole(user.roles[0] || backendRoles[0]?.name || "");
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!activeUser) return;
    try {
      await updateUser(activeUser._id, {
        name,
        email,
        password: password || undefined,
        mobile_number: mobile,
        company_number: companyNo,
        aadhar_card: aadhar,
        bank_number: bankNo,
        roles: [role]
      });
      setEditOpen(false);
      clear();
      loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update user.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      loadUsers();
    } catch {
      setError("Failed to delete user.");
    }
  };

  const handleLoginAs = (user: User) => {
    localStorage.setItem("wrixty_authenticated", "true");
    localStorage.setItem("wrixty_authenticated_user", JSON.stringify({
      name: user.name,
      email: user.email,
      roles: user.roles
    }));
    window.location.href = "/dashboard";
  };

  const clear = () => {
    setName("");
    setEmail("");
    setMobile("");
    setCompanyNo("");
    setAadhar("");
    setBankNo("");
    setPassword("");
    setRole(backendRoles[0]?.name || "");
    setFormErrors({});
  };

  const columns: Column<User>[] = [
    { key: "_id", header: "No", render: (_, __, i) => (page - 1) * limit + i + 1, sortable: false },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "company_number", header: "Company No" },
    { key: "roles", header: "Role", render: (val) => (val || []).join(", ") },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-2 text-text-secondary hover:text-primary-teal hover:bg-primary-teal/5 rounded-lg transition-all inline-flex items-center justify-center"
            title="Edit User"
          >
            <FiEdit className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => handleLoginAs(row)}
            className="p-2 text-text-secondary hover:text-secondary-cyan hover:bg-secondary-cyan/5 rounded-lg transition-all inline-flex items-center justify-center"
            title="Login As This User"
          >
            <FiUserCheck className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-all inline-flex items-center justify-center"
            title="Delete User"
          >
            <FiTrash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg p-8 border border-border-ui rounded-lg shadow-soft">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-wider text-text-primary">
            Users & Staff
          </h2>
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
            Manage call agents, managers, and bank details
          </p>
        </div>
        <Button
          onClick={() => {
            clear();
            setModalOpen(true);
          }}
          variant="primary"
          className="rounded-lg px-6"
        >
          Add User
        </Button>
      </div>

      {error && (
        <div className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-card-bg p-8 border border-border-ui rounded-lg shadow-soft">
        <Table 
          data={users} 
          columns={columns}
          searchable={true}
          searchPlaceholder="Search users..."
          idField="_id"
          isLoading={loading}
          serverSide={true}
          totalCount={total}
          currentPage={page}
          rowsPerPage={limit}
          onPageChange={(p, l) => { setPage(p); setLimit(l); }}
          onSearchChange={(s) => { setSearch(s); setPage(1); }}
        />
      </div>

      {/* Add User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User" sizeClass="max-w-4xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <Input label="Name" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} required />
              {formErrors.name && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.name}</p>}
              <Input label="Mobile Number" placeholder="Enter 10-Digit Mobile Number" value={mobile} onChange={(e) => handleMobileChange(e.target.value)} />
              {formErrors.mobile && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.mobile}</p>}
              <Input label="Aadhar Card" placeholder="Enter 12-Digit Aadhar Card" value={aadhar} onChange={(e) => handleAadharChange(e.target.value)} />
              {formErrors.aadhar && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.aadhar}</p>}
              <Input label="Bank Number" placeholder="Enter Bank Number" value={bankNo} onChange={(e) => handleBankChange(e.target.value)} />
              <Input label="Confirm Password" placeholder="Enter Confirm Password" type="password" required />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Input label="Email" placeholder="Enter Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {formErrors.email && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.email}</p>}
              <Input label="Company Number" placeholder="Enter Company Number" value={companyNo} onChange={(e) => setCompanyNo(e.target.value)} />
              
              {/* Check Photo File Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Check Photo
                </label>
                <div className="flex items-center">
                  <label className="flex items-center justify-center px-4 py-2 bg-white border border-zinc-200 rounded-l cursor-pointer hover:bg-zinc-50 transition-colors text-xs text-zinc-700 border-r-0">
                    Choose File
                    <input type="file" className="hidden" />
                  </label>
                  <div className="flex-1 px-3 py-2 text-xs text-zinc-500 bg-white border border-zinc-200 rounded-r border-l-0">
                    No file chosen
                  </div>
                </div>
              </div>

              <Input label="Password" placeholder="Enter Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {formErrors.password && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.password}</p>}
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={backendRoles.map(r => ({ value: r.name, label: r.name }))}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800 px-8"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit User Details" sizeClass="max-w-4xl">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              {formErrors.name && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.name}</p>}
              <Input label="Mobile Number" value={mobile} onChange={(e) => handleMobileChange(e.target.value)} />
              {formErrors.mobile && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.mobile}</p>}
              <Input label="Aadhar Card" value={aadhar} onChange={(e) => handleAadharChange(e.target.value)} />
              {formErrors.aadhar && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.aadhar}</p>}
              <Input label="Bank Number" value={bankNo} onChange={(e) => handleBankChange(e.target.value)} />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {formErrors.email && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.email}</p>}
              <Input label="Company Number" value={companyNo} onChange={(e) => setCompanyNo(e.target.value)} />
              <Input label="New Password (optional)" placeholder="Leave blank to keep current" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {formErrors.password && <p className="text-rose-500 text-[11px] mt-0.5">{formErrors.password}</p>}
              <Select
                label="Assigned Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={backendRoles.map(r => ({ value: r.name, label: r.name }))}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              className="bg-teal-800 hover:bg-teal-700 focus:ring-teal-800 px-8"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
