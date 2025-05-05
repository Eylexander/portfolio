import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { Mdx } from "@/src/components/mdx";
import { Header } from "./header";
import matter from "gray-matter";
import "./mdx.css";

export const revalidate = 60;

type Props = {
  params: {
    slug: string;
    locale: string;
  };
};

// Helper function to read all project files
async function getProjectFiles(): Promise<string[]> {
  const contentDir = path.join(process.cwd(), "content", "projects");
  try {
    return await fs.readdir(contentDir);
  } catch (error) {
    console.error("Error reading project directory:", error);
    return [];
  }
}

// Extract slugs from filenames
export async function generateStaticParams(): Promise<Pick<Props["params"], "slug">[]> {
  const files = await getProjectFiles();
  
  return files
    .filter(file => file.endsWith(".mdx"))
    .map(file => ({
      slug: file.replace(/\.mdx$/, ""),
    }));
}

// Read and parse a project file
async function getProject(slug: string) {
  const filePath = path.join(process.cwd(), "content", "projects", `${slug}.mdx`);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    if (!frontmatter.published && process.env.NODE_ENV === 'production') {
      return null;
    }
    
    return {
      slug,
      content,
      title: frontmatter.title || 'Untitled Project',
      description: frontmatter.description || 'No description provided',
      url: frontmatter.url,
      repository: frontmatter.repository,
      ...frontmatter,
    };
  } catch (error) {
    console.error(`Error reading project file ${slug}:`, error);
    return null;
  }
}

export default async function PostPage({ params }: Props) {
  const slugparams = await params;
  const slug = slugparams.slug;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header project={project} />

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
        <Mdx content={project.content} code={""} />
      </article>
    </div>
  );
}
