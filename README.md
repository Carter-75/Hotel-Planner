# Hotel Planner (MEAN Stack)

A comprehensive hotel management application built with the MEAN stack, designed with a premium portfolio template.

## Project Structure
- **/backend**: Express.js server, MongoDB models, and API routes.
- **/frontend**: Angular application for the user interface.
- **/api**: Serverless entry point for Vercel deployment.

## Setup & Installation

**Install All Dependencies**:
From the project root, run:
```bash
npm run install-all
```

## Running the Application

You can manage both the frontend and backend from the root directory using these commands:

- **Development Mode**: Starts the unified launcher.
  ```bash
  npm run dev
  ```
- **Standard Mode**: Starts both applications normally.
  ```bash
  npm start
  ```

## Features
- **Frontend**: Angular v21 (Standalone, Signals) with Matter.js physics and Anime.js animations.
- **User Authentication**: Secure login/signup using Passport.js with forgot-password support.
- **Hotel Management**: Browse, search, and manage hotel listings.
- **Security**: Iframe protection for portfolio embedding.
- **Deployment**: Configured for Vercel with serverless functions.

## Environment Configuration
A `.env.local` file is used in the `backend/` directory (and root during dev) to manage secrets like `MONGODB_URI` and `SESSION_SECRET`.
