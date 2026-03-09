"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronRight, User, X } from "lucide-react";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  brands: string[];
  categoryMap: Record<string, string[]>;
}

export default function Sidebar({
  isOpen,
  onClose,
  categories,
  brands,
  categoryMap,
}: SidebarProps) {
  const t = useTranslations("sidebar");
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-[350px] bg-secondary z-[101] shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-primary p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight font-sans">
              {t("hello")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-accent" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-4 md:space-y-8">
          {/* Shop By Category */}
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-6 border-b border-gray-100 pb-2">
              {t("shopByCategory")}
            </h3>
            <ul className="space-y-4">
              {categories.map((cat) => (
                <li key={cat} className="space-y-2">
                  <div className="text-primary font-bold text-lg hover:text-accent transition-colors cursor-pointer flex items-center justify-between group">
                    <Link
                      href={`/search?category=${encodeURIComponent(cat)}`}
                      onClick={onClose}
                      className="flex-grow"
                    >
                      <span>{cat}</span>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                  </div>
                  {/* Nested Subcategories */}
                  <ul className="pl-4 space-y-1.5">
                    {categoryMap[cat].map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`/search?subCategory=${encodeURIComponent(sub)}&category=${encodeURIComponent(cat)}`}
                          className="text-xs text-text-dark/60 hover:text-primary transition-colors block py-0.5"
                          onClick={onClose}
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          {/* Featured Brands */}
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-6 border-b border-gray-100 pb-2">
              {t("exclusiveBrands")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {brands.map((brand) => (
                <Link
                  key={brand}
                  href={`/search?brand=${encodeURIComponent(brand)}`}
                  className="bg-white border border-gray-100 p-3  text-[10px] font-black text-center uppercase tracking-widest text-primary hover:border-accent hover:text-accent transition-all shadow-sm"
                  onClick={onClose}
                >
                  {brand}
                </Link>
              ))}
            </div>
          </section>

          {/* Help & Settings */}
          <section className="pt-6 border-t border-gray-100">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mb-4">
              {t("helpSettings")}
            </h3>
            <ul className="space-y-3 text-sm font-medium text-text-dark/70">
              <li className="hover:text-primary cursor-pointer">
                {t("yourAccount")}
              </li>
              <li className="hover:text-primary cursor-pointer">
                {t("customerService")}
              </li>
              <li className="hover:text-primary cursor-pointer">
                {t("signIn")}
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100">
          <span className="text-[10px] font-black tracking-tight text-text-dark/30 uppercase tracking-[0.4em]">
            CASA DI MODA<span className="text-accent">.</span>
          </span>
        </div>
      </aside>
    </>
  );
}
