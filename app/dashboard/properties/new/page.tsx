"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Home, Hotel, Key, MapPin, DollarSign, Plus, X, Upload } from "lucide-react";

export default function AddPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [propertyData, setPropertyData] = useState({
    title: "",
    description: "",
    type: "apartment", // apartment, house, pg, hotel, room
    price: "",
    location: "",
    address: "",
    city: "",
    state: "",
    bedrooms: "1",
    bathrooms: "1",
    area: "",
    amenities: [] as string[],
    images: [] as string[],
  });

  const propertyTypes = [
    { value: "apartment", label: "Apartment", icon: Building2 },
    { value: "house", label: "House", icon: Home },
    { value: "pg", label: "PG/Paying Guest", icon: Building2 },
    { value: "hotel", label: "Hotel/Service Apartment", icon: Hotel },
    { value: "room", label: "Room", icon: Key },
  ];

  const commonAmenities = [
    "WiFi",
    "Parking",
    "Security",
    "Elevator",
    "Power Backup",
    "Water Supply",
    "Cleaning Service",
    "Air Conditioning",
    "Furnished",
    "Kitchen",
    "Laundry",
    "Gym",
    "Swimming Pool",
    "Pet Friendly"
  ];

  const handleAddProperty = async () => {
    if (!propertyData.title || !propertyData.price || !propertyData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to add a property");
      return;
    }

    setIsLoading(true);

    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      
      if (!db) throw new Error('Firestore not initialized');

      // Create property object
      const newProperty = {
        name: propertyData.title,
        title: propertyData.title,
        description: propertyData.description || '',
        location: propertyData.location,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        type: propertyData.type.toUpperCase(),
        price: parseInt(propertyData.price) || 0,
        bedrooms: parseInt(propertyData.bedrooms) || 1,
        bathrooms: parseInt(propertyData.bathrooms) || 1,
        area: propertyData.area ? parseInt(propertyData.area) : 0,
        amenities: propertyData.amenities,
        image: propertyData.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        images: propertyData.images.length > 0 
          ? propertyData.images.map(url => ({ url })) 
          : [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' }],
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || user.email,
        status: 'Active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('🏠 Creating property:', newProperty);
      
      // Save to Firestore
      const propertiesRef = collection(db, 'properties');
      const docRef = await addDoc(propertiesRef, newProperty);
      
      console.log('✅ Property created with ID:', docRef.id);
      toast.success('✅ Property added successfully!');
      
      // Redirect to owner dashboard
      setTimeout(() => {
        router.push('/dashboard/owner');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error adding property:', error);
      toast.error('Failed to add property: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setPropertyData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image is too large. Max size is 10MB");
        return;
      }
      
      const toastId = toast.loading("Compressing & uploading image...");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Execute aggressive jpeg compression down to quality level 0.6
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          
          setPropertyData(prev => ({
            ...prev,
            images: [...prev.images, compressedBase64]
          }));
          toast.success("Image added!", { id: toastId });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setPropertyData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Add New Property</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={(e) => { e.preventDefault(); handleAddProperty(); }} className="space-y-8">
          {/* Property Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Property Type</CardTitle>
              <CardDescription>Select what type of property you're listing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setPropertyData(prev => ({ ...prev, type: type.value }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        propertyData.type === type.value
                          ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                          : "border-gray-200 hover:border-cyan-200"
                      }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">{type.label}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide essential details about your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Spacious 2BHK Apartment in Downtown"
                  value={propertyData.title}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe your property..."
                  value={propertyData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPropertyData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹/month or ₹/night) *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="25000"
                      value={propertyData.price}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, price: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location/City *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="location"
                      placeholder="e.g., Mumbai, Bangalore"
                      value={propertyData.location}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Complete Address *</Label>
                <Input
                  id="address"
                  placeholder="Street address, area, PIN code"
                  value={propertyData.address}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Specify the size and facilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <select
                    id="bedrooms"
                    value={propertyData.bedrooms}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPropertyData(prev => ({ ...prev, bedrooms: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} {i === 0 ? 'Bedroom' : 'Bedrooms'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <select
                    id="bathrooms"
                    value={propertyData.bathrooms}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPropertyData(prev => ({ ...prev, bathrooms: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {[...Array(5)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} {i === 0 ? 'Bathroom' : 'Bathrooms'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="area">Area (sq ft)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="1200"
                    value={propertyData.area}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, area: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>Select facilities available with the property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {commonAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      propertyData.amenities.includes(amenity)
                        ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                        : "border-gray-200 hover:border-cyan-200"
                    }`}
                  >
                    {propertyData.amenities.includes(amenity) ? "✓ " : ""}{amenity}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Photos</CardTitle>
              <CardDescription>Upload clear photos of your property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-200 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">Click to upload photos</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                </label>

                {propertyData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {propertyData.images.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={image} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
              isLoading={isLoading}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Property
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
