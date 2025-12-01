// src/app/dashboard/page.jsx
"use client";

import { useAuth } from "@/context/AuthContext";
import RequireAuth from "../components/RequireAuth";
import { useEffect } from "react";


export default function DashboardPage() {
  const { user } = useAuth();
useEffect(()=>{
  document.title = "Dashboard";
})
  return (
    <RequireAuth>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
      </main>
    </RequireAuth>
  );
}
