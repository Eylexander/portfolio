"use client";

import ArticleEditor from "@/components/ArticleEditor";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NewArticlePage() {
    const router = useRouter();
    const t = useTranslations("Admin");

    return (
        <div className="min-h-screen bg-background">
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
