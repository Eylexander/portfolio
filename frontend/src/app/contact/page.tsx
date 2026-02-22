"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { Github, AtSign, Mail, Twitter } from "lucide-react";
import toast from "react-hot-toast";
import PageNav from "@/components/PageNav";
import { useTranslations } from "next-intl";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const inputClass =
  "w-full px-4 py-3 bg-transparent border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // Honeypot field
  });
  const [isSending, setIsSending] = useState(false);

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      url: "https://github.com/eylexander",
      hoverClass: "hover:border-foreground/40 hover:text-foreground",
    },
    {
      name: "Discord",
      icon: AtSign,
      url: "https://discord.com/users/344526513577918477",
      hoverClass: "hover:border-blue-500/50 hover:text-blue-500",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/eylexander",
      hoverClass: "hover:border-sky-400/50 hover:text-sky-400",
    },
    {
      name: "Email",
      icon: Mail,
      url: "mailto:me@eylexander.fr",
      hoverClass: "hover:border-primary/50 hover:text-primary",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await apiClient.sendContactMessage(formData);
      toast.success(t("success"));
      setFormData({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to send message. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageNav />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <motion.div
          className="max-w-3xl w-full space-y-12"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Heading */}
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-primary">
              {t("header")}
            </p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-base">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-border text-muted-foreground bg-card transition-colors duration-200 group ${link.hoverClass}`}
              >
                <link.icon size={22} strokeWidth={1.75} />
                <span className="text-xs font-medium">{link.name}</span>
              </motion.a>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="h-px w-full bg-border" />

          {/* Form */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {t("name")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className={inputClass}
                  placeholder={t("placeholder_name")}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {t("email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className={inputClass}
                  placeholder={t("placeholder_email")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                {t("subject")}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                maxLength={200}
                className={inputClass}
                placeholder={t("placeholder_subject")}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                {t("message")}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                maxLength={5000}
                rows={6}
                className={`${inputClass} resize-none`}
                placeholder={t("placeholder_message")}
              />
            </div>

            {/* Honeypot field - hidden from real users */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSending ? t("sending") : t("submit")}
            </motion.button>
          </motion.form>
        </motion.div>
      </main>
    </div>
  );
}