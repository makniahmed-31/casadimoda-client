"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  images: string[];
  displayImage: string;
  onSelect: (img: string) => void;
  productName: string;
}

export default function ProductGallery({ images, displayImage, onSelect, productName }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, images.length]);

  useEffect(() => {
    if (lightboxOpen) onSelect(images[lightboxIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, lightboxOpen]);

  const openLightbox = () => {
    const idx = images.indexOf(displayImage);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const thumbClass = (img: string) =>
    `relative aspect-square overflow-hidden border-2 transition-all cursor-pointer bg-white ${
      displayImage === img ? "border-accent" : "border-gray-100 hover:border-gray-300"
    }`;

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-2 md:gap-3">
        {/* Main image + bottom row */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div
            className="relative w-full overflow-hidden bg-white border border-gray-100 cursor-zoom-in"
            style={{ aspectRatio: "4/5" }}
            onClick={openLightbox}
          >
            <Image
              src={displayImage}
              alt={productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 md:p-8 transition-opacity duration-200"
              priority
              unoptimized
            />
          </div>

          {/* {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button key={i} onClick={() => onSelect(img)} className={thumbClass(img)}>
                  <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )} */}
        </div>
        {/* Left vertical strip (first 3) */}
        {images.length > 1 && (
          <div className="flex xl:flex-col gap-2 w-full xl:w-[110px] flex-shrink-0">
            {images.slice(0, 3).map((img, i) => (
              <button key={i} onClick={() => onSelect(img)} className={`w-full ${thumbClass(img)}`}>
                <Image src={img} alt={`${productName} ${i + 1}`} fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2 cursor-pointer z-10 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={26} />
          </button>
          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-[11px] font-bold uppercase tracking-widest">
            {lightboxIndex + 1} / {images.length}
          </span>
          {images.length > 1 && (
            <button
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-3 cursor-pointer z-10 bg-black/30 hover:bg-black/60 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i - 1 + images.length) % images.length);
              }}
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {images.length > 1 && (
            <button
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-3 cursor-pointer z-10 bg-black/30 hover:bg-black/60 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i + 1) % images.length);
              }}
            >
              <ChevronRight size={28} />
            </button>
          )}
          <div
            className="relative w-full max-w-3xl mx-16 md:mx-24"
            style={{ height: "70vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={images[lightboxIndex]} alt={productName} fill className="object-contain" unoptimized priority />
          </div>
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`relative w-12 h-12 md:w-14 md:h-14 overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                    lightboxIndex === i ? "border-accent" : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
