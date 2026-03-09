"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductItem from "@/components/ProductItem";
import { Product } from "@/types";

interface FeaturedProductsGridProps {
  products: Product[];
  pageSize?: number;
}

export default function FeaturedProductsGrid({
  products,
}: FeaturedProductsGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel mb-8">
      {/* Prev button */}
      <button
        onClick={() => scroll("left")}
        className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
          w-10 h-10 flex items-center justify-center
          bg-black/70 border border-white/10 text-white/60
          hover:border-accent hover:text-accent
          transition-all duration-200
          opacity-0 group-hover/carousel:opacity-100"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Carousel track */}
      <div
        ref={scrollRef}
        className="grid grid-rows-1 gap-3 overflow-x-auto scroll-smooth pb-2"
        style={{
          gridAutoFlow: "column",
          gridAutoColumns: "clamp(200px, 22vw, 240px)",
          scrollbarWidth: "none",
        }}
      >
        {products.map((product) => (
          <ProductItem key={product.slug} product={product} />
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => scroll("right")}
        className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
          w-10 h-10 flex items-center justify-center
          bg-black/70 border border-white/10 text-white/60
          hover:border-accent hover:text-accent
          transition-all duration-200
          opacity-0 group-hover/carousel:opacity-100"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
