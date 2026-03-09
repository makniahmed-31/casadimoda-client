"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Building2,
  Crown,
} from "lucide-react";

interface HeroSlide {
  type: "image" | "video";
  src: string;
  alt?: string;
  title: string;
  subtitle: string;
  description: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoplayInterval?: number;
}

export default function HeroCarousel({
  slides,
  autoplayInterval = 5000,
}: HeroCarouselProps) {
  const t = useTranslations("hero");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(140);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector("header");
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    const observer = new MutationObserver(updateHeaderHeight);
    const header = document.querySelector("header");
    if (header) {
      observer.observe(header, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          video.play().catch((error) => {
            console.log("Video autoplay failed:", error);
          });
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentSlide]);

  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      const interval = setInterval(nextSlide, autoplayInterval);
      return () => clearInterval(interval);
    }
  }, [isPaused, nextSlide, autoplayInterval, slides.length]);

  const currentSlideData = slides[currentSlide];

  return (
    <div
      className="relative w-full overflow-hidden group/hero"
      style={{ height: `calc(100vh - ${headerHeight}px)` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Media */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.type === "image" ? (
              <img
                src={slide.src}
                alt={slide.alt || slide.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={slide.src}
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
            )}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
      </div>

      {/* Content - Centered */}
      <div className="relative h-full flex flex-col items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-6 flex-1 flex flex-col items-center justify-center">
          {/* Top label */}
          <p className="text-white/70 font-bold uppercase tracking-[0.35em] text-[9px] md:text-[11px] mb-4 md:mb-6">
            {currentSlideData.subtitle}
          </p>

          {/* Main title */}
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-tight mb-3 md:mb-5 leading-[1.15] italic">
            {currentSlideData.title}
          </h1>

          {/* Description */}
          <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
            {currentSlideData.description}
          </p>
          {/* Category Cards - Inside hero at bottom */}
          <div className="w-full max-w-4xl mx-auto md:px-8 md:pb-16 mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-16">
              {/* Shop Détail */}
              <Link
                href="/products"
                className="group/card bg-black/30 backdrop-blur-sm border border-white/10 hover:border-accent/40 p-3 md:p-6 flex flex-col items-center text-center transition-all duration-300 hover:bg-black/70"
              >
                <ShoppingBag className="w-5 h-5 md:w-8 md:h-8 text-accent mb-2 md:mb-3" />
                <h3 className="text-white font-black uppercase tracking-wider text-[9px] md:text-sm mb-0.5 md:mb-1">
                  {t("shopDetail")}
                </h3>
                <p className="text-white/50 text-[7px] md:text-[11px] tracking-wide">
                  {t("brandsAccessories")}
                </p>
              </Link>

              {/* Espace Wholesale */}
              <Link
                href="/wholesale"
                className="group/card bg-black/30 backdrop-blur-sm border border-white/10 hover:border-accent/40 p-3 md:p-6 flex flex-col items-center text-center transition-all duration-300 hover:bg-black/70"
              >
                <Building2 className="w-5 h-5 md:w-8 md:h-8 text-accent mb-2 md:mb-3" />
                <h3 className="text-white font-black uppercase tracking-wider text-[9px] md:text-sm mb-0.5 md:mb-1">
                  {t("wholesaleSpace")}
                </h3>
                <p className="text-white/50 text-[7px] md:text-[11px] tracking-wide">
                  {t("wholesaleSales")}
                </p>
              </Link>

              {/* VIP Store */}
              <Link
                href="/vip-store"
                className="group/card bg-black/30 backdrop-blur-sm border border-white/10 hover:border-accent/40 p-3 md:p-6 flex flex-col items-center text-center transition-all duration-300 hover:bg-black/70"
              >
                <Crown className="w-5 h-5 md:w-8 md:h-8 text-accent mb-2 md:mb-3" />
                <h3 className="text-white font-black uppercase tracking-wider text-[9px] md:text-sm mb-0.5 md:mb-1">
                  {t("vipStore")}
                </h3>
                <p className="text-white/50 text-[7px] md:text-[11px] tracking-wide">
                  {t("customCreation")}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ghost Navigation Arrows - visible only on hover */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/hero:opacity-100 hover:bg-white/10 cursor-pointer"
            aria-label={t("previousSlide")}
          >
            <ChevronLeft
              size={24}
              className="text-white/60 hover:text-white transition-colors"
            />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/hero:opacity-100 hover:bg-white/10 cursor-pointer"
            aria-label={t("nextSlide")}
          >
            <ChevronRight
              size={24}
              className="text-white/60 hover:text-white transition-colors"
            />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all h-[2px] cursor-pointer ${
                index === currentSlide
                  ? "w-8 bg-accent"
                  : "w-4 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
