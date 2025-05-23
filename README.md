# Eylexander's Portfolio

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Go-1.24-00ADD8?style=for-the-badge&logo=go" alt="Go">
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker" alt="Docker">
</div>

<div align="center">
  <h3>🚀 Modern, animated portfolio built with cutting-edge technologies</h3>
  <p>A complete full-stack portfolio showcasing projects, skills, and experience with beautiful animations and internationalization</p>
  
  <a href="https://eylexander.xyz">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#️-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a>
</div>

---

## ✨ Features

### **Modern Design & Animations**
- **Galaxy Background**: Custom animated particle system with nebula effects
- **Trail Animations**: Smooth GSAP-powered animations for text and UI elements
- **Interactive UI**: Hover effects, smooth transitions, and micro-interactions
- **Responsive Design**: Optimized for all screen sizes and devices

### **Internationalization**
- **Multi-language Support**: English and French locales
- **Dynamic Content**: Locale-specific project content and descriptions
- **SEO Optimized**: Proper meta tags and OpenGraph support for each language

### **Content Management**
- **MDX Integration**: Write content in Markdown with React components
- **Project Showcase**: Dynamic project gallery with filtering and categorization
- **Blog-style Articles**: Detailed project descriptions with syntax highlighting
- **Asset Management**: Optimized image loading and content delivery

### **Developer Experience**
- **TypeScript**: Full type safety across the entire application
- **Hot Reload**: Instant development feedback with Next.js
- **Docker Support**: Containerized development and deployment
- **Modern Tooling**: ESLint, Prettier, and automated formatting

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15.3](https://nextjs.org/) - React framework with SSR/SSG
- **Language**: [TypeScript 5.2](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [TailwindCSS 3.3](https://tailwindcss.com/) - Utility-first CSS framework
- **Animations**: [GSAP](https://greensock.com/gsap/) - Professional animation library
- **Content**: [MDX](https://mdxjs.com/) - Markdown with React components
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) - i18n for Next.js

### Backend
- **Language**: [Go 1.24](https://golang.org/) - Fast and efficient backend
- **Router**: [Gorilla Mux](https://github.com/gorilla/mux) - HTTP request router
- **Database**: [MongoDB](https://www.mongodb.com/) - NoSQL document database
- **Environment**: [godotenv](https://github.com/joho/godotenv) - Environment variable management

### DevOps & Deployment
- **Containerization**: [Docker](https://www.docker.com/) - Container platform
- **Orchestration**: [Docker Compose](https://docs.docker.com/compose/) - Multi-container applications
- **Database**: [MongoDB](https://www.mongodb.com/) with persistent volumes
- **Reverse Proxy**: [Nginx](https://nginx.org/) - High-performance web server

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Go 1.24+** - [Download](https://golang.org/dl/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/)
- **pnpm** (recommended) - `npm install -g pnpm`

### 1. Clone the Repository
```bash
git clone https://github.com/Eylexander/portfolio.git
cd portfolio
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install                    # Install dependencies
pnpm run dev                    # Start development server
```

The frontend doesn't require a backend to run.
You can access it at `http://localhost:3000`

### 3. Backend Setup
```bash
cd backend
go mod tidy                     # Download Go dependencies
go run main.go                  # Start the Go API server
```

The backend API will be available at `http://localhost:8000`
It will require a MongoDB database to function properly.

### 4. Database Setup (Docker)
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

MongoDB will be available at `localhost:27017`

---

## 🐳 Docker Deployment

### Prerequisites

Every service is located inside the `beethoven` folder.

### Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# OR with make

# Start all services
make run

# Start with a fresh build
make build
```

There is also a bash script to build all docker images.

```bash
# Build all images in production mode
bash build.sh

# Build all images in development mode
bash build.sh -dev
```

### Production Deployment
```bash
cd deploy
docker-compose up -d

# OR with make

# Start all services
make run
```

This will start:
- **Frontend** (Next.js) on private port 3000
- **Backend** (Go API) on private port 8000
- **Database** (MongoDB) on port 27017
- **Nginx** reverse proxy on port 8080

---

## 📝 Content Management

### Adding New Projects

1. Create a new MDX file in `frontend/content/projects/[locale]/`:
```bash
# English version
frontend/content/projects/en/my-project.mdx

# French version
frontend/content/projects/fr/my-project.mdx
```

2. Add frontmatter metadata:
```yaml
---
title: "My Awesome Project"
description: "A brief description of the project"
date: "2025-01-24"
published: true
url: "https://project-demo.com"
repository: "username/repository"
---
```

3. Write your content in MDX format with React components support.

### Customizing Featured Projects

Set environment variables to control which projects appear on the main page:
```bash
NEXT_PUBLIC_FEATURED_PROJECT=my-main-project
NEXT_PUBLIC_TOP2_PROJECT=secondary-project
NEXT_PUBLIC_TOP3_PROJECT=third-project
```

---

## 🎨 Customization

### Internationalization
- **Add Languages**: Create new locale files in `frontend/messages/`
- **Configure Routing**: Update `frontend/src/i18n/routing.ts`
- **Content Translation**: Add locale-specific content in `frontend/content/projects/`

---

## 📊 Performance

- ⚡ **Lighthouse Score**: 95+ across all metrics
- 🚀 **First Contentful Paint**: < 1.5s
- 📱 **Mobile Optimized**: Responsive design with touch interactions
- 🔍 **SEO Ready**: Structured data and meta tags
- 🌐 **CDN Ready**: Optimized for global content delivery

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **Eclipse Public License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Design Inspiration**: [chronark.com](https://chronark.com) - Clean and elegant portfolio design
- **Animations**: [GSAP](https://greensock.com/) - Professional animation library
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) - Beautiful icon library
- **Hosting**: Self-hosted on personal infrastructure

---

<div align="center">
  <p>Built with ❤️ by <a href="https://eylexander.xyz">Eylexander</a></p>
  
  <a href="https://github.com/Eylexander">
    <img src="https://img.shields.io/github/followers/Eylexander?style=social" alt="GitHub followers">
  </a>
</div>
