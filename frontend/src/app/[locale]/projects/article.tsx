'use client';

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

export const Article: React.FC<Props> = ({ project }) => {

	const t = useTranslations("projects");
	const locale = useLocale();

	return (
		<Link href={`/projects/${project.slug}`}>
			<article className="p-4 md:p-8">
				<div className="flex justify-between gap-2 items-center">
					<span className="text-xs duration-1000 text-zinc-200 group-hover:text-white group-hover:border-zinc-200 drop-shadow-orange">
						{project.date ? (
							<time dateTime={new Date(project.date).toISOString()}>
								{new Intl.DateTimeFormat(locale, {
									year: "numeric",
									month: "long",
								})
									.format(new Date(project.date))
									.replace(/^./, (str) => str.toUpperCase())}
							</time>
						) : (
							<span>{t('soon')}</span>
						)}
					</span>
				</div>
				<h2 className="mt-2 z-20 text-xl font-medium duration-1000 lg:text-3xl text-zinc-200 group-hover:text-white font-display">
					{project.title}
				</h2>
				<p className="z-20 mt-4 text-sm  duration-1000 text-zinc-400 group-hover:text-zinc-200">
					{project.description}
				</p>
			</article>
		</Link>
	);
};
