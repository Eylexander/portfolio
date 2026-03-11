"use client";

import { useEffect, useState } from "react";
import ArticleEditor from "@/components/ArticleEditor";
import { useParams } from "next/navigation";
import { Article } from "@/types";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function EditArticlePage() {
    const { id } = useParams();
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
        <div className="h-full flex flex-col overflow-hidden bg-background">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader size="md" />
                </div>
            ) : !article ? (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground gap-1">
                    {t("edit_project")} — project not found.{" "}
                    <Link href="/admin/dashboard" className="text-primary hover:underline">{t("back")}</Link>
                </div>
            ) : (
                <ArticleEditor initialData={article} isNew={false} backHref="/admin/dashboard" />
            )}
        </div>
    );
}
