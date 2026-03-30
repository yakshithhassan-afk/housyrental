"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function SiteHeader() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg border-b border-gray-200"
          : "bg-white/95 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            router.push("/");
            toast.success("Welcome to HousyRental!");
          }}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900">HousyRental</span>
            <p className="text-xs text-gray-600">Find Your Perfect Home</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            href="/browse-properties"
            onClick={() => toast.info("Loading properties...")}
            className="text-gray-700 hover:text-cyan-600 transition-all duration-300 font-medium hover:scale-105 transform cursor-pointer"
          >
            Properties
          </Link>
          <Link
            href="/services"
            onClick={() => toast.info("Loading services...")}
            className="text-gray-700 hover:text-cyan-600 transition-all duration-300 font-medium hover:scale-105 transform cursor-pointer"
          >
            Services
          </Link>
          <Link
            href="/about"
            onClick={() => toast.info("About HousyRental")}
            className="text-gray-700 hover:text-cyan-600 transition-all duration-300 font-medium hover:scale-105 transform cursor-pointer"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20 h-9 bg-gray-200 animate-pulse rounded-md opacity-50"></div>
              <div className="w-20 h-9 bg-gray-200 animate-pulse rounded-md opacity-50"></div>
            </div>
          ) : user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                onClick={() => {
                  if (user.role === 'OWNER') router.push('/dashboard/owner');
                  else if (user.role === 'ADMIN') router.push('/admin/dashboard');
                  else router.push('/dashboard/user');
                }}
                variant="outline"
                className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 transition-colors"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => {
                  logout();
                  toast.success("Successfully logged out");
                  router.push("/");
                }}
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-50 transition-colors"
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-cyan-100 transition-all duration-300 transform hover:scale-110"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-cyan-600" />
            ) : (
              <Menu className="w-5 h-5 text-cyan-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {[
              { href: "/browse-properties", label: "Properties", msg: "Loading properties..." },
              { href: "/services", label: "Services", msg: "Loading services..." },
              { href: "/about", label: "About", msg: "About HousyRental" },
            ].map(({ href, label, msg }) => (
              <Link
                key={href}
                href={href}
                onClick={() => { setIsMenuOpen(false); toast.info(msg); }}
                className="text-gray-700 hover:text-cyan-600 transition-all duration-300 font-medium"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (user.role === 'OWNER') router.push('/dashboard/owner');
                    else if (user.role === 'ADMIN') router.push('/admin/dashboard');
                    else router.push('/dashboard/user');
                  }}
                  variant="outline"
                  className="w-full border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => { 
                    setIsMenuOpen(false); 
                    logout(); 
                    toast.success("Logged out"); 
                    router.push("/");
                  }} 
                  variant="outline"
                  className="w-full border-red-500 text-red-600 hover:bg-red-50"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-gray-700 hover:text-cyan-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 font-semibold">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
