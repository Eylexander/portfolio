import { Link } from "@/src/i18n/navigation";
import React from "react";
import { use } from "react";
import { Locale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Galaxy from "@/src/components/galaxy";
import Trail from "@/src/components/trail";

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
        <nav className="my-16">
          <ul className="flex items-center justify-center gap-4">
            <Trail 
              fromDirection="top" 
              distance={30}
              friction={300}
              delay={300}
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base duration-500 text-zinc-500 hover:text-zinc-300"
                >
                  {item.name}
                </Link>
              ))}
            </Trail>
          </ul>
        </nav>

        <Galaxy
          className="absolute inset-0 -z-10"
          quantity={300}
          colorful={false}
          nebulaFrequency={1500}
          nebulaIntensity={1.2}
          nebulaFadeDuration={5}
          nebulaColors={[
            "rgba(97, 95, 255, 0.3)",
            "rgba(0, 188, 125, 0.3)",
            "rgba(246, 51, 154, 0.3)",
          ]}
        />

        {/* <div className="hidden w-screen h-px md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" /> */}

        <Trail 
          fromDirection="center-expand" 
          delay={150} 
          distance={40}
          tension={1000}
          staggerDelay={100}
        >
          <div className="py-3.5 px-0.5 z-10 text-4xl text-transparent bg-white font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text text-glow">
            eylexander
          </div>
        </Trail>

        {/* <div className="hidden w-screen h-px md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" /> */}

        <Trail 
          fromDirection="bottom" 
          delay={300}
          distance={30}
          tension={1000}
        >
          <div className="my-16 text-center">
            <h2 className="text-base text-zinc-500">{t("home.description")}</h2>
          </div>
        </Trail>
      </div>
  );
}
