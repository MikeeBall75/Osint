"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plug,
  Activity,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalSearches: number;
  totalIntegrations: number;
  activeIntegrations: number;
  recentSearches: {
    id: string;
    query: string;
    queryType: string;
    sources: number;
    createdAt: string;
    user: { email: string; name: string | null };
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Users,
            label: "Total Users",
            value: stats.totalUsers,
            color: "text-brand-400",
            bg: "bg-brand-500/10",
          },
          {
            icon: Search,
            label: "Total Searches",
            value: stats.totalSearches,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
          {
            icon: Plug,
            label: "API Integrations",
            value: stats.totalIntegrations,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            icon: Activity,
            label: "Active Sources",
            value: stats.activeIntegrations,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Searches */}
      <div className="glass-card">
        <div className="p-5 border-b border-surface-border">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Searches (All Users)
          </h2>
        </div>
        {stats.recentSearches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No searches yet.
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {stats.recentSearches.map((search) => (
              <div key={search.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center">
                  {search.queryType === "email" ? (
                    <Mail className="w-5 h-5 text-brand-400" />
                  ) : (
                    <Phone className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {search.query}
                  </p>
                  <p className="text-gray-500 text-sm">
                    by {search.user.name || search.user.email} &middot;{" "}
                    {search.sources} sources
                  </p>
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(search.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
