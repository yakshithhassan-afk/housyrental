"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Building2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Invalid email or password");
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-cyan-50 via-white to-teal-50 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">HousyRental</h1>
                <p className="text-sm text-gray-600">Welcome Back</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Your Account</h2>
            <p className="text-gray-600">Continue your journey to find the perfect home</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
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
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-cyan-50 via-white to-teal-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.02] bg-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Sign in with Google</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-cyan-600 hover:text-cyan-700 font-semibold underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative Background */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600"></div>
        
        {/* Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-xl text-cyan-100 mb-8">Sign in to access your account and continue your property search</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Quick Access</p>
                  <p className="text-sm text-cyan-100">Login in seconds</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Secure Login</p>
                  <p className="text-sm text-cyan-100">Your data is protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
