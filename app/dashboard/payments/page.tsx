"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  ArrowLeft,
  TrendingUp,
  Bell,
  Filter,
  Search
} from "lucide-react";

export default function PaymentManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState([
    {
      id: 1,
      propertyTitle: "Sunset Villa - Luxury Beachfront",
      address: "123 Ocean Drive, Miami, FL",
      amount: "₹45,000",
      dueDate: "2024-03-31",
      status: "paid",
      paidDate: "2024-03-28",
      paymentMethod: "Credit Card",
      transactionId: "TXN-123456",
    },
    {
      id: 2,
      propertyTitle: "Modern Downtown Apartment", 
      address: "456 Main Street, New York, NY",
      amount: "₹28,000",
      dueDate: "2024-04-01",
      status: "pending",
      paidDate: null,
      paymentMethod: null,
      transactionId: null,
    },
    {
      id: 3,
      propertyTitle: "Cozy Suburban Home",
      address: "789 Maple Avenue, Austin, TX",
      amount: "₹21,000",
      dueDate: "2024-04-15",
      status: "upcoming",
      paidDate: null,
      paymentMethod: null,
      transactionId: null,
    },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "Credit Card",
      last4: "4242",
      brand: "Visa",
      isDefault: true,
    },
    {
      id: 2,
      type: "Bank Account",
      last4: "6789",
      brand: "HDFC Bank",
      isDefault: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState("overview");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "overdue": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Calendar className="h-4 w-4 text-cyan-900" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      default: return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Paid";
      case "pending": return "Pending";
      case "overdue": return "Overdue";
      default: return "Upcoming";
    }
  };

  const handleMakePayment = (paymentId: number) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      alert(`Processing payment for ${payment.propertyTitle} - ${payment.amount}`);
    }
  };

  const handleDownloadReceipt = (paymentId: number) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      alert(`Downloading receipt for payment ID: ${paymentId} - ${payment.propertyTitle}`);
    }
  };

  const handleAddPaymentMethod = () => {
    alert("Opening payment method setup");
  };

  const handleSetDefaultPaymentMethod = (methodId: number) => {
    setPaymentMethods(prev => 
      prev.map(method => ({ ...method, isDefault: method.id === methodId }))
    );
  };

  const handleDeletePaymentMethod = (methodId: number) => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesSearch = payment.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-200 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const paidPayments = payments.filter(p => p.status === "paid");
  const pendingPayments = payments.filter(p => p.status === "pending");
  const upcomingPayments = payments.filter(p => p.status === "upcoming");
  const totalPaid = paidPayments.reduce((sum, p) => sum + parseInt(p.amount.replace(/[₹,]/g, "")), 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/dashboard/owner")}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <span className="font-bold text-xl text-gray-800">PropManager</span>
              <p className="text-xs text-gray-500">Payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-md">
            <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-8 h-8 rounded-full border-2 border-cyan-200" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user.displayName}</p>
              <p className="text-xs text-gray-500">Tenant</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-3">Payment Management</h1>
            <p className="text-indigo-100 text-lg mb-6">
              Manage your rent payments and payment methods securely
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</p>
                <p className="text-sm text-indigo-100">Total Paid</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
                <p className="text-sm text-indigo-100">Pending</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-2xl font-bold">{paymentMethods.length}</p>
                <p className="text-sm text-indigo-100">Payment Methods</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-100 text-sm font-medium">Total Paid</CardTitle>
                <DollarSign className="h-5 w-5 text-green-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">₹{totalPaid.toLocaleString()}</div>
              <p className="text-green-100 text-sm">Lifetime payments</p>
              <div className="mt-3 text-xs text-green-200">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                On track with payments
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-100 text-sm font-medium">Pending</CardTitle>
                <Clock className="h-5 w-5 text-yellow-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{pendingPayments.length}</div>
              <p className="text-yellow-100 text-sm">Awaiting payment</p>
              <div className="mt-3 text-xs text-yellow-200">
                <Bell className="inline h-3 w-3 mr-1" />
                Action required
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-100 text-sm font-medium">Upcoming</CardTitle>
                <Calendar className="h-5 w-5 text-blue-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{upcomingPayments.length}</div>
              <p className="text-blue-100 text-sm">Due soon</p>
              <div className="mt-3 text-xs text-blue-200">
                <Calendar className="inline h-3 w-3 mr-1" />
                Scheduled payments
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-100 text-sm font-medium">Payment Methods</CardTitle>
                <CreditCard className="h-5 w-5 text-purple-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{paymentMethods.length}</div>
              <p className="text-purple-100 text-sm">Saved methods</p>
              <div className="mt-3 text-xs text-purple-200">
                <CreditCard className="inline h-3 w-3 mr-1" />
                Secure & verified
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "payment-methods" ? "default" : "outline"}
            onClick={() => setActiveTab("payment-methods")}
          >
            Payment Methods
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
          >
            Payment History
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Filters and Search */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by property name or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-cyan-200"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      onClick={() => setFilterStatus("all")}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      All ({payments.length})
                    </Button>
                    <Button
                      variant={filterStatus === "pending" ? "default" : "outline"}
                      onClick={() => setFilterStatus("pending")}
                    >
                      Pending ({pendingPayments.length})
                    </Button>
                    <Button
                      variant={filterStatus === "upcoming" ? "default" : "outline"}
                      onClick={() => setFilterStatus("upcoming")}
                    >
                      Upcoming ({upcomingPayments.length})
                    </Button>
                    <Button
                      variant={filterStatus === "paid" ? "default" : "outline"}
                      onClick={() => setFilterStatus("paid")}
                    >
                      Paid ({paidPayments.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Payments */}
            {pendingPayments.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Clock className="h-5 w-5" />
                    Pending Payments
                  </CardTitle>
                  <CardDescription>Payments that need your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPayments.filter(payment => 
                      filterStatus === "all" || payment.status === filterStatus
                    ).filter(payment =>
                      searchTerm === "" || 
                      payment.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      payment.address.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((payment) => (
                      <div key={payment.id} className="bg-white rounded-xl border border-yellow-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{payment.propertyTitle}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                                {payment.address}
                              </p>
                              <p className="text-sm text-yellow-600 font-medium">Due: {payment.dueDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-900">{payment.amount}</div>
                            <Badge variant="secondary" className="mb-2">Pending</Badge>
                            <div className="mt-2">
                              <Button
                                onClick={() => handleMakePayment(payment.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Pay Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Payments */}
            {upcomingPayments.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-900">
                    <Calendar className="h-5 w-5" />
                    Upcoming Payments
                  </CardTitle>
                  <CardDescription>Payments scheduled for the future</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingPayments.filter(payment => 
                      filterStatus === "all" || payment.status === filterStatus
                    ).filter(payment =>
                      searchTerm === "" || 
                      payment.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      payment.address.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((payment) => (
                      <div key={payment.id} className="bg-white rounded-xl border border-cyan-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-cyan-900" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{payment.propertyTitle}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                                {payment.address}
                              </p>
                              <p className="text-sm text-cyan-900 font-medium">Due: {payment.dueDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-900">{payment.amount}</div>
                            <Badge variant="outline" className="mb-2">Upcoming</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "payment-methods" && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </div>
                <Button onClick={handleAddPaymentMethod} className="bg-indigo-600 hover:bg-indigo-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-cyan-900" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{method.type}</p>
                          <p className="text-sm text-gray-600">{method.brand} •••• {method.last4}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && <Badge variant="default">Default</Badge>}
                        {!method.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "history" && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>Your complete payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paidPayments.filter(payment => 
                  filterStatus === "all" || payment.status === filterStatus
                ).filter(payment =>
                  searchTerm === "" || 
                  payment.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  payment.address.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((payment) => (
                  <div key={payment.id} className="bg-white rounded-xl border border-green-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{payment.propertyTitle}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                            {payment.address}
                          </p>
                          <p className="text-sm text-gray-500">
                            Paid: {payment.paidDate} • {payment.paymentMethod}
                          </p>
                          <p className="text-xs text-gray-400">Transaction ID: {payment.transactionId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{payment.amount}</div>
                        <Badge variant="default" className="mb-2">Paid</Badge>
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReceipt(payment.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
