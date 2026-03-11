"use client";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import { useOllama } from "@/hooks/useOllama";

import { useState, useRef } from "react";
import { Article } from "@/types";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import toast from "react-hot-toast";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Eye, Edit2, Image as ImageIcon, Loader2 } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors";
const labelCls =
  "block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1.5";

interface ArticleEditorProps {
  initialData?: Article;
  isNew?: boolean;
}

export default function ArticleEditor({
  initialData,
  isNew = false,
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
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"en-US" | "fr-FR">("en-US");
  const [isPreview, setIsPreview] = useState(false);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Language Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("en-US")}
          className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "en-US"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("fr-FR")}
          className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "fr-FR"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          Français
        </button>
      </div>

      {/* Title + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Title ({activeTab.toUpperCase()})</label>
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
          <label className={labelCls}>Slug (Optional)</label>
          <input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className={inputCls}
            placeholder="auto-generated-from-title"
          />
        </div>
      </div>

      {/* Snippet */}
      <div>
        <label className={labelCls}>Snippet ({activeTab.toUpperCase()})</label>
        <textarea
          name="snippet"
          value={formData.snippet[activeTab]}
          onChange={(e) => handleLocalizedChange(e, "snippet", activeTab)}
          className={`${inputCls} h-20 resize-none`}
          placeholder={activeTab === "en-US" ? "A short description shown in the project card…" : "Une courte description affichée sur la carte du projet…"}
          required
        />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
            Content — Markdown ({activeTab.toUpperCase()})
          </label>
          <div className="flex items-center gap-3">
            {!isPreview && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {isUploadingImage ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ImageIcon size={12} />
                )}
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                />
              </label>
            )}
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {isPreview ? (
                <>
                  <Edit2 size={12} /> Edit
                </>
              ) : (
                <>
                  <Eye size={12} /> Preview
                </>
              )}
            </button>
          </div>
        </div>
        
        {isPreview ? (
          <div className="w-full h-80 overflow-y-auto px-4 py-3 rounded-lg border border-border bg-background prose prose-neutral dark:prose-invert prose-sm max-w-none
            prose-headings:font-black prose-headings:tracking-tight prose-headings:scroll-mt-24
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
            prose-img:rounded-lg prose-img:shadow-sm"
          >
            {formData.content[activeTab] ? (
              <MarkdownRenderer content={formData.content[activeTab]} />
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview yet...</p>
            )}
          </div>
        ) : (
          <div className="relative">
            <AutoTranslateButton 
              sourceText={formData.content[activeTab === 'en-US' ? 'fr-FR' : 'en-US']}
              sourceLang={activeTab === 'en-US' ? 'français' : 'english'}
              targetLang={activeTab === 'en-US' ? 'english' : 'français'}
              onTranslated={(text) => {
                setFormData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    [activeTab]: text
                  }
                }));
              }}
            />
            <textarea
              ref={textareaRef}
              name="content"
              value={formData.content[activeTab]}
              onChange={(e) => handleLocalizedChange(e, "content", activeTab)}
              className={`${inputCls} h-80 font-mono text-xs resize-y ${isTranslateConfigured ? 'pt-10' : ''}`}
              placeholder={activeTab === "en-US" ? "# My project\n\nWrite your content in Markdown…" : "# Mon projet\n\nÉcrivez votre contenu en Markdown…"}
              required
            />
          </div>
        )}
      </div>

      {/* Cover image + Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-secondary text-foreground hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              title="Upload cover image"
            >
              {isUploadingCover ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
            </button>
            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
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
      </div>

      {/* Date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Project Start Month</label>
          <input
            type="month"
            name="project_date"
            value={formData.project_date}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Project End Month <span className="normal-case font-normal text-muted-foreground">(optional)</span></label>
          <input
            type="month"
            name="project_end_date"
            value={formData.project_end_date}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>

      {/* Visibility */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-lg border border-border bg-secondary/20">
        <input
          type="checkbox"
          id="is_visible"
          checked={formData.is_visible}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, is_visible: e.target.checked }))
          }
          className="mt-0.5 w-4 h-4 accent-primary rounded cursor-pointer"
        />
        <div>
          <label
            htmlFor="is_visible"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Visible publicly
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Show this project on the public website
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving…" : isNew ? "Create Project" : "Update Project"}
        </button>
      </div>
    </form>
  );
}
