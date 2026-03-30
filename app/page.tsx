// Server Component — no "use client" directive
// Static sections (How It Works, CTA, Footer) render on the server with zero client JS.
// Interactive sections are isolated client components imported below.

import Link from "next/link";
import { Building2, Search, Calendar, Users, Check } from "lucide-react";
import { SiteHeader } from "@/components/home/site-header";
import { HeroSection } from "@/components/home/hero-section";
import { PropertyGrid } from "@/components/home/property-grid";
import { FeaturesSection } from "@/components/home/features-section";
import { ScrollToTop } from "@/components/home/scroll-to-top";

// ─── Static data (server-rendered, no hydration cost) ───────────────────────
const howItWorks = [
  {
    step: 1,
    title: "Search Properties",
    description: "Browse thousands of verified listings with detailed photos and virtual tours",
    icon: Search,
    color: "from-cyan-400 to-teal-400",
  },
  {
    step: 2,
    title: "Schedule Tours",
    description: "Book property visits at your convenience with our easy scheduling system",
    icon: Calendar,
    color: "from-cyan-500 to-teal-500",
  },
  {
    step: 3,
    title: "Apply Online",
    description: "Submit your application digitally with all required documents",
    icon: Building2,
    color: "from-cyan-600 to-teal-600",
  },
  {
    step: 4,
    title: "Move In",
    description: "Sign lease electronically and get keys to your new home",
    icon: Users,
    color: "from-cyan-700 to-teal-700",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#e0e7ff" }}>
      {/* Fixed Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "linear-gradient(135deg,rgb(127, 191, 235) 0%,rgb(200, 175, 175) 50%, #ecfdf5 100%)",
          minHeight: "100vh",
        }}
      />

      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full filter blur-3xl opacity-40 animate-pulse"
          style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full filter blur-3xl opacity-40 animate-pulse animation-delay-2000"
          style={{ background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-3xl opacity-30 animate-pulse animation-delay-4000"
          style={{ background: "linear-gradient(135deg, #22d3ee 0%, #34d399 100%)" }}
        />
      </div>

      {/* ── CLIENT: Sticky header with scroll + auth awareness ── */}
      <SiteHeader />

      {/* ── CLIENT: Hero with search bar + stats ── */}
      <HeroSection />

      {/* ── SERVER: How It Works (pure static HTML, no JS) ── */}
      <section
        className="py-20 relative z-10"
        style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-3xl p-8 md:p-12 mb-16 shadow-xl">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                How <span className="text-cyan-600">HousyRental</span> Works
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                Find and rent your perfect home in 4 simple steps
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="group relative animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-300 to-teal-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLIENT: Property grid with Firebase realtime ── */}
      <PropertyGrid />

      {/* ── CLIENT: Features with hover state ── */}
      <FeaturesSection />

      {/* ── SERVER: CTA section (pure static HTML) ── */}
      <section
        className="relative py-20 text-white z-10 overflow-hidden"
        style={{ background: "linear-gradient(90deg, #0e7490 0%, #0d9488 50%, #059669 100%)" }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-cyan-950/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
              Ready to Find Your Dream Home with HousyRental?
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto text-cyan-50 drop-shadow-lg">
              Join thousands of satisfied tenants who found their perfect rental through HousyRental
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/browse-properties"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-white to-gray-100 text-cyan-600 hover:from-gray-100 hover:to-gray-200 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl border-2 border-cyan-200 rounded-lg"
              >
                Browse Properties
                <Search className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-cyan-600 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl rounded-lg"
              >
                List Your Property
                <Users className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {[
              { value: "5000+", label: "Happy Tenants" },
              { value: "2500+", label: "Properties Listed" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "24/7", label: "Support Available" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold mb-2">{item.value}</div>
                <div className="text-indigo-100">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVER: Footer (pure static HTML) ── */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">HousyRental</span>
            </div>
            <p className="text-gray-400 mb-8 text-center">
              Setting the standard for rental excellence.
            </p>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 w-full">
              <p>© 2024 HousyRental. All rights reserved.</p>
              <div className="flex justify-center gap-6 mt-4">
                <Link
                  href="mailto:housyrental0@gmail.com"
                  className="hover:text-cyan-400 transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── CLIENT: Scroll-to-top button (tiny, isolated) ── */}
      <ScrollToTop />

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-6000 { animation-delay: 6s; }
        .animation-delay-8000 { animation-delay: 8s; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
      `}</style>
    </div>
  );
}
