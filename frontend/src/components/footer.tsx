import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";

export const Footer: React.FC = () => {
  const t = useTranslations("navigation");

  return (
    <footer className="relative z-10 flex flex-col items-center justify-center w-full h-20 gap-1">
      <p className="text-sm text-zinc-500 select-none">
        © {new Date().getFullYear()} eylexander
      </p>
      <Link href="/legal" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors" rel="noreferrer" target="_blank">
        {t("legal")}
      </Link>
    </footer>
  );
};
