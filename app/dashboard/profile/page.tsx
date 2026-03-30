"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Settings,
  Home,
  DollarSign,
  X,
  Camera,
  Save
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      propertyAlerts: true,
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.displayName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        bio: "Real estate enthusiast looking for the perfect home.",
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          propertyAlerts: true,
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    // TODO: Update user profile in database
    console.log("Saving profile:", profileData);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      // Handle nested preferences
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [child]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

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
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/dashboard/user")}>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your personal information and preferences
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture and Basic Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Your profile photo</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={user.photoURL || ""}
                      alt={user.displayName || ""}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    />
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0"
                        variant="outline"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg">{profileData.name}</h3>
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                    <Badge variant="secondary" className="mt-2">Tenant</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your contact details and bio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted h-24"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preferences */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Property updates and alerts</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="preferences.emailNotifications"
                      checked={profileData.preferences.emailNotifications}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-5 h-5 text-primary border-2 rounded focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Urgent alerts only</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="preferences.smsNotifications"
                      checked={profileData.preferences.smsNotifications}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-5 h-5 text-primary border-2 rounded focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Property Alerts</p>
                        <p className="text-sm text-muted-foreground">New matching properties</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="preferences.propertyAlerts"
                      checked={profileData.preferences.propertyAlerts}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-5 h-5 text-primary border-2 rounded focus:ring-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>Your recent activity on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">Properties Viewed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-sm text-muted-foreground">Applications Sent</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-sm text-muted-foreground">Saved Properties</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 flex justify-end">
              <Button onClick={handleSave} className="px-8">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
