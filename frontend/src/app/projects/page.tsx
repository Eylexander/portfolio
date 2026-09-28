"use client";

import { useEffect, useState } from "react";
import { Article } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Plus, LayoutDashboard, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import apiClient from "@/lib/api-client";
import { pageStagger as stagger, pageFadeUp as fadeUp } from "@/lib/animations";

// Module-level cache so re-visiting /projects (e.g. after opening a project and
// navigating back) doesn't replay the full skeleton loading animation for data
// we already have; it's revalidated silently in the background instead.
const articlesCache = new Map<boolean, Article[]>();

export default function ProjectsPage() {
  const { isAuthenticated } = useAuthStore();
  const [articles, setArticles] = useState<Article[]>(() => articlesCache.get(isAuthenticated) || []);
  const [isLoading, setIsLoading] = useState(() => !articlesCache.has(isAuthenticated));
  const [isScrolled, setIsScrolled] = useState(false);
  const t = useTranslations("Projects");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const cached = articlesCache.get(isAuthenticated);
    if (cached) {
      setArticles(cached);
      setIsLoading(false);
    }

    const fetchArticles = async () => {
      try {
        const data = await apiClient.getArticles(isAuthenticated);
        articlesCache.set(isAuthenticated, data || []);
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
    <div className="min-h-screen relative overflow-hidden">

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-6">
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl font-black tracking-tight text-foreground"
              >
                {t("title")}<span className="text-primary">.</span>
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
          <>
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                    className="h-80 rounded-xl bg-secondary/60 border border-border overflow-hidden"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--secondary)) 25%, hsl(var(--muted)) 50%, hsl(var(--secondary)) 75%)",
                      backgroundSize: "200% 100%",
                      animation: `shimmer 1.8s infinite linear`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </motion.div>
            ) : articles.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-muted-foreground py-24 text-sm tracking-wide"
              >
                {t("noProjects")}
              </motion.p>
            ) : (
              <motion.div key="content" className="space-y-12">
                {/* Featured Projects Section */}
                {articles.filter(a => a.tags.includes("featured") || a.tags.includes("hero")).length > 0 && (() => {
                  const priorityArticles = articles.filter(a => a.tags.includes("featured") || a.tags.includes("hero"));
                  // Explicitly pick the 'hero' tagged article first; fallback to the newest 'featured'
                  const heroArticle = priorityArticles.find(a => a.tags.includes("hero")) || priorityArticles[0];
                  const otherFeatured = priorityArticles.filter(a => a.id !== heroArticle.id);

                  return (
                    <div className="space-y-6">
                      <motion.div variants={fadeUp}>
                        <ArticleCard article={heroArticle} featured={true} hero={true} />
                      </motion.div>
                      
                      {otherFeatured.length > 0 && (
                        <motion.div
                          variants={stagger}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {otherFeatured.map((article) => (
                            <motion.div key={article.id} variants={fadeUp} className="h-full">
                              <ArticleCard article={article} featured={true} hero={false} />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })()}

                {/* Scroll Indicator Divider */}
                {articles.filter(a => !a.tags.includes("featured") && !a.tags.includes("hero")).length > 0 && 
                 articles.filter(a => a.tags.includes("featured") || a.tags.includes("hero")).length > 0 && (
                  <AnimatePresence>
                    {!isScrolled && (
                      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                        <motion.button
                          onClick={() => window.scrollBy({ top: window.innerHeight * 0.7, behavior: "smooth" })}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                          transition={{ delay: 1.5, duration: 0.8 }}
                          className="flex flex-col items-center justify-center shadow-xl bg-background/80 hover:bg-background transition-all backdrop-blur-md px-5 py-1.5 rounded-full border border-border/50 cursor-pointer group"
                        >
                          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-center text-foreground/80 group-hover:text-foreground transition-colors mt-0.5">
                            {t("moreProjects")}
                          </span>
                          <motion.div
                            animate={{ y: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="-mt-1"
                          >
                            <ChevronDown size={16} className="text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        </motion.button>
                      </div>
                    )}
                  </AnimatePresence>
                )}

                {/* All Other Projects Grid */}
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
                >
                  {articles.filter(a => !a.tags.includes("featured") && !a.tags.includes("hero")).map((article) => (
                    <motion.div key={article.id} variants={fadeUp}>
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </>
        </div>
      </main>
    </div>
  );
}

