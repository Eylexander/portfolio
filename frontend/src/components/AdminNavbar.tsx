"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Globe, FolderOpenDot, LogOut } from "lucide-react";

export default function AdminNavbar() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("Admin");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
      >
        <span className="text-sm font-bold tracking-wider text-foreground">Admin</span>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
        >
          {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <Link
          href="/about"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
        >
          <Globe size={13} /> <span className="hidden sm:inline">About</span>
        </Link>
        <Link
          href="/projects"
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
        >
          <FolderOpenDot size={13} /> <span className="hidden sm:inline">Projects</span>
        </Link>
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut size={13} /> <span className="hidden sm:inline">{t("logout")}</span>
        </button>
      </div>
    </header>
  );
}
