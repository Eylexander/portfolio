"use client";

import { useState } from "react";
import { Article } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface ArticleCardProps {
  article: Article;
  isAdmin?: boolean;
  featured?: boolean;
  hero?: boolean;
}

export default function ArticleCard({ article, featured = false, hero = false }: ArticleCardProps) {
  const locale = useLocale() as "en-US" | "fr-FR";
  const dateFnsLocale = locale === "fr-FR" ? fr : enUS;
  const t = useTranslations("Projects");
  const title = article.title?.[locale] || article.title?.["en-US"] || "Untitled";
  const snippet = article.snippet?.[locale] || article.snippet?.["en-US"] || "";
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <Link href={`/projects/${article.slug}`} className={`block break-inside-avoid ${featured || hero ? "h-full" : "mb-6"}`}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:shadow-foreground/5 transition-shadow duration-300 cursor-pointer flex ${hero ? "flex-col md:flex-row md:h-80" : "flex-col"} ${
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
          <div className={`relative overflow-hidden bg-secondary shrink-0 ${
            hero ? "w-full md:w-2/5 lg:w-1/2 h-56 md:h-auto border-b md:border-b-0 md:border-r border-border" : "w-full h-44"
          }`}>
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover_image}
              alt={title}
              onLoad={() => setIsImageLoaded(true)}
              className={`w-full h-full object-contain transition-all duration-500 will-change-transform group-hover:scale-105 relative z-10 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t dark:from-card/60 dark:to-transparent z-20 pointer-events-none" />
          </div>
        )}

        <div className={`space-y-3 flex flex-col ${hero ? "p-6 md:p-8 lg:p-10 flex-1 md:justify-center" : "p-5 flex-1"}`}>
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
            hero ? "text-2xl md:text-3xl lg:text-4xl mb-2" : "text-base lg:text-lg"
          }`}>
            {title}
          </h3>

          {/* Snippet */}
          {snippet && (
            <p className={`text-muted-foreground leading-relaxed flex-1 ${
              hero ? "text-base md:text-lg line-clamp-3 md:line-clamp-4" : "text-sm line-clamp-2"
            }`}>
              {snippet}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-auto">
            <time className="text-xs text-muted-foreground/70">
              {format(new Date(article.project_date || article.created_at), "MMM yyyy", { locale: dateFnsLocale })}
              {article.project_end_date && (
                <> &ndash; {format(new Date(article.project_end_date), "MMM yyyy", { locale: dateFnsLocale })}</>
              )}
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
