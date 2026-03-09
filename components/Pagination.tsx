"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
    totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const showMax = 5;

        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + showMax - 1);

        if (end === totalPages) {
            start = Math.max(1, end - showMax + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <Link
                    key={i}
                    href={createPageURL(i)}
                    scroll={false}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold transition-all ${currentPage === i
                        ? "bg-primary text-white shadow-lg scale-110"
                        : "bg-white text-primary hover:bg-secondary border border-gray-100"
                        }`}
                >
                    {i}
                </Link>
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-16">
            <Link
                href={createPageURL(currentPage - 1)}
                scroll={false}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary border border-gray-100 transition-all ${currentPage <= 1 ? "opacity-30 pointer-events-none" : "hover:bg-secondary"
                    }`}
            >
                <ChevronLeft size={16} />
            </Link>

            <div className="flex items-center gap-2">
                {renderPageNumbers()}
            </div>

            <Link
                href={createPageURL(currentPage + 1)}
                scroll={false}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary border border-gray-100 transition-all ${currentPage >= totalPages ? "opacity-30 pointer-events-none" : "hover:bg-secondary"
                    }`}
            >
                <ChevronRight size={16} />
            </Link>
        </div>
    );
}
