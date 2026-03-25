"use client";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import { useOllama } from "@/hooks/useOllama";

import { useState, useRef } from "react";
import { Article } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import toast from "react-hot-toast";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors";
const labelCls =
  "block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5";

interface ArticleEditorProps {
  initialData?: Article;
  isNew?: boolean;
  backHref?: string;
}

export default function ArticleEditor({
  initialData,
  isNew = false,
  backHref,
}: ArticleEditorProps) {
  const router = useRouter();
  const { isConfigured: isTranslateConfigured } = useOllama();

  const [formData, setFormData] = useState({
    title: {
      "en-US": initialData?.title?.["en-US"] || "",
      "fr-FR": initialData?.title?.["fr-FR"] || "",
    },
    slug: initialData?.slug || "",
    snippet: {
      "en-US": initialData?.snippet?.["en-US"] || "",
      "fr-FR": initialData?.snippet?.["fr-FR"] || "",
    },
    content: {
      "en-US": initialData?.content?.["en-US"] || "",
      "fr-FR": initialData?.content?.["fr-FR"] || "",
    },
    cover_image: initialData?.cover_image || "",
    tags: initialData?.tags?.join(", ") || "",
    is_visible: initialData?.is_visible ?? true,
    project_date: initialData?.project_date ? initialData.project_date.substring(0, 7) : new Date().toISOString().substring(0, 7),
    project_end_date: initialData?.project_end_date ? initialData.project_end_date.substring(0, 7) : "",
    external_link: initialData?.external_link || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"en-US" | "fr-FR">("en-US");
  const [isSlugModified, setIsSlugModified] = useState(!!initialData?.slug);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "slug") {
      setIsSlugModified(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalizedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: "title" | "snippet" | "content",
    lang: "en-US" | "fr-FR"
  ) => {
    const { value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value,
        },
      };

      if (field === "title" && !isSlugModified && lang === "en-US") {
        newData.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    
    // Convert YYYY-MM to full ISO string for Go time.Time
    const projectDateIso = formData.project_date ? new Date(`${formData.project_date}-01T00:00:00Z`).toISOString() : new Date().toISOString();
    const projectEndDateIso = formData.project_end_date ? new Date(`${formData.project_end_date}-01T00:00:00Z`).toISOString() : undefined;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = { ...formData, tags: tagsArray, project_date: projectDateIso };
    if (projectEndDateIso !== undefined) {
      payload.project_end_date = projectEndDateIso;
    } else {
      payload.project_end_date = null;
    }

    try {
      if (isNew) {
        await apiClient.createArticle(payload);
        toast.success("Project created!");
      } else if (initialData?.id) {
        await apiClient.updateArticle(initialData.id, payload);
        toast.success("Project updated!");
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const url = await apiClient.uploadImage(file);
      setFormData((prev) => ({ ...prev, cover_image: url }));
      toast.success("Cover image uploaded!");
    } catch {
      toast.error("Failed to upload cover image");
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await apiClient.uploadImage(file);
      const imageMarkdown = `\n![${file.name}](${url})\n`;

      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = formData.content[activeTab];
        
        const newContent = currentContent.substring(0, start) + imageMarkdown + currentContent.substring(end);
        
        setFormData((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            [activeTab]: newContent,
          },
        }));

        // Reset cursor position after state update
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      } else {
        // Fallback if textarea ref is not available
        setFormData((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            [activeTab]: prev.content[activeTab] + imageMarkdown,
          },
        }));
      }
      toast.success("Image uploaded!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      e.target.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">

      {/* ── Top toolbar ──────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background shrink-0">
        {/* Back */}
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mr-1 shrink-0"
          >
            <ArrowLeft size={13} />
          </Link>
        )}

        {/* Language tabs */}
        <div className="flex items-center bg-secondary rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("en-US")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === "en-US"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fr-FR")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === "fr-FR"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            FR
          </button>
        </div>

        <div className="flex-1" />

        {/* Upload content image */}
        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer shrink-0">
          {isUploadingImage ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
          <span className="hidden sm:inline">Insert image</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
        </label>

        {/* Visibility */}
        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={formData.is_visible}
            onChange={(e) => setFormData((prev) => ({ ...prev, is_visible: e.target.checked }))}
            className="w-3.5 h-3.5 accent-primary"
          />
          <span className="hidden sm:inline">Visible</span>
        </label>

        {/* Cancel */}
        <button
          type="button"
          onClick={() => router.back()}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
        >
          Cancel
        </button>

        {/* Save */}
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {isSaving ? "Saving…" : isNew ? "Create" : "Save"}
        </button>
      </div>

      {/* ── Three-pane area ──────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left sidebar: metadata ── */}
        <div className="w-64 xl:w-72 shrink-0 border-r border-border overflow-y-auto bg-background">
          <div className="p-4 space-y-4">
            <div>
              <label className={labelCls}>Title</label>
              <input
                name="title"
                value={formData.title[activeTab]}
                onChange={(e) => handleLocalizedChange(e, "title", activeTab)}
                className={inputCls}
                placeholder={activeTab === "en-US" ? "My Awesome Project" : "Mon Super Projet"}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={inputCls}
                placeholder="auto-generated-from-title"
              />
            </div>
            <div>
              <label className={labelCls}>Snippet</label>
              <textarea
                name="snippet"
                value={formData.snippet[activeTab]}
                onChange={(e) => handleLocalizedChange(e, "snippet", activeTab)}
                className={`${inputCls} h-24 resize-none`}
                placeholder={activeTab === "en-US" ? "A short description…" : "Une courte description…"}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Cover Image</label>
              <div className="flex gap-2">
                <input
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="https://… or upload →"
                />
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="shrink-0 inline-flex items-center px-2.5 py-2 rounded-lg border border-border bg-secondary text-foreground hover:bg-accent transition-colors disabled:opacity-60"
                  title="Upload cover image"
                >
                  {isUploadingCover ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                </button>
                <input ref={coverImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Tags — comma separated</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className={inputCls}
                placeholder="react, go, design"
              />
            </div>
            <div>
              <label className={labelCls}>Start Month</label>
              <input type="month" name="project_date" value={formData.project_date} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Month <span className="normal-case font-normal text-muted-foreground">(optional)</span></label>
              <input type="month" name="project_end_date" value={formData.project_end_date} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>External Link <span className="normal-case font-normal text-muted-foreground">(optional)</span></label>
              <input
                name="external_link"
                value={formData.external_link}
                onChange={handleChange}
                className={inputCls}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>

        {/* ── Editor pane ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-border">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-secondary/30 shrink-0">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Markdown</span>
          </div>
          <div className="relative flex-1 min-h-0 flex flex-col">
            <AutoTranslateButton
              sourceText={formData.content[activeTab === 'en-US' ? 'fr-FR' : 'en-US']}
              sourceLang={activeTab === 'en-US' ? 'français' : 'english'}
              targetLang={activeTab === 'en-US' ? 'english' : 'français'}
              onTranslated={(text) => setFormData(prev => ({ ...prev, content: { ...prev.content, [activeTab]: text } }))}
            />
            <textarea
              ref={textareaRef}
              name="content"
              value={formData.content[activeTab]}
              onChange={(e) => handleLocalizedChange(e, "content", activeTab)}
              className={`flex-1 min-h-0 resize-none font-mono text-xs p-4 bg-background text-foreground focus:outline-none ${isTranslateConfigured ? 'pt-10' : ''}`}
              placeholder={activeTab === "en-US" ? "# My project\n\nWrite your content in Markdown…" : "# Mon projet\n\nÉcrivez votre contenu en Markdown…"}
              required
            />
          </div>
        </div>

        {/* ── Preview pane ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex items-center px-3 py-1.5 border-b border-border bg-secondary/30 shrink-0">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Preview</span>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6 prose prose-neutral dark:prose-invert prose-sm max-w-none
            prose-headings:font-black prose-headings:tracking-tight
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
            prose-img:rounded-lg prose-img:shadow-sm"
          >
            {formData.content[activeTab] ? (
              <MarkdownRenderer content={formData.content[activeTab]} />
            ) : (
              <p className="text-muted-foreground italic text-sm">Preview will appear here…</p>
            )}
          </div>
        </div>

      </div>
    </form>
  );
}
