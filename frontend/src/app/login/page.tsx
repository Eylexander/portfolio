"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 bg-transparent border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, checkAuth } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    checkAuth();
    const { isAuthenticated: authenticated } = useAuthStore.getState();
    if (authenticated) {
      router.push("/admin/dashboard");
    }
  }, [checkAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiClient.login(username, password);
      if (data.token) {
        login(data.token);
        toast.success("Logged in successfully!");
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Back link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        <ArrowLeft size={15} />
        Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm space-y-8"
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-2">Admin</p>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Sign In</h2>
          <p className="mt-2 text-sm text-muted-foreground">Access the dashboard.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className={inputClass}
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-2 w-full py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
