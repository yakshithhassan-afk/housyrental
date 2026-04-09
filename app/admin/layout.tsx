"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Allow access to the login page and the root admin path (which redirects to login anyway)
    if (pathname === '/admin/login' || pathname === '/admin') {
      setIsAuthorized(true);
      return;
    }

    // Protection logic for all other /admin/* routes
    if (!user) {
      console.log("🔒 AdminGuard: No user, redirecting to login");
      router.push("/admin/login");
    } else if (user.role !== "ADMIN") {
      console.log(`🔒 AdminGuard: Access Denied. User role is ${user.role}, bouncing to user dashboard`);
      // Standard users who try to access admin routes are sent back to their dashboard
      router.push("/dashboard/user");
    } else {
      // User is an ADMIN, let them in
      setIsAuthorized(true);
    }
  }, [user, loading, pathname, router]);

  // Show a loading spinner while determining auth or waiting for redirect
  if (loading || (!isAuthorized && pathname !== '/admin/login' && pathname !== '/admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
