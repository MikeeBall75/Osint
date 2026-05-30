"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  Globe,
  AlertTriangle,
} from "lucide-react";

interface SearchResult {
  source: string;
  data: Record<string, unknown>;
  error?: string;
}

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState("");
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setError("");
    setResults(null);
    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), queryType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        setLoading(false);
        return;
      }

      setResults(data.results);
      setCreditsRemaining(data.creditsRemaining);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          OSINT Search
        </h1>
        <p className="text-gray-400">
          Enter an email address or phone number to begin your investigation
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="glass-card p-6 search-glow">
        {/* Type Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setQueryType("email")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              queryType === "email"
                ? "bg-brand-600 text-white"
                : "bg-surface-elevated text-gray-400 hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setQueryType("phone")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              queryType === "phone"
                ? "bg-brand-600 text-white"
                : "bg-surface-elevated text-gray-400 hover:text-white"
            }`}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>

        {/* Search Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type={queryType === "email" ? "email" : "tel"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                queryType === "email"
                  ? "Enter email address..."
                  : "Enter phone number (e.g. +1234567890)..."
              }
              className="input-field pl-12 text-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary px-8 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Search
          </button>
        </div>

        {session && (
          <p className="text-gray-500 text-sm mt-3">
            Each search costs 1 credit. You have{" "}
            <span className="text-brand-400 font-medium">
              {creditsRemaining ?? session.user.credits}
            </span>{" "}
            credits remaining.
          </p>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Results ({results.filter((r) => !r.error).length} sources)
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-gray-300 text-lg">No results found</p>
              <p className="text-gray-500 mt-1">
                No OSINT sources are configured. Ask the admin to add API
                integrations.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((result, i) => (
                <div
                  key={i}
                  className="glass-card p-6 animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {result.source}
                      </h3>
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
