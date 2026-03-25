"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Article } from "@/types";
import Link from "next/link";
import { Edit, Trash2, Plus, Eye, EyeOff, Image as ImageIcon, Copy, Check, Code, Star, Download, Upload, Search } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Loader from "@/components/Loader";
import apiClient from "@/lib/api-client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useOllama } from "@/hooks/useOllama";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function AdminDashboard() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [editingTagsValue, setEditingTagsValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "uploads" | "messages" | "settings">("projects");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingCredentials, setUpdatingCredentials] = useState(false);

  const [ollama_model, setOllamaModel] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const { isConfigured: isOllamaConfigured, models: availableModels } = useOllama();

  const t = useTranslations("Admin");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesData, uploadsData, messagesData, settingsData] = await Promise.all([
        apiClient.getArticles(true),
        apiClient.getUploads(),
        apiClient.getContactMessages(),
        apiClient.getSettings().catch(() => null),
      ]);
      setArticles(articlesData || []);
      setUploads(uploadsData || []);
      setMessages(messagesData || []);
      if (settingsData) {
        setOllamaModel(settingsData.ollama_model || "");
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try {
      await apiClient.deleteArticle(id);
      toast.success("Article deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const handleUpdateTags = async (article: Article, newTagsStr: string) => {
    try {
      const tagsArray = newTagsStr.split(",").map(t => t.trim()).filter(Boolean);
      await apiClient.updateArticle(article.id, { ...article, tags: tagsArray });
      toast.success("Tags updated");
      fetchData();
    } catch {
      toast.error("Failed to update tags");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await apiClient.deleteContactMessage(id);
      toast.success("Message deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleDeleteUpload = async (filename: string) => {
    if (!confirm("Delete this upload?")) return;
    try {
      await apiClient.deleteUpload(filename);
      toast.success("Upload deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete upload");
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedText(url);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
      console.error(err);
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy email");
      console.error(err);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername && !newPassword) {
      toast.error("Please enter a new username or password");
      return;
    }
    setUpdatingCredentials(true);
    try {
      await apiClient.updateCredentials(newUsername || undefined, newPassword || undefined);
      toast.success("Credentials updated successfully. Please log in again.");
      logout();
      router.push("/login");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to update credentials");
    } finally {
      setUpdatingCredentials(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingSettings(true);
    try {
      await apiClient.updateSettings({ ollama_model });
      toast.success("Settings updated successfully.");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleToggleFeatured = async (article: Article) => {
    try {
      const isFeatured = article.tags.includes("featured");
      const newTags = isFeatured
        ? article.tags.filter(t => t !== "featured")
        : [...article.tags, "featured"];

      await apiClient.updateArticle(article.id, { ...article, tags: newTags });
      toast.success(isFeatured ? "Removed from featured" : "Added to featured");
      fetchData();
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await apiClient.exportBackup();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Backup exported successfully");
    } catch {
      toast.error("Failed to export backup");
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        if (!confirm(`Are you sure you want to restore this backup? This will overwrite current database collections (Articles, About, and Messages)!`)) {
          event.target.value = '';
          return;
        }

        await apiClient.importBackup(backupData);
        toast.success(`Backup restored successfully.`);
        fetchData();
      } catch {
        toast.error("Failed to import backup");
      }

      // Reset the input
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const getSnippet = (content: string, query: string) => {
    if (!content || !query) return null;
    const lowerContent = content.toLowerCase();
    const index = lowerContent.indexOf(query.toLowerCase());
    if (index === -1) return null;

    // Find the word occurrence context
    const start = Math.max(0, index - 40);
    const end = Math.min(content.length, index + query.length + 40);
    let snippet = content.substring(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";

    // Highlight the matching part
    const regex = new RegExp(`(${query})`, 'gi');
    return snippet.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white px-1 rounded">{part}</mark> : part
    );
  };

  const filteredArticles = articles.filter((article) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleEn = article.title?.["en-US"]?.toLowerCase() || "";
    const titleFr = article.title?.["fr-FR"]?.toLowerCase() || "";
    const contentEn = article.content?.["en-US"]?.toLowerCase() || "";
    const contentFr = article.content?.["fr-FR"]?.toLowerCase() || "";

    return titleEn.includes(query) || titleFr.includes(query) || contentEn.includes(query) || contentFr.includes(query);
  });

  return (
    <div className="min-h-full bg-background pb-12">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-1">Dashboard</p>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Overview</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border mb-6 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide [&::-webkit-scrollbar]:hidden justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "projects"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "uploads"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "messages"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          {loading ? (
            <Loader size="md" className="py-16" />
          ) : activeTab === "projects" ? (
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 border-b border-border bg-secondary/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-lg hover:bg-secondary transition-colors shadow-sm"
                    title="Export Backup"
                  >
                    <Download size={14} /> <span className="hidden sm:inline">Export</span>
                  </button>
                  <label
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-lg hover:bg-secondary transition-colors shadow-sm cursor-pointer"
                    title="Import Backup"
                  >
                    <Upload size={14} /> <span className="hidden sm:inline">Import</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportBackup}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-9 pr-3 py-1.5 border border-border rounded-lg leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="Search across articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Link
                    href="/admin/articles/new"
                    className="flex shrink-0 items-center justify-center gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Plus size={15} /> <span className="hidden sm:inline">{t("new_project")}</span>
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <motion.table
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="w-full text-sm min-w-full"
                >
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      <th className="py-3 px-4 sm:px-5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Title</th>
                      <th className="hidden sm:table-cell py-3 px-4 sm:px-5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Status</th>
                      <th className="hidden md:table-cell py-3 px-4 sm:px-5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">Date</th>
                      <th className="py-3 px-4 sm:px-5 text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((article) => {
                      const snippetEn = searchQuery ? getSnippet(article.content?.["en-US"] || "", searchQuery) : null;
                      const snippetFr = searchQuery && !snippetEn ? getSnippet(article.content?.["fr-FR"] || "", searchQuery) : null;
                      const snippet = snippetEn || snippetFr;

                      return (
                        <motion.tr
                          key={article.id}
                          variants={fadeUp}
                          className="border-b border-border/60 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="py-3.5 px-4 sm:px-5 font-medium text-foreground">
                            <Link href={`/projects/${article.slug}`} className="hover:text-primary hover:underline transition-colors line-clamp-1 block">
                              {article.title?.["en-US"] || article.title?.["fr-FR"] || "Untitled"}
                            </Link>
                            {searchQuery && snippet && (
                              <div className="mt-1 text-xs text-muted-foreground font-normal italic overflow-hidden text-ellipsis line-clamp-2">
                                &quot;...{snippet}...&quot;
                              </div>
                            )}
                            <div className="flex sm:hidden items-center gap-2 mt-1 text-xs text-muted-foreground">
                              {article.is_visible ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                  <Eye size={10} /> Visible
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <EyeOff size={10} /> Hidden
                                </span>
                              )}
                              <span>•</span>
                              <span>
                                {new Date(article.project_date || article.created_at).toLocaleDateString()}
                                {article.project_end_date && (
                                  <> &ndash; {new Date(article.project_end_date).toLocaleDateString()}</>
                                )}
                              </span>
                            </div>
                            {/* Tags quick edit */}
                            <div className="mt-2 hidden sm:block relative">
                              {editingTagsId === article.id ? (
                                <div className="absolute top-0 left-0 z-10 p-2 bg-card border border-border rounded-md shadow-lg shadow-black/5 flex flex-col gap-2 min-w-[250px]">
                                  <div className="flex items-center justify-between pointer-events-none">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Edit Tags</span>
                                    <span className="text-[10px] text-muted-foreground">Comma separated</span>
                                  </div>
                                  <textarea 
                                    autoFocus
                                    className="text-xs bg-background border border-border rounded-md px-2 py-1.5 w-full min-h-[60px] focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none font-mono"
                                    value={editingTagsValue}
                                    onChange={(e) => setEditingTagsValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleUpdateTags(article, editingTagsValue);
                                        setEditingTagsId(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingTagsId(null);
                                      }
                                    }}
                                  />
                                  <div className="flex justify-start gap-1 flex-wrap">
                                    {editingTagsValue.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                                      <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded-sm bg-secondary opacity-70">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex justify-end gap-2 mt-1">
                                    <button 
                                      className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTagsId(null);
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded-sm hover:opacity-90"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateTags(article, editingTagsValue);
                                        setEditingTagsId(null);
                                      }}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="flex flex-wrap gap-1 cursor-pointer hover:opacity-80"
                                  onClick={() => {
                                    setEditingTagsId(article.id);
                                    setEditingTagsValue(article.tags.join(", "));
                                  }}
                                  title="Click to edit tags"
                                >
                                  {article.tags.length > 0 ? article.tags.map((tag) => (
                                    <span key={tag} className="px-1.5 py-0.5 text-[10px] font-medium rounded-sm bg-secondary text-secondary-foreground">
                                      {tag}
                                    </span>
                                  )) : (
                                    <span className="text-[10px] text-muted-foreground border border-dashed border-border px-1.5 py-0.5 rounded-sm hover:bg-secondary cursor-pointer transition-colors">+ Add tags</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell py-3.5 px-4 sm:px-5">
                            {article.is_visible ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <Eye size={12} /> Visible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <EyeOff size={12} /> Hidden
                              </span>
                            )}
                          </td>
                          <td className="hidden md:table-cell py-3.5 px-4 sm:px-5 text-muted-foreground text-xs">
                            {new Date(article.project_date || article.created_at).toLocaleDateString()}
                            {article.project_end_date && (
                              <> &ndash; {new Date(article.project_end_date).toLocaleDateString()}</>
                            )}
                          </td>
                          <td className="py-3.5 px-4 sm:px-5">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleToggleFeatured(article)}
                                className={`p-1.5 rounded-md transition-colors ${article.tags.includes("featured")
                                  ? "text-yellow-500 hover:bg-yellow-500/10"
                                  : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                                  }`}
                                title={article.tags.includes("featured") ? "Remove from featured" : "Add to featured"}
                              >
                                <Star size={15} fill={article.tags.includes("featured") ? "currentColor" : "none"} />
                              </button>
                              <Link href={`/admin/articles/${article.id}`}>
                                <button className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                                  <Edit size={15} />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {articles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                          No projects yet.{" "}
                          <Link href="/admin/articles/new" className="text-primary hover:underline">
                            Create your first one.
                          </Link>
                        </td>
                      </tr>
                    )}
                    {articles.length > 0 && filteredArticles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                          No matches found across articles for &quot;{searchQuery}&quot;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </motion.table>
              </div>
            </div>
          ) : activeTab === "uploads" ? (
            <div className="p-4 sm:p-6">
              {uploads.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                  <ImageIcon size={32} className="opacity-20" />
                  <p>No images uploaded yet.</p>
                </div>
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"
                >
                  {uploads.map((url, index) => (
                    <motion.div
                      key={index}
                      variants={fadeUp}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-secondary/20 cursor-pointer"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                      >
                        <Image
                          src={url}
                          alt={`Upload ${index}`}
                          width={400}
                          height={400}
                          unoptimized
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </a>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => window.open(url, '_blank')}
                            className="p-2 bg-background/90 text-foreground rounded-md hover:bg-background transition-colors"
                            title="Open Image"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleCopyUrl(url)}
                            className="p-2 bg-background/90 text-foreground rounded-md hover:bg-background transition-colors"
                            title="Copy URL"
                          >
                            {copiedText === url ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                          <button
                            onClick={() => handleCopyUrl(`<img src="${url}" alt="Image" width="100%" />`)}
                            className="p-2 bg-background/90 text-foreground rounded-md hover:bg-background transition-colors"
                            title="Copy Markdown"
                          >
                            {copiedText === `<img src="${url}" alt="Image" width="100%" />` ? <Check size={16} className="text-green-500" /> : <Code size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUpload(url.split('/').pop()!)}
                            className="p-2 bg-background/90 text-red-500 rounded-md hover:bg-background transition-colors"
                            title="Delete Image"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : activeTab === "messages" ? (
            <div className="p-4 sm:p-6">
              {messages.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                  <p>No messages yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 border border-border rounded-lg bg-secondary/10">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2 sm:gap-0">
                        <div>
                          <h3 className="font-semibold text-foreground">{msg.subject}</h3>
                          <p className="text-xs text-muted-foreground">
                            From: {msg.name} (
                            <button
                              onClick={() => handleCopyEmail(msg.email)}
                              className="hover:text-primary hover:underline transition-colors inline-flex items-center gap-1"
                              title="Copy email"
                            >
                              {msg.email}
                              <Copy size={10} />
                            </button>
                            )
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap mt-3">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-12">
              {isOllamaConfigured && (
                <div>
                  <h2 className="text-lg font-semibold mb-1">Ollama Configuration</h2>
                  <p className="text-xs text-muted-foreground mb-4">Ollama is connected. Select the model to use for auto-translations.</p>
                  <form onSubmit={handleUpdateSettings} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Ollama Model</label>
                      {availableModels.length > 0 ? (
                        <select
                          value={ollama_model}
                          onChange={(e) => setOllamaModel(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Use .env default</option>
                          {availableModels.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={ollama_model}
                          onChange={(e) => setOllamaModel(e.target.value)}
                          placeholder="e.g. llama3 (leave blank to use .env default)"
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      )}
                      <p className="text-xs text-muted-foreground mt-1">This overrides the OLLAMA_MODEL environment variable for auto-translations.</p>
                    </div>
                    <button
                      type="submit"
                      disabled={updatingSettings}
                      className="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingSettings ? "Saving..." : "Save Settings"}
                    </button>
                  </form>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-4">Update Credentials</h2>
                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">New Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {/* Second password input to verify */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingCredentials || (!newUsername && !newPassword) || newPassword !== confirmNewPassword}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingCredentials ? "Updating..." : "Update Credentials"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
