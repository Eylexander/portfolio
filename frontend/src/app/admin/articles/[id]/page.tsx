"use client";

import { useEffect, useState } from "react";
import ArticleEditor from "@/components/ArticleEditor";
import { useRouter, useParams } from "next/navigation";
import { Article } from "@/types";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function EditArticlePage() {
    const { id } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslations("Admin");

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const articles = await apiClient.getArticles(true);
                const found = articles.find((a: Article) => a.id === id || a.slug === id);
                if (found) {
                    setArticle(found);
                } else {
                    toast.error("Project not found");
                }
            } catch {
                toast.error("Failed to fetch project");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchArticle();
    }, [id]);

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-5"
                    >
                        <ArrowLeft size={13} /> {t("back")}
                    </Link>
                    {!loading && article && (
                        <>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-1">{t("edit_project")}</p>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{article.title?.["en-US"] || article.title?.["fr-FR"] || "Untitled"}</h1>
                        </>
                    )}
                    {!loading && !article && (
                        <>
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-1">{t("edit_project")}</p>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Project not found</h1>
                        </>
                    )}
                </div>

                {loading ? (
                    <Loader size="md" className="py-16" />
                ) : !article ? (
                    <div className="border border-border rounded-xl bg-card p-8 sm:p-16 text-center text-sm text-muted-foreground">
                        Project not found.{" "}
                        <Link href="/admin/dashboard" className="text-primary hover:underline">Go back to dashboard</Link>
                    </div>
                ) : (
                    <div className="border border-border rounded-xl bg-card p-4 sm:p-6">
                        <ArticleEditor initialData={article} isNew={false} />
                    </div>
                )}
            </main>
        </div>
    );
}
