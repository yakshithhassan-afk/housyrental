"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { propertiesData, Property } from "@/data/properties";
import { Building2, Home, Hotel, Key, MapPin, Search, Heart, Bell, Filter, TrendingUp, Calendar, DollarSign, Users, FileText, MessageSquare, User, LogOut, X, Phone, Menu, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadKYCDocument, getUserKYCDocuments, type KYCDocument as FirebaseKYCDocument } from "@/lib/kyc-service";
import { Timestamp } from "firebase/firestore";

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("properties");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Owners Directory states
  const [ownersList, setOwnersList] = useState<any[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  // Payment states
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Maintenance states
  const [userMaintenance, setUserMaintenance] = useState<any[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  
  // Messages states
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentProperty, setPaymentProperty] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Owner Message states
  const [showOwnerMessageModal, setShowOwnerMessageModal] = useState(false);
  const [selectedOwnerForMessage, setSelectedOwnerForMessage] = useState<any>(null);
  const [messageToOwner, setMessageToOwner] = useState('');
  const [isSendingToOwner, setIsSendingToOwner] = useState(false);
  
  // Booking states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
    occupancy: '1',
    agreeToTerms: false
  });

  // KYC states
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycDocuments, setKycDocuments] = useState<FirebaseKYCDocument[]>([]);
  const [selectedKYCType, setSelectedKYCType] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<FirebaseKYCDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingKYC, setLoadingKYC] = useState(true);

  // Your UPI ID and Phone Number for receiving payments
  const YOUR_UPI_ID = "yourname@oksbi";
  const YOUR_PHONE_NUMBER = "+91 XXXXXXXXXX";

  // Mock data for booked properties
  const bookedProperties = [
    {
      id: 1,
      name: "Whitefield Elite",
      owner: "Rajesh Kumar",
      amount: 45000,
      status: "Active",
      nextPayment: "2024-04-01"
    }
  ];

  // Mock maintenance services
  const maintenanceServices = [
    { id: 1, name: "Deep Cleaning", price: 2500, duration: "3-4 hours" },
    { id: 2, name: "AC Service", price: 1500, duration: "1-2 hours" },
    { id: 3, name: "Plumbing", price: 800, duration: "1 hour" },
    { id: 4, name: "Electrical Work", price: 1000, duration: "1-2 hours" },
  ];

  // Mock documents
  const documents = [
    { id: 1, name: "Aadhaar Card", status: "Verified", date: "2024-01-15" },
    { id: 2, name: "PAN Card", status: "Verified", date: "2024-01-15" },
    { id: 3, name: "Employment Certificate", status: "Pending", date: "2024-03-20" },
  ];

  // KYC document types
  const kycDocumentTypes = [
    { id: 'aadhaar', name: 'Aadhaar Card', icon: '🆔', required: true },
    { id: 'pan', name: 'PAN Card', icon: '💳', required: true },
    { id: 'employment', name: 'Employment Certificate', icon: '📄', required: true },
    { id: 'photo', name: 'Passport Photo', icon: '📷', required: true },
    { id: 'address', name: 'Address Proof', icon: '🏠', required: false },
    { id: 'income', name: 'Income Certificate', icon: '💰', required: false },
  ];

  // Fetch properties from Firebase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const firebaseModule = await import('@/lib/firebase');
        const db = firebaseModule.db;
        if (!db) throw new Error('Firestore not initialized');
        
        const firestore = await import('firebase/firestore');
        const propertiesRef = firestore.collection(db, 'properties');
        const snapshot = await firestore.getDocs(propertiesRef);
        
        const propertyList: Property[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          propertyList.push({
            property_id: doc.id,
            type: (data.type?.toLowerCase() || 'apartment') as any,
            name: data.name || data.title || '',
            location: data.location || '',
            city: data.city || '',
            price: data.price || 0,
            rental_type: data.rentalType === 'RENT' ? 'Rent' : 'Nightly',
            details: data.details || `${data.bedrooms || 0} BHK, ${data.area || 0} sqft`,
            bedrooms: parseInt(data.bedrooms) || 1,
            bathrooms: parseInt(data.bathrooms) || 1,
            area: data.area || 0,
            image: data.image || data.images?.[0]?.url || '',
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            description: data.description || ''
          });
        });
        
        console.log('📊 User dashboard fetched:', propertyList.length, 'properties');
        setProperties(propertyList.length > 0 ? propertyList : propertiesData);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties(propertiesData);
      }
    };
    
    fetchProperties();
    
    // Listen for updates
    const handlePropertyUpdate = () => {
      console.log('🔄 Refreshing user dashboard...');
      fetchProperties();
    };
    
    window.addEventListener('properties-updated', handlePropertyUpdate);
    return () => window.removeEventListener('properties-updated', handlePropertyUpdate);
  }, []);

  // Fetch owners directory when the 'owners' tab is active
  useEffect(() => {
    if (activeTab === 'owners' && ownersList.length === 0) {
      const fetchOwners = async () => {
        try {
          setLoadingOwners(true);
          const firebaseModule = await import('@/lib/firebase');
          const db = firebaseModule.db;
          const firestore = await import('firebase/firestore');
          
          if (!db) throw new Error('Firestore not initialized');
          
          const usersRef = firestore.collection(db, 'users');
          const q = firestore.query(usersRef, firestore.where('role', '==', 'OWNER'));
          const snapshot = await firestore.getDocs(q);
          
          const fetchedOwners: any[] = [];
          const propsRef = firestore.collection(db, 'properties');
          
          for (const docSnap of snapshot.docs) {
            const ownerData = docSnap.data();
            let propertyCount = 0;
            let ownerProperties: any[] = [];
            try {
               const pq = firestore.query(propsRef, firestore.where('ownerId', '==', docSnap.id));
               const pSnap = await firestore.getDocs(pq);
               propertyCount = pSnap.size;
               ownerProperties = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            } catch (e) {
               console.warn("Could not fetch properties for owner", e);
            }
            
            fetchedOwners.push({
              id: docSnap.id,
              ...ownerData,
              propertyCount,
              properties: ownerProperties
            });
          }
          
          setOwnersList(fetchedOwners);
        } catch (error) {
          console.error("Error fetching owners:", error);
          toast.error("Failed to load owners directory");
        } finally {
          setLoadingOwners(false);
        }
      };
      
      fetchOwners();
    }
  }, [activeTab, ownersList.length]);

  // Fetch user bookings when the 'payments' tab is active
  useEffect(() => {
    if (activeTab === 'payments' && userBookings.length === 0 && user?.uid) {
      const fetchBookings = async () => {
        try {
          setLoadingBookings(true);
          const { db } = await import('@/lib/firebase');
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          
          if (!db) throw new Error('Firestore not initialized');
          
          const bookingsRef = collection(db, 'bookings');
          const q = query(bookingsRef, where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          
          const fetchedBookings: any[] = [];
          snapshot.forEach(doc => {
            fetchedBookings.push({ id: doc.id, ...doc.data() });
          });
          
          fetchedBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setUserBookings(fetchedBookings);
        } catch (error) {
          console.error("Error fetching bookings:", error);
          toast.error("Failed to load your payments");
        } finally {
          setLoadingBookings(false);
        }
      };
      
      fetchBookings();
    }
  }, [activeTab, user?.uid, userBookings.length]);

  // Fetch maintenance requests
  const fetchMaintenance = async () => {
    if (!user?.uid) return;
    try {
      setLoadingMaintenance(true);
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db as any, 'maintenance'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const requests: any[] = [];
      snap.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
      requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      setUserMaintenance(requests);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'maintenance' && userMaintenance.length === 0) {
      fetchMaintenance();
    }
  }, [activeTab, user?.uid]);

  // Handle tab from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['properties', 'owners', 'payments', 'maintenance', 'documents', 'messages'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []); // Run once on mount

  const handleBookMaintenance = async (service: any) => {
    if (!user) return toast.error("Please log in first");
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db as any, 'maintenance'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
        status: 'Pending',
        requestedAt: new Date().toISOString()
      });
      toast.success(`${service.name} request submitted!`);
      fetchMaintenance();
    } catch (error) {
      toast.error("Failed to book service");
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!user?.uid) return;
    try {
      setLoadingMessages(true);
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db as any, 'messages'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const msgs: any[] = [];
      snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setUserMessages(msgs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages' && userMessages.length === 0) {
      fetchMessages();
    }
  }, [activeTab, user?.uid]);

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !user) return;
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db as any, 'messages'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        text: newMessageText.trim(),
        senderId: user.uid,
        senderRole: 'USER',
        createdAt: new Date().toISOString()
      });
      setNewMessageText('');
      fetchMessages();
    } catch (e) {
      toast.error('Failed to send message');
    }
  };

  // Payment handler function
  const handlePayment = (amount: number, propertyName: string) => {
    setPaymentAmount(amount);
    setPaymentProperty(propertyName);
    setShowPaymentModal(true);
    setPaymentSuccess(false);
  };

  // Booking handler function
  const handleBookProperty = (property: any) => {
    setSelectedProperty(property);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = () => {
    // Validate booking data
    if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.moveInDate) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (!bookingData.agreeToTerms) {
      toast.error("Please agree to terms and conditions");
      return;
    }

    // Calculate total amount (Security Deposit + First Month Rent)
    const securityDeposit = selectedProperty.price;
    const firstMonthRent = selectedProperty.price;
    const totalAmount = securityDeposit + firstMonthRent;
    
    setShowBookingModal(false);
    handlePayment(totalAmount, selectedProperty.name);
  };

  const processPayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setPaymentSuccess(true);
      toast.success("Payment successful!");
      
      // Generate UPI payment link
      const upiLink = `upi://pay?pa=${YOUR_UPI_ID}&pn=HousyRental&am=${paymentAmount}&cu=INR`;
      
      // In production, you would integrate with actual payment gateway
      console.log('UPI Link:', upiLink);
      console.log('Phone Number:', YOUR_PHONE_NUMBER);
    }, 2000);
  };

  // KYC upload handler
  const handleKYCUpload = (documentType: string) => {
    setSelectedKYCType(documentType);
    setShowKYCModal(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) {
      console.error('❌ Upload failed - Missing file or user:', { 
        hasFile: !!file, 
        userId: user?.uid 
      });
      toast.error('Please login to upload documents');
      setUploadingFile(false);
      return;
    }

    try {
      setUploadingFile(true);
      console.log('📤 Starting upload...', { 
        fileName: file.name, 
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        fileType: selectedKYCType,
        userId: user.uid 
      });
      
      const documentName = kycDocumentTypes.find(dt => dt.id === selectedKYCType)?.name || selectedKYCType;
      console.log('📝 Document name:', documentName);
      
      // Step 1: Upload to Firebase Storage and Firestore
      console.log('⏳ Calling uploadKYCDocument...');
      const newDoc = await uploadKYCDocument(
        user.uid,
        file,
        selectedKYCType,
        documentName
      );

      console.log('✅ Upload successful! Document ID:', newDoc.id);
      console.log('📄 Document details:', {
        id: newDoc.id,
        name: newDoc.name,
        type: newDoc.type,
        status: newDoc.status,
        fileUrl: newDoc.fileUrl.substring(0, 50) + '...'
      });
      
      // Step 2: Update local state
      setKycDocuments(prev => {
        // Check if document of this type already exists
        const existingIndex = prev.findIndex(doc => doc.type === selectedKYCType);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newDoc;
          console.log('🔄 Updated existing document at index:', existingIndex);
          console.log('📋 Updated documents count:', updated.length);
          return updated;
        }
        console.log('➕ Added new document to list');
        console.log('📋 Total documents count:', prev.length + 1);
        return [...prev, newDoc];
      });

      console.log('✅ State updated successfully');
      setUploadingFile(false);
      setShowKYCModal(false);
      setSelectedKYCType('');
      toast.success(`${documentName} uploaded successfully! Awaiting verification.`);
      setActiveTab('documents');
    } catch (error: any) {
      console.error('❌ Upload error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast.error(`Upload failed: ${error.message || 'Please check Firebase configuration'}`);
      setUploadingFile(false);
      setShowKYCModal(false);
      setSelectedKYCType('');
    }
  };

  // Get recent properties (mock - in real app, this would be user's saved/viewed properties)
  const recentProperties = propertiesData.slice(0, 4);
  
  // Get trending properties (mock data)
  const trendingProperties = propertiesData.filter(p => p.city === "Bangalore").slice(0, 3);

  // Load KYC documents from Firebase on mount
  useEffect(() => {
    const loadKYCDocuments = async () => {
      if (!user?.uid) return;
      
      try {
        setLoadingKYC(true);
        const docs = await getUserKYCDocuments(user.uid);
        setKycDocuments(docs);
      } catch (error) {
        console.error('Error loading KYC documents:', error);
        toast.error('Failed to load KYC documents');
      } finally {
        setLoadingKYC(false);
      }
    };

    loadKYCDocuments();
  }, [user?.uid]);

  const handleSendMessageToOwner = async () => {
    if (!user || !messageToOwner.trim() || !selectedOwner) return;

    try {
      setIsSendingToOwner(true);
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      if (!db) throw new Error('Firestore not initialized');

      await addDoc(collection(db, 'messages'), {
        text: messageToOwner.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderRole: 'USER',
        recipientId: selectedOwner.id,
        recipientName: selectedOwner.displayName || selectedOwner.email,
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success('Message sent to owner!');
      setMessageToOwner('');
      setShowOwnerMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingToOwner(false);
    }
  };

  const propertyTypes = [
    { value: "all", label: "All", icon: Building2 },
    { value: "apartment", label: "Apartments", icon: Building2 },
    { value: "house", label: "Houses", icon: Home },
    { value: "pg", label: "PGs", icon: Building2 },
    { value: "hotel", label: "Hotels", icon: Hotel },
    { value: "room", label: "Rooms", icon: Key },
  ];

  const filteredProperties = properties.filter(property => {
    const matchesType = selectedType === "all" || property.type === selectedType;
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-white font-bold text-lg">HR</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">HousyRental</h1>
              <p className="text-xs text-gray-500">Your Home, Your Way</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200" title="Notifications">
              <Bell className="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-3.5 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <img 
                  src={user?.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.displayName || "User")} 
                  alt={user?.displayName || ""} 
                  className="w-8 h-8 rounded-full ring-2 ring-gray-100" 
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.displayName || "User"}</p>
                  <p className="text-xs text-gray-500">Property Seeker</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  {/* Profile Info */}
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/50">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={user?.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.displayName || "User")} 
                        alt={user?.displayName || ""} 
                        className="w-10 h-10 rounded-full ring-2 ring-blue-200" 
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user?.displayName || "User"}</p>
                        <p className="text-xs text-gray-600">{user?.email || "user@example.com"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleKYCUpload('aadhaar');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      Complete KYC
                    </button>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1.5">
                    <button 
                      onClick={() => {
                        toast.info("Opening profile settings...");
                        setShowProfileDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2.5 transition-all"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Profile Settings</span>
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await logout();
                          toast.success("Logged out successfully");
                          router.push("/auth/login");
                        } catch {
                          toast.error("Failed to logout");
                        }
                        setShowProfileDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-2.5 transition-all"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Navigation Tabs - Modern Design */}
        <div className="mb-8 relative z-40">
          
          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                  <Menu className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Navigation Menu</p>
                  <p className="font-bold text-gray-900 capitalize">
                    {activeTab === 'properties' ? 'Dashboard Home' : activeTab}
                  </p>
                </div>
              </div>
              {isMobileMenuOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {/* Mobile Dropdown Options */}
            {isMobileMenuOpen && (
              <div className="absolute left-0 right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                <div className="flex flex-col p-2 space-y-1">
                  {[
                    { id: 'properties', label: 'Properties', icon: Building2, color: 'text-blue-600 bg-blue-50' },
                    { id: 'owners', label: 'Owners', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
                    { id: 'payments', label: 'Payments', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
                    { id: 'maintenance', label: 'Maintenance', icon: Calendar, color: 'text-purple-600 bg-purple-50' },
                    { id: 'documents', label: 'Documents', icon: FileText, color: 'text-cyan-600 bg-cyan-50' },
                    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'text-rose-600 bg-rose-50' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-all ${
                          isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? tab.color : 'bg-gray-100 text-gray-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={isActive ? 'text-gray-900 font-bold' : 'text-gray-600'}>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Grid Layout (Hidden on Mobile) */}
          <div className="hidden md:block bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-1.5 shadow-inner border border-gray-200">
            <div className="grid grid-cols-6 gap-2">
              {[
                { id: 'properties', label: 'Properties', icon: Building2, color: 'from-blue-500 to-indigo-500' },
                { id: 'owners', label: 'Owners', icon: Users, color: 'from-emerald-500 to-teal-500' },
                { id: 'payments', label: 'Payments', icon: DollarSign, color: 'from-amber-500 to-orange-500' },
                { id: 'maintenance', label: 'Maintenance', icon: Calendar, color: 'from-purple-500 to-pink-500' },
                { id: 'documents', label: 'Documents', icon: FileText, color: 'from-cyan-500 to-blue-500' },
                { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'from-rose-500 to-red-500' },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden group ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                        : "bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-white/10 animate-pulse" />
                    )}
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${
                      activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "properties" && (
          <>
        {/* Quick Stats - Compact Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="group bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Properties</p>
                <p className="text-2xl font-bold text-blue-600">{propertiesData.length}+</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Cities Covered</p>
                <p className="text-2xl font-bold text-emerald-600">5+</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Starting From</p>
                <p className="text-2xl font-bold text-indigo-600">₹6K</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Trending Properties - Modern Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">🔥 Trending in Bangalore</h2>
              <p className="text-gray-500 font-medium">Most viewed properties this week</p>
            </div>
            <button 
              onClick={() => router.push("/browse-properties?type=apartment&city=Bangalore")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingProperties.map((property) => (
              <div 
                key={property.property_id}
                onClick={() => router.push(`/properties/${property.property_id}`)}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md">
                    {property.type}
                  </div>
                  <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-all duration-200 transform hover:scale-110">
                    <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{property.name}</h3>
                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{property.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-3xl font-bold text-blue-600">₹{property.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm font-medium ml-1">/{property.rental_type === 'Nightly' ? 'night' : 'month'}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {property.bedrooms} Beds • {property.bathrooms} Baths
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookProperty(property);
                    }}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                  >
                    Book Property
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar - Clean Design */}
        <div className="bg-white rounded-xl p-2 shadow-md border border-gray-200 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location or property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-transparent border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400 font-medium"
              />
            </div>
            <button 
              onClick={() => {
                const params = new URLSearchParams();
                if (selectedType !== 'all') params.set('type', selectedType);
                if (searchQuery) params.set('q', searchQuery);
                router.push(`/browse-properties?${params.toString()}`);
              }}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        {/* Property Type Tabs - Clean Chip Design */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {propertyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  selectedType === type.value
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Browse All Properties - Grid Layout */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedType === "all" ? "All Properties" : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
              </h2>
              <p className="text-gray-500 font-medium">{filteredProperties.length} properties available</p>
            </div>
            <button 
              onClick={() => {
                const params = new URLSearchParams();
                if (selectedType !== 'all') params.set('type', selectedType);
                router.push(`/browse-properties?${params.toString()}`);
              }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              Browse All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProperties.slice(0, 8).map((property) => (
              <div 
                key={property.property_id}
                onClick={() => router.push(`/properties/${property.property_id}`)}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md">
                    {property.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors truncate">{property.name}</h3>
                  <div className="flex items-center gap-1.5 mb-3 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="truncate font-medium">{property.location}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 font-medium">{property.details}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">₹{property.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-xs font-medium ml-1">/{property.rental_type === 'Nightly' ? 'night' : 'mo'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Properties Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
          </>
        )}

        {/* Owners Directory Tab - Modern Design */}
        {activeTab === "owners" && (
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Property Owners Directory</h2>
            
            {loadingOwners ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : ownersList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-200">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700">No Owners Found</h3>
                <p className="text-gray-500">There are currently no property owners registered.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownersList.map((owner) => (
                  <div key={owner.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/60 transform hover:-translate-y-2">
                    <div className="flex items-center gap-5 mb-6">
                      {owner.photoURL ? (
                        <img src={owner.photoURL} alt={owner.displayName} className="w-20 h-20 rounded-full shadow-lg object-cover ring-4 ring-emerald-50" />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg uppercase">
                          {owner.displayName?.substring(0, 2) || 'OW'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{owner.displayName || 'Anonymous Owner'}</h3>
                        <p className="text-sm text-gray-500 font-medium">Property Owner</p>
                      </div>
                    </div>
                    
                    {owner.about && (
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3 italic">"{owner.about}"</p>
                    )}
                    
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-500" /> Properties Listed:
                        </span>
                        <span className="font-bold text-2xl text-blue-600">{owner.propertyCount || 0}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button 
                          onClick={() => setSelectedOwner(owner)}
                          className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                        >
                          <User className="w-4 h-4" />
                          View Profile
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedOwner(owner);
                            setShowOwnerMessageModal(true);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-sm text-center"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          {/* Owner Profile Modal */}
          {selectedOwner && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOwner(null); }}>
              <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative my-8">
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedOwner(null)}
                  className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors z-10 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Cover Image/Header Pattern */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <div className="px-8 pb-8">
                  {/* Profile Header */}
                  <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-8 border-b border-gray-100 pb-8">
                    {selectedOwner.photoURL ? (
                      <img src={selectedOwner.photoURL} alt={selectedOwner.displayName} className="w-24 h-24 rounded-2xl shadow-xl object-cover ring-4 ring-white bg-white" />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white uppercase">
                        {selectedOwner.displayName?.substring(0, 2) || 'OW'}
                      </div>
                    )}
                    <div className="flex-1 mt-4 sm:mt-0">
                      <h2 className="text-3xl font-bold text-gray-900">{selectedOwner.displayName || 'Anonymous Owner'}</h2>
                      <p className="text-gray-500 font-medium mt-1">Property Owner • {selectedOwner.propertyCount || 0} Properties Listed</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                      <button 
                        onClick={() => setShowOwnerMessageModal(true)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                      {selectedOwner.phone && (
                        <a href={`tel:${selectedOwner.phone}`} className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" /> Call
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: About & Details */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Info</h3>
                        <div className="space-y-4">
                          {selectedOwner.email && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                              <p className="font-medium text-gray-900 truncate">{selectedOwner.email}</p>
                            </div>
                          )}
                          {selectedOwner.phone && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                              <p className="font-medium text-gray-900">{selectedOwner.phone}</p>
                            </div>
                          )}
                          {selectedOwner.company && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company</p>
                              <p className="font-medium text-gray-900">{selectedOwner.company}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedOwner.about && (
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{selectedOwner.about}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Properties */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Listed Properties</h3>
                      </div>
                      
                      {!selectedOwner.properties || selectedOwner.properties.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-semibold">No properties listed yet.</p>
                          <p className="text-gray-400 text-sm mt-1">This owner hasn't published any listings.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedOwner.properties.map((property: any) => (
                            <div 
                              key={property.id} 
                              onClick={() => router.push(`/properties/${property.property_id || property.id}`)}
                              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer flex flex-col"
                            >
                              <div className="h-44 overflow-hidden relative">
                                <img 
                                  src={property.image || property.images?.[0]?.url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600"} 
                                  alt={property.name || property.title} 
                                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                                />
                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-gray-900 shadow-sm">
                                  ₹{(property.price || 0).toLocaleString()}
                                </div>
                                <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm uppercase">
                                  {property.type || 'Property'}
                                </div>
                              </div>
                              <div className="p-4 flex-1 flex flex-col">
                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{property.name || property.title}</h4>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{property.location || property.city}</span>
                                </div>
                                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
                                  <span>{property.bedrooms || 1} Beds</span>
                                  <span>•</span>
                                  <span>{property.bathrooms || 1} Baths</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Payments Tab - Modern Design */}
        {activeTab === "payments" && (
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Payments & Bookings</h2>
            
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Transaction History</h3>
              
              {loadingBookings ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-200">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700">No Payments Yet</h3>
                  <p className="text-gray-500">You haven't made any real property bookings or payments via Razorpay.</p>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden border border-gray-200/60">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Property</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Receipt (Order ID)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {userBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-orange-50/30 transition-colors">
                          <td className="px-6 py-5 text-sm font-bold text-gray-900">{booking.propertyName || 'Unknown Property'}</td>
                          <td className="px-6 py-5 text-sm font-medium text-gray-700">{new Date(booking.date).toLocaleDateString()}</td>
                          <td className="px-6 py-5 text-sm font-bold text-lg text-orange-600">₹{Number(booking.amount).toLocaleString()}</td>
                          <td className="px-6 py-5"><span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase">{booking.status || 'Confirmed'}</span></td>
                          <td className="px-6 py-5 text-xs font-mono text-gray-500">{booking.orderId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maintenance Tab - Modern Cards */}
        {activeTab === "maintenance" && (
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Maintenance Services</h2>
            
            {/* Active Requested Services */}
            <div className="mb-12 cursor-default">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Requested Services</h3>
              {loadingMaintenance ? (
                <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div></div>
              ) : userMaintenance.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 text-center border border-gray-100">
                  <p className="text-gray-500">You have no active maintenance requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userMaintenance.map(req => (
                    <div key={req.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all">
                      <div>
                        <h4 className="font-bold text-gray-900">{req.serviceName}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-1">Requested: {new Date(req.requestedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                        req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">Book a Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {maintenanceServices.map((service) => (
                <div key={service.id} className="group bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/60 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 font-medium mb-4">Duration: {service.duration}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-5">₹{service.price}</p>
                  <button 
                    onClick={() => handleBookMaintenance(service)}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Book Service
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab - Modern Table */}
        {activeTab === "documents" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">KYC Documents</h2>
                <p className="text-gray-600 font-medium">Upload and manage your verification documents</p>
              </div>
              <button 
                onClick={() => handleKYCUpload('')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Document
              </button>
            </div>
            
            {/* KYC Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">KYC Completion Status</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    {loadingKYC ? '-' : Math.round((kycDocuments.length / kycDocumentTypes.filter(t => t.required).length) * 100)}%
                  </span>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {loadingKYC ? 'Loading...' : `${kycDocuments.filter(d => d.status === "Verified").length} verified`}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-4">
                {loadingKYC ? 'Loading documents...' : `${kycDocuments.length} of ${kycDocumentTypes.filter(t => t.required).length} required documents uploaded`}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500"
                  style={{ width: loadingKYC ? '0%' : `${(kycDocuments.length / kycDocumentTypes.filter(t => t.required).length) * 100}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {loadingKYC ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                ) : (
                  kycDocumentTypes.map((type) => {
                    const doc = kycDocuments.find(d => d.type === type.id);
                    const isUploaded = !!doc;
                    const isVerified = doc?.status === "Verified";
                    
                    return (
                      <div 
                        key={type.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isVerified 
                            ? "border-emerald-500 bg-emerald-50" 
                            : isUploaded
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <p className="text-xs font-bold text-gray-900 mb-1">{type.name}</p>
                        <p className="text-xs text-gray-600 font-medium">
                          {isVerified ? "✓ Verified" : isUploaded ? "⏳ Pending" : type.required ? "Required" : "Optional"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Documents Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden border border-gray-200/60">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Document</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Uploaded Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kycDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5 text-sm font-bold text-gray-900">{doc.name}</td>
                      <td className="px-6 py-5">
                        <span className={`px-4 py-2 text-xs font-bold rounded-full ${
                          doc.status === "Verified" ? "bg-emerald-100 text-emerald-700" : 
                          doc.status === "Pending" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>{doc.status}</span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                        {doc.uploadedAt ? new Date(doc.uploadedAt.toDate()).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setViewingDoc(doc)}
                            className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all duration-200"
                          >
                            View
                          </button>
                          {doc.status !== "Verified" && (
                            <button 
                              onClick={() => handleKYCUpload(doc.type || '')}
                              className="px-4 py-2 border-2 border-amber-600 text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50 transition-all duration-200"
                            >
                              Re-upload
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Required Documents Info */}
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Important Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>All <strong className="text-gray-900">required documents</strong> must be uploaded for complete KYC verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Verification typically takes <strong className="text-gray-900">24-48 hours</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Ensure documents are <strong className="text-gray-900">clear and readable</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>You'll be notified once your KYC is verified</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Messages Tab - Modern Chat UI */}
        {activeTab === "messages" && (
          <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-2xl font-bold text-white">Support & Messages</h2>
              <p className="text-blue-100 text-sm">Chat directly with platform administrators</p>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : userMessages.length === 0 ? (
                <div className="text-center text-gray-400 my-auto">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Send a message to start the conversation.</p>
                </div>
              ) : (
                userMessages.map(msg => {
                  const isAdmin = msg.senderRole === 'ADMIN';
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[80%] ${isAdmin ? 'self-start' : 'self-end'}`}>
                      <div className={`p-4 rounded-2xl ${isAdmin ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md'}`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!newMessageText.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-cyan-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 rounded-3xl shadow-2xl max-w-lg w-full my-8 overflow-hidden animate-scale-in border-2 border-blue-200/60">
            {!paymentSuccess ? (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">Complete Payment</h3>
                  <p className="text-blue-100 text-sm">{paymentProperty}</p>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {/* Amount Display */}
                  <div className="bg-gradient-to-br from-blue-100/90 to-cyan-100/90 backdrop-blur-sm rounded-2xl p-6 mb-6 text-center border-2 border-blue-300/60">
                    <p className="text-gray-700 text-sm font-bold mb-2 uppercase tracking-wide">Amount to Pay</p>
                    <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">₹{paymentAmount.toLocaleString()}</p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-4">Select Payment Method</h4>
                    <div className="space-y-3">
                      {/* UPI */}
                      <button
                        onClick={() => setSelectedPaymentMethod('upi')}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                          selectedPaymentMethod === 'upi'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-900">UPI</p>
                          <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                        {selectedPaymentMethod === 'upi' && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* Debit/Credit Card */}
                      <button
                        onClick={() => setSelectedPaymentMethod('card')}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                          selectedPaymentMethod === 'card'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-900">Debit/Credit Card</p>
                          <p className="text-sm text-gray-500">Visa, Mastercard, RuPay, Amex</p>
                        </div>
                        {selectedPaymentMethod === 'card' && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* Net Banking */}
                      <button
                        onClick={() => setSelectedPaymentMethod('netbanking')}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                          selectedPaymentMethod === 'netbanking'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-900">Net Banking</p>
                          <p className="text-sm text-gray-500">All major banks supported</p>
                        </div>
                        {selectedPaymentMethod === 'netbanking' && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        )}
                      </button>

                      {/* Wallets */}
                      <button
                        onClick={() => setSelectedPaymentMethod('wallet')}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                          selectedPaymentMethod === 'wallet'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-900">Wallets</p>
                          <p className="text-sm text-gray-500">Paytm, PhonePe, Amazon Pay</p>
                        </div>
                        {selectedPaymentMethod === 'wallet' && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gradient-to-br from-amber-100/90 to-orange-100/90 backdrop-blur-sm border-2 border-amber-300/60 rounded-xl p-4 mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-amber-900 mb-1">Payment Details</p>
                        <p className="text-xs text-amber-800 font-medium">After clicking "Pay Now", you'll be redirected to complete the payment securely.</p>
                        <p className="text-xs text-amber-800 mt-2"><strong>UPI ID:</strong> {YOUR_UPI_ID}</p>
                        <p className="text-xs text-amber-800"><strong>Phone:</strong> {YOUR_PHONE_NUMBER}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Sticky at bottom */}
                  <div className="flex gap-3 sticky bottom-0 bg-white pt-4 mt-6 border-t border-gray-100">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processPayment}
                      className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Pay ₹{paymentAmount.toLocaleString()}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Success State
              <div className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">Your payment of ₹{paymentAmount.toLocaleString()} for {paymentProperty} has been completed.</p>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Transaction ID</p>
                  <p className="font-mono font-bold text-gray-900">TXN{Date.now()}</p>
                </div>

                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setActiveTab('payments');
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedProperty && (
        <div className="fixed inset-0 bg-cyan-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-scale-in border border-emerald-200/50">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-6 text-white">
              <h3 className="text-2xl font-bold mb-1">Book Property</h3>
              <p className="text-emerald-100 text-sm">{selectedProperty.name}</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Property Summary */}
              <div className="bg-gradient-to-br from-emerald-100/80 to-green-100/80 backdrop-blur-sm rounded-2xl p-4 mb-6 flex gap-4 border border-emerald-200/60">
                <img 
                  src={selectedProperty.image} 
                  alt={selectedProperty.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{selectedProperty.name}</h4>
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedProperty.location}
                  </p>
                  <p className="text-lg font-bold text-emerald-600">₹{selectedProperty.price.toLocaleString()}/month</p>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-4 mb-6">
                <h4 className="font-bold text-gray-900 text-lg">Tenant Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date *</label>
                    <input
                      type="date"
                      value={bookingData.moveInDate}
                      onChange={(e) => setBookingData({...bookingData, moveInDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy</label>
                    <select
                      value={bookingData.occupancy}
                      onChange={(e) => setBookingData({...bookingData, occupancy: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 Persons</option>
                      <option value="3">3 Persons</option>
                      <option value="4">4 Persons</option>
                    </select>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-gradient-to-br from-blue-100/90 to-cyan-100/90 backdrop-blur-sm border-2 border-blue-300/60 rounded-xl p-4 mt-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3">Payment Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="font-semibold">₹{selectedProperty.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">First Month Rent:</span>
                      <span className="font-semibold">₹{selectedProperty.price.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-blue-300 pt-2 mt-2">
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-gray-900">Total Amount:</span>
                        <span className="text-emerald-600">₹{(selectedProperty.price * 2).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingData.agreeToTerms}
                      onChange={(e) => setBookingData({...bookingData, agreeToTerms: e.target.checked})}
                      className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the <strong className="text-blue-600">Terms & Conditions</strong> and confirm that all information provided is accurate. I understand that the security deposit is refundable and the first month's rent is non-refundable.
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 sticky bottom-0 bg-white pt-4 mt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookingSubmit}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Proceed to Pay ₹{(selectedProperty.price * 2).toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Upload Modal */}
      {showKYCModal && (
        <div className="fixed inset-0 bg-cyan-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl shadow-2xl max-w-lg w-full my-8 overflow-hidden animate-scale-in border-2 border-blue-200/60">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-6 text-white">
              <h3 className="text-2xl font-bold mb-1">Upload Document</h3>
              <p className="text-blue-100 text-sm">Complete your KYC verification</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Select Document Type */}
              {!selectedKYCType && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Select Document Type</h4>
                  <div className="space-y-3 mb-6">
                    {kycDocumentTypes.map((type) => {
                      const doc = kycDocuments.find(d => d.type === type.id);
                      const isUploaded = !!doc;
                      const isVerified = doc?.status === "Verified";
                      
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedKYCType(type.id)}
                          disabled={isVerified}
                          className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                            isVerified
                              ? 'border-emerald-500 bg-emerald-50 cursor-not-allowed opacity-60'
                              : isUploaded
                              ? 'border-amber-500 bg-amber-50 hover:border-blue-500'
                              : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-3xl">{type.icon}</div>
                          <div className="flex-1 text-left">
                            <p className="font-bold text-gray-900">{type.name}</p>
                            <p className="text-sm text-gray-600">
                              {isVerified ? '✓ Already verified' : isUploaded ? '⏳ Pending verification' : type.required ? 'Required document' : 'Optional document'}
                            </p>
                          </div>
                          {isVerified && (
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload Form */}
              {selectedKYCType && (
                <div>
                  <div className="mb-6">
                    <button
                      onClick={() => setSelectedKYCType('')}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-4"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to document types
                    </button>
                    
                    <h4 className="font-bold text-gray-900 mb-2">
                      Upload {kycDocumentTypes.find(t => t.id === selectedKYCType)?.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Accepted formats: PDF, JPG, PNG. Max file size: 5MB
                    </p>
                  </div>

                  {/* Upload Area */}
                  <div className="mb-6">
                    <label className="block w-full border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition-all bg-blue-50/50">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                      {uploadingFile ? (
                        <div>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-700 font-semibold">Uploading...</p>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-blue-700 font-semibold mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <h5 className="font-bold text-amber-900 mb-3 text-sm">Document Guidelines</h5>
                    <ul className="space-y-1.5 text-xs text-amber-800">
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-0.5">•</span>
                        <span>Ensure the document is clear and all text is readable</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-0.5">•</span>
                        <span>All four corners of the document should be visible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-0.5">•</span>
                        <span>Avoid glare or shadows on the document</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-0.5">•</span>
                        <span>Color scans/photos are preferred over black and white</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowKYCModal(false);
                        setSelectedKYCType('');
                      }}
                      className="flex-1 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                      disabled={uploadingFile}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300"
                      disabled={uploadingFile}
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-cyan-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">{viewingDoc.name}</h3>
                <p className="text-blue-100 text-sm flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    viewingDoc.status === "Verified" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                  }`}>{viewingDoc.status}</span>
                  <span>• Uploaded on {viewingDoc.uploadedAt ? new Date(viewingDoc.uploadedAt.toDate()).toLocaleDateString() : 'N/A'}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Document Preview */}
            <div className="p-6">
              {viewingDoc.fileUrl ? (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{viewingDoc.fileName || 'Document'}</p>
                        <p className="text-sm text-gray-600">File uploaded for verification</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    {viewingDoc.fileName?.endsWith('.pdf') ? (
                      <div className="h-[60vh] w-full">
                        <iframe 
                          src={viewingDoc.fileUrl} 
                          className="w-full h-full"
                          title="Document Preview"
                        />
                      </div>
                    ) : (
                      <div className="p-4">
                        <img 
                          src={viewingDoc.fileUrl} 
                          alt={viewingDoc.name}
                          className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                        />
                      </div>
                    )}
                  </div>

                  {/* Status Info */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-amber-900 mb-1">Verification Status</p>
                        <p className="text-sm text-amber-800">
                          {viewingDoc.status === "Verified" 
                            ? "This document has been verified and approved."
                            : "This document is pending verification. Our team will review it within 24-48 hours."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 font-semibold">No preview available</p>
                  <p className="text-sm text-gray-500 mt-2">The document file cannot be displayed</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                {viewingDoc.fileUrl && (
                  <a
                    href={viewingDoc.fileUrl}
                    download={viewingDoc.fileName}
                    className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all text-center"
                  >
                    Download
                  </a>
                )}
                <button
                  onClick={() => setViewingDoc(null)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        {/* Owner Message Modal */}
        {showOwnerMessageModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
                <h3 className="text-xl font-bold">Message to {selectedOwner?.displayName || 'Owner'}</h3>
                <button onClick={() => setShowOwnerMessageModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4 font-medium italic">"Inquire about listed properties or request more details."</p>
                <textarea
                  value={messageToOwner}
                  onChange={(e) => setMessageToOwner(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-400"
                ></textarea>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowOwnerMessageModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessageToOwner}
                    disabled={isSendingToOwner || !messageToOwner.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSendingToOwner ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
}
