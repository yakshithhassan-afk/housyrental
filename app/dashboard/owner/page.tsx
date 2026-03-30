'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Home, Plus, Users, DollarSign, TrendingUp, Eye, Calendar,
  CheckCircle, Clock, AlertCircle, Edit, Trash2, MessageSquare, X
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  ownerId?: string;
}

interface Application {
  id: string;
  propertyId: string;
  propertyName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  requestedMoveIn: string;
  message?: string;
}

export default function OwnerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'applications' | 'messages'>('overview');
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);

  // Fetch owner's properties from Firebase
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!user || !db) return;

      try {
        setLoadingData(true);
        
        // Fetch properties owned by this user
        const propertiesRef = collection(db, 'properties');
        const q = query(propertiesRef, where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        
        const ownerProperties: Property[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          ownerProperties.push({
            id: doc.id,
            name: data.name || data.title || '',
            location: data.location || '',
            price: data.price || 0,
            type: data.type || 'Apartment',
            status: data.status || 'Active',
            bedrooms: parseInt(data.bedrooms) || 0,
            bathrooms: parseInt(data.bathrooms) || 0,
            area: data.area || 0,
            image: data.image || '',
            ownerId: data.ownerId
          });
        });
        
        console.log('🏠 Owner properties:', ownerProperties.length);
        setProperties(ownerProperties);

        // Fetch applications for owner's properties
        if (ownerProperties.length > 0) {
          const propertyIds = ownerProperties.map(p => p.id);
          const applicationsRef = collection(db, 'applications');
          
          // Get all applications and filter client-side (better than multiple queries)
          const appsSnapshot = await getDocs(applicationsRef);
          const ownerApplications: Application[] = [];
          
          appsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (propertyIds.includes(data.propertyId)) {
              ownerApplications.push({
                id: doc.id,
                propertyId: data.propertyId,
                propertyName: data.propertyName || '',
                applicantName: data.applicantName || '',
                applicantEmail: data.applicantEmail || '',
                applicantPhone: data.applicantPhone || '',
                status: data.status || 'pending',
                submittedAt: data.submittedAt || Timestamp.now(),
                requestedMoveIn: data.requestedMoveIn || '',
                message: data.message
              });
            }
          });
          
          console.log('📋 Owner applications:', ownerApplications.length);
          setApplications(ownerApplications);
        }
        
        // Fetch messages for the owner
        setLoadingMessages(true);
        const messagesRef = collection(db, 'messages');
        const qMessages = query(messagesRef, where('recipientId', '==', user.uid));
        const msgsSnapshot = await getDocs(qMessages);
        const ownerMessages: any[] = [];
        msgsSnapshot.forEach((doc) => {
          ownerMessages.push({ id: doc.id, ...doc.data() });
        });
        
        // Also fetch messages sent BY the owner to show full threads (simplification)
        const qSentMessages = query(messagesRef, where('senderId', '==', user.uid));
        const sentMsgsSnapshot = await getDocs(qSentMessages);
        sentMsgsSnapshot.forEach((doc) => {
          ownerMessages.push({ id: doc.id, ...doc.data() });
        });

        // Sort by date
        ownerMessages.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setMessages(ownerMessages);
        setLoadingMessages(false);
        
      } catch (error) {
        console.error('Error fetching owner data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoadingData(false);
        setLoadingMessages(false);
      }
    };

    fetchOwnerData();
  }, [user]);

  const handleAddProperty = () => {
    router.push('/dashboard/properties/new');
  };

  const handleEditProperty = (propertyId: string) => {
    router.push(`/dashboard/properties/${propertyId}/edit`);
  };

  const handleReplyToMessage = async () => {
    if (!user || !replyText.trim() || !selectedMessage) return;

    try {
      setIsSendingReply(true);
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      if (!db) throw new Error('Firestore not initialized');

      await addDoc(collection(db, 'messages'), {
        text: replyText.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderRole: 'OWNER',
        recipientId: selectedMessage.senderId,
        recipientName: selectedMessage.senderName,
        createdAt: serverTimestamp(),
        read: false,
        replyTo: selectedMessage.id
      });

      toast.success('Reply sent!');
      setReplyText('');
      setShowReplyModal(false);
      
      // Refresh messages
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('recipientId', '==', user.uid));
      const msgsSnapshot = await getDocs(q);
      const ownerMessages: any[] = [];
      msgsSnapshot.forEach((doc) => {
        ownerMessages.push({ id: doc.id, ...doc.data() });
      });
      const qSent = query(messagesRef, where('senderId', '==', user.uid));
      const sentSnapshot = await getDocs(qSent);
      sentSnapshot.forEach((doc) => {
        ownerMessages.push({ id: doc.id, ...doc.data() });
      });
      ownerMessages.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      setMessages(ownerMessages);

    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      if (!db) throw new Error('Firestore not initialized');
      
      await deleteDoc(doc(db, 'properties', propertyId));
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast.success('✅ Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      if (!db) throw new Error('Firestore not initialized');
      
      await updateDoc(doc(db, 'applications', applicationId), {
        status: 'approved',
        updatedAt: Timestamp.now()
      });
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'approved' as const } : app
      ));
      
      toast.success('✅ Application approved!');
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      if (!db) throw new Error('Firestore not initialized');
      
      await updateDoc(doc(db, 'applications', applicationId), {
        status: 'rejected',
        updatedAt: Timestamp.now()
      });
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'rejected' as const } : app
      ));
      
      toast.success('Application rejected');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-200 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const totalRevenue = properties.reduce((sum, p) => sum + p.price, 0);
  const totalViews = properties.reduce((sum, p) => sum + (p.area > 0 ? Math.floor(Math.random() * 100) : 0), 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">HR</span>
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800">HousyRental</span>
              <p className="text-xs text-gray-500">Owner Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/browse-properties')} className="border-cyan-200 text-cyan-900 hover:bg-cyan-50">
              <Home className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-md">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || '')}`} alt="" className="w-8 h-8 rounded-full border-2 border-cyan-200" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user.displayName || user.email}</p>
                <p className="text-xs text-gray-500">Property Owner</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-3">Welcome back, {user.displayName || 'Owner'}!</h1>
            <p className="text-cyan-100 text-lg mb-6">Manage your properties and track rental applications</p>
            <div className="flex gap-3">
              <Button onClick={handleAddProperty} className="bg-white text-cyan-900 hover:bg-cyan-50">
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-100 text-sm font-medium">My Properties</CardTitle>
                <Home className="h-5 w-5 text-blue-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{properties.length}</div>
              <p className="text-blue-100 text-sm">Active listings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-100 text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-5 w-5 text-green-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{totalViews}</div>
              <p className="text-green-100 text-sm">Property views</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-100 text-sm font-medium">Applications</CardTitle>
                <Users className="h-5 w-5 text-purple-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{applications.length}</div>
              <p className="text-purple-100 text-sm">Total applications</p>
              <div className="mt-2 text-xs text-purple-200">
                <span className="font-medium">{pendingApplications.length} pending</span> • {approvedApplications.length} approved
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-orange-100 text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-orange-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-orange-100 text-sm">Potential income</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'overview' 
                ? 'border-b-2 border-cyan-200 text-cyan-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'properties' 
                ? 'border-b-2 border-cyan-200 text-cyan-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Properties ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'applications' 
                ? 'border-b-2 border-cyan-200 text-cyan-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Applications ({pendingApplications.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Properties */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>Your latest property listings</CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No properties yet. Add your first property!</p>
                    <Button onClick={handleAddProperty} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.slice(0, 3).map((property) => (
                      <div key={property.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <img src={property.image} alt={property.name} className="w-full h-40 object-cover" />
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1">{property.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-900 font-bold">₹{property.price.toLocaleString()}</span>
                            <Badge>{property.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Applications */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>Applications awaiting your review</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApplications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                    <p>No pending applications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApplications.map((app) => (
                      <div key={app.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{app.applicantName}</p>
                          <p className="text-sm text-gray-600">Interested in: {app.propertyName}</p>
                          <p className="text-xs text-gray-500">{app.applicantEmail}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApproveApplication(app.id)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectApplication(app.id)}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>My Properties</CardTitle>
              <CardDescription>Manage your property listings</CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No properties yet</p>
                  <p className="mb-4">Add your first property to start attracting tenants</p>
                  <Button onClick={handleAddProperty}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <div key={property.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{property.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{property.location}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>{property.bedrooms} Beds</span>
                          <span>{property.bathrooms} Baths</span>
                          <span>{property.area} sqft</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-900 font-bold text-lg">₹{property.price.toLocaleString()}</span>
                          <Badge>{property.status}</Badge>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" onClick={() => handleEditProperty(property.id)} className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteProperty(property.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Rental Applications</CardTitle>
              <CardDescription>Review and manage tenant applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{app.applicantName}</h3>
                          <p className="text-gray-600">Interested in: <span className="font-semibold">{app.propertyName}</span></p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span>📧 {app.applicantEmail}</span>
                            <span>📱 {app.applicantPhone}</span>
                          </div>
                        </div>
                        <Badge className={
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {app.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {app.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {app.message && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <MessageSquare className="w-4 h-4 text-gray-500 mb-1" />
                          <p className="text-sm text-gray-700">{app.message}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Requested Move-in: <span className="font-medium">{app.requestedMoveIn}</span>
                        </div>
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveApplication(app.id)} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectApplication(app.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {activeTab === 'messages' && (
          <Card className="shadow-lg border-2 border-cyan-100/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
              <CardTitle className="text-2xl">Messages & Inquiries</CardTitle>
              <CardDescription className="text-cyan-50">Direct communication with potential tenants</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingMessages ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                  <p className="text-xl font-semibold text-gray-400">No messages yet</p>
                  <p className="text-sm">Inquiries about your properties will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {messages.map((message) => {
                    const isReceived = message.recipientId === user?.uid;
                    return (
                      <div 
                        key={message.id} 
                        className={`p-6 hover:bg-gray-50 transition-colors ${!message.read && isReceived ? 'bg-cyan-50/30' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                              isReceived ? 'bg-gradient-to-br from-cyan-500 to-teal-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                            }`}>
                              {(isReceived ? message.senderName : message.recipientName)?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {isReceived ? message.senderName : `To: ${message.recipientName}`}
                                {!message.read && isReceived && <Badge variant="secondary" className="ml-2 bg-cyan-100 text-cyan-700 border-cyan-200">New</Badge>}
                              </p>
                              <p className="text-xs text-gray-500">
                                {message.createdAt?.toDate 
                                  ? message.createdAt.toDate().toLocaleString() 
                                  : new Date(message.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {isReceived && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-cyan-200 hover:bg-cyan-50 text-cyan-700"
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowReplyModal(true);
                              }}
                            >
                              Reply
                            </Button>
                          )}
                        </div>
                        <div className={`mt-3 p-4 rounded-2xl ${isReceived ? 'bg-white border border-gray-100 shadow-sm' : 'bg-gray-50 border border-gray-100'}`}>
                          <p className="text-gray-700 leading-relaxed">{message.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform animate-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
                <div>
                  <h3 className="text-xl font-bold">Reply to {selectedMessage.senderName}</h3>
                  <p className="text-cyan-100 text-xs mt-0.5">Direct response to user inquiry</p>
                </div>
                <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Original Message</p>
                  <p className="text-gray-700 italic">"{selectedMessage.text}"</p>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-400"
                ></textarea>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowReplyModal(false)}
                    className="flex-1 py-6 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all h-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReplyToMessage}
                    disabled={isSendingReply || !replyText.trim()}
                    className="flex-1 py-6 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] h-auto flex items-center justify-center gap-2"
                  >
                    {isSendingReply ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
