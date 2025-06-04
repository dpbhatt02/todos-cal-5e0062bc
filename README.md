
# Welcome to Taskendar

## Project info

**URL**: https://lovable.dev/projects/9d677506-774d-4d7a-b266-624cb3394c4a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9d677506-774d-4d7a-b266-624cb3394c4a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9d677506-774d-4d7a-b266-624cb3394c4a) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Masterplan Overview

### Goals
- Provide a centralized schedule by integrating tasks with Google Calendar.
- Support one-time and recurring tasks with overdue management.
- Multi-device sync for web and mobile.

### Target Audience
- Freelancers, students, and professionals needing unified tasks and events.
- Anyone struggling with event-task overlaps.

### Key Features
- Task CRUD with drag and drop.
- Full-day and time-slot tasks.
- Recurring tasks.
- Overdue task accordion.
- Google Calendar two-way sync with selected calendar.
- Google OAuth and email signup.
- Multiple views: list, calendar, Kanban.
- Theme and color-coded priority, filtering, and search.

### Tech Stack
- Frontend: React, TypeScript, Tailwind CSS.
- Backend: Node.js with Express, Supabase.
- Google Calendar API with OAuth 2.0.

### Development Phases
1. MVP – basic tasks and calendar integration.
2. Advanced features – two-way sync and recurring tasks.
3. Monetization – premium features and integrations.

### Future Enhancements
- Collaboration features.
- Mobile app with React Native.
- Integrations with tools like Notion or Slack.
