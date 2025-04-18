# Noter - Modern Note-Taking Application

![Noter Banner](https://via.placeholder.com/1200x300/0a0a0a/16a34a?text=Noter+Modern+Note+Taking+App)

## 📝 Overview

Noter is a feature-rich note-taking application built with modern web technologies. It allows users to create, edit, and share notes with a beautiful, responsive interface. With folder organization, bookmark functionality, and public/private notes, Noter helps users organize their thoughts and share knowledge.

## ✨ Features

- **💻 Rich Text Editing** - Create beautiful notes with a powerful TipTap WYSIWYG editor
- **🔍 Quick Search** - Find notes instantly with full-text search
- **🔐 Private & Public Notes** - Control who can see your notes
- **🔖 Bookmarks** - Save important notes for quick access
- **📁 Folder Organization** - Organize notes in a folder structure
- **👥 User Profiles** - Personalized spaces for your content
- **🌐 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🔒 Secure Authentication** - Login with email/password and Google OAuth

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://reactjs.org/), [TailwindCSS 4](https://tailwindcss.com/)
- **Backend**: [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Editor**: [TipTap](https://tiptap.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) database (local or hosted)

## 🚀 Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/noter.git
cd noter
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables: Create a .env.local file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/noter"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open http://localhost:3000 in your browser to see the application.

## 🗄️ Database Schema

Noter uses Prisma ORM with a PostgreSQL database. The main models include:

- User: User accounts and profiles
- Note: The core note content with privacy settings
- Bookmark: Saved notes for quick access
- Folder: Organization structure for notes

## 📁 Project Structure

```bash
/noter
├── /prisma              # Database schema and migrations
├── /public              # Static assets
├── /src
│   ├── /app             # Next.js App Router pages
│   │   ├── /api         # API routes
│   │   │   ├── /auth    # Authentication endpoints
│   │   │   ├── /bookmarks # Bookmark management
│   │   │   ├── /folders # Folder management
│   │   │   ├── /notes   # Note CRUD operations
│   │   │   ├── /public  # Public notes/folders endpoints
│   │   │   └── /users   # User profile endpoints
│   │   ├── /bookmarks   # Bookmarks page
│   │   ├── /explore     # Explore public notes
│   │   ├── /folders     # Folder management
│   │   ├── /notes       # User's notes and editor
│   │   ├── /profile     # User profiles
│   │   └── /signin      # Authentication pages
│   ├── /components      # Reusable React components
│   ├── /lib             # Utility functions and libraries
│   └── /types           # TypeScript type definitions
├── .env.local           # Environment variables (local)
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## 🔐 Authentication

Noter supports multiple authentication methods:

1. Google OAuth: Sign in with Google account
2. Email/Password: Traditional credential-based authentication

Authentication is handled by NextAuth.js with secure JWT sessions.

## 🔄 API Routes

Noter provides RESTful API endpoints for:

- /api/auth/* - Authentication endpoints
- /api/notes - CRUD operations for notes
- /api/notes/[id] - Individual note operations
- /api/bookmarks - Managing bookmarked notes
- /api/folders - Folder management
- /api/folders/[id] - Individual folder operations
- /api/users/[id] - User profile data
- /api/users/[id]/notes - User's notes
- /api/public/notes - Discover publicly shared notes
- /api/public/folders - Browse public folders

## 🚢 Deployment

Deploying to Vercel

1. Push your code to GitHub
2. Go to Vercel Dashboard
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

The package.json already includes the necessary scripts for Vercel deployment:

```bash
"scripts": {
  "build": "prisma generate && next build",
  "vercel-build": "prisma generate && prisma migrate deploy && next build"
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

Project Lead - [@jayvaliyajay09](https://x.com/jayvaliya09)

Project Link: [GitHub](https://github.com/jayvaliya/noter)

Project Lead Email - [valiyajay555@gmail.com](mailto:valiyajay555@gmail.com)

Built with ❤️ by Jay Valiya.
