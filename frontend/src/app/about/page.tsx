"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import PageNav from "@/components/PageNav";
import apiClient from "@/lib/api-client";
import { AboutData } from "@/types";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Edit } from "lucide-react";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function AboutPage() {
  const locale = useLocale() as "en-US" | "fr-FR";
  const [data, setData] = useState<AboutData | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    apiClient.getAboutData().then(setData).catch(console.error);
  }, []);

  if (!data) return <Loader />;

  return (
    <div className="min-h-screen bg-background">
      <PageNav />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center overflow-hidden">
        <motion.div
          className="max-w-3xl w-full space-y-14"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            variants={fadeUp}
          >
            <div className="space-y-3 pt-12 md:pt-0">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-primary">
                About
              </p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-none">
                {data.title?.[locale]}
              </h1>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/about"
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit Page</span>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Bio paragraph */}
          <motion.div
            variants={fadeUp}
            className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            <p className="whitespace-pre-line">{data.description?.[locale]}</p>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="h-px w-full bg-border" />

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-8">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                {data.experience_title?.[locale] || "Experience"}
              </h2>
              <div className="space-y-8">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-6 border-l border-border/60">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 ring-4 ring-background" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {exp.role?.[locale]}
                      </h3>
                      <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full w-fit">
                        {exp.period?.[locale]}
                      </span>
                    </div>
                    <p className="text-primary font-medium mb-3">
                      {exp.company}
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {exp.description?.[locale]}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Divider */}
          {data.experiences && data.experiences.length > 0 && (
            <motion.div variants={fadeUp} className="h-px w-full bg-border" />
          )}

          {/* Associative Experience */}
          {data.associative_experiences && data.associative_experiences.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-8">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                {data.associative_title?.[locale] || "Associative Experience"}
              </h2>
              <div className="space-y-8">
                {data.associative_experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-6 border-l border-border/60">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 ring-4 ring-background" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {exp.role?.[locale]}
                      </h3>
                      <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full w-fit">
                        {exp.period?.[locale]}
                      </span>
                    </div>
                    <p className="text-primary font-medium mb-3">
                      {exp.company}
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {exp.description?.[locale]}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Divider */}
          {data.associative_experiences && data.associative_experiences.length > 0 && (
            <motion.div variants={fadeUp} className="h-px w-full bg-border" />
          )}

          {/* Stack */}
          {data.stack_tools && data.stack_tools.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-6 w-full">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Stack &amp; Tools
              </h2>
              
              <style>{`
                @keyframes custom-marquee {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-50%); }
                }
                .animate-custom-marquee {
                  animation: custom-marquee 90s linear infinite;
                }
              `}</style>

              {/* Marquee Container */}
              <div className="relative flex overflow-hidden w-full group [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                <div className="flex w-max animate-custom-marquee group-hover:[animation-play-state:paused] will-change-transform">
                  {[...data.stack_tools, ...data.stack_tools, ...data.stack_tools, ...data.stack_tools, ...data.stack_tools, ...data.stack_tools, ...data.stack_tools, ...data.stack_tools].map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex-shrink-0 mx-2 py-2"
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground border border-border/60 transition-all hover:scale-105 hover:-translate-y-0.5 hover:border-primary/50"
                      >
                        {item.name}
                        <span className="text-[10px] text-muted-foreground/70 font-normal">
                          {item.category}
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}

