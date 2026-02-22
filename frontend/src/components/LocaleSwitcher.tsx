"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const locales: { code: "en-US" | "fr-FR"; label: string }[] = [
  { code: "en-US", label: "EN" },
  { code: "fr-FR", label: "FR" },
];

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleLocaleChange = (newLocale: "en-US" | "fr-FR") => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <div className="flex items-center bg-background/50 backdrop-blur-sm border border-border/40 rounded-full p-0.5 gap-0.5 shadow-sm">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => handleLocaleChange(l.code)}
          className={`relative px-3 py-1 text-xs font-bold tracking-wider transition-colors duration-200 rounded-full overflow-hidden ${
            locale === l.code
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="relative z-10">{l.label}</span>
          {locale === l.code && (
            <motion.div
              layoutId="activeLocale"
              className="absolute inset-0 bg-primary z-0 rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
