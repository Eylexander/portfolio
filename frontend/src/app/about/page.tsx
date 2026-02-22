"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import PageNav from "@/components/PageNav";

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

const stack = [
  { name: "React",        category: "Frontend", url: "https://reactjs.org/" },
  { name: "Next.js",      category: "Frontend", url: "https://nextjs.org/" },
  { name: "TypeScript",   category: "Frontend", url: "https://www.typescriptlang.org/" },
  { name: "Tailwind CSS", category: "Frontend", url: "https://tailwindcss.com/" },
  { name: "Golang",       category: "Backend",  url: "https://golang.org/" },
  { name: "Node.js",      category: "Backend",  url: "https://nodejs.org/" },
  { name: "Java",         category: "Backend",  url: "https://www.java.com/" },
  { name: "MongoDB",      category: "Database", url: "https://www.mongodb.com/" },
  { name: "Docker",       category: "DevOps",   url: "https://www.docker.com/" },
  { name: "Kubernetes",   category: "DevOps",   url: "https://kubernetes.io/" },
  { name: "VsCode",       category: "Tools",    url: "https://code.visualstudio.com/" },
];

// Duplicate stack for seamless marquee (we need enough items to fill ultrawide screens)
const marqueeStack = [...stack, ...stack, ...stack, ...stack, ...stack, ...stack, ...stack, ...stack];

export default function AboutPage() {
  const t = useTranslations("About");

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
          {/* Heading */}
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-primary">
              About
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-none">
              {t("title")}
            </h1>
          </motion.div>

          {/* Bio paragraph */}
          <motion.div
            variants={fadeUp}
            className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            <p>{t("description")}</p>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="h-px w-full bg-border" />

          {/* Experience */}
          <motion.div variants={fadeUp} className="space-y-8">
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              {t("experience_title")}
            </h2>
            <div className="space-y-8">
              {["job1", "job2"].map((jobKey) => (
                <div key={jobKey} className="relative pl-6 border-l border-border/60">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5 ring-4 ring-background" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {t(`experiences.${jobKey}.role`)}
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full w-fit">
                      {t(`experiences.${jobKey}.period`)}
                    </span>
                  </div>
                  <p className="text-primary font-medium mb-3">
                    {t(`experiences.${jobKey}.company`)}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`experiences.${jobKey}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="h-px w-full bg-border" />

          {/* Stack */}
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
                {marqueeStack.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
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
        </motion.div>
      </main>
    </div>
  );
}

