"use client";

import React from "react";
import { fetchUsers, User } from "../../services/userService";
import { Table, Column } from "../../components/common/Table";
import {
  TrendingUp,
  PeopleAlt,
  ShoppingBag,
  AssignmentReturn,
  MonetizationOn
} from "@mui/icons-material";

export default function DashboardPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [leads, setLeads] = React.useState<any[]>([
    { id: "1", name: "Rajesh Kumar", phone_number: "9988776655", product: "Wrixty Ashwagandha Gold", amount: 1200, quantity: 2, subtotal: 2400, assgin: "Aman Sharma", date: "2026-05-29", time: "10:30", status: "New", note: "Interested in stress relief products." },
    { id: "2", name: "Suresh Gupta", phone_number: "8877665544", product: "Wrixty Triphala Digest", amount: 650, quantity: 1, subtotal: 650, assgin: "Priya Patel", date: "2026-05-29", time: "11:15", status: "Call Back", note: "Wants to consult with doctor first." },
    { id: "3", name: "Neha Sharma", phone_number: "7766554433", product: "Wrixty Shatavari Hormonal Balance", amount: 1100, quantity: 1, subtotal: 1100, assgin: "Aman Sharma", date: "2026-05-30", time: "09:00", status: "In-Progress", note: "Inquiring about hormonal balance pack." },
    { id: "4", name: "Ramesh Patel", phone_number: "9012345678", product: "Wrixty Brahmi Mind Focus", amount: 890, quantity: 3, subtotal: 2670, assgin: "Vikram Singh", date: "2026-05-28", time: "16:20", status: "Pending", note: "Asked for discount." }
  ]);
  const [orders, setOrders] = React.useState<any[]>([
    { id: "1", leadId: "4", name: "Ramesh Patel", phone_number: "9012345678", product: "Wrixty Brahmi Mind Focus", amount: 890, quantity: 3, subtotal: 2670, grandTotal: 2670, date: "2026-05-28", paymentType: "COD", courier: "Delhivery", assginTo: "Vikram Singh", transactionId: "TXN90283019", status: "Dispatched" }
  ]);
  const [returnOrders, setReturnOrders] = React.useState<any[]>([
    { id: "1", customerName: "Anil Saxena", phone_number: "9123456780", assginTo: "Aman Sharma", orderDate: "2026-05-20", returnDate: "2026-05-25", product: "Wrixty Neem Blood Purify", amount: 450, quantity: 2, subtotal: 900, type: "Wrong Product Delivered" }
  ]);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsers({ page: 1, limit: 100 });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, []);

  // 1. Calculations
  const totalLeads = leads.filter(l => !l.isDeleted).length;
  const totalOrders = orders.length;
  const totalReturns = returnOrders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);

  // Return rate percentage
  const returnRate = totalOrders > 0 ? ((totalReturns / totalOrders) * 100).toFixed(1) : "0.0";

  // Metrics list
  const metrics = [
    { name: "Total Leads", value: totalLeads, icon: <PeopleAlt className="w-5 h-5 text-primary-teal" />, desc: "Active inquiries in CRM" },
    { name: "Total Orders", value: totalOrders, icon: <ShoppingBag className="w-5 h-5 text-secondary-cyan" />, desc: "Successfully converted orders" },
    { name: "Total Returns", value: totalReturns, icon: <AssignmentReturn className="w-5 h-5 text-error" />, desc: "Returned/Rejected orders" },
    { name: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <MonetizationOn className="w-5 h-5 text-warning" />, desc: "Delivered sales value" }
  ];

  // Best Selling Products data
  const bestSellers = React.useMemo(() => {
    const counts: Record<string, { count: number; amt: number }> = {};
    orders.forEach(o => {
      if (!counts[o.product]) {
        counts[o.product] = { count: 0, amt: 0 };
      }
      counts[o.product].count += o.quantity;
      counts[o.product].amt += o.grandTotal;
    });

    return Object.entries(counts).map(([name, stat]) => ({
      name,
      count: stat.count,
      amount: `₹${stat.amt.toLocaleString("en-IN")}`
    }));
  }, [orders]);

  // Columns for Best Selling Table
  const productColumns: Column<typeof bestSellers[0]>[] = [
    { key: "name", header: "Product Name" },
    { key: "count", header: "Selling Count" },
    { key: "amount", header: "Amount" }
  ];

  // Staff order statistics
  const staffStats = React.useMemo(() => {
    const stats: Record<string, { total: number; returned: number; delivered: number; qty: number; retQty: number; subtotal: number }> = {};
    
    // Initialize staff list
    users.forEach(u => {
      stats[u.name] = { total: 0, returned: 0, delivered: 0, qty: 0, retQty: 0, subtotal: 0 };
    });

    orders.forEach(o => {
      const staffName = o.assginTo || "Super Admin";
      if (!stats[staffName]) {
        stats[staffName] = { total: 0, returned: 0, delivered: 0, qty: 0, retQty: 0, subtotal: 0 };
      }
      stats[staffName].total += 1;
      stats[staffName].qty += o.quantity;
      stats[staffName].subtotal += o.grandTotal;
      if (o.status === "Delivered") {
        stats[staffName].delivered += 1;
      }
    });

    returnOrders.forEach(r => {
      const staffName = r.assginTo || "Super Admin";
      if (!stats[staffName]) {
        stats[staffName] = { total: 0, returned: 0, delivered: 0, qty: 0, retQty: 0, subtotal: 0 };
      }
      stats[staffName].returned += 1;
      stats[staffName].retQty += r.quantity;
    });

    return Object.entries(stats).map(([name, s]) => ({
      name,
      total: s.total,
      returned: s.returned,
      delivered: s.delivered,
      qty: s.qty,
      retQty: s.retQty,
      subtotal: `₹${s.subtotal.toLocaleString("en-IN")}`
    }));
  }, [users, orders, returnOrders]);

  // Columns for Staff Table
  const staffColumns: Column<typeof staffStats[0]>[] = [
    { key: "name", header: "Staff Name" },
    { key: "total", header: "Staff Total Order" },
    { key: "returned", header: "Staff Return Order" },
    { key: "delivered", header: "Staff Order" },
    { key: "qty", header: "Order Quantity" },
    { key: "retQty", header: "Order Return Quantity" },
    { key: "subtotal", header: "Subtotal" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-subtle p-8 border border-border-ui rounded-lg shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-teal/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl font-black uppercase tracking-wider text-[#1f2f3e]">
            Ayurvedic Dashboard
          </h2>
          <p className="text-sm text-text-secondary font-semibold uppercase tracking-wider">
            Real-time analytics and staff metrics overview
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-primary-teal/10 px-4 py-2 rounded-lg relative z-10">
          <TrendingUp className="w-4 h-4 text-primary-teal" />
          <span className="text-sm font-bold text-primary-teal uppercase tracking-wider">
            Return Rate: {returnRate}%
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="p-6 bg-card-bg border border-border-ui rounded-lg shadow-soft flex items-center justify-between transition-all hover:border-primary-teal/20 hover:shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-teal to-secondary-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="space-y-2 text-left relative z-10">
              <span className="text-sm text-text-secondary font-bold uppercase tracking-wider">
                {metric.name}
              </span>
              <h3 className="text-3xl font-black text-[#1f2f3e] tracking-tight">
                {metric.value}
              </h3>
              <p className="text-xs text-text-secondary font-medium">
                {metric.desc}
              </p>
            </div>
            <div className="p-4 bg-background border border-border-ui/50 rounded-lg group-hover:bg-primary-teal/5 transition-colors">
              {metric.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Staff Stats */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-black uppercase tracking-wider text-text-secondary px-2">
            👥 Staff Performance Matrix
          </h4>
          <div className="bg-card-bg p-6 border border-border-ui rounded-lg shadow-soft">
            <Table data={staffStats} columns={staffColumns} searchable={false} idField="name" />
          </div>
        </div>

        {/* Right Side: Best Selling Products */}
        <div className="space-y-4">
          <h4 className="text-sm font-black uppercase tracking-wider text-text-secondary px-2">
            📦 Best Selling Products
          </h4>
          <div className="bg-card-bg p-6 border border-border-ui rounded-lg shadow-soft">
            <Table data={bestSellers} columns={productColumns} searchable={false} idField="name" />
          </div>
        </div>
      </div>
    </div>
  );
}
