"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface SearchRecord {
  id: string;
  query: string;
  queryType: string;
  results: string;
  sources: number;
  createdAt: string;
}

interface SearchResult {
  source: string;
  data: Record<string, unknown>;
  error?: string;
}

export default function SearchResultPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [search, setSearch] = useState<SearchRecord | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetch("/api/user/history")
        .then((r) => r.json())
        .then((data: SearchRecord[]) => {
          const found = data.find(
            (s: SearchRecord) => s.id === params.id
          );
          if (found) {
            setSearch(found);
            try {
              setResults(JSON.parse(found.results));
            } catch {
              setResults([]);
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session, params.id]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!search) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          Search not found
        </h2>
        <Link href="/dashboard" className="text-brand-400 hover:text-brand-300">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-500/10 flex items-center justify-center">
            {search.queryType === "email" ? (
              <Mail className="w-7 h-7 text-brand-400" />
            ) : (
              <Phone className="w-7 h-7 text-green-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{search.query}</h1>
            <div className="flex items-center gap-3 text-gray-400 text-sm mt-1">
              <span className="capitalize">{search.queryType} search</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {search.sources} sources
              </span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(search.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {results.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-500">
            No results data available.
          </div>
        ) : (
          results.map((result, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{result.source}</h3>
                  {result.error && (
                    <span className="text-red-400 text-xs">
                      Error: {result.error}
                    </span>
                  )}
                </div>
              </div>

              {!result.error && (
                <div className="bg-surface-elevated rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
