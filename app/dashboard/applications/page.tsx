"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home,
  Calendar,
  MapPin,
  DollarSign,
  MessageSquare,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Star,
  Filter,
  Search
} from "lucide-react";

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([
    {
      id: 1,
      propertyTitle: "Luxury Villa - Beachfront",
      propertyAddress: "123 Ocean Drive, Miami, FL",
      propertyImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&h=200&fit=crop",
      propertyType: "Villa",
      bedrooms: 4,
      bathrooms: 3,
      monthlyRent: "₹45,000",
      status: "pending",
      submittedAt: "2024-03-15",
      ownerResponse: "Your application is under review. We'll contact you within 24 hours.",
      requestedMoveIn: "2024-04-01",
      rating: 4.8,
      ownerName: "John Smith",
    },
    {
      id: 2,
      propertyTitle: "Modern Downtown Apartment",
      propertyAddress: "456 Main Street, New York, NY",
      propertyImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop",
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      monthlyRent: "₹28,000",
      status: "approved",
      submittedAt: "2024-03-10",
      ownerResponse: "Congratulations! Your application has been approved. Please contact us to schedule a viewing.",
      requestedMoveIn: "2024-04-15",
      rating: 4.5,
      ownerName: "Sarah Johnson",
    },
    {
      id: 3,
      propertyTitle: "Cozy Suburban Home",
      propertyAddress: "789 Maple Avenue, Austin, TX",
      propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop",
      propertyType: "House",
      bedrooms: 3,
      bathrooms: 2,
      monthlyRent: "₹21,000",
      status: "rejected",
      submittedAt: "2024-03-08",
      ownerResponse: "Thank you for your interest. Unfortunately, the property has been rented to another applicant.",
      requestedMoveIn: "2024-05-01",
      rating: 4.2,
      ownerName: "Mike Davis",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      default: return "Pending";
    }
  };

  const handleViewProperty = (propertyId: number) => {
    router.push(`/properties/${propertyId}`);
  };

  const handleContactOwner = (applicationId: number) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      alert(`Opening conversation with ${application.ownerName} for ${application.propertyTitle}`);
    }
  };

  const handleWithdrawApplication = (applicationId: number) => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch = app.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-200 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const pendingCount = applications.filter(app => app.status === "pending").length;
  const approvedCount = applications.filter(app => app.status === "approved").length;
  const rejectedCount = applications.filter(app => app.status === "rejected").length;

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
              <p className="text-xs text-gray-500">Applications</p>
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
            <h1 className="text-4xl font-bold mb-3">My Applications</h1>
            <p className="text-indigo-100 text-lg mb-6">
              Track the status of your rental applications and communicate with property owners
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-indigo-100">Total Applications</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-indigo-100">Pending</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-indigo-100">Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-100 text-sm font-medium">Pending</CardTitle>
                <Clock className="h-5 w-5 text-yellow-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{pendingCount}</div>
              <p className="text-yellow-100 text-sm">Under review</p>
              <div className="mt-3 text-xs text-yellow-200">
                Average response time: 24-48 hours
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-100 text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{approvedCount}</div>
              <p className="text-green-100 text-sm">Successful applications</p>
              <div className="mt-3 text-xs text-green-200">
                Contact owners for next steps
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-100 text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-5 w-5 text-red-100" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{rejectedCount}</div>
              <p className="text-red-100 text-sm">Not selected</p>
              <div className="mt-3 text-xs text-red-200">
                Try other properties
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Applications
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
                  All ({applications.length})
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending ({pendingCount})
                </Button>
                <Button
                  variant={filterStatus === "approved" ? "default" : "outline"}
                  onClick={() => setFilterStatus("approved")}
                >
                  Approved ({approvedCount})
                </Button>
                <Button
                  variant={filterStatus === "rejected" ? "default" : "outline"}
                  onClick={() => setFilterStatus("rejected")}
                >
                  Rejected ({rejectedCount})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Application History</CardTitle>
            <CardDescription>Your rental applications and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterStatus !== "all" 
                    ? "Try adjusting your filters or search terms" 
                    : "Start by browsing and applying for properties"}
                </p>
                <Button onClick={() => router.push("/properties")} className="bg-indigo-600 hover:bg-indigo-700">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Properties
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      {/* Property Image */}
                      <div className="md:w-1/3">
                        <div className="relative h-48 md:h-full">
                          <img
                            src={application.propertyImage}
                            alt={application.propertyTitle}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge variant={getStatusColor(application.status)} className="bg-white/90 backdrop-blur-sm">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(application.status)}
                                {getStatusText(application.status)}
                              </div>
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-cyan-950/60 text-white px-3 py-1 rounded-full text-sm">
                            <Star className="h-3 w-3 fill-current" />
                            {application.rating}
                          </div>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{application.propertyTitle}</h3>
                            <p className="text-gray-600 flex items-center gap-1 mb-2">
                              <MapPin className="h-4 w-4" />
                              {application.propertyAddress}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{application.propertyType}</span>
                              <span>•</span>
                              <span>{application.bedrooms} BD</span>
                              <span>•</span>
                              <span>{application.bathrooms} BA</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-900">{application.monthlyRent}</div>
                            <p className="text-sm text-gray-500">per month</p>
                          </div>
                        </div>

                        {/* Application Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Application Details
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>Submitted:</strong> {application.submittedAt}</p>
                              <p><strong>Requested Move-in:</strong> {application.requestedMoveIn}</p>
                              <p><strong>Owner:</strong> {application.ownerName}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Owner Response
                            </h4>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                              {application.ownerResponse}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-500">
                            Application ID: #{application.id.toString().padStart(6, '0')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleViewProperty(application.id)}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Property
                            </Button>
                            {application.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => handleContactOwner(application.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Contact Owner
                              </Button>
                            )}
                            {application.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleWithdrawApplication(application.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Withdraw
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
