# Deployment Guide: ATS Demo

This guide provides instructions on how to deploy the Applicant Tracking System (ATS) Demo.

## Environment Variables

Ensure you have a `.env` file in the root directory (refer to [.env.example](file:///.env.example)) with the following:

- `DATABASE_URL`: Connection string for your database (default is `file:./dev.db` for SQLite).
- `JWT_SECRET`: A secret key for signing authentication tokens.

## Prerequisites

- Node.js (v18+)
- NPM or Yarn

## Local Production Build

To run the application in production mode locally:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```
3.  **Run Database Migrations**:
    ```bash
    npx prisma migrate deploy
    ```
4.  **Build the application**:
    ```bash
    npm run build
    ```
5.  **Start the server**:
    ```bash
    npm run start
    ```

## Deploying to Vercel (Recommended)

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add the environment variables (`DATABASE_URL`, `JWT_SECRET`) in the Vercel project settings.
4.  Vercel will automatically handle the build and deployment.
    - **Note**: For SQLite, data will reset on every deployment. For persistent storage, use a managed database like Postgres (Supabase, Neon).

## Deploying to VPS (e.g., DigitalOcean, AWS)

1.  Clone the repository to your server.
2.  Follow the **Local Production Build** steps above.
3.  Use a process manager like `pm2` to keep the application running:
    ```bash
    npm install -g pm2
    pm2 start npm --name "ats-demo" -- start
    ```

## Database Considerations

- **SQLite**: Great for demos and small projects. Included by default.
- **PostgreSQL**: Recommended for production. Update `schema.prisma` and `DATABASE_URL` accordingly.
