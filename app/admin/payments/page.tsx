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
  TrendingUp,
  Users,
  Building,
  Mail,
  Bell
} from "lucide-react";

export default function AdminPaymentManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState([
    {
      id: 1,
      tenantName: "Alice Johnson",
      tenantEmail: "alice@example.com",
      propertyTitle: "Sunset Villa - Luxury Beachfront",
      propertyAddress: "123 Ocean Drive, Miami, FL",
      amount: "$4,500",
      dueDate: "2024-03-31",
      status: "paid",
      paidDate: "2024-03-28",
      paymentMethod: "Credit Card",
      transactionId: "TXN-123456",
      ownerName: "John Smith",
    },
    {
      id: 2,
      tenantName: "Bob Smith",
      tenantEmail: "bob@example.com", 
      propertyTitle: "Modern Downtown Apartment",
      propertyAddress: "456 Main Street, New York, NY",
      amount: "$2,800",
      dueDate: "2024-04-01",
      status: "pending",
      paidDate: null,
      paymentMethod: null,
      transactionId: null,
      ownerName: "Sarah Johnson",
    },
    {
      id: 3,
      tenantName: "Carol White",
      tenantEmail: "carol@example.com",
      propertyTitle: "Cozy Suburban Home",
      propertyAddress: "789 Maple Avenue, Austin, TX",
      amount: "$2,100",
      dueDate: "2024-04-15",
      status: "upcoming",
      paidDate: null,
      paymentMethod: null,
      transactionId: null,
      ownerName: "Mike Davis",
    },
    {
      id: 4,
      tenantName: "David Brown",
      tenantEmail: "david@example.com",
      propertyTitle: "Luxury Penthouse",
      propertyAddress: "321 Skyline Drive, Los Angeles, CA",
      amount: "$5,200",
      dueDate: "2024-03-25",
      status: "overdue",
      paidDate: null,
      paymentMethod: null,
      transactionId: null,
      ownerName: "Emily Wilson",
    },
  ]);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "overdue": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Calendar className="h-4 w-4 text-indigo-600" />;
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

  const handleSendReminder = (paymentId: number) => {
    // TODO: Send payment reminder email
    alert(`Sending payment reminder for payment ID: ${paymentId}`);
  };

  const handleSendBulkReminder = () => {
    // TODO: Send bulk payment reminders
    alert("Sending payment reminders to all overdue accounts");
  };

  const handleExportData = () => {
    // TODO: Export payment data to CSV/Excel
    alert("Exporting payment data...");
  };

  const handleViewPaymentDetails = (paymentId: number) => {
    // TODO: Open payment details modal
    alert(`Viewing payment details for ID: ${paymentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const paidPayments = payments.filter(p => p.status === "paid");
  const pendingPayments = payments.filter(p => p.status === "pending");
  const overduePayments = payments.filter(p => p.status === "overdue");
  const upcomingPayments = payments.filter(p => p.status === "upcoming");
  
  const totalRevenue = paidPayments.reduce((sum, p) => sum + parseFloat(p.amount.replace(/[$,]/g, "")), 0);
  const pendingRevenue = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount.replace(/[$,]/g, "")), 0);
  const overdueRevenue = overduePayments.reduce((sum, p) => sum + parseFloat(p.amount.replace(/[$,]/g, "")), 0);

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-bold text-xl">PropManager</span>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/admin")}>
              ← Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium">{user.displayName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
          <p className="text-muted-foreground">
            Track all payments, manage revenue, and send payment reminders
          </p>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{pendingPayments.length} payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${overdueRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{overduePayments.length} accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleSendBulkReminder} disabled={overduePayments.length === 0}>
            <Bell className="h-4 w-4 mr-2" />
            Send Bulk Reminders ({overduePayments.length})
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Payment Data
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "overdue" ? "default" : "outline"}
            onClick={() => setActiveTab("overdue")}
          >
            Overdue ({overduePayments.length})
          </Button>
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({pendingPayments.length})
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
            {/* Overdue Payments Alert */}
            {overduePayments.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Critical: Overdue Payments
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    {overduePayments.length} overdue payment(s) requiring immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overduePayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.tenantName}</p>
                            <p className="text-sm text-muted-foreground">{payment.propertyTitle}</p>
                            <p className="text-sm text-red-600">Due: {payment.dueDate} (Overdue)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">{payment.amount}</div>
                          <Badge variant="destructive">Overdue</Badge>
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSendReminder(payment.id)}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Send Reminder
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewPaymentDetails(payment.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment activities across all properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          payment.status === "paid" ? "bg-green-100" : 
                          payment.status === "overdue" ? "bg-red-100" : 
                          payment.status === "pending" ? "bg-yellow-100" : "bg-blue-100"
                        }`}>
                          {getStatusIcon(payment.status)}
                        </div>
                        <div>
                          <p className="font-medium">{payment.tenantName}</p>
                          <p className="text-sm text-muted-foreground">{payment.propertyTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Owner: {payment.ownerName} • Due: {payment.dueDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{payment.amount}</div>
                        <Badge variant={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                        {payment.status === "paid" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Paid: {payment.paidDate}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "overdue" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overdue Payments</CardTitle>
                  <CardDescription>Payments that require immediate attention</CardDescription>
                </div>
                <Button onClick={handleSendBulkReminder} disabled={overduePayments.length === 0}>
                  <Bell className="h-4 w-4 mr-2" />
                  Send All Reminders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overduePayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-sm text-muted-foreground">{payment.propertyTitle}</p>
                        <p className="text-sm text-red-600">Due: {payment.dueDate} • Owner: {payment.ownerName}</p>
                        <p className="text-sm text-muted-foreground">{payment.tenantEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{payment.amount}</div>
                      <Badge variant="destructive">Overdue</Badge>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSendReminder(payment.id)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Send Reminder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPaymentDetails(payment.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Payments awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-sm text-muted-foreground">{payment.propertyTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {payment.ownerName} • Due: {payment.dueDate}
                        </p>
                        <p className="text-sm text-muted-foreground">{payment.tenantEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{payment.amount}</div>
                      <Badge variant="secondary">Pending</Badge>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPaymentDetails(payment.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
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
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Complete payment history across all properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paidPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-sm text-muted-foreground">{payment.propertyTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Owner: {payment.ownerName} • Paid: {payment.paidDate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Method: {payment.paymentMethod} • ID: {payment.transactionId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{payment.amount}</div>
                      <Badge variant="default">Paid</Badge>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPaymentDetails(payment.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
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
