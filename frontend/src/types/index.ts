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
