"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, UserRole } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, User, Eye, EyeOff, Building2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("USER");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, name, role as UserRole);
      toast.success("Account created successfully!");
      
      if (role === "OWNER") {
        router.push("/dashboard/owner");
      } else {
        router.push("/dashboard/user");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Welcome!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to sign in with Google");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-cyan-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">HousyRental</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Create Your Account</h2>
          <p className="text-gray-600">Join thousands finding their dream homes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`relative p-4 rounded-2xl text-center transition-all duration-300 ${
                  role === "USER"
                    ? "bg-gradient-to-br from-cyan-600 to-teal-600 text-white shadow-lg scale-105"
                    : "border-2 border-gray-200 hover:border-cyan-300 bg-white text-gray-700"
                }`}
              >
                {role === "USER" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <User className={`w-8 h-8 mx-auto mb-2 ${role === "USER" ? "text-white" : "text-cyan-600"}`} />
                <div className={`font-semibold text-sm ${role === "USER" ? "text-white" : "text-gray-900"}`}>User</div>
                <p className={`text-xs mt-1 ${role === "USER" ? "text-cyan-100" : "text-gray-500"}`}>Looking to rent/buy</p>
              </button>
              
              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={`relative p-4 rounded-2xl text-center transition-all duration-300 ${
                  role === "OWNER"
                    ? "bg-gradient-to-br from-cyan-600 to-teal-600 text-white shadow-lg scale-105"
                    : "border-2 border-gray-200 hover:border-cyan-300 bg-white text-gray-700"
                }`}
              >
                {role === "OWNER" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <Building2 className={`w-8 h-8 mx-auto mb-2 ${role === "OWNER" ? "text-white" : "text-cyan-600"}`} />
                <div className={`font-semibold text-sm ${role === "OWNER" ? "text-white" : "text-gray-900"}`}>Owner</div>
                <p className={`text-xs mt-1 ${role === "OWNER" ? "text-cyan-100" : "text-gray-500"}`}>Sell/Rent property</p>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-gray-300"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-gray-300"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-gray-300"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all hover:border-gray-300"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-md transition-all"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all bg-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Sign up with Google</span>
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-cyan-600 hover:text-cyan-700 font-semibold underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
