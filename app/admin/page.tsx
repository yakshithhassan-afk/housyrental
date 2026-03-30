"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login page
    router.push('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
        <p className="text-white font-semibold text-lg">Redirecting to Admin Login...</p>
      </div>
    </div>
  );
}
