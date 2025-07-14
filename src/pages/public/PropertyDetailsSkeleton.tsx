// components/public/PropertyDetailsSkeleton.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming shadcn/ui Skeleton component

const PropertyDetailsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <Skeleton className="w-full h-full bg-gray-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-8 text-white">
            <Skeleton className="h-6 w-32 mb-3 bg-gray-400" /> {/* Badge */}
            <Skeleton className="h-10 w-3/4 mb-3 bg-gray-400" /> {/* Title */}
            <Skeleton className="h-6 w-1/2 bg-gray-400" /> {/* Location */}
          </div>
        </div>
      </section>

      {/* Main Content and Sidebar Skeleton */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content Skeletons */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description Card Skeleton */}
              <Skeleton className="h-48 w-full bg-gray-200 rounded-lg" />

              {/* Amenities Card Skeleton */}
              <Skeleton className="h-32 w-full bg-gray-200 rounded-lg" />

              {/* Specifications Card Skeleton */}
              <Skeleton className="h-40 w-full bg-gray-200 rounded-lg" />

              {/* Gallery Card Skeleton */}
              <Skeleton className="h-56 w-full bg-gray-200 rounded-lg" />

              {/* Map Card Skeleton */}
              <Skeleton className="h-64 w-full bg-gray-200 rounded-lg" />
            </div>

            {/* Sidebar Skeletons */}
            <div className="space-y-6">
              {/* Price & CTA Card Skeleton */}
              <Skeleton className="h-48 w-full bg-gray-200 rounded-lg" />

              {/* Key Details Card Skeleton */}
              <Skeleton className="h-40 w-full bg-gray-200 rounded-lg" />

              {/* Developer Info Card Skeleton */}
              <Skeleton className="h-32 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyDetailsSkeleton;