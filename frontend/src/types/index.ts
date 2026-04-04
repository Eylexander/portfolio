export interface LocalizedString {
  "en-US": string;
  "fr-FR": string;
}

export interface Article {
  _id?: string;
  id: string;
  title: LocalizedString;
  slug: string;
  content: LocalizedString;
  snippet: LocalizedString;
  cover_image: string;
  tags: string[];
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  project_date: string;
  project_end_date?: string;
  external_link?: string;
}

export interface LoginResponse {
  token: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface Experience {
  id: string;
  role: LocalizedString;
  company: string;
  url?: string;
  period: LocalizedString;
  description: LocalizedString;
}

export interface StackItem {
  id: string;
  name: string;
  category: string;
  url: string;
}

export interface AboutData {
  id?: string;
  title: LocalizedString;
  description: LocalizedString;
  experience_title: LocalizedString;
  experiences: Experience[];
  associative_title: LocalizedString;
  associative_experiences: Experience[];
  education_title: LocalizedString;
  education_experiences: Experience[];
  stack_tools: StackItem[];
  section_order?: string[];
}


export interface Settings {
  ollama_model: string;
}
