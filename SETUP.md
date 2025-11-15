# Local Setup Guide - VZNX Workspace Management Platform

This guide will help you set up and run the VZNX Technical Challenge project on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Bun** (recommended) or npm/yarn - [Install Bun](https://bun.sh/)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd vznx-workspace-platform
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database Configuration (Turso)
DATABASE_URL=your_turso_database_url
DATABASE_AUTH_TOKEN=your_turso_auth_token
```

#### Getting Turso Database Credentials:

1. **Sign up for Turso** (free): [https://turso.tech/](https://turso.tech/)
2. **Install Turso CLI**:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
3. **Create a database**:
   ```bash
   turso db create vznx-workspace
   ```
4. **Get database URL**:
   ```bash
   turso db show vznx-workspace --url
   ```
5. **Create auth token**:
   ```bash
   turso db tokens create vznx-workspace
   ```
6. Copy the URL and token to your `.env` file

### 4. Set Up the Database

Run database migrations and seed initial data:

```bash
# Push database schema
bun run db:push

# Seed sample data (optional but recommended)
bun run db:seed
```

### 5. Run the Development Server

```bash
bun run dev
```

Or with npm:
```bash
npm run dev
```

The application will be available at **http://localhost:3000**

## 🏗️ Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard homepage
│   │   ├── projects/          # Projects pages
│   │   ├── team/              # Team overview page
│   │   └── api/               # API routes
│   │       ├── projects/      # Projects CRUD API
│   │       ├── tasks/         # Tasks CRUD API
│   │       └── team-members/  # Team members CRUD API
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   └── workspace/        # Custom workspace components
│   ├── db/                   # Database configuration
│   │   ├── schema.ts         # Drizzle ORM schema
│   │   └── seeds/            # Database seeders
│   └── lib/                  # Utility functions
├── .env                      # Environment variables
├── drizzle.config.ts        # Drizzle configuration
├── package.json             # Dependencies
└── SETUP.md                 # This file
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **Shadcn/UI** - Component library
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Type-safe database ORM
- **Turso** - SQLite database (libSQL)

### Development Tools
- **Bun** - Fast JavaScript runtime and package manager
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## 📝 Available Scripts

```bash
# Development
bun run dev          # Start development server

# Database
bun run db:push      # Push schema changes to database
bun run db:seed      # Seed database with sample data
bun run db:studio    # Open Drizzle Studio (database GUI)

# Production
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Run ESLint
```

## ✅ Features Implemented

### Core Requirements ✅
1. **Project Dashboard**
   - Display projects with name, status, and progress bar
   - Add new projects
   - Edit project details and progress
   - Delete projects

2. **Task List (Inside Each Project)**
   - View all tasks for a project
   - Toggle task status (Complete/Incomplete)
   - Visual feedback (strikethrough for completed tasks)
   - Add new tasks
   - Delete tasks

3. **Team Overview**
   - Display team members
   - Show task count per member
   - Capacity bar with color indicators (green/orange/red)
   - Add/remove team members

### Bonus Features ✅
- **Auto-update project progress**: When tasks are marked complete/incomplete, the project progress bar automatically updates
- **Workload color indicators**: Green (low), Orange (medium), Red (high)
- **Real-time dashboard stats**: Auto-refreshes when navigating back
- **Responsive design**: Works on all screen sizes

## 🧪 Testing the Application

### 1. Dashboard
- Open http://localhost:3000
- View total projects, tasks, team members
- Check average progress percentage

### 2. Projects Management
- Click "New Project" to create a project
- Click on any project to view details
- Edit progress or delete from project detail page

### 3. Tasks Management
- Inside a project, add new tasks
- Toggle task status (complete/incomplete)
- Watch project progress update automatically

### 4. Team Overview
- Navigate to "Team" from dashboard
- Add new team members
- Assign tasks to members
- View capacity indicators

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 bun run dev
```

### Database Connection Issues
- Verify your `.env` file has correct Turso credentials
- Check if database exists: `turso db list`
- Recreate auth token if expired: `turso db tokens create vznx-workspace`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
bun install
bun run dev
```

## 📦 Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- **Netlify**: Supports Next.js
- **Railway**: Full-stack deployment
- **Render**: Static + API hosting

## 📞 Support

For issues or questions about this technical challenge submission:
- **Candidate**: [Your Name]
- **Email**: [Your Email]
- **Challenge**: VZNX Developer Technical Challenge

## 🎯 Challenge Completion

This project fulfills all VZNX Technical Challenge requirements:

✅ **Core Requirements**: Project Dashboard, Task Management, Team Overview  
✅ **Bonus Features**: Auto-progress updates, Capacity indicators  
✅ **Tech Stack**: React/Next.js with backend API  
✅ **Code Quality**: Clean, structured, and maintainable  
✅ **Design**: Clean UI with clear visual hierarchy  

---

**Built for VZNX Technical Challenge**  
*Showcasing full-stack development with Next.js 15, TypeScript, and modern best practices*
