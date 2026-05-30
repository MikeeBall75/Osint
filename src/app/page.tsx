import Link from "next/link";
import {
  Shield,
  Search,
  Mail,
  Phone,
  Lock,
  Zap,
  Globe,
  Database,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 via-transparent to-transparent" />
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-4 h-4 text-brand-400" />
              <span className="text-sm text-brand-300">
                Powerful OSINT Intelligence
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Investigate any </span>
              <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
                digital footprint
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              Search by email or phone number to uncover registered accounts,
              breach data, and digital profiles from multiple OSINT sources — all
              in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/register"
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Start Searching
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-lg px-8 py-3 flex items-center justify-center gap-2"
              >
                Sign In
              </Link>
            </div>

            {/* Search types */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-brand-400" />
                </div>
                <span>Email Lookup</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-brand-400" />
                </div>
                <span>Phone Lookup</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-4">
              Unmatched Accuracy. Absolute Confidence.
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
              Hours of manual research, in seconds. Our platform aggregates data
              from multiple OSINT sources for comprehensive intelligence.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Real-Time Data",
                  desc: "Fresh data and up-to-the-second accuracy for fast-paced investigations.",
                },
                {
                  icon: Lock,
                  title: "Privacy First",
                  desc: "Robust encryption keeps your activity confidential. We never store search results.",
                },
                {
                  icon: Globe,
                  title: "Multiple Sources",
                  desc: "Access intelligence from configurable data sources worldwide.",
                },
                {
                  icon: Database,
                  title: "Zero False Positives",
                  desc: "Validation processes filter out inaccuracies for trustworthy intelligence.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card p-6 hover:border-brand-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center glass-card p-12 search-glow">
            <Shield className="w-16 h-16 text-brand-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to investigate?
            </h2>
            <p className="text-gray-400 mb-8">
              Sign up now and start uncovering digital footprints with
              credit-based searches.
            </p>
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-surface-border py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-500" />
              <span className="text-gray-400 text-sm">OSINT Platform</span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
