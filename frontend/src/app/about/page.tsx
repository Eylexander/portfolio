"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useEffect, useState, Fragment } from "react";
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
    <div className="min-h-screen relative overflow-hidden">

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center overflow-hidden relative z-10">
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
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-none">
                {data.title?.[locale]}<span className="text-primary">.</span>
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

          {/* Dynamic Sections (Experiences, Associative, Education) */}
          {(data.section_order || ["experiences", "associative_experiences", "education_experiences"]).map((sectionType) => {
            if (sectionType === "experiences" && data.experiences && data.experiences.length > 0) {
              return (
                <Fragment key="experiences">
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
                          {exp.url ? (
                            <a 
                              href={exp.url.startsWith('http') ? exp.url : `https://${exp.url}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary font-medium mb-3 hover:underline inline-block"
                            >
                              {exp.company}
                            </a>
                          ) : (
                            <p className="text-primary font-medium mb-3">
                              {exp.company}
                            </p>
                          )}
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {exp.description?.[locale]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="h-px w-full bg-border" />
                </Fragment>
              );
            }

            if (sectionType === "associative_experiences" && data.associative_experiences && data.associative_experiences.length > 0) {
              return (
                <Fragment key="associative_experiences">
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
                          {exp.url ? (
                            <a 
                              href={exp.url.startsWith('http') ? exp.url : `https://${exp.url}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary font-medium mb-3 hover:underline inline-block"
                            >
                              {exp.company}
                            </a>
                          ) : (
                            <p className="text-primary font-medium mb-3">
                              {exp.company}
                            </p>
                          )}
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {exp.description?.[locale]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="h-px w-full bg-border" />
                </Fragment>
              );
            }

            if (sectionType === "education_experiences" && data.education_experiences && data.education_experiences.length > 0) {
              return (
                <Fragment key="education_experiences">
                  <motion.div variants={fadeUp} className="space-y-8">
                    <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                      {data.education_title?.[locale] || "Education"}
                    </h2>
                    <div className="space-y-8">
                      {data.education_experiences.map((exp) => (
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
                          {exp.url ? (
                            <a 
                              href={exp.url.startsWith('http') ? exp.url : `https://${exp.url}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary font-medium mb-3 hover:underline inline-block"
                            >
                              {exp.company}
                            </a>
                          ) : (
                            <p className="text-primary font-medium mb-3">
                              {exp.company}
                            </p>
                          )}
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {exp.description?.[locale]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="h-px w-full bg-border" />
                </Fragment>
              );
            }

            return null;
          })}

          {/* Stack */}
          {data.stack_tools && data.stack_tools.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-6 w-full">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Stack &amp; Tools
              </h2>

              <div className="flex flex-wrap gap-3">
                {data.stack_tools.map((item, idx) => (
                  <a
                    key={`${item.id}-${idx}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-secondary/40 hover:bg-secondary text-secondary-foreground border border-border/50 hover:border-primary/50 transition-all hover:scale-105 hover:-translate-y-0.5"
                  >
                    {item.name}
                    <span className="text-[10px] text-muted-foreground/70 font-normal tracking-wider uppercase">
                      {item.category}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}

