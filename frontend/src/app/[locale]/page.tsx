import { Link } from "@/src/i18n/navigation";
import React from "react";
import { use } from "react";
import Particles from "@/src/components/particles";
import { Locale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Galaxy from "@/src/components/galaxy";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default function Home({ params }: Props) {
  const { locale } = use(params);
  const t = useTranslations();

  setRequestLocale(locale);

  const navigation = [
    { name: t("navigation.projects"), href: "/projects" },
    { name: t("navigation.about"), href: "/about" },
    { name: t("navigation.contact"), href: "/contact" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <nav className="my-16 animate-fade-in">
        <ul className="flex items-center justify-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base duration-500 text-zinc-500 hover:text-zinc-300"
            >
              {item.name}
            </Link>
          ))}
        </ul>
      </nav>
      <div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

      {/* <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={300}
        colorful={false}
      /> */}

      <Galaxy
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={300} // Adjust number of stars
        staticity={50}
        ease={30}
        colorful={false}
        // Nebula configuration
        enableNebula={true}
        nebulaFrequency={1500} // One flash roughly every second
        nebulaIntensity={1.2} // Slightly more intense than default
        nebulaFadeDuration={5} // Make nebulas stay 2.5x longer on screen
        nebulaColors={[
          "rgba(64, 0, 255, 0.3)",    // Deep Blue
          "rgba(138, 43, 226, 0.3)",  // Purple
          "rgba(255, 0, 255, 0.3)",   // Pink
          "rgba(0, 255, 127, 0.3)",   // Green
        ]}
/>

      <h1 className="py-3.5 px-0.5 z-10 text-4xl text-transparent duration-1000 bg-white animate-title-alt font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
        eylexander
      </h1>

      <div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      <div className="my-16 text-center animate-fade-in">
        <h2 className="text-base text-zinc-500 ">{t("home.description")}</h2>
      </div>
    </div>
  );
}
