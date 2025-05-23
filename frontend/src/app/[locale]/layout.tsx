import "./styles.css";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";
import { Metadata } from "next";
import { Analytics } from "@/src/components/analytics";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import DeviceProvider from "@/src/hooks/deviceProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://eylexander.xyz"),
  title: {
    default: "eylexander.xyz",
    template: "%s | eylexander.xyz",
  },
  description: "Engineer, student, and sysadmin.",
  openGraph: {
    title: "eylexander.xyz",
    description: "Engineer, student, and sysadmin.",
    url: "https://eylexander.xyz",
    siteName: "eylexander.xyz",
    images: [
      {
        url: "https://eylexander.xyz/content/og.png",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Eylexander",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/favicon.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../../../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={[inter.variable, calSans.variable].join(" ")}
    >
      <head>
        <Analytics />
      </head>
      <body
        className={`bg-black selection:bg-[rgb(253,251,212)] selection:text-[rgb(2,4,43)] ${
          process.env.NODE_ENV === "development" ? "debug-screens" : undefined
        }`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DeviceProvider>{children}</DeviceProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
