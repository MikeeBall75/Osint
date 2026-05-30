"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Mail, Phone, ArrowRight, Search } from "lucide-react";

interface SearchRecord {
  id: string;
  query: string;
  queryType: string;
  sources: number;
  createdAt: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/user/history")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setSearches(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Clock className="w-6 h-6 text-gray-400" />
          Search History
        </h1>
        <Link href="/dashboard/search" className="btn-primary text-sm">
          New Search
        </Link>
      </div>

      {searches.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No searches yet</p>
        </div>
      ) : (
        <div className="glass-card divide-y divide-surface-border">
          {searches.map((search) => (
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
                  {new Date(search.createdAt).toLocaleString()}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
