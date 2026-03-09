"use client";

import { User } from "@/types";
import {
  Search,
  Filter,
  Shield,
  ShieldAlert,
  Mail,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function UsersList({ initialUsers }: { initialUsers: User[] }) {
  const t = useTranslations("admin");
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("usersTitle")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("usersSubtitle")}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-6 lg:p-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dark/20"
              size={18}
            />
            <input
              className="w-full bg-secondary border-none  py-4 pl-12 pr-4 outline-none font-bold text-primary placeholder:text-gray-300"
              placeholder={t("searchMembers")}
            />
          </div>
          <button className="bg-secondary px-6 py-4  flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all cursor-pointer">
            <Filter size={16} /> {t("filters")}
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("memberDetails")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("contact")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("status")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("joinedDate")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialUsers.map((user) => (
                <tr
                  key={user._id}
                  className="group hover:bg-secondary/10 transition-colors"
                >
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-accent font-black text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-primary text-sm leading-tight mb-1">
                          {user.name}
                        </p>
                        <p className="text-[10px] font-bold text-text-dark/30 uppercase tracking-widest">
                          ID: {user._id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-text-dark/60">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>
                  <td className="py-6">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center gap-2 text-[10px] font-black text-accent bg-accent/5 px-4 py-2  uppercase tracking-widest border border-accent/10">
                        <Shield size={12} /> {t("administrator")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-[10px] font-bold text-text-dark/40 bg-secondary px-4 py-2  uppercase tracking-widest">
                        {t("member")}
                      </span>
                    )}
                  </td>
                  <td className="py-6">
                    <span className="text-xs font-bold text-text-dark/50 flex items-center gap-2">
                      <Calendar size={14} className="text-text-dark/30" />
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
