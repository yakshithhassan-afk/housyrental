import { prisma } from "../lib/prisma";
import { PropertyType, ListingType, PropertyStatus, VerificationStatus, UserRole } from "@prisma/client";

async function main() {
  console.log("Seeding database...");

  // Create sample users
  const owner1 = await prisma.user.create({
    data: {
      id: "owner_1",
      name: "John Smith",
      email: "john@example.com",
      role: UserRole.OWNER,
      phone: "+1234567890",
      image: "https://i.pravatar.cc/150?u=john",
      subscriptionTier: "premium",
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      id: "owner_2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: UserRole.OWNER,
      phone: "+1234567891",
      image: "https://i.pravatar.cc/150?u=sarah",
      subscriptionTier: "free",
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      id: "tenant_1",
      name: "Michael Chen",
      email: "michael@example.com",
      role: UserRole.TENANT,
      phone: "+1234567892",
      image: "https://i.pravatar.cc/150?u=michael",
    },
  });

  // Create amenities
  const amenities = await prisma.amenity.createMany({
    data: [
      { name: "Swimming Pool", icon: "waves", category: "outdoor" },
      { name: "Gym", icon: "dumbbell", category: "indoor" },
      { name: "Parking", icon: "car", category: "outdoor" },
      { name: "Security", icon: "shield", category: "security" },
      { name: "WiFi", icon: "wifi", category: "indoor" },
      { name: "Air Conditioning", icon: "wind", category: "indoor" },
      { name: "Garden", icon: "tree-pine", category: "outdoor" },
      { name: "Fireplace", icon: "flame", category: "indoor" },
    ],
  });

  console.log(`Created ${amenities.count} amenities`);

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      title: "Sunset Villa - Luxury Beachfront",
      description: "Stunning beachfront villa with panoramic ocean views. Features 4 bedrooms, private pool, and modern amenities.",
      type: PropertyType.VILLA,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      address: "123 Ocean Drive",
      city: "Miami",
      state: "Florida",
      country: "USA",
      zipCode: "33139",
      price: 4500,
      maintenanceCharges: 300,
      securityDeposit: 9000,
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 3200,
      furnished: true,
      parking: true,
      petsAllowed: true,
      verificationStatus: VerificationStatus.VERIFIED,
      featured: true,
      ownerId: owner1.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop", order: 1 },
        ],
      },
      amenities: {
        create: [
          { amenity: { connect: { name: "Swimming Pool" } } },
          { amenity: { connect: { name: "Gym" } } },
          { amenity: { connect: { name: "Parking" } } },
          { amenity: { connect: { name: "Security" } } },
          { amenity: { connect: { name: "WiFi" } } },
        ],
      },
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: "Modern Loft in Downtown",
      description: "Contemporary loft apartment in the heart of the city. Open floor plan with high ceilings and city views.",
      type: PropertyType.APARTMENT,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      address: "456 Main Street",
      city: "New York",
      state: "New York",
      country: "USA",
      zipCode: "10001",
      price: 3200,
      maintenanceCharges: 150,
      securityDeposit: 6400,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      furnished: false,
      parking: true,
      petsAllowed: false,
      verificationStatus: VerificationStatus.VERIFIED,
      featured: true,
      ownerId: owner2.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop", order: 1 },
        ],
      },
      amenities: {
        create: [
          { amenity: { connect: { name: "Gym" } } },
          { amenity: { connect: { name: "WiFi" } } },
          { amenity: { connect: { name: "Air Conditioning" } } },
        ],
      },
    },
  });

  const property3 = await prisma.property.create({
    data: {
      title: "Cozy Suburban Home",
      description: "Charming family home in a quiet neighborhood. Perfect for families with kids, near schools and parks.",
      type: PropertyType.HOUSE,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      address: "789 Maple Avenue",
      city: "Austin",
      state: "Texas",
      country: "USA",
      zipCode: "78701",
      price: 650000,
      maintenanceCharges: 0,
      securityDeposit: 0,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 2100,
      furnished: false,
      parking: true,
      petsAllowed: true,
      verificationStatus: VerificationStatus.PENDING,
      featured: false,
      ownerId: owner1.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop", isPrimary: true, order: 0 },
        ],
      },
      amenities: {
        create: [
          { amenity: { connect: { name: "Garden" } } },
          { amenity: { connect: { name: "Parking" } } },
          { amenity: { connect: { name: "Security" } } },
        ],
      },
    },
  });

  const property4 = await prisma.property.create({
    data: {
      title: "Skyline Penthouse",
      description: "Luxurious penthouse with 360° city views. Top-floor living with private terrace and premium finishes.",
      type: PropertyType.CONDO,
      listingType: ListingType.RENT,
      status: PropertyStatus.AVAILABLE,
      address: "1000 Tower Place",
      city: "Chicago",
      state: "Illinois",
      country: "USA",
      zipCode: "60601",
      price: 5500,
      maintenanceCharges: 500,
      securityDeposit: 11000,
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 2800,
      furnished: true,
      parking: true,
      petsAllowed: true,
      verificationStatus: VerificationStatus.VERIFIED,
      featured: true,
      ownerId: owner2.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop", isPrimary: true, order: 0 },
          { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop", order: 1 },
        ],
      },
      amenities: {
        create: [
          { amenity: { connect: { name: "Swimming Pool" } } },
          { amenity: { connect: { name: "Gym" } } },
          { amenity: { connect: { name: "Security" } } },
          { amenity: { connect: { name: "WiFi" } } },
          { amenity: { connect: { name: "Air Conditioning" } } },
        ],
      },
    },
  });

  // Create inquiries
  await prisma.inquiry.create({
    data: {
      propertyId: property1.id,
      tenantId: tenant1.id,
      ownerId: owner1.id,
      message: "I'm interested in viewing this property this weekend.",
    },
  });

  // Create payments
  await prisma.payment.createMany({
    data: [
      {
        userId: tenant1.id,
        propertyId: property1.id,
        amount: 4500,
        currency: "USD",
        type: "rent",
        status: "PAID",
      },
      {
        userId: tenant1.id,
        propertyId: property1.id,
        amount: 4500,
        currency: "USD",
        type: "rent",
        status: "PENDING",
      },
    ],
  });

  // Create viewings
  await prisma.viewing.createMany({
    data: [
      {
        propertyId: property1.id,
        tenantId: tenant1.id,
        scheduledAt: new Date("2024-05-20T10:00:00Z"),
        status: "scheduled",
      },
      {
        propertyId: property2.id,
        tenantId: tenant1.id,
        scheduledAt: new Date("2024-05-22T14:00:00Z"),
        status: "scheduled",
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("\nSample data created:");
  console.log("- 2 Property Owners");
  console.log("- 1 Tenant");
  console.log("- 4 Properties (Villa, Apartment, House, Condo)");
  console.log("- 8 Amenities");
  console.log("- 1 Inquiry");
  console.log("- 2 Payments");
  console.log("- 2 Viewings");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
