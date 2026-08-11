# Kerukunan Basanohi SUA

A community application for Kerukunan Basanohi SUA built with React, Vite, Express, and PostgreSQL (Drizzle ORM).

## Features
- Member Management
- Event/Activity Management 
- News & Announcements
- User Authentication & Roles

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL Database (Local or Supabase)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your database credentials and JWT secret.
   ```bash
   cp .env.example .env
   ```

3. **Set up the Database Schema:**
   The project uses Drizzle ORM. To push the schema to your database, run:
   ```bash
   npm run db:push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Building for Production

To build the application for production:
```bash
npm run build
```
This will compile both the React frontend and the Express backend into the `dist/` directory.

To start the production server:
```bash
npm start
```
