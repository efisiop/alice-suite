# Alice Suite - Quick Start Scripts

## 🚀 Quick Start

### Option 1: Setup Aliases (Recommended)
```bash
./setup-aliases.sh
source ~/.zshrc
```

Then use these simple commands:
- `alice` - Start both apps
- `alice-status` - Check if apps are running
- `alice-stop` - Stop all apps

### Option 2: Direct Scripts
```bash
./start-both-apps.sh    # Start both apps
./check-status.sh       # Check status
./kill-all.sh          # Stop all apps
```

## 📱 App URLs
- **Alice Reader**: http://localhost:5173
- **Alice Consultant Dashboard**: http://localhost:5174

## 🛠️ Available Scripts

| Script | Purpose |
|--------|---------|
| `start-both-apps.sh` | Start both Alice apps |
| `check-status.sh` | Check if apps are running |
| `kill-all.sh` | Stop all running apps |
| `setup-aliases.sh` | Set up convenient aliases |

## 💡 Tips
- Use `Ctrl+C` to stop the apps when running `start-both-apps.sh`
- The apps run in the background, so you can close the terminal
- Check status anytime with `alice-status` or `./check-status.sh` 