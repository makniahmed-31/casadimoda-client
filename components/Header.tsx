"use client";

import { useEffect, useRef, useState } from "react";
import AnnouncementBar from "./header/AnnouncementBar";
import Navbar from "./header/Navbar";
import Sidebar from "./header/Sidebar";
import TopBar from "./header/TopBar";

interface HeaderProps {
  categories: string[];
  brands: string[];
  categoryMap: Record<string, string[]>;
}

export default function Header({ categories, brands, categoryMap }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty("--header-height", `${headerRef.current.offsetHeight}px`);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className="flex flex-col font-sans shadow-sm relative sticky top-0 z-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categories={categories}
        brands={brands}
        categoryMap={categoryMap}
      />
      <AnnouncementBar />
      <TopBar />
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
    </header>
  );
}
