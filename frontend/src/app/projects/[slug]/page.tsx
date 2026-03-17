"use client";

import { useEffect, useState } from "react";
import { Article } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import apiClient from "@/lib/api-client";
import { PageLoader } from "@/components/Loader";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Edit2 } from "lucide-react";

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const locale = useLocale() as "en-US" | "fr-FR";
  const dateFnsLocale = locale === "fr-FR" ? fr : enUS;
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!slug) return;
    const fetchArticle = async () => {
      try {
        const data = await apiClient.getArticle(slug as string);
        setArticle(data);
      } catch {
        setError("Project not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      
      <PageLoader />
    </div>
  );

  if (error || !article) return (
    <div className="min-h-screen bg-background">
      
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">{error || "Not found"}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pt-28 pb-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl mx-auto">
          {/* Cover */}
          {article.cover_image && (
            <a
              href={article.cover_image}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full h-56 md:h-80 overflow-hidden rounded-xl mb-10 
               border border-border/50 bg-secondary/30 
               shadow-sm hover:shadow-md hover:border-primary/20 
               transition-all duration-300 cursor-pointer relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.cover_image}
                alt={article.title?.[locale] || article.title?.["en-US"] || "Untitled"}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </a>
          )}

          {/* Header */}
          <header className="mb-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-4 flex-1">
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight tracking-tight break-words">
                  {article.title?.[locale] || article.title?.["en-US"] || "Untitled"}
                </h1>
              </div>
              {isAuthenticated && (
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors w-fit"
                >
                  <Edit2 size={14} />
                  Edit
                </Link>
              )}
            </div>
            <time className="text-sm text-muted-foreground">
              {format(new Date(article.project_date || article.created_at), "MMMM yyyy", { locale: dateFnsLocale })}
              {article.project_end_date && (
                <> &ndash; {format(new Date(article.project_end_date), "MMMM yyyy", { locale: dateFnsLocale })}</>
              )}
            </time>
          </header>

          {/* Divider */}
          <div className="h-px w-full bg-border mb-10" />

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert prose-sm md:prose-base max-w-none
            prose-headings:font-black prose-headings:tracking-tight prose-headings:scroll-mt-24
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
            prose-img:rounded-lg prose-img:shadow-sm prose-img:mx-auto
          ">
            <MarkdownRenderer content={article.content?.[locale] || article.content?.["en-US"] || ""} />
          </div>

          {/* Legal Footer */}
          <div className="mt-20 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} eylexander. All rights reserved.
            </p>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
