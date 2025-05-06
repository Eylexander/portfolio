import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { Mdx } from "@/src/components/mdx";
import { Header } from "./header";
import matter from "gray-matter";
import "./mdx.css";
import { getLocale } from "next-intl/server";

export const revalidate = 60;

type Props = {
  params: {
    slug: string;
    locale: string;
  };
};

// Helper function to read all project files for a specific locale
async function getProjectFiles(locale: string): Promise<string[]> {
  const contentDir = path.join(process.cwd(), "content", "projects", locale);
  try {
    return await fs.readdir(contentDir);
  } catch (error) {
    console.error(`Error reading project directory for locale ${locale}:`, error);
    // Fall back to the root projects directory if locale directory doesn't exist
    try {
      const rootContentDir = path.join(process.cwd(), "content", "projects");
      return await fs.readdir(rootContentDir);
    } catch {
      return [];
    }
  }
}

// Extract slugs from filenames
export async function generateStaticParams(): Promise<Pick<Props["params"], "slug">[]> {
  // For static param generation, we'll use the primary locale (en)
  const files = await getProjectFiles('en');
  
  return files
    .filter(file => file.endsWith(".mdx"))
    .map(file => ({
      slug: file.replace(/\.mdx$/, ""),
    }));
}

// Read and parse a project file with locale support
async function getProject(slug: string, locale: string) {
  // Try to get the file from the locale-specific directory
  let filePath = path.join(process.cwd(), "content", "projects", locale, `${slug}.mdx`);
  
  try {
    let fileContent = await fs.readFile(filePath, 'utf8');
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
    // If file doesn't exist in locale directory, try the default locale (en)
    if (locale !== 'en') {
      try {
        filePath = path.join(process.cwd(), "content", "projects", 'en', `${slug}.mdx`);
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
      } catch {
        // If file doesn't exist in default locale either, try the root directory as fallback
        try {
          filePath = path.join(process.cwd(), "content", "projects", `${slug}.mdx`);
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
        } catch {
          console.error(`Error reading project file ${slug} for locale ${locale}:`, error);
          return null;
        }
      }
    } else {
      // Try the root directory as fallback for default locale
      try {
        filePath = path.join(process.cwd(), "content", "projects", `${slug}.mdx`);
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
      } catch {
        console.error(`Error reading project file ${slug} for locale ${locale}:`, error);
        return null;
      }
    }
  }
}

export default async function PostPage({ params }: Props) {
  const locale = params.locale;
  const slug = params.slug;
  const project = await getProject(slug, locale);

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
