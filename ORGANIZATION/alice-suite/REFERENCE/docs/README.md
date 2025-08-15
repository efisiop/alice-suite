# 🎯 **Alice Suite - Educational Reading Platform**

A comprehensive educational reading platform consisting of two main applications:
- **Alice Reader**: Interactive reading interface for students
- **Alice Consultant Dashboard**: Management interface for educational consultants

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm 8+
- Supabase account and project
- Claude Code CLI (optional, for AI assistance)

### **One-Command Setup**
```bash
# Clone and setup
git clone <your-repo-url>
cd alice-suite
npm run setup

# Start both apps
npm run dev:all
```

### **AI-Powered Development (Optional)**
```bash
# Kimi API integration is pre-configured!
claude "Help me understand this codebase"
claude "Create a new component for user feedback"
```

### **Manual Setup**
```bash
# 1. Install dependencies
npm install
cd alice-reader && npm install
cd ../alice-consultant-dashboard && npm install

# 2. Configure environment variables
cp alice-reader/.env.example alice-reader/.env
cp alice-consultant-dashboard/.env.example alice-consultant-dashboard/.env
# Edit .env files with your Supabase credentials

# 3. Check environment
npm run check-env

# 4. Start both apps
npm run dev:all
```

## 📱 **Applications**

### **Alice Reader** (Port 5173)
- **URL**: http://localhost:5173
- **Purpose**: Interactive reading interface for students
- **Features**: 
  - Text highlighting and annotation
  - Progress tracking
  - Feedback viewing
  - Glossary integration

### **Alice Consultant Dashboard** (Port 5174)
- **URL**: http://localhost:5174
- **Purpose**: Management interface for educational consultants
- **Features**:
  - Student progress monitoring
  - Feedback management
  - Reading analytics
  - Assignment management

## 🛠️ **Available Scripts**

### **Development**
```bash
npm run dev:all          # Start both apps
npm run dev:reader       # Start Alice Reader only
npm run dev:dashboard    # Start Consultant Dashboard only
```

### **Building**
```bash
npm run build:all        # Build both apps
npm run build:reader     # Build Alice Reader only
npm run build:dashboard  # Build Consultant Dashboard only
```

### **Testing & Quality**
```bash
npm run test             # Run tests for both apps
npm run lint             # Run linting for both apps
npm run check-env        # Validate environment variables
```

### **Utilities**
```bash
npm run clean            # Clean build artifacts
npm run setup            # Full setup (install + env check)
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**

Both apps require these Supabase environment variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Environment Files**
- `alice-reader/.env` - Alice Reader environment variables
- `alice-consultant-dashboard/.env` - Consultant Dashboard environment variables
- `alice-reader/.env.example` - Example configuration for Alice Reader
- `alice-consultant-dashboard/.env.example` - Example configuration for Consultant Dashboard

## 🏗️ **Project Structure**

```
alice-suite/
├── alice-reader/                 # Student reading interface
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── alice-consultant-dashboard/   # Consultant management interface
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── scripts/                      # Utility scripts
│   └── check-env.js
├── start-both-apps.sh           # Startup script
├── package.json                 # Root workspace configuration
└── README.md
```

## 🧪 **Testing**

### **Running Tests**
```bash
# Test both apps
npm run test

# Test individual apps
npm run test:reader
npm run test:dashboard
```

### **Health Checks**
```bash
# Check environment configuration
npm run check-env

# Manual health checks (when apps are running)
curl http://localhost:5173/healthz
curl http://localhost:5174/healthz
```

## 🚀 **Deployment**

### **Development**
```bash
npm run dev:all
```

### **Production Build**
```bash
npm run build:all
npm run preview:all
```

### **Individual App Deployment**
```bash
# Alice Reader
npm run build:reader
npm run preview:reader

# Consultant Dashboard
npm run build:dashboard
npm run preview:dashboard
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Check what's using the ports
lsof -i :5173 -i :5174

# Kill processes if needed
kill -9 <PID>
```

#### **Environment Variables Missing**
```bash
# Check environment configuration
npm run check-env

# Copy example files if needed
cp alice-reader/.env.example alice-reader/.env
cp alice-consultant-dashboard/.env.example alice-consultant-dashboard/.env
```

#### **Dependencies Issues**
```bash
# Clean and reinstall
npm run clean
npm run install:all
```

### **Getting Help**

1. **Check the logs**: Look at the terminal output for error messages
2. **Verify environment**: Run `npm run check-env`
3. **Check ports**: Ensure ports 5173 and 5174 are available
4. **Restart apps**: Stop and restart with `npm run dev:all`
5. **AI assistance**: Use `claude "Help me debug this issue"` for AI-powered debugging

## 📚 **Technology Stack**

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Material-UI (MUI)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Context + Hooks
- **Build Tool**: Vite
- **Package Manager**: npm

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details

## 🆘 **Support**

For support and questions:
- Check the troubleshooting section above
- Review the environment configuration
- Ensure all prerequisites are met

---

**Happy coding! 🎉**
