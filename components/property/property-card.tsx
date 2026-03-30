"use client";

import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import type { Property, PropertyImage, PropertyAmenity, User } from "@prisma/client";

interface PropertyWithRelations extends Property {
  images: PropertyImage[];
  amenities: (PropertyAmenity & {
    amenity: {
      name: string;
    };
  })[];
  owner: Pick<User, "name" | "image">;
}

interface PropertyCardProps {
  property: PropertyWithRelations;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
  
  return (
    <Link href={`/properties/${property.id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden card-shadow card-shadow-hover transition-all duration-300 h-full flex flex-col">
        <div className="relative aspect-[4/3]">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              property.listingType === "RENT" 
                ? "bg-primary text-white" 
                : "bg-success text-white"
            }`}>
              For {property.listingType === "RENT" ? "Rent" : "Sale"}
            </span>
          </div>
          {property.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-warning text-foreground text-xs font-medium rounded-full">
                Featured
              </span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-xs text-primary font-medium mb-1 uppercase tracking-wide">
            {property.type}
          </div>
          <h3 className="font-semibold mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {property.address}, {property.city}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {property.bedrooms && (
              <span>{property.bedrooms} BD</span>
            )}
            {property.bathrooms && (
              <span>{property.bathrooms} BA</span>
            )}
            {property.squareFeet && (
              <span>{property.squareFeet.toLocaleString()} sqft</span>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">
                {formatCurrency(property.price)}
              </span>
              {property.listingType === "RENT" && (
                <span className="text-sm text-muted-foreground">/mo</span>
              )}
            </div>
            <span className="text-sm text-primary hover:underline">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
