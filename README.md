# 📚 Word Saver

A modern Progressive Web App (PWA) for saving and organizing vocabulary with smart review notifications.

![Word Saver](https://img.shields.io/badge/PWA-enabled-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.19-cyan)

## ✨ Features

### 📖 Word Management

- **Add Words**: Save words with definitions, tags, and contexts
- **Smart Organization**: Organize words by custom contexts (study topics, books, etc.)
- **Advanced Search**: Find words quickly across all your vocabulary
- **Export/Import**: Backup and restore your data in JSON format

### 🔔 Smart Notifications

- **Review Reminders**: Get browser notifications to review your words
- **Contextual Reviews**: Review words from specific contexts
- **Interactive Modal**: Click notifications to open review sessions

### 🎨 User Experience

- **Progressive Web App**: Install on any device, works offline
- **Dark/Light Theme**: Automatic theme switching with manual override
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Semantic Design System**: Consistent UI with comprehensive color tokens

### 📊 Statistics & Insights

- **Word Count**: Track your vocabulary growth
- **Context Analytics**: See how many words per context
- **Storage Usage**: Monitor local storage consumption
- **Review Progress**: Track your learning sessions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: v22)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/BrunoYTanaka/word-saver.git

# Navigate to project directory
cd word-saver

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Build for Production

```bash
# Build the app
npm run build

# Preview the build
npm run serve
```

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.3.0
- **Styling**: Tailwind CSS 3.4 with semantic design tokens
- **PWA**: Vite PWA plugin with Workbox
- **Database**: IndexedDB for offline storage
- **Notifications**: Browser Notification API
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Prettier + Husky

## 📁 Project Structure

For a detailed overview of the project architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).

```
src/
├── app/                # Application configuration and routing
├── shared/             # Shared resources (UI, layout, hooks, utils)
├── core/               # Infrastructure layer (database, PWA, notifications)
├── features/           # Feature modules (vocabulary, learning, analytics, etc.)
├── store/              # Redux state management
└── pages/              # Page compositions
```

## 🎨 Design System

Word Saver uses a comprehensive semantic token system:

- **Primary**: Main brand color and interactive elements
- **Success**: Positive actions and feedback
- **Warning**: Attention and caution states
- **Destructive**: Dangerous actions and errors
- **Muted**: Secondary text and subtle elements

Themes are automatically applied based on system preference with manual override available.

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Install Prompt**: Install on desktop and mobile devices
- **Background Sync**: Sync data when connection is restored
- **Push Notifications**: Review reminders (browser notifications)

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run serve           # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run prettier        # Format with Prettier
npm run typecheck       # TypeScript type checking

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes (Husky will run lint checks on commit)
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Bruno Yoichi Tanaka**

- GitHub: [@BrunoYTanaka](https://github.com/BrunoYTanaka)
- Email: brunoyoichi@hotmail.com

---

⭐ If you found this project useful, please consider giving it a star on GitHub!
