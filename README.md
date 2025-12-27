# ATS Demo

A comprehensive Applicant Tracking System (ATS) demo built with Next.js 15 (App Router), TypeScript, Prisma, SQLite, and Tailwind CSS.

## Features

### Core
- **Job Management**: View open positions.
- **Applicant Management**: Candidates can apply with resume upload (stored in DB).
- **Duplicate Prevention**: Prevents candidates from applying to the same job twice.
- **Recruiter Dashboard**: Filter applications by status, job, or search text.
- **Status Workflow**: Track candidates from APPLIED -> SCREENING -> INTERVIEW -> REJECTED -> HIRED.
- **Notes System**: Add internal notes for each application.

### "AI" Features
- **Smart Scoring**: Automatically assigns a relevance score (0-100) to applications.
- **Insight Summary**: Generates a brief summary based on the score.
- *Note: This is currently simulated with keyword matching/random logic for the demo, as requested.*

## Tech Stack
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: SQLite (file-based `dev.db`)
- **ORM**: Prisma
- **Styling**: Tailwind CSS

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   *Note: Using Prisma 5.x for compatibility with standard schema structure.*

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Public Job Board: [http://localhost:3000/jobs](http://localhost:3000/jobs)
   - Recruiter Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Deployment

Deploying to Vercel:

1. Push to GitHub.
2. Import project in Vercel.
3. Build command: `next build`
4. Install command: `npm install`
5. **Important**: SQLite is ephemeral on Vercel. Any data created (including uploaded resumes) will be lost on the next deployment. For persistent storage in production, switch the Prisma provider to PostgreSQL (e.g., Vercel Postgres, Supabase, Neon).

## Project Structure
- `src/components`: Reusable UI components.
- `prisma/schema.prisma`: Database schema.

## Business Rules & Assumptions

### Recruiter Access Control
For this take-home demo, we have implemented stricter access rules than a typical basic setup:
1. **No Self-Applying**: A recruiter cannot apply to a job they created. This prevents conflict of interest and database clutter.
   - *Implementation*: The `POST /api/applications` endpoint checks the applicant's email against the Job's owner.
2. **Job Ownership**: Recruiters can only Edit/Delete jobs they specifically created.
3. **Application Privacy**: Recruiters can only view applications for their own jobs.

### Demo Limitations
- **Mock Authentication**: Since there is no full Auth Provider (like dynamic NextAuth/Clerk) in this demo scope, authentication is simulated via the `X-Recruiter-Email` header.
    - In a real app, this would be replaced by `session.user.email`.
    - **How to Test**: Use Postman or curl with `X-Recruiter-Email: alice@company.com`.
- **Database Reset**: The migration `init_recruiter` introduces a mandatory relationship. The provided seed script populates necessary test data.





