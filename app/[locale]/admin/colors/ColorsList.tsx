"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Palette, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

interface Color {
  _id: string;
  name: string;
  hex: string;
}

export default function ColorsList({
  initialColors,
}: {
  initialColors: Color[];
}) {
  const t = useTranslations("admin");
  const [colors, setColors] = useState<Color[]>(initialColors);
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");
  const [saving, setSaving] = useState(false);

  const fetchColors = async () => {
    const res = await apiFetch("/api/admin/colors");
    const data = await res.json();
    setColors(data);
  };

  const openCreate = () => {
    setEditingColor(null);
    setName("");
    setHex("#000000");
    setShowModal(true);
  };

  const openEdit = (color: Color) => {
    setEditingColor(color);
    setName(color.name);
    setHex(color.hex);
    setShowModal(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hex.trim()) return;
    setSaving(true);
    const method = editingColor ? "PUT" : "POST";
    const body = editingColor
      ? { id: editingColor._id, name, hex }
      : { name, hex };
    await apiFetch("/api/admin/colors", {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    setSaving(false);
    setShowModal(false);
    fetchColors();
  };

  const deleteColor = async (id: string) => {
    if (!confirm(t("deleteColorConfirm"))) return;
    await apiFetch(`/api/admin/colors?id=${id}`, { method: "DELETE" });
    fetchColors();
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("colorsTitle")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("colorsRegistered", { count: colors.length })}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-black text-white px-8 py-4 font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> {t("addColor")}
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm p-8">
        {colors.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <Palette size={48} className="text-gray-100" />
            <p className="text-xs font-bold text-text-dark/30 uppercase tracking-[0.2em]">
              {t("noColors")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {colors.map((color) => {
              const isLight = [
                "#f5f5f5",
                "#ffffff",
                "#e5e7eb",
                "#d1d5db",
                "#dbeafe",
                "#e5e4c2",
                "#ddc49a",
              ].includes(color.hex.toLowerCase());
              return (
                <div
                  key={color._id}
                  className="group relative bg-secondary border border-gray-100 overflow-hidden"
                >
                  {/* Swatch */}
                  <div
                    className="h-20 w-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-xs font-black text-primary truncate">
                      {color.name}
                    </p>
                    <p className="text-[10px] font-mono text-text-dark/40 uppercase">
                      {color.hex}
                    </p>
                  </div>
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(color)}
                      className="p-1.5 bg-white/90 hover:bg-white shadow text-primary hover:text-accent transition-colors cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => deleteColor(color._id)}
                      className="p-1.5 bg-white/90 hover:bg-white shadow text-primary hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {/* Light border indicator */}
                  {isLight && (
                    <div className="absolute inset-x-0 top-0 h-20 border border-gray-200 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm shadow-2xl p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-primary tracking-tight">
                {editingColor ? t("editColor") : t("newColor")}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-secondary cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/40 ml-1">
                  {t("colorName")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-secondary border-none p-4 outline-none font-bold text-primary"
                  placeholder={t("colorNamePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/40 ml-1">
                  {t("hexValue")}
                </label>
                <div className="flex gap-3 items-center">
                  {/* Color picker */}
                  <label className="cursor-pointer">
                    <div
                      className="w-14 h-14 border-2 border-gray-200 cursor-pointer"
                      style={{ backgroundColor: hex }}
                    />
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => setHex(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                  <input
                    value={hex}
                    onChange={(e) => setHex(e.target.value)}
                    required
                    pattern="^#[0-9a-fA-F]{3,6}$"
                    className="flex-1 bg-secondary border-none p-4 outline-none font-mono text-sm text-primary"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Live preview */}
              <div className="flex items-center gap-3 p-4 bg-secondary">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 border border-gray-200"
                  style={{ backgroundColor: hex }}
                />
                <span className="font-bold text-sm text-primary">
                  {name || t("colorPreview")}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-secondary transition-all cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-accent text-primary font-black uppercase text-[10px] tracking-widest hover:bg-accent/80 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving
                    ? t("saving")
                    : editingColor
                      ? t("update")
                      : t("addColor")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
