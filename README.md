# Eylexander's Portfolio

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Go-1.25-00ADD8?style=for-the-badge&logo=go" alt="Go">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker" alt="Docker">
</div>

My personal portfolio website and blog. Contains a Next.js frontend and a Go backend with MongoDB.

## Features
- **Custom Design**: Boids canvas simulation background, Tailwind styling, and Framer Motion animations.
- **Admin Panel**: Backend interface to write/edit markdown articles, trigger database backups, and manage website settings.
- **Articles & Projects**: Markdown-supported articles with math rendering (KaTeX) and syntax highlighting.
- **Internationalization (i18n)**: English and French translation routing (`next-intl`), with an Ollama backend integration to auto-translate content between locales.
- **Contact & Notifications**: Contact form integrated with Gotify for instant push notifications to my devices.

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, Framer Motion, Zustand
- **Backend**: Go 1.25, Gin, MongoDB, JWT auth, Resty
- **Infrastructure**: Docker, Docker Compose, Nginx

## Quick Start

### Development

You can run the environment using Docker Compose:

```bash
# Start MongoDB, Frontend, and Backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env
docker compose -f docker/docker-compose.yml up -d
```

Or you can run the components manually:

**Frontend**:
```bash
cd frontend
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env
pnpm run dev
```
Accessible at `http://localhost:3000`.

**Backend**:
```bash
cd backend
go mod tidy
go run src/cmd/main.go
```
Accessible at `http://localhost:8000`.
Make sure to have a MongoDB instance running and `.env` configured with the right credentials.

### Deployment

The system is fully containerized. A `build.sh` script is provided to simplify image building:

```bash
# Build the production docker images
./build.sh

# Run via production compose file
docker compose -f docker/docker-compose.prod.yml up -d
```

This starts the Next.js frontend, Go API, MongoDB, and an Nginx reverse proxy.
