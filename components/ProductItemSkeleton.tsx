import React from "react";

export default function ProductItemSkeleton() {
  return (
    <div className="group border border-gray-100  shadow-sm overflow-hidden flex flex-col bg-white">
      <div className="relative aspect-[3/4] w-full bg-gray-200 animate-pulse" />

      <div className="p-5 flex-grow">
        {/* SubCategory */}
        <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded mb-2.5" />

        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-4" />

        {/* Delivery info */}
        <div className="flex items-center gap-2 mt-2">
          <div className="h-3 w-3 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>

      <div className="p-5 pt-0 flex justify-between items-center">
        {/* Price */}
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />

        {/* Button */}
        <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-full" />
      </div>
    </div>
  );
}
