"use client";

import { ThemeOverrides, useTheme } from "@/utils/context/ThemeContext";
import { CheckCircle, Circle, Cloud, CloudOff, Loader2, Palette, RefreshCw, RotateCcw, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

// ─── Radius options ───────────────────────────────────────────────────────────

const RADIUS_OPTIONS = [
  { label: "Sharp", value: "0px", icon: <Square size={13} strokeWidth={2} /> },
  { label: "Soft", value: "4px", icon: <Square size={13} strokeWidth={2} style={{ borderRadius: 3 }} /> },
  { label: "Rounded", value: "12px", icon: <Square size={13} strokeWidth={2} style={{ borderRadius: 6 }} /> },
  { label: "Pill", value: "9999px", icon: <Circle size={13} strokeWidth={2} /> },
];

const RADIUS_FIELDS: { key: keyof ThemeOverrides; label: string }[] = [
  { key: "radiusCard", label: "Product Card" },
  { key: "radiusButton", label: "Button" },
  { key: "radiusBadge", label: "Badge / Tag" },
  { key: "radiusInput", label: "Input" },
];

// ─── Mini card preview ────────────────────────────────────────────────────────

function CardPreview() {
  return (
    <div
      className="w-48 shrink-0 overflow-hidden shadow-lg select-none"
      style={{
        background: "linear-gradient(to bottom, var(--pc-bg-from), var(--pc-bg-to))",
        border: "1px solid var(--pc-border)",
        borderRadius: "var(--radius-card)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="w-3 h-3 rounded-full" style={{ background: "var(--color-accent)", opacity: 0.5 }} />
        <span
          className="text-[8px] uppercase tracking-widest font-bold"
          style={{ color: "var(--color-accent)", opacity: 0.7 }}
        >
          Casa di Moda
        </span>
        <div className="w-3 h-3 rounded-full opacity-20" style={{ background: "var(--pc-header-text)" }} />
      </div>

      {/* Accent separator */}
      <div
        className="h-px"
        style={{
          background: "linear-gradient(to right, transparent, var(--color-accent), transparent)",
          opacity: 0.5,
        }}
      />

      {/* Image area */}
      <div className="h-24 flex items-center justify-center" style={{ background: "var(--pc-image-bg)" }}>
        <div className="w-12 h-16 opacity-20 rounded-sm" style={{ background: "var(--pc-header-text)" }} />
      </div>

      {/* Content */}
      <div className="px-3 py-3 flex flex-col gap-2">
        <div className="h-2 rounded-full w-4/5 opacity-50" style={{ background: "var(--pc-header-text)" }} />
        <div className="h-1.5 rounded-full w-2/5 opacity-25" style={{ background: "var(--pc-muted-text)" }} />

        {/* Price */}
        <div className="flex items-center gap-1 mt-0.5">
          <div className="h-3 w-12 rounded opacity-70" style={{ background: "var(--pc-header-text)" }} />
          <div className="h-2 w-6 rounded opacity-25" style={{ background: "var(--pc-muted-text)" }} />
        </div>

        {/* Size badges */}
        <div className="flex gap-1">
          {["S", "M", "L"].map((s) => (
            <span
              key={s}
              className="text-[8px] px-1.5 py-0.5 font-bold"
              style={{
                background: "var(--pc-badge-bg)",
                border: "1px solid var(--pc-badge-border)",
                color: "var(--pc-badge-text)",
                borderRadius: "var(--radius-badge)",
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* CTA button */}
        <div
          className="w-full py-1.5 text-[8px] font-black uppercase tracking-widest text-center"
          style={{
            background: "var(--btn-primary-bg)",
            color: "var(--btn-primary-text)",
            borderRadius: "var(--radius-button)",
          }}
        >
          Add to Cart
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Save status badge ────────────────────────────────────────────────────────

function SaveStatusBadge({ status }: { status: ReturnType<typeof useTheme>["saveStatus"] }) {
  if (status === "idle") return null;
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 border text-[9px] font-black uppercase tracking-widest transition-all ${
        status === "saving"
          ? "border-white/10 text-white/40"
          : status === "saved"
            ? "border-green-500/30 text-green-400 bg-green-500/10"
            : "border-red-500/30 text-red-400 bg-red-500/10"
      }`}
    >
      {status === "saving" && <Loader2 size={10} className="animate-spin" />}
      {status === "saved" && <Cloud size={10} />}
      {status === "error" && <CloudOff size={10} />}
      {status === "saving" ? "Saving…" : status === "saved" ? "Saved to server" : "Save failed"}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  const { themes, activeTheme, overrides, saveStatus, setTheme, setOverride, resetOverrides, isLoading } = useTheme();
  const [applyingId, setApplyingId] = useState<string | null>(null);

  async function handleApply(themeId: string) {
    setApplyingId(themeId);
    await setTheme(themeId);
    setTimeout(() => setApplyingId(null), 2000);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="space-y-10 max-w-5xl">
      {/* ── Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">{t("themeSettings")}</h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
            {t("themeSettingsSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveStatusBadge status={saveStatus} />
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-2">
            <Palette size={14} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">
              {activeTheme?.name ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Active theme banner ── */}
      {activeTheme && (
        <div className="bg-white/5 border border-white/10 p-5 flex items-center gap-4">
          <div
            className="w-10 h-10 shrink-0 border border-white/10 overflow-hidden"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${activeTheme.preview.bg} 50%, ${activeTheme.preview.accent} 50%)`,
              }}
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">{t("currentTheme")}</p>
            <p className="text-sm font-black text-white">{activeTheme.name}</p>
            <p className="text-[11px] text-white/40 mt-0.5">{activeTheme.description}</p>
          </div>
        </div>
      )}

      {/* ── Theme grid ── */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">{t("selectTheme")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const isActive = activeTheme?.id === theme.id;
            const wasJustApplied = applyingId === theme.id;

            return (
              <div
                key={theme.id}
                className={`group relative border transition-all duration-200 overflow-hidden ${
                  isActive ? "border-accent shadow-lg shadow-accent/10" : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Preview swatch */}
                <div className="h-28 w-full relative" style={{ background: theme.preview.bg }}>
                  <div className="absolute inset-3 flex flex-col gap-1.5">
                    <div className="h-4 rounded-sm opacity-60" style={{ background: theme.preview.surface }} />
                    <div className="flex gap-1.5 flex-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm opacity-40"
                          style={{ background: theme.preview.surface }}
                        />
                      ))}
                    </div>
                    <div className="h-3 w-16 rounded-sm self-end" style={{ background: theme.preview.accent }} />
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 bg-accent text-primary text-[8px] font-black uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                      <CheckCircle size={8} />
                      {t("activeTheme")}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-white/5 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    {[theme.preview.bg, theme.preview.accent, theme.preview.surface].map((c) => (
                      <div key={c} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="text-sm font-black text-white mb-0.5">{theme.name}</p>
                  <p className="text-[10px] text-white/40 leading-relaxed mb-4">{theme.description}</p>

                  <button
                    onClick={() => handleApply(theme.id)}
                    disabled={isActive}
                    className={`w-full py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                      isActive
                        ? "bg-accent/20 text-accent border border-accent/30 cursor-default"
                        : "bg-white/5 border border-white/10 text-white hover:border-accent/50 hover:bg-accent/10 hover:text-accent cursor-pointer"
                    }`}
                  >
                    {wasJustApplied && saveStatus === "saving" ? (
                      <>
                        <Loader2 size={11} className="animate-spin" />
                        Saving…
                      </>
                    ) : wasJustApplied && saveStatus === "saved" ? (
                      <>
                        <CheckCircle size={11} />
                        {t("themeApplied")}
                      </>
                    ) : isActive ? (
                      <>
                        <CheckCircle size={11} />
                        {t("activeTheme")}
                      </>
                    ) : (
                      <>
                        <RefreshCw size={11} />
                        {t("applyTheme")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Border Radius ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Border Radius</p>
          {hasOverrides && (
            <button
              onClick={resetOverrides}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-accent transition-colors cursor-pointer"
            >
              <RotateCcw size={10} />
              Reset to theme defaults
            </button>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 divide-y divide-white/5">
          {RADIUS_FIELDS.map(({ key, label }) => {
            // Effective value: override ?? active theme default
            const themeDefault =
              activeTheme?.borderRadius[
                key.replace("radius", "").toLowerCase() as keyof typeof activeTheme.borderRadius
              ] ?? "0px";
            const effective = overrides[key] ?? themeDefault;

            return (
              <div key={key} className="flex items-center justify-between px-5 py-4 gap-4 flex-wrap">
                <div className="w-28 shrink-0">
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-[9px] text-white/30 font-mono mt-0.5">{effective}</p>
                </div>

                <div className="flex items-center gap-2">
                  {RADIUS_OPTIONS.map((opt) => {
                    const isSelected = effective === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setOverride(key, opt.value)}
                        title={opt.label}
                        className={`flex flex-col items-center gap-1 px-3 py-2 border transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/70"
                        }`}
                        style={{
                          borderRadius: isSelected ? "2px" : "2px",
                        }}
                      >
                        <span style={{ borderRadius: opt.value === "9999px" ? "9999px" : opt.value }}>{opt.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Mini visual preview of radius */}
                <div
                  className="w-10 h-10 shrink-0 border-2 transition-all"
                  style={{
                    borderRadius: effective,
                    borderColor: "var(--color-accent)",
                    background: "var(--color-accent)",
                    opacity: 0.25,
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Live Product Card Preview ── */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Product Card Preview</p>

        <div className="bg-white/5 border border-white/10 p-8 flex flex-col sm:flex-row items-center justify-center gap-8">
          <CardPreview />

          <div className="text-xs text-white/40 space-y-2 max-w-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-3">Live Preview</p>
            <p className="leading-relaxed">
              This card reflects the active theme&apos;s colors and your current border radius overrides — in real time.
            </p>
            <p className="leading-relaxed">
              Changes apply instantly across the whole storefront without a page reload.
            </p>
            {hasOverrides && (
              <p className="text-[9px] font-bold text-amber-400/70 uppercase tracking-widest mt-4">
                Custom overrides active — radius differs from theme defaults.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <div className="bg-accent/5 border border-accent/15 p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">{t("themeHowItWorks")}</p>
        <p className="text-xs text-white/40 leading-relaxed">{t("themeHowItWorksDesc")}</p>
      </div>

      {/* ── Token reference ── */}
      {activeTheme && (
        <section className="bg-white/5 border border-white/10">
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-sm font-black text-white">{t("themeTokens")}</p>
            <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">{t("themeTokensDesc")}</p>
          </div>

          {/* Colors */}
          <div className="divide-y divide-white/5">
            {Object.entries(activeTheme.colors).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-sm border border-white/10 shrink-0" style={{ background: value }} />
                  <code className="text-xs text-white/60 font-mono">
                    --color-{key.replace(/([A-Z])/g, "-$1").toLowerCase()}
                  </code>
                </div>
                <code className="text-[10px] text-accent font-mono">{value}</code>
              </div>
            ))}
          </div>

          {/* Border radius */}
          <div className="border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 px-6 py-3">Border Radius</p>
            <div className="divide-y divide-white/5">
              {RADIUS_FIELDS.map(({ key }) => {
                const themeDefault =
                  activeTheme.borderRadius[
                    key.replace("radius", "").toLowerCase() as keyof typeof activeTheme.borderRadius
                  ] ?? "0px";
                const effective = overrides[key] ?? themeDefault;
                const isOverridden = overrides[key] !== undefined && overrides[key] !== themeDefault;
                return (
                  <div key={key} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 border border-white/10 shrink-0"
                        style={{ background: "var(--color-accent)", opacity: 0.3, borderRadius: effective }}
                      />
                      <code className="text-xs text-white/60 font-mono">
                        --radius-{key.replace("radius", "").toLowerCase()}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverridden && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-400/70 border border-amber-400/20 px-1.5 py-0.5">
                          custom
                        </span>
                      )}
                      <code className="text-[10px] text-accent font-mono">{effective}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product card tokens */}
          <div className="border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 px-6 py-3">Product Card</p>
            <div className="divide-y divide-white/5">
              {Object.entries(activeTheme.productCard).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    {value.startsWith("#") || value.startsWith("rgba") ? (
                      <div
                        className="w-5 h-5 rounded-sm border border-white/10 shrink-0"
                        style={{ background: value }}
                      />
                    ) : (
                      <div className="w-5 h-5 shrink-0" />
                    )}
                    <code className="text-xs text-white/60 font-mono">
                      --pc-{key.replace(/([A-Z])/g, "-$1").toLowerCase()}
                    </code>
                  </div>
                  <code className="text-[10px] text-accent font-mono max-w-[160px] truncate text-right">{value}</code>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
