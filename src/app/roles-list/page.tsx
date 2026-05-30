"use client";

import React, { useState } from "react";
import { Table, Column } from "../../components/common/Table";
import { Delete, Edit } from "@mui/icons-material";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

interface Role {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
}

const MODULE_PERMISSIONS = [
  { module: "Users List", perms: ["User-add", "User-list", "User-edit", "User-delete"] },
  { module: "Team List", perms: ["Team-add", "Team-list", "Team-edit", "Team-delete"] },
  { module: "Roles List", perms: ["Roles-add", "Roles-list", "Roles-edit", "Roles-delete"] },
  { module: "Lead List", perms: ["Lead-add", "Lead-transfer", "Lead-list", "Lead-edit", "Lead-delete"] },
  { module: "Order List", perms: ["Order-edit", "Order-delete", "Repart-order"] },
  { module: "Activity-Log", perms: ["Activity-log"] },
  { module: "Lead-Try", perms: ["Lead-try"] },
  { module: "Reminder List", perms: ["Reminder-edit", "Reminder-list"] },
  { module: "Return Order List", perms: ["Return-order-list", "Return-order-add"] },
  { module: "Currier List", perms: ["Currier-add", "Currier-list", "Currier-edit", "Currier-delete"] },
];

export default function RolesListPage() {
  const [roles, setRoles] = useState<Role[]>([
    { id: "1", name: "Admin", permissions: {} },
    { id: "2", name: "Staff", permissions: {} },
    { id: "3", name: "Main Maneger", permissions: {} },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Record<string, boolean>>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setRoles([...roles, { id: Date.now().toString(), name, permissions: selectedPerms }]);
    setModalOpen(false);
    clear();
  };

  const openEdit = (role: Role) => {
    setActiveRole(role);
    setName(role.name);
    setSelectedPerms(role.permissions || {});
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRole) return;
    setRoles(roles.map(r => r.id === activeRole.id ? { ...r, name, permissions: selectedPerms } : r));
    setEditOpen(false);
    clear();
  };

  const handleDelete = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const clear = () => {
    setName("");
    setSelectedPerms({});
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms(prev => ({
      ...prev,
      [perm]: !prev[perm]
    }));
  };

  const columns: Column<Role>[] = [
    { key: "id", header: "No", render: (_, __, i) => i + 1, sortable: false },
    { key: "name", header: "Name" },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all shadow-sm"
            title="Edit Role"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded transition-all shadow-sm"
            title="Delete Role"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const renderPermissionsTable = () => (
    <div className="mt-6 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden bg-white dark:bg-zinc-950">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-600 dark:text-zinc-400">
            <th className="p-4 w-1/4">Module</th>
            <th className="p-4 w-3/4">Permissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {MODULE_PERMISSIONS.map((mod, i) => (
            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
              <td className="p-4 font-semibold text-zinc-800 dark:text-zinc-200 align-top">
                {mod.module}
              </td>
              <td className="p-4">
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {mod.perms.map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer font-medium text-zinc-600 dark:text-zinc-400 min-w-[120px]">
                      <input
                        type="checkbox"
                        checked={!!selectedPerms[perm]}
                        onChange={() => togglePerm(perm)}
                        className="w-4 h-4 text-teal-700 rounded border-zinc-300 focus:ring-teal-600"
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-900 rounded-md shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            Roles List
          </h2>
          <Button
            onClick={() => {
              clear();
              setModalOpen(true);
            }}
            variant="primary"
          >
            Add Role
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

        <Table data={roles} columns={columns} searchable={false} />
      </div>

      {/* Add Role Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Role" sizeClass="max-w-5xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter Name" />
          
          <h4 className="font-bold text-zinc-800 dark:text-zinc-100 pt-4">Assign Permissions to Roles</h4>
          {renderPermissionsTable()}
          
          <div className="flex justify-end pt-4">
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

      {/* Edit Role Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Role" sizeClass="max-w-5xl">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter Name" />
          
          <h4 className="font-bold text-zinc-800 dark:text-zinc-100 pt-4">Assign Permissions to Roles</h4>
          {renderPermissionsTable()}

          <div className="flex justify-end pt-4">
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
