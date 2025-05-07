import React from "react";
import { Link } from "@/src/i18n/navigation";
import { Navigation } from "@/src/components/nav";
import { Card } from "@/src/components/card";
import { Article } from "./article";
import { getTranslations, getLocale } from "next-intl/server";
import fs from "fs/promises";
import * as fsSync from "fs";
import path from "path";
import matter from "gray-matter";
import { Featured } from "./featured";
import { BsArrowDownCircle } from "react-icons/bs";

// Type for project data
type Project = {
    slug: string;
    title: string;
    description: string;
    date?: string;
    published: boolean;
    url?: string;
    repository?: string;
};

// Function to get all projects with locale support
async function getAllProjects(locale: string): Promise<Project[]> {
    // Try to find projects in the locale-specific directory
    const localeContentDir = path.join(
        process.cwd(),
        "content",
        "projects",
        locale
    );
    let files = [];

    try {
        // First try to get files from locale directory
        files = await fs.readdir(localeContentDir);

        const projects = await Promise.all(
            files
                .filter((file) => file.endsWith(".mdx"))
                .map(async (file) => {
                    const filePath = path.join(localeContentDir, file);
                    const content = await fs.readFile(filePath, "utf8");
                    const { data } = matter(content);

                    return {
                        slug: file.replace(/\.mdx$/, ""),
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        published: data.published !== false, // Default to true if not specified
                        url: data.url,
                        repository: data.repository,
                    };
                })
        );

        return projects.filter((p) => p.published);
    } catch (error) {
        // If locale directory doesn't exist or has an error, try falling back
        // For non-English locales, try English first
        if (locale !== "en") {
            try {
                const enContentDir = path.join(
                    process.cwd(),
                    "content",
                    "projects",
                    "en"
                );
                files = await fs.readdir(enContentDir);

                const projects = await Promise.all(
                    files
                        .filter((file) => file.endsWith(".mdx"))
                        .map(async (file) => {
                            const filePath = path.join(enContentDir, file);
                            const content = await fs.readFile(filePath, "utf8");
                            const { data } = matter(content);

                            return {
                                slug: file.replace(/\.mdx$/, ""),
                                title: data.title,
                                description: data.description,
                                date: data.date,
                                published: data.published !== false,
                                url: data.url,
                                repository: data.repository,
                            };
                        })
                );

                return projects.filter((p) => p.published);
            } catch (enError) {
                console.error(
                    "Error reading English project directory:",
                    enError
                );
            }
        }

        // Last resort, try the root content directory
        try {
            const rootContentDir = path.join(
                process.cwd(),
                "content",
                "projects"
            );
            files = await fs.readdir(rootContentDir);

            const projects = await Promise.all(
                files
                    .filter(
                        (file) =>
                            file.endsWith(".mdx") &&
                            !fsSync
                                .statSync(path.join(rootContentDir, file))
                                .isDirectory()
                    )
                    .map(async (file) => {
                        const filePath = path.join(rootContentDir, file);
                        const content = await fs.readFile(filePath, "utf8");
                        const { data } = matter(content);

                        return {
                            slug: file.replace(/\.mdx$/, ""),
                            title: data.title,
                            description: data.description,
                            date: data.date,
                            published: data.published !== false,
                            url: data.url,
                            repository: data.repository,
                        };
                    })
            );

            return projects.filter((p) => p.published);
        } catch (rootError) {
            console.error("Error reading root project directory:", rootError);
            return [];
        }
    }
}

export default async function ProjectsPage() {
    const locale = await getLocale();
    const projects = await getAllProjects(locale);

    const t = await getTranslations("projects");

    // Get featured project slugs from environment variables with fallbacks
    const featuredSlug = process.env.NEXT_PUBLIC_FEATURED_PROJECT || "unkey";
    const top2Slug = process.env.NEXT_PUBLIC_TOP2_PROJECT || "planetfall";
    const top3Slug = process.env.NEXT_PUBLIC_TOP3_PROJECT || "highstorm";

    const featured = projects.find((project) => project.slug === featuredSlug);
    const top2 = projects.find((project) => project.slug === top2Slug);
    const top3 = projects.find((project) => project.slug === top3Slug);
    const sorted = projects
        .filter(
            (project) =>
                project.slug !== featured?.slug &&
                project.slug !== top2?.slug &&
                project.slug !== top3?.slug
        )
        .sort(
            (a, b) =>
                new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
                new Date(a.date ?? Number.POSITIVE_INFINITY).getTime()
        );

    return (
        <div className="relative pb-16">
            <Navigation />
            <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
                <div className="max-w-2xl mx-auto lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                        {t("title")}
                    </h2>
                    <p className="mt-4 text-zinc-400">{t("description")}</p>
                </div>
                <div className="w-full h-px bg-zinc-800" />

                <div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-2 ">
                    {featured && (
                        <Card>
                            <Featured project={featured} />
                        </Card>
                    )}

                    <div className="flex flex-col w-full gap-8 mx-auto border-t border-gray-900/10 lg:mx-0 lg:border-t-0">
                        {[top2, top3]
                            .filter((project): project is Project =>
                                Boolean(project)
                            )
                            .map((project) => (
                                <Card key={project.slug}>
                                    <Article project={project} />
                                </Card>
                            ))}
                    </div>
                </div>
                <div className="relative items-center w-full hidden md:flex">
                    <div className="w-full h-px bg-zinc-800" />
                    <div className="absolute left-1/2 -translate-x-1/2 bg-zinc-900 p-2 rounded-full">
                        <BsArrowDownCircle className="bg-zinc-900 text-zinc-500 rounded-full text-4xl" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
                    <div className="grid grid-cols-1 gap-4">
                        {sorted
                            .filter((_, i) => i % 3 === 0)
                            .map((project) => (
                                <Card key={project.slug}>
                                    <Article project={project} />
                                </Card>
                            ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {sorted
                            .filter((_, i) => i % 3 === 1)
                            .map((project) => (
                                <Card key={project.slug}>
                                    <Article project={project} />
                                </Card>
                            ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {sorted
                            .filter((_, i) => i % 3 === 2)
                            .map((project) => (
                                <Card key={project.slug}>
                                    <Article project={project} />
                                </Card>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
