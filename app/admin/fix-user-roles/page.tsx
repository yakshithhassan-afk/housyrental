'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role?: string;
  createdAt?: any;
}

export default function FixUserRolesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please login as admin first');
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const fetchAllUsers = async () => {
    if (!db || !user) return;
    
    setFetching(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const userList: UserRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        userList.push({
          uid: docSnap.id,
          email: data.email || '',
          displayName: data.displayName || '',
          role: data.role || 'MISSING',
          createdAt: data.createdAt
        });
      });
      
      console.log('📊 Fetched users:', userList.length);
      setUsers(userList);
      toast.success(`Found ${userList.length} users`);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setFetching(false);
    }
  };

  const updateUserRole = async (uid: string, newRole: string) => {
    if (!db) return;
    
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.uid === uid ? { ...u, role: newRole } : u
      ));
      
      toast.success(`✅ Updated ${uid.substring(0, 8)}... to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const bulkFixOwnerRoles = async () => {
    if (!db) return;
    
    const ownersWithEmail = users.filter(u => 
      u.email?.includes('@') && 
      (u.role === 'MISSING' || u.role === 'USER' || !u.role)
    );
    
    if (ownersWithEmail.length === 0) {
      toast.info('No users need fixing');
      return;
    }
    
    setFetching(true);
    try {
      for (const userData of ownersWithEmail) {
        // You can add logic here to determine if they should be OWNER or USER
        // For now, we'll just mark them as USER by default
        await updateUserRole(userData.uid, 'USER');
      }
      toast.success(`✅ Fixed ${ownersWithEmail.length} user roles`);
      fetchAllUsers();
    } catch (error) {
      console.error('Error bulk fixing:', error);
      toast.error('Failed to fix user roles');
    } finally {
      setFetching(false);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔧 Fix User Roles</h1>
          <p className="text-gray-600">View and fix user roles in Firestore</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={fetchAllUsers}
            disabled={fetching}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
          >
            {fetching ? '⏳ Loading...' : '🔄 Fetch All Users'}
          </button>
          
          <button
            onClick={bulkFixOwnerRoles}
            disabled={fetching}
            className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
          >
            {fetching ? '⏳ Processing...' : '🛠️ Fix Missing Roles'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 border-2 border-indigo-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
            <p className="text-sm text-blue-800">Total Users</p>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => u.role === 'OWNER').length}
            </p>
            <p className="text-sm text-green-800">Owners</p>
          </div>
          <div className="bg-purple-50 border-2 border-indigo-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {users.filter(u => u.role === 'USER' || !u.role || u.role === 'MISSING').length}
            </p>
            <p className="text-sm text-purple-800">Users</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Display Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Current Role</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Click "Fetch All Users" to load user data
                  </td>
                </tr>
              ) : (
                users.map((userData) => (
                  <tr key={userData.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{userData.email}</p>
                      <p className="text-xs text-gray-500">UID: {userData.uid.substring(0, 12)}...</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{userData.displayName || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        userData.role === 'OWNER' ? 'bg-green-100 text-green-700' :
                        userData.role === 'USER' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {userData.role || 'MISSING'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateUserRole(userData.uid, 'USER')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200"
                        >
                          Set USER
                        </button>
                        <button
                          onClick={() => updateUserRole(userData.uid, 'OWNER')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200"
                        >
                          Set OWNER
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="font-bold text-yellow-900 mb-3">ℹ️ How to Use:</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>1. Click "Fetch All Users" to load all users from Firestore</li>
            <li>2. Review the "Current Role" column - look for "MISSING" or incorrect roles</li>
            <li>3. Click "Set USER" or "Set OWNER" to fix individual users</li>
            <li>4. Or click "Fix Missing Roles" to bulk-fix all users with missing roles</li>
            <li>5. After fixing, logout and login again to test the correct dashboard routing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
