"use client";

import ArticleEditor from "@/components/ArticleEditor";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, LogOut, Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export default function NewArticlePage() {
    const { isAuthenticated, logout } = useAuthStore();
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const t = useTranslations("Admin");

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
                <span className="text-sm font-bold tracking-wider text-foreground">Admin</span>
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                        className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
                    >
                        {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                    >
                        <Globe size={13} /> <span className="hidden sm:inline">{t("view_site")}</span>
                    </Link>
                    <button
                        onClick={() => { logout(); router.push("/"); }}
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <LogOut size={13} /> <span className="hidden sm:inline">{t("logout")}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-5"
                    >
                        <ArrowLeft size={13} /> {t("back")}
                    </button>
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-1">{t("new_project")}</p>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{t("create_project")}</h1>
                </div>

                <div className="border border-border rounded-xl bg-card p-4 sm:p-6">
                    <ArticleEditor isNew={true} />
                </div>
            </main>
        </div>
    );
}
