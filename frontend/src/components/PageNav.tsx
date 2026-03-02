"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface PageNavProps {
  /** Label shown next to the back arrow — defaults to the Navigation.home translation */
  backLabel?: string;
  /** Override the back href, defaults to "/" */
  backHref?: string;
  /** Optional callback to handle back navigation instead of using href */
  onBack?: () => void;
}

export default function PageNav({ backLabel, backHref = "/", onBack }: PageNavProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const navT = useTranslations("Navigation");
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Show navbar only on specific pages
  if (
    !pathname.startsWith("/about") &&
    !pathname.startsWith("/projects") &&
    !pathname.startsWith("/contact")
  ) {
    return null;
  }

  // Handle specific paths that need custom back behavior
  let resolvedBackLabel = backLabel;
  let resolvedBackHref = backHref;

  // For project detail pages
  if (pathname.startsWith("/projects/") && pathname !== "/projects") {
    resolvedBackLabel = navT("projects");
    resolvedBackHref = "/projects";
  }

  const navLinks = [
    { href: "/about", label: navT("about") },
    { href: "/projects", label: navT("projects") },
    { href: "/contact", label: navT("contact") },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 backdrop-blur-md bg-background/70 border-b border-border/40"
      >
        {/* Left: Back to Home */}
        {onBack ? (
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 z-50"
          >
            <motion.span
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} strokeWidth={2.5} className="shrink-0" />
              <span className="hidden sm:inline">{resolvedBackLabel ?? navT("home")}</span>
            </motion.span>
          </button>
        ) : (
          <Link
            href={resolvedBackHref}
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 z-50"
          >
            <motion.span
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} strokeWidth={2.5} className="shrink-0" />
              <span className="hidden sm:inline">{resolvedBackLabel ?? navT("home")}</span>
            </motion.span>
          </Link>
        )}

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative py-1 text-sm font-semibold tracking-[0.15em] transition-colors duration-300 ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive ? (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                ) : (
                  <span className="absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-out w-0 group-hover:w-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 z-50">
          <LocaleSwitcher />
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
          >
            <motion.span
              key={resolvedTheme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="block"
            >
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </motion.span>
          </button>
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center pt-20"
          >
            <div className="flex flex-col items-center gap-8 w-full px-6">
              {navLinks.map((link, i) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-full text-center"
                  >
                    <Link
                      href={link.href}
                      className={`block py-4 text-2xl font-bold tracking-widest transition-colors duration-300 ${
                        isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
