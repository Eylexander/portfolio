// 'use client';

import React from "react";
import { Link } from '@/src/i18n/navigation';
import { Navigation } from "@/src/components/nav";
import { Card } from "@/src/components/card";
import { Article } from "./article";
import { getTranslations, getLocale } from "next-intl/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

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

// Function to get all projects
async function getAllProjects(): Promise<Project[]> {
  const contentDir = path.join(process.cwd(), "content", "projects");
  let files;
  
  try {
    files = await fs.readdir(contentDir);
  } catch (error) {
    console.error("Error reading project directory:", error);
    return [];
  }

  const projects = await Promise.all(
    files
      .filter(file => file.endsWith(".mdx"))
      .map(async (file) => {
        const filePath = path.join(contentDir, file);
        const content = await fs.readFile(filePath, 'utf8');
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

  return projects.filter(p => p.published);
}

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const t = await getTranslations("projects");
  const locale = await getLocale();

  const featured = projects.find((project) => project.slug === "unkey")!;
  const top2 = projects.find((project) => project.slug === "planetfall")!;
  const top3 = projects.find((project) => project.slug === "highstorm")!;
  const sorted = projects
    .filter(
      (project) =>
        project.slug !== featured?.slug &&
        project.slug !== top2?.slug &&
        project.slug !== top3?.slug,
    )
    .sort(
      (a, b) =>
        new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
        new Date(a.date ?? Number.POSITIVE_INFINITY).getTime(),
    );

  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-zinc-400">
            {t('description')}
          </p>
        </div>
        <div className="w-full h-px bg-zinc-800" />

        <div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-2 ">
          {featured && (
            <Card>
              <Link href={`/projects/${featured.slug}`}>
                <article className="relative w-full h-full p-4 md:p-8">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-100">
                      {featured.date ? (
                        <time dateTime={new Date(featured.date).toISOString()}>
                          {new Intl.DateTimeFormat(locale, {
                            year: "numeric",
                            month: "long",
                          })
                            .format(new Date(featured.date))
                            .replace(/^./, (str) => str.toUpperCase())}
                        </time>
                      ) : (
                        <span>{t('soon')}</span>
                      )}
                    </div>
                  </div>

                  <h2
                    id="featured-post"
                    className="mt-4 text-3xl font-bold text-zinc-100 group-hover:text-white sm:text-4xl font-display"
                  >
                    {featured.title}
                  </h2>
                  <p className="mt-4 leading-8 duration-150 text-zinc-400 group-hover:text-zinc-300">
                    {featured.description}
                  </p>
                  <div className="absolute bottom-4 md:bottom-8">
                    <p className="hidden text-zinc-200 hover:text-zinc-50 lg:block">
                      {t('more')} <span aria-hidden="true">&rarr;</span>
                    </p>
                  </div>
                </article>
              </Link>
            </Card>
          )}

          <div className="flex flex-col w-full gap-8 mx-auto border-t border-gray-900/10 lg:mx-0 lg:border-t-0">
            {[top2, top3].filter(Boolean).map((project) => (
              <Card key={project.slug}>
                <Article project={project} />
              </Card>
            ))}
          </div>
        </div>
        <div className="hidden w-full h-px md:block bg-zinc-800" />

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
