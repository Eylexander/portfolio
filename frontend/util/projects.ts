// API client for projects with caching
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return 'http://' + window.location.hostname + '/api/v1';
  }
  return 'http://localhost:8000/api/v1';
}

// Cache structure
const cache: {
  projects: Record<string, { data: Project[] | null; timestamp: number }>;
  projectBySlug: Record<string, Record<string, { data: Project | null; timestamp: number }>>;
} = {
  projects: {},
  projectBySlug: {},
};

// Cache duration: 10 minutes (in milliseconds)
const CACHE_DURATION = 10 * 60 * 1000;

export type ProjectLocale = {
  title: string;
  description: string;
  content: string;
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

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
};

/**
 * Check if cached data is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Extract locale-specific content from a Project
 * Returns a flat object with title, description, and content for the given locale
 */
export function getProjectForLocale(project: Project, locale: string) {
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

/**
 * Fetch all published projects from the API with caching
 * @param locale Optional locale to filter projects by
 */
export async function getProjects(locale?: string): Promise<Project[]> {
  const cacheKey = locale || 'default';
  
  // Return cached data if valid
  if (
    cache.projects[cacheKey]?.data !== null &&
    isCacheValid(cache.projects[cacheKey]?.timestamp || 0)
  ) {
    return cache.projects[cacheKey]?.data || [];
  }

  try {
    const url = new URL(`${getApiBaseUrl()}/projects`);
    if (locale) {
      url.searchParams.append('locale', locale);
    }
    
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const json: ApiResponse<Project[]> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to fetch projects');
    }

    // Update cache
    if (!cache.projects[cacheKey]) {
      cache.projects[cacheKey] = { data: null, timestamp: 0 };
    }
    cache.projects[cacheKey] = {
      data: json.data,
      timestamp: Date.now(),
    };

    return json.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Return cached data even if expired, as fallback
    if (cache.projects[cacheKey]?.data) {
      return cache.projects[cacheKey].data;
    }
    throw error;
  }
}

/**
 * Fetch a single project by slug with caching
 * @param slug Project slug
 * @param locale Optional locale to filter by
 */
export async function getProjectBySlug(slug: string, locale?: string): Promise<Project> {
  const localeKey = locale || 'default';
  
  // Initialize locale cache if it doesn't exist
  if (!cache.projectBySlug[slug]) {
    cache.projectBySlug[slug] = {};
  }

  // Return cached data if valid
  if (
    cache.projectBySlug[slug][localeKey]?.data !== null &&
    isCacheValid(cache.projectBySlug[slug][localeKey]?.timestamp || 0)
  ) {
    return cache.projectBySlug[slug][localeKey]?.data as Project;
  }

  try {
    const url = new URL(`${getApiBaseUrl()}/projects/${slug}`);
    if (locale) {
      url.searchParams.append('locale', locale);
    }
    
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const json: ApiResponse<Project> = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Project not found');
    }

    // Update cache
    cache.projectBySlug[slug][localeKey] = {
      data: json.data,
      timestamp: Date.now(),
    };

    return json.data;
  } catch (error) {
    console.error(`Error fetching project ${slug}:`, error);
    // Return cached data even if expired, as fallback
    if (cache.projectBySlug[slug]?.[localeKey]?.data) {
      return cache.projectBySlug[slug][localeKey].data as Project;
    }
    throw error;
  }
}

/**
 * Clear all caches
 */
export function clearProjectCache(): void {
  cache.projects = {};
  cache.projectBySlug = {};
}

/**
 * Clear cache for a specific project
 */
export function clearProjectCacheBySlug(slug: string): void {
  delete cache.projectBySlug[slug];
}

/**
 * Invalidate all caches to force fresh fetch on next request
 */
export function invalidateProjectCache(): void {
  Object.keys(cache.projects).forEach((locale) => {
    cache.projects[locale].timestamp = 0;
  });
  Object.keys(cache.projectBySlug).forEach((slug) => {
    Object.keys(cache.projectBySlug[slug]).forEach((locale) => {
      cache.projectBySlug[slug][locale].timestamp = 0;
    });
  });
}
