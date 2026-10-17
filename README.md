# subjects-platform

> A Firebase-backed platform for organizing and delivering educational subjects and digital resources.

`subjects-platform` is a right-to-left React application for browsing collections, subjects, and learning resources. It also includes a protected dashboard for maintaining the platform content through Firebase.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Data model](#data-model)
- [Firebase configuration](#firebase-configuration)
- [Deployment](#deployment)
- [Code quality](#code-quality)
- [Project status](#project-status)
- [Contributing](#contributing)
- [License](#license)

## Overview

The application presents educational content through a simple navigation flow:

```text
Welcome
  └── Collections
        └── Subjects
              └── Resources
                    ├── PDF
                    ├── Images
                    ├── Audio
                    ├── Video
                    └── Microsoft Office
```

Content is stored in Cloud Firestore. Public pages read published content, while authenticated administrators can create, update, and delete collections, subjects, and resources from the dashboard.

## Features

### Content management

- Create, edit, and delete collections, subjects, and resources.
- Assign subjects to collections and move subjects to the orphan collection when a collection is removed.
- Order collections, subjects, and resources by creation time.
- Cache collection and subject reads in the browser to reduce repeated requests.

### Resource delivery

- Support PDF, image, audio, video, and Microsoft Office resources.
- Render supported resources in dedicated viewers, including EmbedPDF and an Office viewer.
- Play video through Video.js, with ReactPlayer support for indirect or platform-hosted links.
- Normalize and validate direct URLs, Google Drive file URLs, and Internet Archive URLs.
- Resolve compatible files from Internet Archive metadata when a resource points to an archive item.

### User experience

- RTL layout designed for Arabic educational content.
- Chakra UI components with selectable theme colors.
- Protected administration route with authentication state handling.
- Loading overlays, toast notifications, error boundaries, and a dedicated 404 page.

## Architecture

The project is organized around feature pages, reusable UI components, Firebase access helpers, and a small Redux store:

```text
src/
├── components/       # Shared UI, viewers, players, and navigation primitives
├── functions/        # Firestore queries, resource fetching, and navigation helpers
├── helpers/          # URL detection, resource normalization, and validation
├── hooks/            # Reusable React hooks
├── pages/            # Welcome, collections, subjects, resources, login, and dashboard
├── store/            # Redux Toolkit store and slices
├── assets/           # Static application assets
└── app.tsx           # Application shell and page flow

functions/
└── src/index.ts      # Firebase Cloud Functions
```

## Technology stack

| Area | Technology |
| --- | --- |
| Application | React 19, TypeScript, Vite |
| Routing | React Router |
| UI | Chakra UI, Sass, Iconify, React Icons |
| State | Redux Toolkit, React Redux |
| Backend | Firebase Authentication, Firestore, Hosting, Cloud Functions |
| Documents | EmbedPDF |
| Media | Video.js, ReactPlayer |
| Tooling | pnpm, Biome, Knip, Vitest, Stryker |

## Requirements

- Node.js 24
- pnpm
- A Firebase project with Authentication and Firestore enabled

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure Firebase

Create a local environment file from the provided template:

```bash
cp .env.example .env
```

Set the following Firebase values in `.env`:

```dotenv
VITE_API_KEY="your-firebase-api-key"
VITE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_PROJECT_ID="your-project-id"
VITE_STORAGE_BUCKET="your-project.appspot.com"
VITE_MESSAGING_SENDER_ID="your-sender-id"
VITE_APP_ID="your-app-id"
```

### 3. Start the development server

```bash
pnpm dev
```

The application is served by Vite. Use `pnpm preview` to preview a production build locally.

## Available scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Type-check and build the production bundle |
| `pnpm preview` | Preview the production bundle |
| `pnpm lint` | Run Biome checks |
| `pnpm lint:fix` | Apply Biome fixes |
| `pnpm format` | Format the source tree with Biome |
| `pnpm knip` | Find unused files, dependencies, and exports |
| `pnpm check` | Run Biome and Knip |
| `pnpm exec vitest run` | Run the Vitest test suite |
| `pnpm deploy:hosting` | Build and deploy Firebase Hosting |
| `pnpm deploy` | Build and deploy Hosting and Firestore |

## Data model

The primary Firestore collections are:

| Collection | Purpose |
| --- | --- |
| `collections` | Top-level groups of educational content |
| `subjects` | Subjects linked to a collection through `belongTo` |
| `resources` | Content attached to a subject, with a resource type and one or more URLs |
| `admins` | Authorized administrator records |

The reserved orphan collection ID is `00000000000000000000`. It keeps subjects available when their parent collection is deleted.

## Firebase configuration

Firebase configuration is maintained in the repository root:

- [`firebase.json`](firebase.json) — Hosting, Functions, Firestore, and emulator configuration.
- [`firestore.rules`](firestore.rules) — Firestore access rules.
- [`firestore.indexes.json`](firestore.indexes.json) — Composite indexes for ordered queries.
- [`functions`](functions) — Cloud Functions package and source.

The configured emulator ports are:

| Service | Port |
| --- | ---: |
| Hosting | `5000` |
| Functions | `5001` |
| Firestore | `8888` |
| Authentication | `9099` |
| Emulator UI | `6061` |

Hosting rewrites all routes to `index.html` so client-side React navigation works after deployment.

## Deployment

Build the application and deploy Hosting:

```bash
pnpm deploy:hosting
```

Deploy Hosting together with Firestore rules and indexes:

```bash
pnpm deploy
```

Firebase runs the Functions build during deployment according to [`firebase.json`](firebase.json).

## Code quality

The project uses Biome as the single formatter and linter. Knip is used to detect unused code and dependencies, while Vitest and Stryker are available for testing and mutation testing.

Before opening a change, run:

```bash
pnpm check
pnpm build
```

## Project status

The current implementation includes:

- Dashboard CRUD workflows for collections, subjects, and resources.
- Google Drive and Internet Archive link handling.
- Microsoft Office resource support.
- Video.js migration from Plyr.
- Improved PDF, image, audio, video, and Office viewing flows.
- Lowercase file and directory naming throughout the source tree.

## Contributing

Contributions and focused improvements are welcome.

1. Create a feature branch from `main`.
2. Keep changes focused and follow the existing TypeScript and Biome conventions.
3. Run `pnpm check` and `pnpm build` before submitting a pull request.
4. Describe the user-facing change and any Firebase configuration changes in the pull request.

## License

This project is licensed under the [Apache License 2.0](LICENSE.txt).

## React Compiler

The React Compiler is not enabled because of its impact on development and build performance. To enable it, see the [React Compiler documentation](https://react.dev/learn/react-compiler/installation).
