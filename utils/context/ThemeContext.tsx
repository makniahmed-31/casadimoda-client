"use client";

import { apiFetch } from "@/utils/api";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  accentHover: string;
  background: string;
  foreground: string;
  dark: string;
  textDark: string;
  marigold: string;
  oxfordBlue: string;
}

export interface ThemeBorderRadius {
  card: string;
  button: string;
  badge: string;
  input: string;
}

export interface ThemeProductCard {
  bgFrom: string;
  bgTo: string;
  border: string;
  hoverShadow: string;
  headerText: string;
  mutedText: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  imageBg: string;
}

export interface ThemeButton {
  primaryBg: string;
  primaryText: string;
  primaryBorder: string;
  primaryHoverBg: string;
  secondaryBg: string;
  secondaryText: string;
  secondaryBorder: string;
  secondaryHoverBorder: string;
}

export interface ThemeCard {
  bg: string;
  border: string;
  hoverBorder: string;
  text: string;
  mutedText: string;
}

export interface ThemeInput {
  bg: string;
  border: string;
  focusBorder: string;
  text: string;
  placeholder: string;
}

export interface ThemeTypography {
  fontSans: string;
  fontSerif: string;
  fontMono: string;
  headingWeight: string;
  bodyWeight: string;
}

export interface ThemeScrollbar {
  thumb: string;
  thumbHover: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: { bg: string; accent: string; surface: string };
  colors: ThemeColors;
  borderRadius: ThemeBorderRadius;
  productCard: ThemeProductCard;
  button: ThemeButton;
  card: ThemeCard;
  input: ThemeInput;
  typography: ThemeTypography;
  scrollbar: ThemeScrollbar;
}

// ─── Overrides (admin-adjustable on top of the active theme) ──────────────────

export interface ThemeOverrides {
  radiusCard?: string;
  radiusButton?: string;
  radiusBadge?: string;
  radiusInput?: string;
}

// ─── SiteConfig shape returned by the server ─────────────────────────────────

interface ServerSiteConfig {
  activeThemeId: string;
  borderRadiusOverrides: ThemeOverrides;
  productCardOverrides: Partial<ThemeProductCard>;
  updatedAt: string;
}

// ─── CSS Variable Application ─────────────────────────────────────────────────

function applyThemeToDom(theme: Theme, overrides: ThemeOverrides = {}, pcOverrides: Partial<ThemeProductCard> = {}) {
  const root = document.documentElement;

  // Core colors (Tailwind @theme)
  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-accent", theme.colors.accent);
  root.style.setProperty("--color-accent-hover", theme.colors.accentHover);
  root.style.setProperty("--color-text-dark", theme.colors.textDark);
  root.style.setProperty("--color-dark", theme.colors.dark);
  root.style.setProperty("--color-marigold", theme.colors.marigold);
  root.style.setProperty("--color-oxford-blue", theme.colors.oxfordBlue);
  root.style.setProperty("--background", theme.colors.background);
  root.style.setProperty("--foreground", theme.colors.foreground);

  // Border radius — override > theme default
  root.style.setProperty("--radius-card", overrides.radiusCard ?? theme.borderRadius.card);
  root.style.setProperty("--radius-button", overrides.radiusButton ?? theme.borderRadius.button);
  root.style.setProperty("--radius-badge", overrides.radiusBadge ?? theme.borderRadius.badge);
  root.style.setProperty("--radius-input", overrides.radiusInput ?? theme.borderRadius.input);

  // Product card — pcOverride > theme default
  const pc = theme.productCard;
  root.style.setProperty("--pc-bg-from", pcOverrides.bgFrom ?? pc.bgFrom);
  root.style.setProperty("--pc-bg-to", pcOverrides.bgTo ?? pc.bgTo);
  root.style.setProperty("--pc-border", pcOverrides.border ?? pc.border);
  root.style.setProperty("--pc-hover-shadow", pcOverrides.hoverShadow ?? pc.hoverShadow);
  root.style.setProperty("--pc-header-text", pcOverrides.headerText ?? pc.headerText);
  root.style.setProperty("--pc-muted-text", pcOverrides.mutedText ?? pc.mutedText);
  root.style.setProperty("--pc-badge-bg", pcOverrides.badgeBg ?? pc.badgeBg);
  root.style.setProperty("--pc-badge-border", pcOverrides.badgeBorder ?? pc.badgeBorder);
  root.style.setProperty("--pc-badge-text", pcOverrides.badgeText ?? pc.badgeText);
  root.style.setProperty("--pc-image-bg", pcOverrides.imageBg ?? pc.imageBg);

  // Button tokens
  root.style.setProperty("--btn-primary-bg", theme.button.primaryBg);
  root.style.setProperty("--btn-primary-text", theme.button.primaryText);
  root.style.setProperty("--btn-primary-border", theme.button.primaryBorder);
  root.style.setProperty("--btn-primary-hover-bg", theme.button.primaryHoverBg);
  root.style.setProperty("--btn-secondary-bg", theme.button.secondaryBg);
  root.style.setProperty("--btn-secondary-text", theme.button.secondaryText);
  root.style.setProperty("--btn-secondary-border", theme.button.secondaryBorder);
  root.style.setProperty("--btn-secondary-hover-border", theme.button.secondaryHoverBorder);

  // Card tokens
  root.style.setProperty("--card-bg", theme.card.bg);
  root.style.setProperty("--card-border", theme.card.border);
  root.style.setProperty("--card-hover-border", theme.card.hoverBorder);
  root.style.setProperty("--card-text", theme.card.text);
  root.style.setProperty("--card-muted-text", theme.card.mutedText);

  // Input tokens
  root.style.setProperty("--input-bg", theme.input.bg);
  root.style.setProperty("--input-border", theme.input.border);
  root.style.setProperty("--input-focus-border", theme.input.focusBorder);
  root.style.setProperty("--input-text", theme.input.text);
  root.style.setProperty("--input-placeholder", theme.input.placeholder);

  // Typography
  root.style.setProperty("--font-sans", theme.typography.fontSans);
  root.style.setProperty("--font-serif", theme.typography.fontSerif);
  root.style.setProperty("--font-mono", theme.typography.fontMono);
  root.style.setProperty("--heading-weight", theme.typography.headingWeight);

  // Scrollbar
  root.style.setProperty("--scrollbar-thumb", theme.scrollbar.thumb);
  root.style.setProperty("--scrollbar-thumb-hover", theme.scrollbar.thumbHover);

  root.setAttribute("data-theme", theme.id);
}

// ─── Server persistence helpers ───────────────────────────────────────────────

async function persistSiteConfig(payload: {
  activeThemeId?: string;
  borderRadiusOverrides?: ThemeOverrides;
  productCardOverrides?: Partial<ThemeProductCard>;
}): Promise<void> {
  try {
    await apiFetch("/api/admin/site-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently ignore — user may not be admin or server may be offline
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DEFAULT_THEME_ID = "dark-luxe";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ThemeContextValue {
  themes: Theme[];
  activeTheme: Theme | null;
  overrides: ThemeOverrides;
  pcOverrides: Partial<ThemeProductCard>;
  saveStatus: SaveStatus;
  setTheme: (themeId: string) => Promise<void>;
  setOverride: (key: keyof ThemeOverrides, value: string) => void;
  setPcOverride: (key: keyof ThemeProductCard, value: string) => void;
  resetOverrides: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  themes: [],
  activeTheme: null,
  overrides: {},
  pcOverrides: {},
  saveStatus: "idle",
  setTheme: async () => {},
  setOverride: () => {},
  setPcOverride: () => {},
  resetOverrides: async () => {},
  isLoading: true,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [overrides, setOverrides] = useState<ThemeOverrides>({});
  const [pcOverrides, setPcOverrides] = useState<Partial<ThemeProductCard>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);

  // Debounce timer ref for override changes
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load themes.json + server siteConfig in parallel
  useEffect(() => {
    Promise.all([
      fetch("/themes.json").then((r) => r.json()) as Promise<{ themes: Theme[] }>,
      apiFetch("/api/site-config")
        .then((r) => r.json())
        .catch(() => null) as Promise<ServerSiteConfig | null>,
    ])
      .then(([themesData, serverConfig]) => {
        const allThemes = themesData.themes;
        setThemes(allThemes);

        const themeId = serverConfig?.activeThemeId ?? DEFAULT_THEME_ID;
        const radOverrides: ThemeOverrides = serverConfig?.borderRadiusOverrides ?? {};
        const cardOverrides: Partial<ThemeProductCard> = serverConfig?.productCardOverrides ?? {};

        const resolved = allThemes.find((t) => t.id === themeId) ?? allThemes[0];

        setActiveThemeId(resolved.id);
        setOverrides(radOverrides);
        setPcOverrides(cardOverrides);
        applyThemeToDom(resolved, radOverrides, cardOverrides);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // ── setTheme: instant apply + persist to server ─────────────────────────────
  const setTheme = useCallback(
    async (themeId: string) => {
      const theme = themes.find((t) => t.id === themeId);
      if (!theme) return;

      // Instant DOM apply
      applyThemeToDom(theme, overrides, pcOverrides);
      setActiveThemeId(themeId);

      // Persist
      setSaveStatus("saving");
      try {
        await apiFetch("/api/admin/site-config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activeThemeId: themeId,
            borderRadiusOverrides: overrides,
            productCardOverrides: pcOverrides,
          }),
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      } finally {
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    },
    [themes, overrides, pcOverrides]
  );

  // ── setOverride: instant apply + debounced persist ──────────────────────────
  const setOverride = useCallback(
    (key: keyof ThemeOverrides, value: string) => {
      const next = { ...overrides, [key]: value };
      setOverrides(next);

      // Immediate DOM apply
      document.documentElement.style.setProperty(`--radius-${key.replace("radius", "").toLowerCase()}`, value);

      // Debounced server persist
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSaveStatus("saving");
      debounceTimer.current = setTimeout(async () => {
        try {
          await persistSiteConfig({ borderRadiusOverrides: next });
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        } finally {
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      }, 600);
    },
    [overrides]
  );

  // ── setPcOverride: instant apply + debounced persist ────────────────────────
  const setPcOverride = useCallback(
    (key: keyof ThemeProductCard, value: string) => {
      const next = { ...pcOverrides, [key]: value };
      setPcOverrides(next);

      // Map key to CSS variable name
      const cssKey = `--pc-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      document.documentElement.style.setProperty(cssKey, value);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSaveStatus("saving");
      debounceTimer.current = setTimeout(async () => {
        try {
          await persistSiteConfig({ productCardOverrides: next });
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        } finally {
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      }, 600);
    },
    [pcOverrides]
  );

  // ── resetOverrides: clear all, apply theme defaults, persist ────────────────
  const resetOverrides = useCallback(async () => {
    const theme = themes.find((t) => t.id === activeThemeId);
    if (!theme) return;

    setOverrides({});
    setPcOverrides({});
    applyThemeToDom(theme, {}, {});

    setSaveStatus("saving");
    try {
      await persistSiteConfig({
        borderRadiusOverrides: {},
        productCardOverrides: {},
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  }, [themes, activeThemeId]);

  const activeTheme = themes.find((t) => t.id === activeThemeId) ?? null;

  return (
    <ThemeContext.Provider
      value={{
        themes,
        activeTheme,
        overrides,
        pcOverrides,
        saveStatus,
        setTheme,
        setOverride,
        setPcOverride,
        resetOverrides,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}
