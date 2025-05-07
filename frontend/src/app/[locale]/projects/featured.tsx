"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

// Custom Project type to replace Contentlayer's
type Project = {
    slug: string;
    title: string;
    description: string;
    date?: string;
    published: boolean;
    url?: string;
    repository?: string;
};

type Props = {
    project: Project;
};

export const Featured: React.FC<Props> = ({ project }) => {
    const t = useTranslations("projects");
    const locale = useLocale();

    return (
        <Link href={`/projects/${project.slug}`}>
            <article className="relative w-full h-full p-4 md:p-8">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-zinc-100">
                        {project.date ? (
                            <time
                                dateTime={new Date(project.date).toISOString()}
                            >
                                {new Intl.DateTimeFormat(locale, {
                                    year: "numeric",
                                    month: "long",
                                })
                                    .format(new Date(project.date))
                                    .replace(/^./, (str) => str.toUpperCase())}
                            </time>
                        ) : (
                            <span>{t("soon")}</span>
                        )}
                    </div>
                </div>

                <h2
                    id="featured-post"
                    className="mt-4 text-3xl font-bold text-zinc-100 group-hover:text-white sm:text-4xl font-display"
                >
                    {project.title}
                </h2>
                <p className="mt-4 leading-8 duration-150 text-zinc-400 group-hover:text-zinc-300">
                    {project.description}
                </p>
                <div className="absolute bottom-4 md:bottom-8">
                    <p className="hidden text-zinc-200 hover:text-zinc-50 lg:block">
                        {t("more")} <span aria-hidden="true">&rarr;</span>
                    </p>
                </div>
            </article>
        </Link>
    );
};
