# AI Mock Interview

AI Mock Interview helps job seekers practice technical interviews by generating role-specific questions and model answers, guiding live mock sessions with webcam and microphone support, capturing spoken answers via browser speech-to-text, and providing AI-generated ratings and improvement feedback. Authentication uses Clerk; data is stored in Neon/Postgres via Drizzle; Google Gemini powers question generation and scoring.

## Features

- Generate interview questions and model answers from a job role, job description, and experience level
- Run guided mock interviews with webcam and microphone support
- Record spoken answers using browser speech recognition and submit them for AI evaluation
- Review structured feedback, numeric ratings, and correct answers after each session
- Retake interviews with fresh question sets generated for each new attempt
- View and delete past interview sessions from the dashboard

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS and shadcn/ui components
- Clerk for authentication
- Neon/Postgres with Drizzle ORM for persistence
- Google Gemini for AI question generation and scoring
- react-webcam for webcam preview

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env.local`, push the database schema, and run the dev server:

```bash
npm run db:push
npm run dev
```

3. Open `http://localhost:3000`.

## Environment variables

Create `.env.local` with at least:

```env
NEXT_PUBLIC_DRIZZLE_DB_URL=your_neon_postgres_url
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — run production build
- `npm run lint` — run ESLint
- `npm run db:push` — push Drizzle schema
- `npm run db:studio` — open Drizzle Studio

## Notes

- Do not commit secret keys. `.gitignore` excludes environment files and build artifacts.
- The app requires microphone and webcam permissions for live mock interview sessions.
