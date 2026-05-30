"use client";

import { useEffect, useState } from "react";
import { Users, Mail, CreditCard, Search } from "lucide-react";

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
  createdAt: string;
  _count: { searches: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <Users className="w-6 h-6 text-brand-400" />
        User Management
      </h1>

      {users.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          No users registered yet.
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">
                    User
                  </th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">
                    Role
                  </th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">
                    Credits
                  </th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">
                    Searches
                  </th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-elevated/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-brand-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {user.name || "—"}
                          </p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-brand-400" />
                        <span className="text-white text-sm">
                          {user.credits}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {user._count.searches}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
