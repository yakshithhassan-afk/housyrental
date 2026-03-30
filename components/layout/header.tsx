"use client";

import Link from "next/link";
import { Search, Bell, Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl hidden sm:block">PropManager</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions, tenants, or units..."
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          
          <Link
            href="/dashboard/payments/record"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            + Record Payment
          </Link>

          <button
            className="lg:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
