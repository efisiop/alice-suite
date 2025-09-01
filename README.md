# 📚 Alice Suite

A comprehensive AI-powered reading platform that combines intelligent learning assistance with human consultant support.

## 🌟 Live Applications

- **🏠 [Alice Suite Homepage](https://efisiop.github.io/alice-suite/)**
- **📖 [Alice Reader](https://efisiop.github.io/alice-suite/alice-reader/)** - Main reading application for students
- **👨‍🏫 [Consultant Dashboard](https://efisiop.github.io/alice-suite/alice-consultant-dashboard/)** - Dashboard for educators and consultants

## 🎯 Overview

Alice Suite is a modern reading platform designed to provide personalized learning experiences through AI assistance and human guidance. The platform consists of two main applications built as a monorepo with shared packages and infrastructure.

### 🏗️ Architecture

```
alice-suite/
├── 📱 APPS/                        # Main applications
│   ├── alice-reader/               # Reader application
│   ├── alice-consultant-dashboard/ # Consultant dashboard
│   └── alice-suite-monorepo/       # Monorepo structure
├── 🧪 TESTING/                     # Testing and debugging
├── 📚 DOCS/                        # Documentation
├── 🔧 TOOLS/                       # Development tools
├── 🚀 DEPLOYMENT/                  # Production deployment
└── 📋 ORGANIZATION/                # Organization tools
```

## 🚀 Features

### Alice Reader
- **AI-Powered Assistance**: Intelligent reading support and comprehension help
- **Personalized Learning**: Adaptive content based on reading level and progress
- **Interactive Tools**: Multimedia support and interactive reading features
- **Progress Tracking**: Comprehensive analytics and learning insights
- **Accessibility**: Inclusive design for diverse learning needs

### Consultant Dashboard
- **Real-Time Monitoring**: Live view of student progress and activities
- **Interactive Support**: Direct communication and assistance tools
- **Analytics Dashboard**: Detailed performance metrics and insights
- **Session Management**: Organize and manage learning sessions
- **User Management**: Handle student accounts and permissions

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Build Tool**: Vite
- **Backend**: Supabase (Database, Auth, Real-time)
- **Deployment**: GitHub Pages
- **Package Management**: pnpm (monorepo)
- **CI/CD**: GitHub Actions

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/efisiop/alice-suite.git
   cd alice-suite
   ```

2. **Install dependencies**
   ```bash
   # For Alice Reader
   cd APPS/alice-reader
   npm install
   
   # For Consultant Dashboard
   cd ../alice-consultant-dashboard
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files and configure
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development servers**
   ```bash
   # Alice Reader (port 5173)
   cd APPS/alice-reader
   npm run dev
   
   # Consultant Dashboard (port 5174)
   cd ../alice-consultant-dashboard
   npm run dev
   ```

## 📦 Building for Production

```bash
# Build Alice Reader
cd APPS/alice-reader
npm run build

# Build Consultant Dashboard
cd ../alice-consultant-dashboard
npm run build
```

## 🚀 Deployment

The applications are automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment
1. Build both applications
2. Copy build outputs to `docs/` directory
3. Push changes to trigger GitHub Actions

### GitHub Pages Configuration
- **Source**: Deploy from a branch
- **Branch**: `gh-pages` (automatically created by GitHub Actions)
- **Folder**: `/docs`

## 🧪 Testing

```bash
# Run tests for Alice Reader
cd APPS/alice-reader
npm test

# Run tests for Consultant Dashboard
cd ../alice-consultant-dashboard
npm test
```

## 📚 Documentation

- **[Setup Guide](DOCS/general/README.md)** - Detailed setup instructions
- **[Testing Guide](DOCS/guides/DASHBOARD_TESTING_GUIDE.md)** - Testing procedures
- **[API Documentation](DOCS/guides/DASHBOARD_STATE_DOCUMENTATION.md)** - API reference
- **[Deployment Guide](GITHUB_PAGES_SETUP.md)** - Deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Designed for accessibility and inclusive learning
- Powered by AI and human expertise

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `DOCS/` folder
- Review the testing guides for troubleshooting

---

**Alice Suite** - Empowering learning through AI and human collaboration 🚀
