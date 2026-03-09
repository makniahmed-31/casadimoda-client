"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface SortSelectProps {
  currentSort: string;
}

export default function SortSelect({ currentSort }: SortSelectProps) {
  const t = useTranslations("products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "newest", label: t("sortNewest") },
    { value: "featured", label: t("sortFeatured") },
    { value: "lowest", label: t("sortPriceLow") },
    { value: "highest", label: t("sortPriceHigh") },
    { value: "toprated", label: t("sortTopRated") },
  ];

  const currentOption =
    sortOptions.find((opt) => opt.value === currentSort) || sortOptions[0];

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }

    params.delete("page");

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);

    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold text-white">{t("sortBy")}:</span>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-secondary px-4 py-2  text-xs font-bold text-primary border-none outline-none cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2 min-w-[180px] justify-between"
        >
          {currentOption.label}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 w-full mt-1 bg-white  shadow-2xl border border-gray-100 overflow-hidden z-[100]">
            <ul className="divide-y divide-gray-50">
              {sortOptions.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left cursor-pointer px-4 py-3 text-xs font-bold transition-all duration-200 ${
                      currentSort === option.value
                        ? "bg-accent text-white"
                        : "text-primary hover:bg-gray-50 hover:text-accent"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
