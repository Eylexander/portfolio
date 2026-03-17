"use client";

import { motion } from "framer-motion";
import TypewriterText from "@/components/TypewriterText";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Sun, Moon, Github, Linkedin, Mail } from "lucide-react";
import { useTheme } from "next-themes";

export default function Home() {
  const t = useTranslations("HomePage");
  const navT = useTranslations("Navigation");
  const { resolvedTheme, setTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  const titleText = "eylexander";
  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.5,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring" as const, damping: 14, stiffness: 120 },
    },
  };

  const roles = t("roles").split(",").map((r) => r.trim());

  const socialLinks = [
    {
      href: "https://github.com/eylexander",
      icon: <Github size={14} />,
      label: "GitHub"
    },
    {
      href: "mailto:me@eylexander.fr",
      icon: <Mail size={14} />,
      label: "Email"
    },
  ];

  return (
    <main className="relative w-full h-screen overflow-hidden selection:bg-primary/30">

      {/* Top-right controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2"
      >
        <LocaleSwitcher />
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="p-2 rounded-full text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm border border-border/40 hover:bg-secondary transition-all duration-200"
        >
          <motion.span
            key={resolvedTheme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="block"
          >
            {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </motion.span>
        </button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="z-10 absolute inset-0 flex flex-col items-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top half — Nav pinned to bottom */}
        <motion.div
          variants={itemVariants}
          className="flex-1 flex items-end pb-6 md:pb-10"
        >
          <nav className="flex flex-wrap justify-center gap-8 md:gap-14">
            {[
              { href: "/about", label: navT("about") },
              { href: "/projects", label: navT("projects") },
              { href: "/contact", label: navT("contact") },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="group relative py-1">
                <span className="text-xs md:text-sm font-semibold tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {link.label}
                </span>
                <span className="absolute bottom-0 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-300 ease-out" />
              </Link>
            ))}
          </nav>
        </motion.div>

        {/* Title — exact vertical center */}
        <motion.h1
          className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tight text-foreground flex"
          variants={titleVariants}
        >
          {titleText.split("").map((char, index) => (
            <motion.span key={index} variants={letterVariants} className="inline-block relative">
              {char}
              <span className="absolute inset-0 blur-lg opacity-0 dark:opacity-20 text-primary -z-10 select-none" aria-hidden="true">{char}</span>
            </motion.span>
          ))}
        </motion.h1>

        {/* Bottom half — Typewriter + Social pinned to top */}
        <motion.div
          variants={itemVariants}
          className="flex-1 flex flex-col items-center pt-6 md:pt-10 gap-6 md:gap-8"
        >
          <p className="text-sm md:text-base text-muted-foreground font-medium tracking-[0.25em] min-h-[1.5em]">
            <TypewriterText words={roles} speed={70} pause={2400} />
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm border border-border/40 hover:bg-secondary transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
