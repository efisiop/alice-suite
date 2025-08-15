# 🚀 Cursor + Kimi Quick Commands Cheat Sheet

## ⚡ **Copy-Paste Commands for Cursor**

### **File Analysis**
```bash
claude "Explain this file: $(f=$(ls -t | head -1) && echo $f)"
claude "Find bugs in $(ls -t | head -1)"
claude "Optimize $(ls -t | head -1)"
```

### **Testing**
```bash
claude "Write tests for $(ls -t | head -1)"
claude "Test coverage for $(ls -t *.test.ts | head -1)"
claude "Mock data for $(ls -t *.ts | head -1)"
```

### **Refactoring**
```bash
claude "Refactor $(ls -t | head -1) using TypeScript best practices"
claude "Extract components from $(ls -t | head -1)"
claude "Simplify $(ls -t | head -1)"
```

### **Project Tasks**
```bash
# Alice Reader specific
claude "Add reading progress tracking to Alice Reader"
claude "Improve text highlighting in Alice Reader"

# Consultant Dashboard
claude "Add analytics to Consultant Dashboard"
claude "Enhance student progress monitoring"

# Shared package
claude "Migrate services to use @alice-suite/api-client"
```

### **Quick Fixes**
```bash
claude "Fix TypeScript errors in $(ls -t *.ts | head -1)"
claude "Resolve build issues"
claude "Update dependencies"
```

---

## 📱 **Cursor Terminal Aliases**

Add to your shell profile:
```bash
alias k-analyze='claude "Analyze $(ls -t | head -1)"'
alias k-test='claude "Write tests for $(ls -t | head -1)"'
alias k-refactor='claude "Refactor $(ls -t | head -1)"'
alias k-docs='claude "Document $(ls -t | head -1)"'
alias k-bugs='claude "Find bugs in $(ls -t | head -1)"'
```

## 🎯 **Daily Use Patterns**

### **Morning Setup**
```bash
claude "What's the project status?"
claude "What should I work on today?"
claude "Review my git diff from yesterday"
```

### **Feature Development**
```bash
claude "Plan the implementation for [FEATURE_NAME]"
claude "Create the component structure for [FEATURE_NAME]"
claude "Add error handling to [FEATURE_NAME]"
```

### **End of Day**
```bash
claude "Review today's changes and suggest improvements"
claude "Update documentation for new features"
claude "Create tests for today's code"
```