"use client";

import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/authStore';
import { Article, LoginResponse, Settings } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: `${API_URL}/api/v1`,
			headers: {
				'Content-Type': 'application/json',
			},
		});

		this.client.interceptors.request.use((config) => {
			const token = Cookies.get('token');
			if (token) {
				config.headers['Authorization'] = `Bearer ${token}`;
			}
			return config;
		});

		this.client.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response && error.response.status === 401) {
					useAuthStore.getState().logout();
				}
				return Promise.reject(error);
			}
		);
	}

	// Auth
	async login(username: string, password: string): Promise<LoginResponse> {
		const response = await this.client.post<LoginResponse>('/auth/login', { username, password });
		return response.data;
	}

	async verifyToken(): Promise<boolean> {
		try {
			await this.client.get('/auth/verify');
			return true;
		} catch (error) {
			console.error('Token verification failed:', error);
			return false;
		}
	}

	async updateCredentials(newUsername?: string, newPassword?: string): Promise<void> {
		await this.client.put('/auth/credentials', { newUsername, newPassword });
	}

	// Articles (Public & Admin)
	async getArticles(admin: boolean = false): Promise<Article[]> {
		const endpoint = admin ? '/admin/articles' : '/articles';
		const response = await this.client.get<Article[]>(endpoint);
		return response.data;
	}

	async getArticle(slug: string): Promise<Article> {
		const response = await this.client.get<Article>(`/articles/${slug}`);
		return response.data;
	}

	async createArticle(article: Partial<Article>): Promise<Article> {
		const response = await this.client.post<Article>('/articles', article);
		return response.data;
	}

	async updateArticle(id: string, article: Partial<Article>): Promise<Article> {
		const response = await this.client.put<Article>(`/articles/${id}`, article);
		return response.data;
	}

	async deleteArticle(id: string): Promise<void> {
		await this.client.delete(`/articles/${id}`);
	}

	async uploadImage(file: File): Promise<string> {
		const formData = new FormData();
		formData.append('image', file);
		const response = await this.client.post<{ url: string }>('/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return `${API_URL}${response.data.url}`;
	}

	async uploadImageFromUrl(url: string): Promise<string> {
		const response = await this.client.post<{ url: string }>('/upload/from-url', { url });
		return `${API_URL}${response.data.url}`;
	}

	async getUploads(): Promise<string[]> {
		const response = await this.client.get<string[]>('/uploads');
		return response.data.map(url => `${API_URL}${url}`);
	}

	async deleteUpload(filename: string): Promise<void> {
		await this.client.delete(`/uploads/${filename}`);
	}

	// Contact
	async sendContactMessage(data: { name: string; email: string; subject: string; message: string; website?: string }): Promise<void> {
		await this.client.post('/contact', data);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getContactMessages(): Promise<any[]> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const response = await this.client.get<any[]>('/messages');
		return response.data;
	}

	async deleteContactMessage(id: string): Promise<void> {
		await this.client.delete(`/messages/${id}`);
	}

	// About
	async getAboutData(): Promise<import('@/types').AboutData> {
		const response = await this.client.get<import('@/types').AboutData>('/about');
		return response.data;
	}

	async updateAboutData(data: import('@/types').AboutData): Promise<import('@/types').AboutData> {
		const response = await this.client.put<import('@/types').AboutData>('/about', data);
		return response.data;
	}

	// Backup
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async exportBackup(): Promise<any> {
		const response = await this.client.get('/backup/export');
		return response.data;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async importBackup(data: any): Promise<void> {
		await this.client.post('/backup/import', data);
	}

	// Settings
	async getSettings(): Promise<Settings> {
		const response = await this.client.get<Settings>("/settings");
		return response.data;
	}

	async updateSettings(settings: Settings): Promise<Settings> {
		const response = await this.client.put<Settings>("/settings", settings);
		return response.data;
	}

	// Translate
	async getOllamaModels(): Promise<string[] | null> {
		try {
			const response = await this.client.get<{ models: string[] }>('/translate/models');
			return response.data.models || [];
		} catch {
			return null;
		}
	}

	async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
		const response = await this.client.post<{ translated_text: string }>('/translate', {
			text,
			source_lang: sourceLang,
			target_lang: targetLang
		});
		return response.data.translated_text;
	}
}

export const apiClient = new ApiClient();
export default apiClient;
