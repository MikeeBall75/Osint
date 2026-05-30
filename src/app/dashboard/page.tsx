"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  CreditCard,
  Clock,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";

interface SearchRecord {
  id: string;
  query: string;
  queryType: string;
  sources: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<SearchRecord[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/user/history")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setRecentSearches(data.slice(0, 5));
        })
        .catch(() => {});
    }
  }, [session]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back{session.user.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="text-gray-400 mt-1">
          Your OSINT intelligence dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-brand-400" />
            </div>
            <span className="text-gray-400 text-sm">Credits Balance</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {session.user.credits}
          </p>
          <Link
            href="/dashboard/credits"
            className="text-brand-400 text-sm hover:text-brand-300 mt-2 inline-flex items-center gap-1"
          >
            Buy more <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Searches</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {recentSearches.length}
          </p>
        </div>

        <Link href="/dashboard/search" className="glass-card p-6 group hover:border-brand-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">New Search</span>
          </div>
          <p className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors">
            Start investigating &rarr;
          </p>
        </Link>
      </div>

      {/* Recent Searches */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Searches
          </h2>
          <Link
            href="/dashboard/history"
            className="text-brand-400 text-sm hover:text-brand-300"
          >
            View all
          </Link>
        </div>

        {recentSearches.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No searches yet. Start your first investigation.</p>
            <Link href="/dashboard/search" className="btn-primary mt-4 inline-block">
              Search Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {recentSearches.map((search) => (
              <Link
                key={search.id}
                href={`/dashboard/search/${search.id}`}
                className="flex items-center gap-4 p-4 hover:bg-surface-elevated/50 transition-colors"
              >
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
                    {search.sources} sources &middot;{" "}
                    {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
