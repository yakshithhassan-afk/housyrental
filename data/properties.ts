// Dummy Property Data for Testing - Karnataka Locations

export interface Property {
  property_id: string;
  type: "apartment" | "house" | "pg" | "hotel" | "room" | string;
  name: string;
  location: string;
  city?: string;
  price: number;
  rental_type: "Rent" | "Nightly" | string;
  details: string;
  bedrooms: number | string;
  bathrooms: number | string;
  area: number | string;
  image: string;
  amenities: string[];
  description: string;
  ownerId?: string;
  ownerName?: string;
}

export const propertiesData: Property[] = [
  // APARTMENTS
  {
    property_id: "A001",
    type: "apartment",
    name: "Whitefield Elite",
    location: "Whitefield, Bangalore",
    city: "Bangalore",
    price: 45000,
    rental_type: "Rent",
    details: "3 BHK, 1690 sqft, Semi-furnished",
    bedrooms: 3,
    bathrooms: 2,
    area: 1690,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600",
    amenities: ["WiFi", "Parking", "Security", "Elevator", "Gym"],
    description: "Spacious 3BHK apartment in the heart of Whitefield with modern amenities and excellent connectivity to IT parks."
  },
  {
    property_id: "A002",
    type: "apartment",
    name: "Koramangala Residency",
    location: "Koramangala 5th Block, Bangalore",
    city: "Bangalore",
    price: 35000,
    rental_type: "Rent",
    details: "2 BHK, 1200 sqft, Fully furnished",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600",
    amenities: ["WiFi", "Parking", "Power Backup", "Water Supply"],
    description: "Beautiful 2BHK in prime Koramangala location, walking distance to restaurants and pubs."
  },
  {
    property_id: "A003",
    type: "apartment",
    name: "Indiranagar Heights",
    location: "Indiranagar, Bangalore",
    city: "Bangalore",
    price: 55000,
    rental_type: "Rent",
    details: "3 BHK, 1800 sqft, Premium furnishing",
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600",
    amenities: ["WiFi", "Parking", "Security", "Elevator", "Gym", "Swimming Pool"],
    description: "Luxury 3BHK apartment with stunning city views in Bangalore's trendiest neighborhood."
  },
  {
    property_id: "A004",
    type: "apartment",
    name: "HSR Layout Gardens",
    location: "HSR Layout, Bangalore",
    city: "Bangalore",
    price: 28000,
    rental_type: "Rent",
    details: "2 BHK, 1100 sqft, Semi-furnished",
    bedrooms: 2,
    bathrooms: 1,
    area: 1100,
    image: "https://images.unsplash.com/photo-1564013799919-600e7555cf07?w=800&h=600",
    amenities: ["WiFi", "Parking", "Security", "Power Backup"],
    description: "Cozy 2BHK perfect for young professionals, close to Silk Board."
  },
  {
    property_id: "A005",
    type: "apartment",
    name: "Electronic City Tech Park",
    location: "Electronic City Phase 1, Bangalore",
    city: "Bangalore",
    price: 22000,
    rental_type: "Rent",
    details: "2 BHK, 950 sqft, Unfurnished",
    bedrooms: 2,
    bathrooms: 1,
    area: 950,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600",
    amenities: ["WiFi", "Parking", "Security", "Elevator"],
    description: "Affordable 2BHK near Electronic City IT hub with great connectivity."
  },
  
  // HOUSES
  {
    property_id: "H001",
    type: "house",
    name: "JP Nagar Independent House",
    location: "JP Nagar 7th Phase, Bangalore",
    city: "Bangalore",
    price: 65000,
    rental_type: "Rent",
    details: "4 BHK, 2400 sqft, Garden, Parking",
    bedrooms: 4,
    bathrooms: 3,
    area: 2400,
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600",
    amenities: ["WiFi", "Parking", "Garden", "Security", "Power Backup"],
    description: "Spacious independent house with garden area, perfect for families."
  },
  {
    property_id: "H002",
    type: "house",
    name: "Malleswaram Traditional Home",
    location: "Malleswaram, Bangalore",
    city: "Bangalore",
    price: 50000,
    rental_type: "Rent",
    details: "3 BHK, 1800 sqft, Vintage charm",
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&h=600",
    amenities: ["Parking", "Water Supply", "Garden"],
    description: "Beautiful traditional home in one of Bangalore's oldest and most cultured neighborhoods."
  },
  {
    property_id: "H003",
    type: "house",
    name: "Basavanagudi Villa",
    location: "Basavanagudi, Bangalore",
    city: "Bangalore",
    price: 80000,
    rental_type: "Rent",
    details: "4 BHK, 3000 sqft, Premium villa",
    bedrooms: 4,
    bathrooms: 4,
    area: 3000,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600",
    amenities: ["WiFi", "Parking", "Garden", "Security", "Gym", "Swimming Pool"],
    description: "Luxurious villa with all modern amenities in prime Basavanagudi location."
  },
  
  // PGs
  {
    property_id: "PG001",
    type: "pg",
    name: "Co-Living Spaces",
    location: "Koramangala, Bangalore",
    city: "Bangalore",
    price: 15000,
    rental_type: "Rent",
    details: "Single sharing, Boys, Includes food",
    bedrooms: 1,
    bathrooms: 1,
    area: 150,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600",
    amenities: ["WiFi", "Food", "Laundry", "Cleaning Service", "Security"],
    description: "Premium PG with single occupancy rooms, includes breakfast and dinner."
  },
  {
    property_id: "PG002",
    type: "pg",
    name: "Girls PG - Indiranagar",
    location: "Indiranagar, Bangalore",
    city: "Bangalore",
    price: 12000,
    rental_type: "Rent",
    details: "Double sharing, Girls only, AC rooms",
    bedrooms: 1,
    bathrooms: 1,
    area: 180,
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600",
    amenities: ["WiFi", "Food", "AC", "Laundry", "Security"],
    description: "Safe and comfortable PG accommodation exclusively for working women."
  },
  {
    property_id: "PG003",
    type: "pg",
    name: "Marathahalli Men's PG",
    location: "Marathahalli, Bangalore",
    city: "Bangalore",
    price: 9500,
    rental_type: "Rent",
    details: "Triple sharing, Boys, All meals included",
    bedrooms: 1,
    bathrooms: 1,
    area: 200,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600",
    amenities: ["WiFi", "Food", "Laundry", "Parking"],
    description: "Budget-friendly PG near Marathahalli bridge with homely food."
  },
  {
    property_id: "PG004",
    type: "pg",
    name: "Whitefield IT Professionals PG",
    location: "Whitefield, Bangalore",
    city: "Bangalore",
    price: 13500,
    rental_type: "Rent",
    details: "Double sharing, Unisex, High-speed WiFi",
    bedrooms: 1,
    bathrooms: 1,
    area: 160,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600",
    amenities: ["WiFi", "Food", "Laundry", "Cleaning Service", "Power Backup"],
    description: "Perfect for IT professionals working from Whitefield area."
  },
  
  // HOTELS / Service Apartments
  {
    property_id: "HT001",
    type: "hotel",
    name: "City Center Residency",
    location: "Majestic, Bangalore",
    city: "Bangalore",
    price: 2500,
    rental_type: "Nightly",
    details: "3-star, Premium Room, Breakfast included",
    bedrooms: 1,
    bathrooms: 1,
    area: 300,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600",
    amenities: ["WiFi", "AC", "Room Service", "Restaurant", "Parking"],
    description: "Comfortable hotel rooms near Bangalore City Railway Station."
  },
  {
    property_id: "HT002",
    type: "hotel",
    name: "MG Road Business Hotel",
    location: "MG Road, Bangalore",
    city: "Bangalore",
    price: 4500,
    rental_type: "Nightly",
    details: "4-star, Executive Suite, All meals",
    bedrooms: 1,
    bathrooms: 1,
    area: 450,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600",
    amenities: ["WiFi", "AC", "Room Service", "Restaurant", "Gym", "Parking"],
    description: "Upscale hotel in the heart of Bangalore's business district."
  },
  {
    property_id: "HT003",
    type: "hotel",
    name: "Airport Gateway Hotel",
    location: "Near Airport, Bangalore",
    city: "Bangalore",
    price: 3500,
    rental_type: "Nightly",
    details: "3-star, Deluxe Room, Free airport shuttle",
    bedrooms: 1,
    bathrooms: 1,
    area: 350,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600",
    amenities: ["WiFi", "AC", "Room Service", "Restaurant", "Airport Shuttle"],
    description: "Convenient hotel near Kempegowda International Airport with free shuttle service."
  },
  
  // ROOMS
  {
    property_id: "R001",
    type: "room",
    name: "Private Room in Shared Flat",
    location: "BTM Layout, Bangalore",
    city: "Bangalore",
    price: 12000,
    rental_type: "Rent",
    details: "1 Room, Shared kitchen, Working professionals only",
    bedrooms: 1,
    bathrooms: 1,
    area: 200,
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600",
    amenities: ["WiFi", "Kitchen", "Laundry", "Cleaning Service"],
    description: "Furnished private room in a 3BHK flat shared with working professionals."
  },
  {
    property_id: "R002",
    type: "room",
    name: "Student Room Near Manipal",
    location: "Manipal, Karnataka",
    city: "Manipal",
    price: 6000,
    rental_type: "Rent",
    details: "1 Room, Attached bathroom, Student friendly",
    bedrooms: 1,
    bathrooms: 1,
    area: 150,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600",
    amenities: ["WiFi", "Water Supply", "Parking"],
    description: "Affordable room perfect for students studying in Manipal universities."
  },
  {
    property_id: "R003",
    type: "room",
    name: "Master Bedroom with Balcony",
    location: "Jayanagar, Bangalore",
    city: "Bangalore",
    price: 18000,
    rental_type: "Rent",
    details: "1 Master bedroom, Balcony, Attached washroom",
    bedrooms: 1,
    bathrooms: 1,
    area: 250,
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600",
    amenities: ["WiFi", "AC", "Balcony", "Kitchen access"],
    description: "Spacious master bedroom with balcony in peaceful Jayanagar locality."
  },
  
  // MYSORE PROPERTIES
  {
    property_id: "A006",
    type: "apartment",
    name: "Mysore Palace View Apartments",
    location: "Gokulam, Mysore",
    city: "Mysore",
    price: 18000,
    rental_type: "Rent",
    details: "2 BHK, 1100 sqft, Palace view",
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600",
    amenities: ["WiFi", "Parking", "Balcony", "Water Supply"],
    description: "Beautiful apartment with view of Mysore Palace, peaceful locality."
  },
  {
    property_id: "PG005",
    type: "pg",
    name: "Mysore Students PG",
    location: "Vidyaranyapuram, Mysore",
    city: "Mysore",
    price: 7000,
    rental_type: "Rent",
    details: "Double sharing, Students & Working professionals",
    bedrooms: 1,
    bathrooms: 1,
    area: 140,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600",
    amenities: ["WiFi", "Food", "Laundry", "Study Room"],
    description: "Quiet PG ideal for students and young professionals in Mysore."
  },
  
  // HUBLI-DHARWAD PROPERTIES
  {
    property_id: "A007",
    type: "apartment",
    name: "Hubli City Center Flat",
    location: "Club Road, Hubli",
    city: "Hubli",
    price: 15000,
    rental_type: "Rent",
    details: "2 BHK, 1000 sqft, Central location",
    bedrooms: 2,
    bathrooms: 1,
    area: 1000,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600",
    amenities: ["WiFi", "Parking", "Security"],
    description: "Well-maintained apartment in the heart of Hubli city."
  },
  {
    property_id: "H004",
    type: "house",
    name: "Dharwad Residential House",
    location: "PB Road, Dharwad",
    city: "Dharwad",
    price: 20000,
    rental_type: "Rent",
    details: "3 BHK, 1500 sqft, Garden area",
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600",
    amenities: ["Parking", "Garden", "Water Supply"],
    description: "Peaceful residential house perfect for families in Dharwad."
  },
];

export default propertiesData;
