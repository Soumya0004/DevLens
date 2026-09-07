# DevLens

DevLens is a GitHub project analyzer built with Next.js, Supabase, and the GitHub API. It turns repository activity into health scores, charts, and actionable recommendations.

## Requirements

- Node.js 20.9 or newer (Node 22 LTS recommended)
- npm 10 or newer
- A Supabase project
- A GitHub OAuth app or personal access token for API access

## Project Structure

```text
app/
	(auth)/                 Authentication pages and callback route
	analyze/                Repository input and analysis workflow
	api/analysis/           Server-side analysis endpoint
	api/github/             GitHub proxy routes (repos, commits, contents, PRs)
	dashboard/              Live repository dashboard
	history/                Saved analysis history
	repository/[owner]/[repo]/  Repository detail view
	settings/               User and integration settings
	globals.css             Global design tokens and visual system
components/               Shared UI and dashboard visualizations
lib/github/               GitHub API client helpers
lib/supabase/             Browser, server, and middleware Supabase clients
supabase/migrations/      Database schema migrations
types/                    Shared TypeScript contracts
```

## Setup Process

1. Install dependencies with `npm install`.
2. Install the native Supabase CLI, authenticate with `supabase login`, and deploy the database migration with `npm run db:setup`.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Project Settings -> API.
4. In Supabase Authentication -> Providers -> GitHub, add the GitHub OAuth client ID and secret. Do not put the GitHub secret in a `NEXT_PUBLIC_*` variable.
5. In Supabase Authentication -> URL Configuration, add `http://localhost:3000/callback` as a redirect URL. For GitHub, the OAuth callback URL is `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
6. Start the app with `npm run dev` and open `http://localhost:3000`.
7. Sign in with GitHub, select a repository in Analyze, and review the generated recommendations and dashboard.

## Useful Commands

```bash
npm run dev       # local development
npm run lint      # ESLint
npm run build     # production build
npm run start     # serve the production build
npm run db:setup  # deploy Supabase migrations
```

On Windows, install the native CLI with Scoop:

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase login
npm run db:setup
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
