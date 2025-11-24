'use server';

const CACHE_DURATION = 10 * 60; // 10 minutes in seconds
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL + "/api/v1" || "http://proxy/api/v1";

export type ProjectLocale = {
  title: string;
  description: string;
  content: string;
};

export type ProjectReducedLocale = {
  title: string;
  description: string;
};

export type Project = {
  id: string;
  slug: string;
  locales: Record<string, ProjectLocale>;
  date?: string;
  published: boolean;
  url?: string;
  repository?: string;
  position?: number;
};

export type ProjectReduced = {
  id: string;
  slug: string;
  locales: Record<string, ProjectReducedLocale>;
  date?: string;
  position?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
};

export async function getProjectForLocale(project: Project, locale: string) {
  const localeData = project.locales[locale];
  if (!localeData) {
    return null;
  }
  return {
    ...project,
    title: localeData.title,
    description: localeData.description,
    content: localeData.content,
  };
}

export async function getProjectForLocaleReduced(project: ProjectReduced, locale: string) {
  const localeData = project.locales[locale];
  if (!localeData) {
    return null;
  }
  return {
    ...project,
    title: localeData.title,
    description: localeData.description,
  };
}

export async function getProjects(locale?: string): Promise<Project[]> {
  try {
    const url = new URL(`${apiBaseUrl}/projects`);
    if (locale) {
      url.searchParams.append("locale", locale);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: CACHE_DURATION },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const json: ApiResponse<Project[]> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || "Failed to fetch projects");
    }

    return json.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

export async function getProjectBySlug(
  slug: string,
  locale?: string
): Promise<Project> {
  try {
    const url = new URL(`${apiBaseUrl}/projects/${slug}`);
    if (locale) {
      url.searchParams.append("locale", locale);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: CACHE_DURATION },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const json: ApiResponse<Project> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || "Project not found");
    }

    return json.data;
  } catch (error) {
    console.error(`Error fetching project ${slug}:`, error);
    throw error;
  }
}

export async function getProjectsReduced(locale?: string): Promise<ProjectReduced[]> {
  try {
    const url = new URL(`${apiBaseUrl}/projects/lite`);
    if (locale) {
      url.searchParams.append("locale", locale);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: CACHE_DURATION },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const json: ApiResponse<ProjectReduced[]> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || "Failed to fetch projects");
    }

    return json.data;
  } catch (error) {
    console.error("Error fetching reduced projects:", error);
    throw error;
  }
}

export async function getProjectBySlugReduced(
  slug: string,
  locale?: string
): Promise<ProjectReduced> {
  try {
    const url = new URL(`${apiBaseUrl}/projects/${slug}/lite`);
    if (locale) {
      url.searchParams.append("locale", locale);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: CACHE_DURATION },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const json: ApiResponse<ProjectReduced> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || "Project not found");
    }

    return json.data;
  } catch (error) {
    console.error(`Error fetching reduced project ${slug}:`, error);
    throw error;
  }
}
