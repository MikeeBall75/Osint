"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  Gift,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

const CREDIT_PACKS = [
  { id: "pack_10", name: "Starter", credits: 10, price: "$4.99" },
  { id: "pack_50", name: "Professional", credits: 50, price: "$19.99" },
  { id: "pack_200", name: "Enterprise", credits: 200, price: "$59.99" },
];

export default function CreditsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreditsContent />
    </Suspense>
  );
}

function CreditsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const success = searchParams.get("success");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/user/credits")
        .then((r) => r.json())
        .then((data) => {
          setCredits(data.credits || 0);
          setTransactions(data.transactions || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  async function handlePurchase(packId: string) {
    setPurchasing(packId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
        setPurchasing(null);
      }
    } catch {
      alert("Network error");
      setPurchasing(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400">
            Credits purchased successfully! They may take a moment to appear.
          </p>
        </div>
      )}

      {/* Balance */}
      <div className="glass-card p-8 text-center">
        <CreditCard className="w-12 h-12 text-brand-400 mx-auto mb-4" />
        <p className="text-gray-400 mb-1">Current Balance</p>
        <p className="text-5xl font-bold text-white">{credits}</p>
        <p className="text-gray-500 mt-1">credits</p>
      </div>

      {/* Packs */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Buy Credits</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="glass-card p-6 hover:border-brand-500/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-brand-400" />
                <h3 className="font-semibold text-white">{pack.name}</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {pack.credits}
              </p>
              <p className="text-gray-400 text-sm mb-4">credits</p>
              <p className="text-2xl font-bold text-brand-400 mb-4">
                {pack.price}
              </p>
              <button
                onClick={() => handlePurchase(pack.id)}
                disabled={purchasing !== null}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {purchasing === pack.id && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Purchase
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Transaction History
        </h2>
        {transactions.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">
            No transactions yet.
          </div>
        ) : (
          <div className="glass-card divide-y divide-surface-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.amount > 0
                      ? "bg-green-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  {tx.type === "BONUS" ? (
                    <Gift className="w-5 h-5 text-amber-400" />
                  ) : tx.amount > 0 ? (
                    <ArrowDownRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    {tx.description || tx.type}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    tx.amount > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
