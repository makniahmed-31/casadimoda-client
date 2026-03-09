"use client";

import { Link } from "@/i18n/routing";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useStore } from "@/utils/context/Store";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingCart, Heart, User, Bell } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import Image from "next/image";
import { apiFetch } from "@/utils/api";

export default function TopBar() {
  const t = useTranslations("nav");
  const { state } = useStore();
  const { cart } = state;
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [bump, setBump] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [orderCount, setOrderCount] = useState(0);
  const sessionUser = session?.user as {
    role?: string;
    isAdmin?: boolean;
  } | null;
  const isAdminOrSupplier =
    sessionUser?.isAdmin || sessionUser?.role === "supplier" || sessionUser?.role === "transporter";

  useEffect(() => {
    if (!isAdminOrSupplier) return;
    const fetchOrderCount = async () => {
      try {
        const endpoint = sessionUser?.isAdmin
          ? "/api/admin/orders?status=active&pageSize=1"
          : "/api/supplier/orders?status=active&pageSize=1";
        const res = await apiFetch(endpoint);
        const data = await res.json();
        setOrderCount(data.activeCount || 0);
      } catch {
        // silently ignore
      }
    };
    fetchOrderCount();
    const interval = setInterval(fetchOrderCount, 60000);
    return () => clearInterval(interval);
  }, [isAdminOrSupplier, sessionUser?.isAdmin]);

  const cartQuantity = cart.cartItems.reduce(
    (a: number, c: { quantity: number }) => a + c.quantity,
    0,
  );

  useEffect(() => {
    if (cartQuantity === 0) return;
    const bumper = setTimeout(() => setBump(true), 0);
    const timer = setTimeout(() => setBump(false), 300);
    return () => {
      clearTimeout(bumper);
      clearTimeout(timer);
    };
  }, [cartQuantity]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await apiFetch(
            `/api/search?q=${encodeURIComponent(searchQuery)}&pageSize=5`,
          );
          const data = await res.json();
          setSearchResults(data.products || []);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search fetch error", error);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setShowSearch(false);
      }
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setShowSearch(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className="relative z-50 bg-[radial-gradient(circle_at_center,_#1e1e1d_0%,_#1e1e1d_25%,_#000_75%)]">
        {/* Gold accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left Nav */}
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-xs font-medium tracking-wide text-secondary hover:text-accent transition-colors underline underline-offset-4 decoration-accent"
              >
                {t("home")}
              </Link>
              <Link
                href="/products"
                className="text-xs font-medium tracking-wide text-secondary/70 hover:text-accent transition-colors"
              >
                {t("shop")}
              </Link>
              <Link
                href="/wholesale"
                className="text-xs font-medium tracking-wide text-secondary/70 hover:text-accent transition-colors"
              >
                {t("wholesale")}
              </Link>
              {/* Language Switcher */}
              <LanguageSwitcher />
            </nav>

            {/* Center Logo */}
            <Link
              href="/"
              className="hidden md:block absolute left-1/2 -translate-x-1/2"
            >
              <h1 className="font-serif text-xl md:text-2xl tracking-[0.01em] lg:tracking-[0.15em] text-accent whitespace-nowrap">
                CASA DI MODA
              </h1>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-3 md:gap-5 ml-auto">
              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-secondary/70 hover:text-accent transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>

              {/* Account */}
              <div
                ref={accountMenuRef}
                className="relative"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <button className="flex items-center gap-1.5 text-secondary/70 hover:text-accent transition-colors cursor-pointer">
                  <User className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  <span className="hidden md:inline text-xs font-medium">
                    {session?.user ? session.user.name : t("login")}
                  </span>
                </button>

                {/* Account Dropdown */}
                <div
                  className={`absolute top-full bg-secondary right-0 w-56 mt-2 shadow-2xl overflow-hidden transition-all duration-300 z-[100] border border-gray-100 cursor-default ${showAccountMenu ? "opacity-100 visible" : "opacity-0 invisible"}`}
                >
                  {session?.user ? (
                    <>
                      <div className="p-4 border-b border-gray-50 bg-secondary/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1">
                          {t("signedInAs")}
                        </p>
                        <p className="text-sm font-bold text-primary truncate">
                          {session.user.name}
                        </p>
                      </div>
                      <div className="flex flex-col py-1">
                        {session.user.isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setShowAccountMenu(false)}
                            className="px-4 py-2.5 text-xs font-medium text-primary hover:bg-accent hover:text-secondary transition-colors"
                          >
                            {t("adminDashboard")}
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setShowAccountMenu(false)}
                          className="px-4 py-2.5 text-xs font-medium text-primary hover:bg-accent hover:text-secondary transition-colors"
                        >
                          {t("myProfile")}
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setShowAccountMenu(false)}
                          className="px-4 py-2.5 text-xs font-medium text-primary hover:bg-accent hover:text-secondary transition-colors"
                        >
                          {t("myOrders")}
                        </Link>
                        <div className="h-px bg-gray-100 mx-4 my-1" />
                        <button
                          onClick={() => signOut()}
                          className="mx-4 my-2 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest  hover:bg-accent transition-all cursor-pointer"
                        >
                          {t("logout")}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 border-b border-gray-50">
                        <Link
                          href="/login"
                          onClick={() => setShowAccountMenu(false)}
                          className="block w-full py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest  hover:bg-accent transition-all text-center"
                        >
                          {t("login")}
                        </Link>
                        <p className="text-[10px] text-secondary/50 mt-2 text-center">
                          {t("newCustomer")}{" "}
                          <Link
                            href="/register"
                            onClick={() => setShowAccountMenu(false)}
                            className="text-accent font-bold hover:underline"
                          >
                            {t("createAccount")}
                          </Link>
                        </p>
                      </div>
                      <div className="flex flex-col py-1">
                        <Link
                          href="/orders"
                          onClick={() => setShowAccountMenu(false)}
                          className="px-4 py-2.5 text-xs font-medium text-primary hover:bg-accent hover:text-secondary transition-colors"
                        >
                          {t("orders")}
                        </Link>
                        <Link
                          href="/become-supplier"
                          onClick={() => setShowAccountMenu(false)}
                          className="px-4 py-2.5 text-xs font-medium text-primary hover:bg-accent hover:text-secondary transition-colors"
                        >
                          {t("becomeSupplier")}
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Favorites */}
              <Link
                href="/products"
                className="hidden md:flex items-center gap-1.5 text-secondary/70 hover:text-accent transition-colors"
              >
                <Heart className="w-[18px] h-[18px]" />
                <span className="text-xs font-medium">{t("favorites")}</span>
              </Link>

              {/* Cart (customers) / Notifications (admin & supplier) */}
              {isAdminOrSupplier ? (
                <Link
                  href={
                    sessionUser?.isAdmin
                      ? "/admin/orders"
                      : sessionUser?.role === "transporter"
                      ? "/transporter"
                      : "/fournisseur/orders"
                  }
                  className="flex items-center gap-1.5 text-secondary/70 hover:text-accent transition-colors group"
                >
                  <div className="relative">
                    <Bell className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    {orderCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {orderCount > 99 ? "99+" : orderCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:inline text-xs font-medium">
                    {t("orders")}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/cart"
                  className="flex items-center gap-1.5 text-secondary/70 hover:text-accent transition-colors group"
                >
                  <div className="relative" data-cart-icon>
                    <ShoppingCart className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    {cartQuantity > 0 && (
                      <span
                        className={`absolute -top-1.5 -right-1.5 bg-accent text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ${
                          bump ? "scale-150" : "scale-100"
                        }`}
                      >
                        {cartQuantity}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:inline text-xs font-medium">
                    {t("cart")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {showSearch && (
        <div
          ref={dropdownRef}
          className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 relative z-40"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex h-10  overflow-hidden border border-gray-200 focus-within:border-accent">
              <input
                type="text"
                className="flex-grow px-4 text-primary text-sm outline-none placeholder:text-gray-400"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                autoFocus
              />
              <button
                onClick={handleSearchSubmit}
                className="bg-primary hover:bg-accent px-5 flex items-center justify-center cursor-pointer transition-all text-white"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full bg-white shadow-2xl border border-gray-100 overflow-hidden z-[100]">
                <div className="max-w-2xl mx-auto">
                  <ul className="divide-y divide-gray-50">
                    {searchResults.map((product) => (
                      <li key={product._id}>
                        <Link
                          href={`/product/${product.slug}`}
                          className="flex items-center gap-4 p-3 hover:bg-secondary/50 transition-all"
                          onClick={() => {
                            setShowDropdown(false);
                            setShowSearch(false);
                          }}
                        >
                          <div className="relative w-10 h-10  overflow-hidden flex-shrink-0 border border-gray-100">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized={true}
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="text-sm font-medium text-primary truncate">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-primary/40 uppercase tracking-wider">
                              {product.brand}
                            </p>
                          </div>
                          <div className="text-xs font-bold text-accent">
                            $
                            {(
                              product.discountPrice || product.price
                            ).toLocaleString()}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full p-2.5 bg-secondary/50 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-accent hover:text-white transition-colors cursor-pointer"
                  >
                    {t("viewAllResults")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
