"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Building2, Users, Calendar, Star, ArrowRight, MessageSquare } from "lucide-react";


const popularTags = ["2 BHK in Mumbai", "Luxury Apartments", "Pet Friendly", "Near Metro"];

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(searchQuery.trim()
      ? `/browse-properties?search=${encodeURIComponent(searchQuery)}`
      : "/browse-properties"
    );
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden z-10 pt-32 pb-16 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
      />

      {/* Floating blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { cls: "top-10 left-10 w-64 h-64", bg: "linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)", delay: "" },
          { cls: "top-20 right-10 w-72 h-72", bg: "linear-gradient(135deg, #0891b2 0%, #0d9488 100%)", delay: "animation-delay-2000" },
          { cls: "-bottom-4 left-20 w-64 h-64", bg: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", delay: "animation-delay-4000" },
        ].map((b, i) => (
          <div
            key={i}
            className={`absolute ${b.cls} rounded-full filter blur-3xl opacity-40 animate-blob ${b.delay}`}
            style={{ background: b.bg }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 animate-fade-in-up leading-tight text-white drop-shadow-2xl">
            Find Your Perfect <span className="text-yellow-300 drop-shadow-2xl">Rental</span> Home
          </h1>
          <p className="text-sm md:text-base text-gray-100 mb-6 max-w-xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed drop-shadow-lg">
            Experience premium rental services tailored to your lifestyle. Find your dream home with{" "}
            <span className="text-yellow-300 font-semibold">HousyRental</span>.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-400">
            <div className="flex flex-col gap-4">
              <div className="bg-white/15 backdrop-blur-md rounded-3xl p-3 flex flex-col md:flex-row gap-3 border border-white/30 shadow-2xl">
                <div className="flex-1 flex items-center px-4 py-4 bg-white/10 rounded-2xl border border-white/20 min-w-0">
                  <Search className="w-5 h-5 text-white/80 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by city, neighborhood, or ZIP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-white placeholder:text-white/60 text-lg font-medium"
                  />
                </div>
                <Button
                  size="lg"
                  type="submit"
                  className="px-10 py-7 bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 font-extrabold shadow-lg hover:shadow-xl border-2 border-cyan-300 rounded-2xl whitespace-nowrap"
                >
                  Search Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => router.push('/support')}
                  className="px-6 py-2.5 bg-white/10 backdrop-blur-md text-cyan-50 border border-white/20 hover:bg-white/20 rounded-full transition-all text-sm font-bold flex items-center gap-2 group shadow-lg"
                >
                  <MessageSquare className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition-transform" />
                  Have Questions? <span className="text-yellow-300 hover:underline">Contact Support</span>
                </button>
              </div>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mb-8 animate-fade-in-up animation-delay-800">
            <p className="text-gray-300 text-sm mb-3 font-medium">Popular searches:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {popularTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(tag);
                    router.push(`/browse-properties?search=${encodeURIComponent(tag)}`);
                  }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
