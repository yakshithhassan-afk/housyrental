"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    // Hardcoded admin credentials check
    const validEmails = ['admin', 'admin@gmail.com', 'admin@housyrental.com'];
    if (!validEmails.includes(email)) {
      toast.error('Invalid admin credentials');
      setLoading(false);
      return;
    }

    if (password !== 'admin123') {
      toast.error('Invalid admin password');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { auth, db } = await import('@/lib/firebase');
      
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      let adminUser;
      
      try {
        // Try to sign in with Firebase credentials
        if (!db) {
          throw new Error('Firestore not initialized');
        }
        const result = await signInWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
        adminUser = result.user;
        console.log('✅ Admin signed in with Firebase:', adminUser.email);
      } catch (firebaseError: any) {
        console.log('⚠️ Firebase admin login failed (user may not exist), creating admin user...');
        
        // If login fails, create the admin user
        const createResult = await createUserWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
        adminUser = createResult.user;
        
        // Update display name
        await updateProfile(adminUser, {
          displayName: 'Admin User'
        });
        
        // Create user document in Firestore
        const { doc, setDoc, Timestamp } = await import('firebase/firestore');
        const userRef = doc(db!, 'users', adminUser.uid);
        await setDoc(userRef, {
          email: 'admin@gmail.com',
          displayName: 'Admin User',
          role: 'ADMIN',
          createdAt: Timestamp.now(),
          isAdmin: true
        });
        
        console.log('✅ Admin user created successfully!');
      }
      
      // Set admin role in localStorage
      if (adminUser) {
        localStorage.setItem(`user_role_${adminUser.uid}`, 'ADMIN');
        console.log('✅ Admin role set for:', adminUser.email);
      }

      toast.success("Admin login successful! Access granted.");
      
      // Redirect to admin dashboard
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error(error.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl border border-white/20">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-blue-100 text-lg">Restricted Area - Authorized Personnel Only</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleAdminLogin} className="space-y-6">
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@housyrental.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-200 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-200 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-100"></div>
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Access Admin Panel
                </div>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-200 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-100 text-sm font-medium">Secure Admin Portal</p>
                <p className="text-blue-200/60 text-xs mt-1">
                  This is a restricted area. Unauthorized access is prohibited and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-blue-100 hover:text-white transition-colors text-sm font-medium"
          >
            ← Back to User Login
          </button>
        </div>
      </div>
    </div>
  );
}
