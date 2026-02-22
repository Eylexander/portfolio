"use client";

import { Article } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface ArticleCardProps {
  article: Article;
  isAdmin?: boolean;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const locale = useLocale() as "en-US" | "fr-FR";
  const t = useTranslations("Projects");
  const title = article.title?.[locale] || article.title?.["en-US"] || "Untitled";
  const snippet = article.snippet?.[locale] || article.snippet?.["en-US"] || "";

  return (
    <Link href={`/projects/${article.slug}`} className={`block break-inside-avoid ${featured ? "h-full" : "mb-6"}`}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:shadow-foreground/5 transition-shadow duration-300 cursor-pointer flex flex-col ${
          featured ? "border-primary/50 shadow-primary/10 h-full" : "border-border hover:border-border/80"
        }`}
      >
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {t("featured")}
          </div>
        )}

        {/* Cover image */}
        {article.cover_image && (
          <div className={`relative w-full overflow-hidden bg-secondary shrink-0 ${featured ? "h-56 md:h-64" : "h-44"}`}>
            <img
              src={article.cover_image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t dark:from-card/60 dark:to-transparent" />
          </div>
        )}

        <div className="p-5 space-y-3 flex flex-col flex-1">
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-secondary text-secondary-foreground tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className={`font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 ${
            featured ? "text-xl md:text-2xl" : "text-base"
          }`}>
            {title}
          </h3>

          {/* Snippet */}
          {snippet && (
            <p className={`text-muted-foreground line-clamp-2 leading-relaxed flex-1 ${
              featured ? "text-base" : "text-sm"
            }`}>
              {snippet}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-auto">
            <time className="text-xs text-muted-foreground/70">
              {format(new Date(article.project_date || article.created_at), "MMM yyyy")}
            </time>
            {!article.is_visible && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60 font-medium">
                <EyeOff size={11} /> Hidden
              </span>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
