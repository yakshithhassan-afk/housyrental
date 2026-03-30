'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, doc, updateDoc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  Users, Building2, DollarSign, FileCheck, TrendingUp, 
  Bell, CheckCircle, XCircle, AlertCircle, Home, Activity, MessageSquare
} from 'lucide-react';
import UserModal from '../components/UserModal';
import PropertyModal from '../components/PropertyModal';
import PaymentModal from '../components/PaymentModal';
import TrendingModal from '../components/TrendingModal';

interface KYCDocument {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  uploadedAt: any;
  fileName: string;
  fileUrl?: string;
  verifiedAt?: any;
  verifiedBy?: string;
}

interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
}

interface Property {
  id: string;
  name: string;
  title?: string;
  location: string;
  price: number;
  type: string;
}

interface Payment {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  type: string;
  status: string;
  dueDate?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<any>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalOwners: 0, totalProperties: 0, pendingKYC: 0, verifiedKYC: 0, monthlyRevenue: 0 });
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'recent' | 'due' | 'late'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTrendingModal, setShowTrendingModal] = useState(false);

  useEffect(() => {
    if (!loading) loadDashboardData();
  }, [loading]);

  const loadDashboardData = async () => {
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      
      await Promise.all([
        loadUsersStats(db), loadOwnersStats(db), loadPropertiesStats(db),
        loadKYCDocuments(db), calculateRevenue(db), loadPayments(db), loadMaintenance(db), loadAdminMessages(db)
      ]);
      
      toast.success('Dashboard loaded successfully!');
      setIsLoading(false);
    } catch (error: any) {
      console.error('❌ Error loading dashboard:', error);
      if (error.code === 'permission-denied') setHasPermissionError(true);
      toast.error(error.message || 'Failed to load data');
      setIsLoading(false);
    }
  };

  const loadUsersStats = async (db: any) => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const userList: User[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Filter users with role USER or no role (default to USER)
        if (!data.role || data.role === 'USER') {
          userList.push({ uid: doc.id, ...data } as User);
        }
      });
      
      console.log('👥 Loaded users:', userList.length);
      setUsers(userList);
      setStats(prev => ({ ...prev, totalUsers: userList.length }));
    } catch (error) {
      console.error('Error loading users:', error);
      setStats(prev => ({ ...prev, totalUsers: 0 }));
    }
  };

  const loadOwnersStats = async (db: any) => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const ownerList: User[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === 'OWNER') {
          ownerList.push({ uid: doc.id, ...data } as User);
        }
      });
      
      console.log('🏢 Loaded owners:', ownerList.length);
      setOwners(ownerList);
      setStats(prev => ({ ...prev, totalOwners: ownerList.length }));
    } catch (error) {
      console.error('Error loading owners:', error);
      setStats(prev => ({ ...prev, totalOwners: 0 }));
    }
  };

  const loadPropertiesStats = async (db: any) => {
    try {
      const propertiesRef = collection(db, 'properties');
      const snapshot = await getDocs(propertiesRef);
      const propertyList: Property[] = [];
      snapshot.forEach(doc => propertyList.push({ id: doc.id, ...doc.data() } as Property));
      setProperties(propertyList);
      setStats(prev => ({ ...prev, totalProperties: snapshot.size }));
    } catch (error) {
      setStats(prev => ({ ...prev, totalProperties: 0 }));
    }
  };

  const loadKYCDocuments = async (db: any) => {
    try {
      const kycRef = collection(db, 'kyc-documents');
      const snapshot = await getDocs(kycRef);
      const kycList: KYCDocument[] = [];
      snapshot.forEach(d => kycList.push({ id: d.id, ...d.data() } as KYCDocument));
      setKycDocuments(kycList);
      setStats(prev => ({
        ...prev,
        pendingKYC: kycList.filter(d => d.status === 'Pending').length,
        verifiedKYC: kycList.filter(d => d.status === 'Verified').length
      }));
    } catch (error) {
      setStats(prev => ({ ...prev, pendingKYC: 0, verifiedKYC: 0 }));
    }
  };

  const calculateRevenue = async (db: any) => {
    try {
      const paymentsRef = collection(db, 'payments');
      const snapshot = await getDocs(paymentsRef);
      let monthly = 0;
      const now = new Date();
      
      snapshot.forEach(doc => {
        const payment = doc.data();
        if (payment.status === 'Paid') {
          const paymentDate = payment.paidDate ? new Date(payment.paidDate) : 
                             payment.createdAt?.toDate ? payment.createdAt.toDate() : new Date();
          if (paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()) {
            monthly += payment.amount || 0;
          }
        }
      });
      setStats(prev => ({ ...prev, monthlyRevenue: monthly }));
    } catch (error) {
      setStats(prev => ({ ...prev, monthlyRevenue: 0 }));
    }
  };

  const loadPayments = async (db: any) => {
    try {
      const paymentsRef = collection(db, 'payments');
      const manualSnap = await getDocs(paymentsRef);
      const paymentList: Payment[] = [];
      manualSnap.forEach(doc => paymentList.push({ id: doc.id, ...doc.data() } as Payment));

      const bookingsRef = collection(db, 'bookings');
      const bookingsSnap = await getDocs(bookingsRef);
      bookingsSnap.forEach(doc => {
        const data = doc.data();
        paymentList.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userEmail || data.userId,
          amount: data.amount,
          type: 'Online Booking',
          status: data.status === 'confirmed' ? 'Paid' : (data.status || 'Paid'),
          dueDate: data.date,
        } as unknown as Payment);
      });

      paymentList.sort((a, b) => {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return bDate - aDate;
      });
      setPayments(paymentList);
    } catch (error) {
      console.error(error);
      setPayments([]);
    }
  };

  const loadMaintenance = async (db: any) => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const mRef = collection(db, 'maintenance');
      const snap = await getDocs(mRef);
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      setMaintenanceRequests(list);
    } catch (e) { console.error(e); }
  };

  const loadAdminMessages = async (db: any) => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const msgRef = collection(db, 'messages');
      const snap = await getDocs(msgRef);
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setAdminMessages(list);
    } catch (e) { console.error(e); }
  };

  const handleUpdateMaintenanceStatus = async (id: string, newStatus: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      if (!db) return;
      await updateDoc(doc(db, 'maintenance', id), { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      loadDashboardData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleApproveKYC = async (docId: string) => {
    try {
      const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      const docRef = doc(db, 'kyc-documents', docId);
      await updateDoc(docRef, { status: 'Verified', verifiedAt: Timestamp.now(), verifiedBy: 'admin' });
      toast.success('Approved!');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleRejectKYC = async (docId: string) => {
    try {
      const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      const docRef = doc(db, 'kyc-documents', docId);
      await updateDoc(docRef, { status: 'Rejected', verifiedAt: Timestamp.now(), verifiedBy: 'admin' });
      toast.success('Rejected');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleAddUser = () => { setSelectedUser(null); setShowUserModal(true); };
  const handleEditUser = (user: User) => { setSelectedUser(user); setShowUserModal(true); };
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      await deleteDoc(doc(db, 'users', userId));
      toast.success('User deleted');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      const userRef = doc(db, 'users', userData.uid || `user_${Date.now()}`);
      await setDoc(userRef, { ...userData, updatedAt: Timestamp.now() }, { merge: true });
      toast.success(userData.uid ? 'User updated' : 'User created');
      setShowUserModal(false);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleAddProperty = () => { setSelectedProperty(null); setShowPropertyModal(true); };
  const handleEditProperty = (property: Property) => { setSelectedProperty(property); setShowPropertyModal(true); };
  
  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      
      await deleteDoc(doc(db, 'properties', propertyId));
      
      toast.success('✅ Property deleted successfully!');
      loadDashboardData();
      
      // Force reload of properties on all pages
      window.dispatchEvent(new CustomEvent('properties-updated'));
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property: ' + error.message);
    }
  };

  const handleSaveProperty = async (propertyData: any) => {
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      
      const isNewProperty = !propertyData.id;
      const propertyId = propertyData.id || `prop_${Date.now()}`;
      
      const { id, ...dataWithoutId } = propertyData;
      
      const formattedData = {
        ...dataWithoutId,
        price: typeof propertyData.price === 'number' ? propertyData.price : parseFloat(propertyData.price) || 0,
        area: typeof propertyData.area === 'number' ? propertyData.area : parseFloat(propertyData.area) || 0,
        bedrooms: propertyData.bedrooms?.toString() || '1',
        bathrooms: propertyData.bathrooms?.toString() || '1',
        updatedAt: Timestamp.now()
      };
      
      const propRef = doc(db, 'properties', propertyId);
      await setDoc(propRef, formattedData, { merge: true });
      
      const successMsg = isNewProperty
        ? '✅ Property created successfully!'
        : '✅ Property updated successfully! Refresh other pages to see changes.';
      
      toast.success(successMsg);
      setShowPropertyModal(false);
      loadDashboardData();
      window.dispatchEvent(new CustomEvent('properties-updated'));
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property: ' + error.message);
    }
  };

  const handleAdminReply = async () => {
    if (!adminReplyText.trim() || !selectedChatUser) return;
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db as any, 'messages'), {
        userId: selectedChatUser.userId,
        userName: selectedChatUser.userName,
        text: adminReplyText.trim(),
        senderId: 'admin',
        senderRole: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      setAdminReplyText('');
      loadDashboardData();
    } catch (e) {
      toast.error('Failed to send reply');
    }
  };

  const handleAddPayment = () => { setSelectedPayment(null); setShowPaymentModal(true); };
  const handleEditPayment = (payment: Payment) => { setSelectedPayment(payment); setShowPaymentModal(true); };
  
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      await deleteDoc(doc(db, 'payments', paymentId));
      toast.success('Payment deleted');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleSavePayment = async (paymentData: any) => {
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      const paymentRef = doc(db, 'payments', paymentData.id || `payment_${Date.now()}`);
      
      // Auto-fetch user data when payment is marked as paid
      if (paymentData.status === 'Paid' && paymentData.userId) {
        const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', paymentData.userId)));
        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          paymentData.userName = userData.displayName || userData.email;
          paymentData.userEmail = userData.email;
        }
      }
      
      await setDoc(paymentRef, { ...paymentData, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }, { merge: true });
      toast.success(paymentData.id ? 'Payment updated' : 'Payment created');
      setShowPaymentModal(false);
      loadDashboardData();
      
      if (paymentData.status === 'Paid' && paymentData.userName) {
        toast.success(`✅ Payment recorded for ${paymentData.userName}`);
      }
    } catch (error: any) {
      toast.error('Failed to save payment: ' + error.message);
    }
  };

  const handleRefreshUserData = async (payment: Payment) => {
    try {
      if (!payment.userId) {
        toast.error('No user selected');
        return;
      }
      const { db } = await import('@/lib/firebase');
      if (!db) throw new Error('Firestore not initialized');
      const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', payment.userId)));
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        const updatedPayment = { ...payment, userName: userData.displayName || userData.email, userEmail: userData.email };
        setSelectedPayment(updatedPayment);
        toast.success('User data refreshed!');
      }
    } catch (error: any) {
      toast.error('Failed to refresh: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-100 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasPermissionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 border-2 border-red-200">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">Firebase Permission Error</h1>
            <p className="text-gray-600">Your Firestore Security Rules are blocking access</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">🔧 How to Fix:</h2>
            <ol className="space-y-2 text-sm text-gray-700">
              <li>Go to <a href="https://console.firebase.google.com/project/propmanager-web/firestore/rules" target="_blank" className="text-indigo-600 underline">Firebase Console</a></li>
              <li>Copy rules from <code className="bg-gray-200 px-2 py-1 rounded">/firestore-rules.txt</code></li>
              <li>Paste and click <strong>"Publish"</strong></li>
              <li>Wait 1-2 minutes</li>
              <li>Reload this page</li>
            </ol>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
            🔄 Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Platform Management</p>
            </div>
          </div>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            Back
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <StatCard icon={Users} color="cyan" label="Total Users" value={stats.totalUsers} trend />
          <StatCard icon={Building2} color="purple" label="Owners" value={stats.totalOwners} trend />
          <StatCard icon={Home} color="amber" label="Properties" value={stats.totalProperties} trend />
          <StatCard icon={FileCheck} color="emerald" label="Pending KYC" value={stats.pendingKYC} alert />
          <RevenueCard value={stats.monthlyRevenue} />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-x-auto">
          <div className="flex">
            {[
              { id: 'overview', icon: Activity, label: 'Overview' },
              { id: 'kyc', icon: FileCheck, label: 'KYC Approval' },
              { id: 'kyc-history', icon: CheckCircle, label: 'KYC History' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'owners', icon: Building2, label: 'Owners' },
              { id: 'properties', icon: Home, label: 'Properties' },
              { id: 'payments', icon: DollarSign, label: 'Payments' },
              { id: 'maintenance', icon: CheckCircle, label: 'Maintenance' },
              { id: 'messages', icon: MessageSquare, label: 'Messages' }
            ].map((tab: { id: string; icon: any; label: string }) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'border-cyan-600 text-cyan-600 bg-cyan-50' : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <StatRow label="Total Users" value={stats.totalUsers} color="blue" />
                  <StatRow label="Property Owners" value={stats.totalOwners} color="purple" />
                  <StatRow label="Pending KYC" value={stats.pendingKYC} color="amber" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                <button onClick={() => setActiveTab('kyc')} className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-bold hover:from-cyan-700 hover:to-teal-700 transition-all">
                  <FileCheck className="w-5 h-5" />
                  Review KYC Documents ({stats.pendingKYC} Pending)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KYC Approval Tab */}
        {activeTab === 'kyc' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">KYC Document Approval</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Document</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Uploaded</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kycDocuments.filter(doc => doc.status === 'Pending').map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><div><p className="font-semibold text-gray-900">{doc.name}</p><p className="text-sm text-gray-500">{doc.fileName}</p></div></td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doc.userId}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{doc.type}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doc.uploadedAt?.toDate ? new Date(doc.uploadedAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Pending</span></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveKYC(doc.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><CheckCircle className="w-5 h-5" /></button>
                          <button onClick={() => handleRejectKYC(doc.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><XCircle className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {kycDocuments.filter(doc => doc.status === 'Pending').length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center"><CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" /><p className="text-gray-600 font-semibold">All KYC documents reviewed!</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC History Tab */}
        {activeTab === 'kyc-history' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">KYC Verification History</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Document</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Uploaded</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Verified</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kycDocuments.filter(doc => doc.status !== 'Pending').map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><div><p className="font-semibold text-gray-900">{doc.name}</p><p className="text-sm text-gray-500">{doc.fileName}</p></div></td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doc.userId}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{doc.type}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doc.uploadedAt?.toDate ? new Date(doc.uploadedAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{doc.verifiedAt?.toDate ? new Date(doc.verifiedAt.toDate()).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">👥 User Management</h2>
              <button onClick={handleAddUser} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Add User
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{user.displayName || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{user.role}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedChatUser({ userId: user.uid, userName: user.displayName || user.email });
                              setActiveTab('messages');
                            }} 
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                            title="Message User"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditUser(user)} className="p-2 bg-blue-100 text-indigo-600 rounded-lg hover:bg-blue-200">Edit</button>
                          <button onClick={() => handleDeleteUser(user.uid)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (<tr><td colSpan={4} className="px-6 py-12 text-center"><p className="text-gray-600">No users found</p></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Owners Tab */}
        {activeTab === 'owners' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🏢 Owner Management</h2>
              <button onClick={handleAddUser} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Add Owner
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-purple-600 text-white">
                  <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {owners.map(owner => (
                    <tr key={owner.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{owner.displayName || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">{owner.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedChatUser({ userId: owner.uid, userName: owner.displayName || owner.email });
                              setActiveTab('messages');
                            }} 
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                            title="Message Owner"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditUser(owner)} className="p-2 bg-blue-100 text-indigo-600 rounded-lg hover:bg-blue-200">Edit</button>
                          <button onClick={() => handleDeleteUser(owner.uid)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {owners.length === 0 && (<tr><td colSpan={3} className="px-6 py-12 text-center"><p className="text-gray-600">No owners found</p></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🏠 Property Management</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowTrendingModal(true)} 
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg"
                >
                  <TrendingUp className="w-5 h-5" />
                  Manage Trending
                </button>
                <button onClick={handleAddProperty} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Add Property
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-amber-600 text-white">
                  <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map(property => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{property.name || property.title}</td>
                      <td className="px-6 py-4 text-gray-600">{property.location}</td>
                      <td className="px-6 py-4 font-bold">₹{property.price?.toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{property.type}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditProperty(property)} className="p-2 bg-blue-100 text-indigo-600 rounded-lg hover:bg-blue-200">Edit</button>
                          <button onClick={() => handleDeleteProperty(property.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {properties.length === 0 && (<tr><td colSpan={5} className="px-6 py-12 text-center"><p className="text-gray-600">No properties found</p><p className="text-sm text-gray-500 mt-2">Run migration tool or add manually</p></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">💰 Payment Management</h2>
              <button onClick={handleAddPayment} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg">
                <DollarSign className="w-5 h-5" />
                Add New Payment
              </button>
            </div>
            
            {/* Payment Filters */}
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => setPaymentFilter('all')} 
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${paymentFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                All Payments
              </button>
              <button 
                onClick={() => setPaymentFilter('recent')} 
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${paymentFilter === 'recent' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'}`}
              >
                Recent / Paid
              </button>
              <button 
                onClick={() => setPaymentFilter('due')} 
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${paymentFilter === 'due' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50 hover:text-amber-700'}`}
              >
                Dues / Partial
              </button>
              <button 
                onClick={() => setPaymentFilter('late')} 
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${paymentFilter === 'late' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-700'}`}
              >
                Late / Overdue
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Date / Due Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.filter(payment => {
                    if (paymentFilter === 'all') return true;
                    if (paymentFilter === 'recent') return payment.status === 'Paid' || payment.status === 'Confirmed';
                    if (paymentFilter === 'due') return payment.status === 'Due' || payment.status === 'Partial';
                    if (paymentFilter === 'late') return payment.status === 'Overdue' || payment.status === 'Late';
                    return true;
                  }).map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{payment.userName || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{payment.userEmail || payment.userId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">₹{payment.amount?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.type === 'Rent' ? 'bg-blue-100 text-blue-700' :
                          payment.type === 'Maintenance' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {payment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          payment.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                          payment.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditPayment(payment)} className="p-2 bg-blue-100 text-indigo-600 rounded-lg hover:bg-blue-200" title="Edit">Edit</button>
                          <button onClick={() => { if (confirm('Delete this payment?')) handleDeletePayment(payment.id); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center"><DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-600 font-semibold">No payments recorded yet</p><p className="text-sm text-gray-500 mt-2">Click "Add New Payment" to create one</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🔧 Maintenance Requests</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">User</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {maintenanceRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><div><p className="font-semibold">{req.userName}</p><p className="text-sm text-gray-500">{req.userEmail}</p></div></td>
                      <td className="px-6 py-4 font-bold text-gray-900">{req.serviceName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateMaintenanceStatus(req.id, 'Scheduled')} className="p-2 bg-blue-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-blue-200">Schedule</button>
                            <button onClick={() => handleUpdateMaintenanceStatus(req.id, 'Completed')} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-200">Complete</button>
                          </div>
                        )}
                        {req.status === 'Scheduled' && (
                          <button onClick={() => handleUpdateMaintenanceStatus(req.id, 'Completed')} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-200">Mark Completed</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {maintenanceRequests.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No maintenance requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-cyan-600 to-teal-600">
              <h2 className="text-2xl font-bold text-white">Support Inbox</h2>
              <p className="text-indigo-100 text-sm">Respond to active user queries and messages</p>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Users List Sidebar */}
              <div className="w-1/3 bg-white border-r border-gray-100 overflow-y-auto hidden md:block">
                {Array.from(new Set(adminMessages.map(m => m.userId))).map(uid => {
                  const msgs = adminMessages.filter(m => m.userId === uid);
                  const lastMsg = msgs[msgs.length - 1];
                  const isSelected = selectedChatUser?.userId === uid;
                  return (
                    <div 
                      key={uid} 
                      onClick={() => setSelectedChatUser({ userId: uid, userName: lastMsg.userName })}
                      className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50'}`}
                    >
                      <h4 className="font-bold text-gray-900">{lastMsg.userName}</h4>
                      <p className="text-xs text-gray-500 truncate mt-1">{lastMsg.text}</p>
                      <p className="text-[10px] text-gray-400 mt-2">{new Date(lastMsg.createdAt).toLocaleDateString()}</p>
                    </div>
                  );
                })}
                {adminMessages.length === 0 && (
                  <div className="p-6 text-center text-gray-400"><p>No messages yet.</p></div>
                )}
              </div>

              {/* Chat Window */}
              <div className="flex-1 bg-gray-50 flex flex-col min-w-[300px]">
                {selectedChatUser ? (
                  <>
                    <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Chat with {selectedChatUser.userName}</h3>
                      <button onClick={() => setSelectedChatUser(null)} className="md:hidden text-gray-400 hover:text-gray-600">Close</button>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                      {adminMessages.filter(m => m.userId === selectedChatUser.userId).map(msg => {
                        const isAdmin = msg.senderRole === 'ADMIN';
                        return (
                          <div key={msg.id} className={`flex flex-col max-w-[80%] ${isAdmin ? 'self-end' : 'self-start'}`}>
                            <div className={`p-4 rounded-2xl ${isAdmin ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-sm shadow-md' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                      <input 
                        type="text" 
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminReply()}
                        placeholder="Type reply..." 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button 
                        onClick={handleAdminReply}
                        disabled={!adminReplyText.trim()}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                    <p>Select a user conversation to view and reply.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUserModal && <UserModal isOpen={true} user={selectedUser} onSave={handleSaveUser} onClose={() => setShowUserModal(false)} />}
      {showPropertyModal && <PropertyModal isOpen={true} property={selectedProperty} onSave={handleSaveProperty} onClose={() => setShowPropertyModal(false)} />}
      {showPaymentModal && <PaymentModal isOpen={true} payment={selectedPayment} users={users} onSave={handleSavePayment} onClose={() => setShowPaymentModal(false)} onRefreshUserData={handleRefreshUserData} />}
      {showTrendingModal && <TrendingModal isOpen={true} onClose={() => setShowTrendingModal(false)} />}
    </div>
  );
}

// Helper Components
const StatCard = ({ icon: Icon, color, label, value, trend, alert }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      {trend && <TrendingUp className="w-5 h-5 text-emerald-500" />}
      {alert && <AlertCircle className="w-5 h-5 text-amber-500" />}
    </div>
    <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const RevenueCard = ({ value }: any) => (
  <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
        <DollarSign className="w-6 h-6 text-white" />
      </div>
      <TrendingUp className="w-5 h-5 text-white/80" />
    </div>
    <p className="text-sm text-white/80 font-medium mb-1">Monthly Revenue</p>
    <p className="text-3xl font-bold">₹{value.toLocaleString()}</p>
  </div>
);

const StatRow = ({ label, value, color }: any) => (
  <div className={`flex items-center justify-between p-3 bg-${color}-50 rounded-lg`}>
    <div><p className="font-semibold text-gray-900">{label}</p><p className="text-sm text-gray-600">Registered accounts</p></div>
    <p className="text-2xl font-bold text-${color}-600">{value}</p>
  </div>
);
