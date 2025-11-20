import React from "react";
import { Navigation } from "@/src/components/nav";
import { Card } from "@/src/components/card";
import { Article } from "./article";
import { getTranslations, getLocale } from "next-intl/server";
import { getProjects } from "@/util/projects";
import type { Project } from "@/util/projects";
import { Featured } from "./featured";
import { BsArrowDownCircle } from "react-icons/bs";

// Function to get all projects from API with locale
async function getAllProjects(locale: string): Promise<Project[]> {
    try {
        const projects = await getProjects(locale);
        return projects.filter((p) => p.published);
    } catch (error) {
        console.error("Error fetching projects from API:", error);
        return [];
    }
}

export default async function ProjectsPage() {
    const locale = await getLocale();
    const projects = await getAllProjects(locale);

    const t = await getTranslations("projects");

    // Get top 3 projects by position attribute
    const featured = projects.find((project) => project.position === 1);
    const top2 = projects.find((project) => project.position === 2);
    const top3 = projects.find((project) => project.position === 3);
    
    // Get remaining projects sorted by date (newest first)
    const sorted = projects
        .filter(
            (project) =>
                !project.position || 
                (project.position !== 1 && project.position !== 2 && project.position !== 3)
        )
        .sort(
            (a, b) =>
                new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
                new Date(a.date ?? Number.POSITIVE_INFINITY).getTime()
        );

    return (
        <div className="relative pb-16 overflow-hidden">
            <Navigation />

            <div>
                <div className="fixed top-[5%] left-[-10%] w-[450px] h-[450px] bg-purple-500/30 rounded-full blur-[140px] pointer-events-none firefly-1" />
                <div className="fixed top-[10%] right-[-10%] w-[450px] h-[450px] bg-blue-500/30 rounded-full blur-[140px] pointer-events-none firefly-2" />
                <div className="fixed bottom-[-10%] left-[40%] w-[450px] h-[450px] bg-emerald-500/25 rounded-full blur-[140px] pointer-events-none firefly-3" />
            </div>

            <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32 relative z-10">
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
