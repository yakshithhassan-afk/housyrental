"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!loading && user) {
        let finalRole = 'USER';
        
        try {
          const { db } = await import('@/lib/firebase');
          const { doc, getDoc } = await import('firebase/firestore');
          const userRef = doc(db as any, 'users', user.uid);
          const snap = await getDoc(userRef);
          
          if (snap.exists()) {
            finalRole = snap.data().role || 'USER';
          } else {
             // Fallback to local state if missing
            finalRole = user.role || localStorage.getItem(`user_role_${user.uid}`) || 'USER';
          }
        } catch (error) {
          console.error('Failed to fetch role for dashboard redirect:', error);
          finalRole = user.role || 'USER';
        }
        
        if (finalRole === 'OWNER') {
          router.push('/dashboard/owner');
        } else if (finalRole === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard/user');
        }
        setIsRedirecting(false);
      } else if (!loading && !user) {
        router.push('/auth/login');
      }
    };

    handleRedirect();
  }, [user, loading, router]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-cyan-900 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
