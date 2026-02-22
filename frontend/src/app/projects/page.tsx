"use client";

import { useEffect, useState } from "react";
import { Article } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Plus, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import apiClient from "@/lib/api-client";
import PageNav from "@/components/PageNav";
import Loader from "@/components/Loader";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function ProjectsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations("Projects");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await apiClient.getArticles(isAuthenticated);
        setArticles(data || []);
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <PageNav />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-3">
              <motion.p
                variants={fadeUp}
                className="text-xs font-semibold tracking-[0.25em] uppercase text-primary"
              >
                Work
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl font-black tracking-tight text-foreground"
              >
                {t("title")}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-base text-muted-foreground max-w-xl"
              >
                {t("subtitle")}
              </motion.p>
            </div>

            {isAuthenticated && (
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/80 transition-colors shadow-sm"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link
                  href="/admin/articles/new"
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                    {t("addProject")}
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-xl bg-secondary/60 border border-border overflow-hidden"
                  style={{
                    background: "linear-gradient(90deg, hsl(var(--secondary)) 25%, hsl(var(--muted)) 50%, hsl(var(--secondary)) 75%)",
                    backgroundSize: "200% 100%",
                    animation: `shimmer 1.8s infinite linear`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground py-24 text-sm tracking-wide"
            >
              {t("noProjects")}
            </motion.p>
          ) : (
            <div className="space-y-12">
              {/* Featured Projects Section */}
              {articles.filter(a => a.tags.includes("featured")).length > 0 && (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {articles.filter(a => a.tags.includes("featured")).map((article) => (
                    <motion.div key={article.id} variants={fadeUp} className="h-full">
                      <ArticleCard article={article} featured={true} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* All Other Projects Grid */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
              >
                {articles.filter(a => !a.tags.includes("featured")).map((article) => (
                  <motion.div key={article.id} variants={fadeUp}>
                    <ArticleCard article={article} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

