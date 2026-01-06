# Flux - Self-Hosted Photo Platform

**✨ Flux** is a privacy-focused, self-hosted photo management platform with professional editing tools, AI restoration, and social sharing capabilities.

## 🎯 Features

### Phase 1 (MVP) - ✅ Complete
- ✅ Docker deployment for TrueNAS Scale
- ✅ Multi-user authentication (Admin + User roles)
- ✅ Security: CSP headers, rate limiting, session management
- ✅ Modern three-panel UI (Sidebar, Main, Inspector)
- ✅ Light/Dark theme with CSS variables
- ✅ Keyboard shortcuts (press `?`)
- ✅ PWA support for offline mode
- ✅ Health monitoring endpoint

### Phase 2 (Image Import & Organization) - ✅ Complete
- ✅ Browser folder upload with progress tracking
- ✅ Image import with EXIF extraction
- ✅ Thumbnail generation with Sharp (300x300)
- ✅ Grid view with 4 size options (small, medium, large, xlarge)
- ✅ View controls (Grid/List toggle)
- ✅ 30+ file format support (JPG, PNG, GIF, BMP, WEBP, HEIC, RAW, Video prep)
- ✅ LocalStorage persistence for UI preferences

### Phase 3 (Inspector Panel) - 🚧 In Progress
- 🔨 Inspector panel with image details
- 🔨 EXIF metadata display
- 🔨 Rating and labeling system
- 📋 Favorite marking
- 📋 Metadata editing

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for development)

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/flux.git
cd flux

# Create environment file
cp .env.example .env
# Edit .env and set your configuration

# Build and run
docker-compose up -d

# Access Flux at http://localhost:3000
```

#### Option 2: Development Mode

```bash
# Install dependencies
npm install

# Setup backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
cd ..

# Setup frontend  
cd frontend
npm install
cd ..

# Run both frontend and backend
npm run dev

# Frontend: http://localhost:4173
# Backend: http://localhost:3000
```

## 📦 Project Structure

```
flux/
├── backend/               # Node.js + Express API
│   ├── prisma/           # Database schema
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, rate limiting
│   │   └── config/       # Security configuration
│   └── package.json
├── frontend/             # React + Vite PWA
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Pages (Login, Library)
│   │   ├── layouts/      # Main layout
│   │   ├── store/        # Zustand state management
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # API client
│   └── package.json
├── docker-compose.yml    # Docker orchestration
├── Dockerfile           # Multi-stage build
└── package.json         # Monorepo root
```

## 🔒 Default Credentials

**Username:** `admin` (or value in .env)  
**Password:** `admin123` (or value in .env)

**⚠️ IMPORTANT:** Change these credentials immediately after first login!

## 🔧 Configuration

See `.env.example` for all available configuration options:

- `SESSION_SECRET`: Secret key for session encryption
- `DATABASE_URL`: SQLite database path
- `PHOTO_LIBRARY_PATH`: Path to your photo collection
- `THUMBNAIL_SIZE`: Thumbnail dimensions (default: 300)
- `RATE_LIMIT_MAX_REQUESTS`: API rate limit (default: 100/15min)

## 🎨 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, PWA
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** SQLite
- **Image Processing:** Sharp, Libvips
- **State Management:** Zustand
- **Authentication:** Express-session + bcrypt

## 📱 PWA Features

- Offline support with Service Worker
- IndexedDB caching for images
- Installable on desktop and mobile
- Responsive design (Mobile First)

## ⚡ Performance

- Code splitting for optimal bundle size
- Virtual scrolling for large image libraries
- Lazy loading of images
- Bundle size budget: <250KB (main), <50KB (CSS)

## 🛣️ Roadmap

See [`flux_roadmap.md`](./flux_roadmap.md) for the complete feature roadmap covering:
- Organization & Workflow tools
- AI & ML analysis (face/object recognition)
- Professional editing studio
- AI restoration (upscaling, colorization)
- Video support
- Maps & geolocation
- Social features & sharing
- Advanced security & integrations

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
- Use Conventional Commits (`feat:`, `fix:`, `docs:`)
- Code in English, UI text in Swedish
- Follow Mobile First design principles
- Maintain bundle size budgets

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with privacy and user control in mind. No telemetry, no tracking, no cloud dependencies.

---

**Made with ❤️ by Dennis** • [Report Bug](https://github.com/yourusername/flux/issues) • [Request Feature](https://github.com/yourusername/flux/issues)