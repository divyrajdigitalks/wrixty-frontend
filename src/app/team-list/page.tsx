"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, Column } from "../../components/common/Table";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";
import { useToast } from "../../context/ToastContext";
import { usePermission } from "../../utils/permissionUtils";
import { fetchUsers, User } from "../../services/userService";
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  Team,
} from "../../services/teamService";

export default function TeamListPage() {
  const { hasPermission } = usePermission();
  const toast = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination + search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);

  // Delete Confirm Modal State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const [name, setName] = useState("");
  const [head, setHead] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTeams({ page, limit, search });
      setTeams(res.data);
      setTotal(res.total);
    } catch {
      setError("Failed to load teams. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    const loadUsersList = async () => {
      try {
        const res = await fetchUsers({ page: 1, limit: 150 });
        setAllUsers(res.data);
      } catch (err) {
        console.error("Failed to load users for teams dropdowns:", err);
      }
    };
    loadUsersList();
  }, []);

  // Filter Managers/Heads: roles containing 'manager', 'maneger', or 'admin'
  const managerUsers = allUsers.filter(u =>
    u.roles && u.roles.some(roleName => {
      const lower = roleName.toLowerCase();
      return lower.includes("manager") || lower.includes("maneger") || lower.includes("admin");
    })
  );

  // Filter Staff/Members: roles containing 'staff', 'agent', or 'user'
  const staffUsers = allUsers.filter(u =>
    u.roles && u.roles.some(roleName => {
      const lower = roleName.toLowerCase();
      return lower.includes("staff") || lower.includes("agent") || lower.includes("user");
    })
  );

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Team name is required";
    if (!head) errors.head = "Team head is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createTeam({
        name,
        head,
        member: members
      });
      setModalOpen(false);
      clear();
      toast.success("Team registered successfully.");
      loadTeams();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to register team.");
    }
  };

  const openEdit = (team: Team) => {
    setActiveTeam(team);
    setName(team.name);
    setHead(team.head);
    setMembers(team.member || []);
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!activeTeam) return;
    try {
      await updateTeam(activeTeam._id, {
        name,
        head,
        member: members
      });
      setEditOpen(false);
      clear();
      toast.success("Team updated successfully.");
      loadTeams();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update team.");
    }
  };

  const handleDelete = (team: Team) => {
    setTeamToDelete(team);
    setDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!teamToDelete) return;
    try {
      await deleteTeam(teamToDelete._id);
      setDeleteOpen(false);
      setTeamToDelete(null);
      toast.success("Team deleted successfully.");
      loadTeams();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete team.");
    }
  };

  const clear = () => {
    setName("");
    setHead("");
    setMembers([]);
    setFormErrors({});
  };

  const columns: Column<Team>[] = [
    { key: "_id", header: "No", render: (_, __, i) => (page - 1) * limit + i + 1, sortable: false },
    { key: "name", header: "Team Name" },
    { key: "head", header: "Team Head" },
    { key: "member", header: "Members Count", render: (val) => (val || []).length },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {hasPermission("Team-edit") && (
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 bg-primary-teal hover:bg-primary-teal text-white rounded-lg transition-all shadow-sm"
              title="Edit Team"
            >
              <FiEdit className="w-3.5 h-3.5" />
            </button>
          )}
          {hasPermission("Team-delete") && (
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg transition-all shadow-sm"
              title="Delete Team"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg p-8 border border-border-ui rounded-lg shadow-soft">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-wider text-text-primary">
            Teams List
          </h2>
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
            Group agents under regional or target teams
          </p>
        </div>
        {hasPermission("Team-add") && (
          <Button
            onClick={() => {
              clear();
              setModalOpen(true);
            }}
            variant="primary"
            className="rounded-lg px-6"
          >
            Create Team
          </Button>
        )}
      </div>

      {error && (
        <div className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-card-bg p-8 border border-border-ui rounded-lg shadow-soft">
        <Table 
          data={teams} 
          columns={columns}
          searchable={true}
          searchPlaceholder="Search teams..."
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

      {/* Add Team Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Sales Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Team Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. West Coast Sales" />
          {formErrors.name && <p className="text-rose-500 text-[11px]">{formErrors.name}</p>}
          <Select
            label="Select Team Head (Managers/Admins)"
            value={head}
            onChange={(e) => setHead(e.target.value)}
            options={managerUsers.map(u => ({ value: u.name, label: `${u.name} (${(u.roles || []).join(", ")})` }))}
            placeholder="Select manager as head"
          />
          {formErrors.head && <p className="text-rose-500 text-[11px]">{formErrors.head}</p>}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Select Team Members (Agents/Staff)</span>
            <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg max-h-48 overflow-y-auto scrollbar-thin">
              {staffUsers.length > 0 ? (
                staffUsers.map(u => (
                  <label key={u._id} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-text-primary">
                    <input
                      type="checkbox"
                      checked={members.includes(u.name)}
                      onChange={(e) => {
                        if (e.target.checked) setMembers([...members, u.name]);
                        else setMembers(members.filter(m => m !== u.name));
                      }}
                      className="w-4 h-4 text-primary-teal border-zinc-300 rounded focus:ring-primary-teal cursor-pointer"
                    />
                    {u.name}
                  </label>
                ))
              ) : (
                <span className="text-xs text-text-secondary italic col-span-2 text-center py-4">No staff or agents found</span>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary-teal hover:bg-primary-teal text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow transition-all"
          >
            Register Team
          </button>
        </form>
      </Modal>

      {/* Edit Team Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Team Setup">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input label="Team Name" value={name} onChange={(e) => setName(e.target.value)} required />
          {formErrors.name && <p className="text-rose-500 text-[11px]">{formErrors.name}</p>}
          <Select
            label="Select Team Head (Managers/Admins)"
            value={head}
            onChange={(e) => setHead(e.target.value)}
            options={managerUsers.map(u => ({ value: u.name, label: `${u.name} (${(u.roles || []).join(", ")})` }))}
          />
          {formErrors.head && <p className="text-rose-500 text-[11px]">{formErrors.head}</p>}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Select Team Members (Agents/Staff)</span>
            <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg max-h-48 overflow-y-auto scrollbar-thin">
              {staffUsers.length > 0 ? (
                staffUsers.map(u => (
                  <label key={u._id} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-text-primary">
                    <input
                      type="checkbox"
                      checked={members.includes(u.name)}
                      onChange={(e) => {
                        if (e.target.checked) setMembers([...members, u.name]);
                        else setMembers(members.filter(m => m !== u.name));
                      }}
                      className="w-4 h-4 text-primary-teal border-zinc-300 rounded focus:ring-primary-teal cursor-pointer"
                    />
                    {u.name}
                  </label>
                ))
              ) : (
                <span className="text-xs text-text-secondary italic col-span-2 text-center py-4">No staff or agents found</span>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary-teal hover:bg-primary-teal text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow transition-all"
          >
            Save Changes
          </button>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={executeDelete}
        title="Delete Team"
        itemName={teamToDelete?.name}
        itemType="team"
      />
    </div>
  );
}
