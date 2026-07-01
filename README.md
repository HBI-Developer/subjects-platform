# Subjects Platform

A personal platform for storing and displaying academic subjects and educational resources in an organized and easily accessible way. The project aims to provide a simple experience for navigating between subjects and opening related content such as PDF files, images, audio/video clips, and office documents.

## Features

- Fast Arabic-friendly user interface with a responsive design
- Browse academic subjects as main sections
- View resources for each subject with multiple content types
- Support for previewing files such as:
  - PDF
  - Images
  - Audio
  - Video
  - Office files
- Admin dashboard for managing subjects and resources
- Authentication using Firebase Authentication
- Data storage via Firebase Firestore
- Support for changing the app theme/color
- Ready-to-deploy setup on Firebase Hosting

## Technologies Used

- React 19
- TypeScript
- Vite
- Chakra UI
- Redux Toolkit
- React Router
- Firebase Authentication and Firestore
- React Player and Plyr React
- Sass
- ESLint

## Project Structure

```text
src/
  components/         # Shared UI components
  pages/              # Main application pages
    Dashboard/        # Admin dashboard
    Login/            # Login page
    Resources/        # Resources listing page
    Subjects/         # Subjects listing page
    Welcome/          # Welcome page
  functions/          # Helper utilities and logic
  hooks/              # Custom hooks
  store/              # State management with Redux
  constants.ts       # App-wide constants
  firebase-config.ts # Firebase configuration
```

## Requirements

- Node.js 20 or newer
- pnpm

## Installation and Running

1. Clone the project:

   ```bash
   git clone <repository-url>
   cd subjects-platform
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root and add the following values:

   ```env
   VITE_API_KEY=your_api_key
   VITE_AUTH_DOMAIN=your_auth_domain
   VITE_PROJECT_ID=your_project_id
   VITE_STORAGE_BUCKET=your_storage_bucket
   VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_APP_ID=your_app_id
   ```

4. Run the project locally:
   ```bash
   pnpm dev
   ```

## Available Scripts

```bash
pnpm dev         # Start the development server
pnpm build       # Build the project for production
pnpm preview     # Preview the local build
pnpm lint        # Lint the code with ESLint
pnpm deploy      # Build and deploy to Firebase Hosting
```

## Deployment

The project is configured for deployment to Firebase Hosting using:

```bash
pnpm deploy
```

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for more details.
