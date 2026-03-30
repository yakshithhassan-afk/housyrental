'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function SetAdminRolePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<'checking' | 'setting' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      setStatus('error');
      setMessage('Please login first');
    } else if (!loading && user) {
      checkAdminRole();
    }
  }, [user, loading]);

  const checkAdminRole = async () => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      
      const userRef = doc(db, 'users', user!.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role === 'ADMIN') {
          setStatus('success');
          setMessage('✅ You already have ADMIN role!');
        } else {
          setStatus('checking');
          setMessage(`Current role: ${userData.role || 'USER'}. Click button below to set as ADMIN.`);
        }
      } else {
        setStatus('checking');
        setMessage('User document not found. Click button below to create with ADMIN role.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('Error checking role: ' + error.message);
    }
  };

  const setAdminRole = async () => {
    setStatus('setting');
    try {
      if (!db) throw new Error('Firestore not initialized');
      
      const userRef = doc(db, 'users', user!.uid);
      await setDoc(userRef, {
        uid: user!.uid,
        email: user!.email,
        displayName: user!.displayName || user!.email?.split('@')[0],
        photoURL: user!.photoURL,
        role: 'ADMIN',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setStatus('success');
      setMessage('✅ Successfully set your role to ADMIN! You can now manage properties.');
    } catch (error: any) {
      setStatus('error');
      setMessage('❌ Failed to set admin role: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-100 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-20">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔑 Set Admin Role</h1>
          <p className="text-gray-600">Grant yourself admin permissions to manage properties</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'user')}`} 
              alt={user?.email || ''} 
              className="w-16 h-16 rounded-full"
            />
            <div className="text-left">
              <p className="font-semibold text-gray-900">{user?.displayName || user?.email}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400">UID: {user?.uid}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 mb-6 ${
          status === 'success' ? 'bg-green-50 border-2 border-green-200' :
          status === 'error' ? 'bg-red-50 border-2 border-red-200' :
          'bg-blue-50 border-2 border-indigo-100'
        }`}>
          <p className={`font-semibold ${
            status === 'success' ? 'text-green-800' :
            status === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {message}
          </p>
        </div>

        {status !== 'success' && (
          <button
            onClick={setAdminRole}
            disabled={status === 'setting'}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {status === 'setting' ? '⏳ Setting Admin Role...' : '👑 Grant Myself Admin Role'}
          </button>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              🎯 Go to Admin Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              🔄 Reload This Page
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="font-bold text-yellow-900 mb-2">ℹ️ What This Does:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Sets your user role to "ADMIN" in Firestore</li>
            <li>• Allows you to add, edit, and delete properties</li>
            <li>• Grants access to all admin dashboard features</li>
            <li>• Only needs to be done once</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
