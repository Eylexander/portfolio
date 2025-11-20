import { notFound } from "next/navigation";
import { Mdx } from "@/src/components/mdx";
import { Header } from "./header";
import { getProjects, getProjectBySlug, getProjectForLocale } from "@/util/projects";
import { getLocale } from "next-intl/server";
import "./mdx.css";

// Generate static params from API
export async function generateStaticParams() {
	try {
		const projects = await getProjects();
		return projects
			.filter(project => project.published)
			.map(project => ({
				slug: project.slug,
			}));
	} catch (error) {
		console.error("Error generating static params:", error);
		return [];
	}
}

// Fetch project from API with locale
async function getProject(slug: string, locale: string) {
	try {
		const project = await getProjectBySlug(slug, locale);
		if (!project.published && process.env.NODE_ENV === 'production') {
			return null;
		}
		return project;
	} catch (error) {
		console.error(`Error fetching project ${slug}:`, error);
		return null;
	}
}

export default async function PostPage({
	params,
}: {
	params: Promise<{ slug: string; locale: string }>;
}) {
	const { slug } = await params;
	const locale = await getLocale();
	const project = await getProject(slug, locale);

	if (!project) {
		notFound();
	}

	const projectData = getProjectForLocale(project, locale);

	return (
		<div className="min-h-screen">
			<Header project={projectData!} />

			<article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
				<Mdx content={projectData?.content || ""} code={""} />
			</article>
		</div>
	);
}
