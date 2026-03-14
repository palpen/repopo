# GitHub Repo Hunt (MVP)

A platform to discover and share cool developer projects from GitHub.

## Getting Started

First, install the dependencies:

```bash
npm install
```

## Database Setup

This project uses **Prisma 7** with a PostgreSQL driver adapter. To set up your local database:

1. **Prerequisites**: Ensure you have a PostgreSQL instance running locally (default port `5432`).
2. **Environment Variables**: Create a `.env` file in the root directory and add your connection string:
   ```env
   LOCAL_DATABASE_URL="postgresql://USERNAME@localhost:5432/githubhunt"
   ```
3. **Initialize Database**: Sync the Prisma schema to your local database and generate the client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

## Running Locally

Once the database is set up, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL with [Prisma ORM 7](https://www.prisma.io/)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
