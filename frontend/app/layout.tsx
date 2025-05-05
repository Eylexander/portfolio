import "../global.css";
import AnimatedCursor from "react-animated-cursor";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";
import { Metadata } from "next";
import { Analytics } from "./components/analytics";

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
        url: "https://chronark.com/og.png",
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
  src: "../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
      <head>
        <Analytics />
      </head>
      <body
        className={`bg-black selection:bg-[rgb(253,251,212)] selection:text-[rgb(2,4,43)] ${
          process.env.NODE_ENV === "development" ? "debug-screens" : undefined
        }`}
      >
        <AnimatedCursor
          color="253,251,212"
          innerSize={8}
          innerScale={1}
          innerStyle={{
        backgroundColor: "rgb(253,251,212)",
        mixBlendMode: "difference",
          }}
          outerSize={35}
          outerScale={2}
          outerAlpha={0}
          outerStyle={{
        border: "3px solid rgb(253,251,212)",
        mixBlendMode: "difference",
          }}
          showSystemCursor={false}
        />
        {children}
      </body>
    </html>
  );
}
