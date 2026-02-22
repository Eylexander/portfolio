"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLoginButton() {
  const pathname = usePathname();

  if (!pathname || pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 2 }}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
    >
      <Link 
        href="/login" 
        className="text-foreground/5 hover:text-primary/60 transition-all duration-500 p-2 block"
        aria-label="Admin Login"
      >
        <Lock size={13} />
      </Link>
    </motion.div>
  );
}
