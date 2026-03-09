import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import NextTopLoader from "nextjs-toploader";
import { StoreProvider } from "@/utils/context/Store";
import { AuthProvider } from "@/components/AuthProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div lang={locale} dir={dir}>
      <NextIntlClientProvider messages={messages}>
        <AuthProvider>
          <StoreProvider>
            <NextTopLoader color="#c9a96e" showSpinner={false} height={2} />
            {children}
          </StoreProvider>
        </AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
