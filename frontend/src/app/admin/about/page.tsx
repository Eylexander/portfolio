"use client";
import AutoTranslateButton from "@/components/AutoTranslateButton";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Languages, ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { AboutData, Experience, StackItem, LocalizedString, Article } from "@/types";
import Loader from "@/components/Loader";
import { useOllama } from "@/hooks/useOllama";

type Locale = "en-US" | "fr-FR";

export default function AdminAboutPage() {
  const router = useRouter();
  const { isConfigured: isTranslateConfigured } = useOllama();
  const [data, setData] = useState<AboutData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<Locale>("en-US");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [res, articlesRes] = await Promise.all([
        apiClient.getAboutData(),
        apiClient.getArticles(true)
      ]);
      setArticles(articlesRes || []);
      // Provide defaults if no data
      setData({
        id: res.id,
        title: res.title || { "en-US": "", "fr-FR": "" },
        description: res.description || { "en-US": "", "fr-FR": "" },
        experience_title: res.experience_title || { "en-US": "", "fr-FR": "" },
        experiences: res.experiences || [],
        associative_title: res.associative_title || { "en-US": "", "fr-FR": "" },
        associative_experiences: res.associative_experiences || [],
        education_title: res.education_title || { "en-US": "", "fr-FR": "" },
        education_experiences: res.education_experiences || [],
        stack_tools: res.stack_tools || [],
        section_order: res.section_order?.length ? res.section_order : ["experiences", "associative_experiences", "education_experiences"],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load about data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      await apiClient.updateAboutData(data);
      toast.success("About page updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update about page");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStringChange = (key: keyof Pick<AboutData, "title" | "description" | "experience_title" | "associative_title" | "education_title">, val: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: { ...prev[key], [activeLang]: val },
      };
    });
  };

  const handleAddExperience = (type: "experiences" | "associative_experiences" | "education_experiences") => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      role: { "en-US": "", "fr-FR": "" },
      company: "",
      url: "",
      period: { "en-US": "", "fr-FR": "" },
      description: { "en-US": "", "fr-FR": "" },
    };

    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, [type]: [...prev[type], newExp] };
    });
  };

  const handleRemoveExperience = (type: "experiences" | "associative_experiences" | "education_experiences", id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [type]: prev[type].filter((exp) => exp.id !== id),
      };
    });
  };

  const handleMoveExperience = (
    type: "experiences" | "associative_experiences" | "education_experiences",
    index: number,
    direction: "up" | "down"
  ) => {
    setData((prev) => {
      if (!prev) return prev;
      const list = [...prev[type]];
      if (direction === "up" && index > 0) {
        [list[index - 1], list[index]] = [list[index], list[index - 1]];
      } else if (direction === "down" && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
      } else {
        return prev;
      }
      return { ...prev, [type]: list };
    });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    setData((prev) => {
      if (!prev) return prev;
      const list = [...(prev.section_order || ["experiences", "associative_experiences", "education_experiences"])];
      if (direction === "up" && index > 0) {
        [list[index - 1], list[index]] = [list[index], list[index - 1]];
      } else if (direction === "down" && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
      }
      return { ...prev, section_order: list };
    });
  };

  const handleExperienceChange = (
    type: "experiences" | "associative_experiences" | "education_experiences",
    id: string,
    field: keyof Experience,
    val: string
  ) => {
    setData((prev) => {
      if (!prev) return prev;
      const newList = prev[type].map((exp) => {
        if (exp.id === id) {
          if (field === "company" || field === "url" || field === "project_slug") {
            return { ...exp, [field]: val };
          } else {
            const locField = exp[field] as LocalizedString;
            return { ...exp, [field]: { ...locField, [activeLang]: val } };
          }
        }
        return exp;
      });
      return { ...prev, [type]: newList };
    });
  };

  const handleAddStackItem = () => {
    const newItem: StackItem = {
      id: crypto.randomUUID(),
      name: "",
      category: "",
      url: "",
    };
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, stack_tools: [...(prev.stack_tools || []), newItem] };
    });
  };

  const handleRemoveStackItem = (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, stack_tools: (prev.stack_tools || []).filter((item) => item.id !== id) };
    });
  };

  const handleStackItemChange = (id: string, field: keyof StackItem, val: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const newStack = (prev.stack_tools || []).map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      });
      return { ...prev, stack_tools: newStack };
    });
  };

  if (isLoading || !data) return <div className="p-8"><Loader /></div>;

  return (
    <div className="min-h-full bg-background pb-12">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push("/about")}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-5"
            >
              <ArrowLeft size={13} /> Back to About
            </button>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-1">About Page</p>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Edit About Data</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
              <Languages className="w-4 h-4 ml-2 text-muted-foreground" />
              <button
                onClick={() => setActiveLang("en-US")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeLang === "en-US" ? "bg-background shadow-sm" : "hover:bg-secondary"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setActiveLang("fr-FR")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeLang === "fr-FR" ? "bg-background shadow-sm" : "hover:bg-secondary"
                }`}
              >
                FR
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Info */}
          <section className="space-y-4 bg-card p-6 rounded-xl border border-border">
          <h2 className="text-xl font-semibold">General Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={data.title?.[activeLang] || ""}
                onChange={(e) => handleStringChange("title", e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <div className="relative">
                <AutoTranslateButton 
                  sourceText={data.description?.[activeLang === 'en-US' ? 'fr-FR' : 'en-US'] || ""}
                  sourceLang={activeLang === 'en-US' ? 'français' : 'english'}
                  targetLang={activeLang === 'en-US' ? 'english' : 'français'}
                  onTranslated={(text) => handleStringChange("description", text)}
                />
                <textarea
                  rows={4}
                  value={data.description?.[activeLang] || ""}
                  onChange={(e) => handleStringChange("description", e.target.value)}
                  className={`w-full px-3 py-2 ${isTranslateConfigured ? 'pt-10' : ''} bg-background border border-border rounded-lg resize-none`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Render sections in dynamic order */}
        {(data.section_order || ["experiences", "associative_experiences", "education_experiences"]).map((sectionType, index) => {
          if (sectionType === "experiences") {
            return (
        <section key="experiences" className="space-y-4 bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Professional Experience</h2>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => handleMoveSection(index, "up")} disabled={index === 0} className="p-0.5 bg-secondary text-secondary-foreground rounded disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => handleMoveSection(index, "down")} disabled={index === 2} className="p-0.5 bg-secondary text-secondary-foreground rounded disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
              </div>
            </div>
            <button
              onClick={() => handleAddExperience("experiences")}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input
              type="text"
              value={data.experience_title?.[activeLang] || ""}
              onChange={(e) => handleStringChange("experience_title", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-4"
            />
          </div>
          <div className="space-y-4">
            {data.experiences?.map((exp, expIndex) => (
              <div key={exp.id} className="p-4 border border-border/50 rounded-lg space-y-4 bg-background/50 relative">
                <div className="absolute top-4 right-12 flex gap-1">
                  <button
                    onClick={() => handleMoveExperience("experiences", expIndex, "up")}
                    disabled={expIndex === 0}
                    className="p-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded disabled:opacity-50"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveExperience("experiences", expIndex, "down")}
                    disabled={expIndex === (data.experiences?.length || 0) - 1}
                    className="p-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded disabled:opacity-50"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveExperience("experiences", exp.id)}
                  className="absolute top-4 right-4 p-1 text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-4 mr-24">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange("experiences", exp.id, "company", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Role</label>
                    <input
                      type="text"
                      value={exp.role?.[activeLang] || ""}
                      onChange={(e) => handleExperienceChange("experiences", exp.id, "role", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Company URL</label>
                    <input
                      type="text"
                      value={exp.url || ""}
                      onChange={(e) => handleExperienceChange("experiences", exp.id, "url", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Linked Project</label>
                    <select
                      value={exp.project_slug || ""}
                      onChange={(e) => handleExperienceChange("experiences", exp.id, "project_slug", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    >
                      <option value="">None</option>
                      {articles.map(a => (
                        <option key={a.id} value={a.slug}>{a.title?.["en-US"] || a.slug}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Period</label>
                    <input
                      type="text"
                      value={exp.period?.[activeLang] || ""}
                      onChange={(e) => handleExperienceChange("experiences", exp.id, "period", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={exp.description?.[activeLang] || ""}
                    onChange={(e) => handleExperienceChange("experiences", exp.id, "description", e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
            );
          }

          if (sectionType === "associative_experiences") {
            return (
        <section key="associative_experiences" className="space-y-4 bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Associative Experience</h2>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => handleMoveSection(index, "up")} disabled={index === 0} className="p-0.5 bg-secondary text-secondary-foreground rounded disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => handleMoveSection(index, "down")} disabled={index === 2} className="p-0.5 bg-secondary text-secondary-foreground rounded disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
              </div>
            </div>
            <button
              onClick={() => handleAddExperience("associative_experiences")}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input
              type="text"
              value={data.associative_title?.[activeLang] || ""}
              onChange={(e) => handleStringChange("associative_title", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-4"
            />
          </div>
          <div className="space-y-4">
            {data.associative_experiences?.map((exp, expIndex) => (
              <div key={exp.id} className="p-4 border border-border/50 rounded-lg space-y-4 bg-background/50 relative">
                <div className="absolute top-4 right-12 flex gap-1">
                  <button
                    onClick={() => handleMoveExperience("associative_experiences", expIndex, "up")}
                    disabled={expIndex === 0}
                    className="p-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded disabled:opacity-50"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveExperience("associative_experiences", expIndex, "down")}
                    disabled={expIndex === (data.associative_experiences?.length || 0) - 1}
                    className="p-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded disabled:opacity-50"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveExperience("associative_experiences", exp.id)}
                  className="absolute top-4 right-4 p-1 text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-4 mr-24">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Organization / Event</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange("associative_experiences", exp.id, "company", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Role</label>
                    <input
                      type="text"
                      value={exp.role?.[activeLang] || ""}
                      onChange={(e) => handleExperienceChange("associative_experiences", exp.id, "role", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Organization URL</label>
                    <input
                      type="text"
                      value={exp.url || ""}
                      onChange={(e) => handleExperienceChange("associative_experiences", exp.id, "url", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Linked Project</label>
                    <select
                      value={exp.project_slug || ""}
                      onChange={(e) => handleExperienceChange("associative_experiences", exp.id, "project_slug", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    >
                      <option value="">None</option>
                      {articles.map(a => (
                        <option key={a.id} value={a.slug}>{a.title?.["en-US"] || a.slug}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Period</label>
                    <input
                      type="text"
                      value={exp.period?.[activeLang] || ""}
                      onChange={(e) => handleExperienceChange("associative_experiences", exp.id, "period", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={exp.description?.[activeLang] || ""}
                    onChange={(e) => handleExperienceChange("associative_experiences", exp.id, "description", e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
            );
          }

          if (sectionType === "education_experiences") {
            return (
        <section key="education_experiences" className="space-y-4 bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Education</h2>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => handleMoveSection(index, "up")} disabled={index === 0} className="p-0.5 bg-secondary text-secondary-foreground rounded disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => handleMoveSection(index, "down")} disabled={index === 2} className="p-0.5 bg-secondary text-secondary-foreground rounded disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
              </div>
            </div>
            <button
              onClick={() => handleAddExperience("education_experiences")}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input
              type="text"
              value={data.education_title?.[activeLang] || ""}
              onChange={(e) => handleStringChange("education_title", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-4"
            />
          </div>
          <div className="space-y-4">
            {data.education_experiences?.map((exp, expIndex) => (
              <div key={exp.id} className="p-4 border border-border/50 rounded-lg space-y-4 bg-background/50 relative">
                <div className="absolute top-4 right-12 flex gap-1">
                  <button
                    onClick={() => handleMoveExperience("education_experiences", expIndex, "up")}
                    disabled={expIndex === 0}
                    className="p-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded disabled:opacity-50"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveExperience("education_experiences", expIndex, "down")}
                    disabled={expIndex === (data.education_experiences?.length || 0) - 1}
                    className="p-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded disabled:opacity-50"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveExperience("education_experiences", exp.id)}
                  className="absolute top-4 right-4 p-1 text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-4 mr-24">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">School / Institution</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange("education_experiences", exp.id, "company", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Degree / Role</label>
                    <input
                      type="text"
                      value={exp.role?.[activeLang] || ""}
                      onChange={(e) => handleExperienceChange("education_experiences", exp.id, "role", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">School URL</label>
                    <input
                      type="text"
                      value={exp.url || ""}
                      onChange={(e) => handleExperienceChange("education_experiences", exp.id, "url", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Linked Project</label>
                    <select
                      value={exp.project_slug || ""}
                      onChange={(e) => handleExperienceChange("education_experiences", exp.id, "project_slug", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    >
                      <option value="">None</option>
                      {articles.map(a => (
                        <option key={a.id} value={a.slug}>{a.title?.["en-US"] || a.slug}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Period</label>
                    <input
                      type="text"
                      value={exp.period?.[activeLang] || ""}
                      onChange={(e) => handleExperienceChange("education_experiences", exp.id, "period", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={exp.description?.[activeLang] || ""}
                    onChange={(e) => handleExperienceChange("education_experiences", exp.id, "description", e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
            );
          }
          return null;
        })}

        {/* Stack & Tools */}
        <section className="space-y-4 bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Stack &amp; Tools</h2>
            <button
              onClick={handleAddStackItem}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Tool
            </button>
          </div>
          <div className="space-y-4">
            {data.stack_tools?.map((item) => (
              <div key={item.id} className="p-4 border border-border/50 rounded-lg space-y-4 bg-background/50 relative flex items-center gap-4">
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleStackItemChange(item.id, "name", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                      placeholder="e.g. React"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Category</label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => handleStackItemChange(item.id, "category", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                      placeholder="e.g. Frontend"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">URL</label>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleStackItemChange(item.id, "url", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveStackItem(item.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded mt-5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!data.stack_tools || data.stack_tools.length === 0) && (
              <p className="text-sm text-muted-foreground italic text-center py-4">No tools added yet.</p>
            )}
          </div>
        </section>

      </div>
      </main>
    </div>
  );
}
