<div align="center">

# 🎓 University Platform | Subjects Platform

<img align="center" src="./public/logo.svg" alt="Subjects Platform Logo" width=200 />

### A cloud-based interactive platform to manage and showcase academic subjects and modern educational resources

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Chakra UI](https://img.shields.io/badge/Chakra--UI-3.36-319795?style=for-the-badge&logo=chakraui&logoColor=white)](https://chakra-ui.com)
[![Redux Toolkit](https://img.shields.io/badge/Redux--Toolkit-2.12-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.15-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Sass](https://img.shields.io/badge/Sass-1.101-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-D22128?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A comprehensive educational platform designed to organize and display academic courses and digital educational resources in a modern, interactive way. Featuring a fast, responsive, and Arabic-friendly user interface, it provides seamless viewing of various media and documents, backed by a powerful admin dashboard powered by Firebase cloud services.</b>
</p>

---

[🔎 Preview](#-visual-showcase) •
[✨ Features](#-key-features) •
[📂 File Structure](#-project-structure-and-architecture) •
[🛠️ Installation](#-installation-and-local-setup) •
[🔥 Firebase Setup](#-firebase-setup-and-configuration) •
[⚡ Scripts](#-available-scripts) •
[🛡️ Security](#-security-and-rules-model)

</div>

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🖼️ Visual Showcase](#-visual-showcase)
- [💻 Tech Stack](#-tech-stack)
- [📂 Project Structure and Architecture](#-project-structure-and-architecture)
- [🛠️ Installation and Local Setup](#-installation-and-local-setup)
- [🔑 Environment Variables Setup](#-environment-variables-env)
- [🔥 Firebase Setup and Configuration](#-firebase-setup-and-configuration)
- [⚡ Available Scripts](#-available-scripts)
- [🤖 Helper Scripts & Development](#-helper-scripts-development)
- [🛡️ Security and Rules Model](#-security-and-rules-model)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Features

### 🧑‍🎓 Student & User Experience

- **🎹 Interactive & Dynamic UI:** Modern, engaging, and fully optimized for reading/navigating in Arabic with smooth transition animations.
- **🎨 Live Color Customizer (Theme Customizer):** A smart system allowing users to change the application colors on the fly, tailoring their visual preference.
- **📄 Built-in Document Viewer:** Integrated PDF and Office document viewing directly inside the app using embedded browser-native iframe viewers, eliminating the need to download or view files externally.
- **🎬 Embedded Media Player:** Full support for playing video and audio files smoothly via modern, responsive wrappers like `Plyr` and `React Player`.
- **📁 Multi-Format Asset Viewer:** Easily preview and browse office documents, images, and slideshows (Carousel) without lag.

### 🔐 Administration & Dashboard (For Admins)

- **🎛️ Dedicated Admin Panel:** A secure, hidden dashboard for administrators to add, edit, and delete academic subjects and their associated educational resources.
- **📝 Subject Editor:** Interactive dialogs allowing admins to set subject titles, choose custom icons, and update metadata instantly.
- **📂 Resource Management System:** Structured upload categorization linking assets to various media types (PDF, Audio, Video, Office Document, Link).
- **🔐 Secure Authentication:** Admin login panel fortified by Firebase Authentication to shield system actions from unauthorized access.

---

## 🖼️ Visual Showcase

> [!TIP]
> Upload real screenshots of your application to the designated assets directory (e.g., `public/` or an external hosting service) and update the image paths below.

|                        Welcome Screen                       |                    Subjects Catalog                     |
| :---------------------------------------------------------: | :-----------------------------------------------------: |
| ![Welcome Screen](/public/welcome-screen.png)               | ![Subjects Screen](/public/subjects-catalog.png) |
|            _Welcome and login interactive gate_             |       _Browse subjects sections with dynamic icons_     |

|                 Integrated Resource Viewer                  |                 Secret Admin Dashboard                  |
| :---------------------------------------------------------: | :-----------------------------------------------------: |
| ![Resources Viewer](/public/integrated-resource-viewer.png) | ![Dashboard Screen](/public/secret-admin-dashboard.png) |
|          _Reading PDFs and viewing media embedded_          |   _Admin panel to add/edit/delete subjects and files_   |

---

## 💻 Tech Stack

The application is built using modern, reliable frontend and backend technologies:

- **Framework & Bundler:** [React 19](https://react.dev) + [Vite 7](https://vite.dev) (for super-fast bundling and HMR).
- **Programming Language:** [TypeScript](https://www.typescriptlang.org) ensuring type safety and clean refactoring.
- **Styling & UI:** [Chakra UI v3](https://chakra-ui.com) for modular, accessible, and responsive components, customized with [Sass](https://sass-lang.org) for granular overrides.
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org) handling global state (active theme colors, loading indicators, navigation states).
- **Routing:** [React Router v7](https://reactrouter.com) managing admin login and dashboard path restrictions.
- **Backend as a Service (BaaS):** [Firebase](https://firebase.google.com) (Authentication for admins, Firestore for live data, Hosting for global file hosting).
- **Document & Media Viewers:**
  - Native `<iframe>` for PDF documents and Microsoft Office Live viewer for Office files.
  - `plyr-react` and `react-player` for audio/video playback control.

---

## 📂 Project Structure and Architecture

The codebase separates presentation components from database functions and helper scripts:

```text
subjects-platform/
├── .firebase/                 # Temporary Firebase configuration and CLI cache
├── data/                      # Local workspace data (untracked service keys, etc.)
├── functions/                 # Firebase Cloud Functions (V2 Node.js Backend)
│   ├── src/
│   │   └── index.ts          # Serverless functions (e.g., fetch subjects: getAllPosts)
│   ├── package.json
│   └── tsconfig.json
├── public/                    # Static public assets served directly
├── scripts/                   # Database utility scripts
│   ├── addTestSubject.cjs     # Appends a test subject to Firestore
│   └── listCollections.cjs    # Queries and prints active database collections
├── src/                       # Main application source directory
│   ├── assets/                # Core visual assets, images, and brand icons
│   ├── components/            # Reusable UI widgets
│   │   ├── AudioPlayer/       # Custom audio shell
│   │   ├── Carousel/          # Slide controller
│   │   ├── OfficeViewer/      # Office file iframe container
│   │   ├── Page/              # Dynamic router container transition
│   │   ├── ProtectedRoute/    # Guards admin dashboard access
│   │   └── ui/                # Chakra UI atomic configurations
│   ├── functions/             # Logic helpers, navigation dispatchers, and state hooks
│   ├── helpers/               # String formatters and sanitizers
│   ├── hooks/                 # React Custom Hooks
│   ├── pages/                 # Full view layouts
│   │   ├── Dashboard/         # Admin Panel UI
│   │   ├── Login/             # Admin Authentication Entry
│   │   ├── Resource/          # Selected Resource Viewer page
│   │   ├── Resources/         # Subject Resource List page
│   │   ├── Subjects/          # Core Subjects List page
│   │   └── Welcome/           # Welcome Screen
│   ├── store/                 # Redux Toolkit configuration & slices
│   ├── App.tsx                # Base component and application theme controller
│   ├── constants.ts           # App variables (delays, theme lists, title strings)
│   ├── firebase-config.ts     # Firebase client SDK initialization
│   ├── index.css              # Global custom stylesheet (scrollbars, basic tags)
│   └── main.tsx               # DOM entry point
├── firestore.rules            # Security rules protecting Firestore queries
├── firestore.indexes.json     # DB indexes optimizing field querying speeds
├── firebase.json              # Emulator port maps, deploy hooks, and hosting targets
├── tsconfig.json              # TypeScript compilation setup
└── vite.config.ts             # Vite server and module path alias definitions
```

---

## 🛠️ Installation and Local Setup

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (v20 LTS or newer)
- **pnpm** (Recommended package manager for faster installations)

### Step-by-Step Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/subjects-platform.git
   cd subjects-platform
   ```

2. **Install Dependencies:**

   ```bash
   pnpm install
   ```

3. **Set Up Local Environment File:**
   Create a `.env` file in the root directory. Copy the structure from `.env.example` or create it manually:
   ```bash
   cp .env.example .env
   ```

---

## 🔑 Environment Variables (`.env`)

Fill in your own Firebase project credentials to link the web application to the cloud services:

```env
# Firebase Web API Key
VITE_API_KEY=AIzaSy...

# Firebase Auth domain identifier
VITE_AUTH_DOMAIN=subjects-platform-xxxx.firebaseapp.com

# Firebase Project Name ID
VITE_PROJECT_ID=subjects-platform-xxxx

# Firebase Cloud Storage Bucket URL
VITE_STORAGE_BUCKET=subjects-platform-xxxx.appspot.com

# Messaging Sender ID
VITE_MESSAGING_SENDER_ID=123456789012

# Unique Web Application Identifier (App ID)
VITE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 🔥 Firebase Setup and Configuration

This project is configured to easily sync with your Firebase console or run locally inside development sandboxes.

### 1. Log in and Initialize via CLI

Install Firebase CLI tools globally or run it via npx to authenticate:

```bash
npx firebase-tools login
```

Set your active project:

```bash
npx firebase-tools use --add
```

### 2. Firebase Emulators

The project is configured to run Firestore, Authentication, and Hosting emulators locally for risk-free testing. Start the emulators using:

```bash
npx firebase-tools emulators:start
```

The emulator UI will be available at:

- **Emulator UI Dashboard:** [http://localhost:6061](http://localhost:6061)
- **Firestore Port:** `8888`
- **Auth Port:** `9099`
- **Hosting Port:** `5000`

---

## ⚡ Available Scripts

Below is a list of commands defined in `package.json` to manage development and production builds:

| Command        | Description                                                                       | Target Environment |
| :------------- | :-------------------------------------------------------------------------------- | :----------------- |
| `pnpm dev`     | Starts the Vite dev server with hot module replacement (HMR)                      | Local Development  |
| `pnpm build`   | Compiles typescript types and packages a minified production bundle inside `dist` | Production Build   |
| `pnpm preview` | Launches a local server to test the generated production bundle                   | Local Preview      |
| `pnpm lint`    | Inspects code quality and runs ESLint format checks                               | Quality Assurance  |
| `pnpm deploy`  | Builds the files and deploys them to Firebase Hosting in one step                 | Production Deploy  |

---

## 🤖 Helper Scripts & Development

The repository contains small helper scripts inside the `scripts/` folder to interact with the database using the server-side `firebase-admin` SDK:

> [!IMPORTANT]
> To run these scripts, download a Service Account Key from your Firebase console and place it at: `data/firebase_keys.json`. Make sure you never commit or share this keys folder online.

### Create a Test Subject

Appends a mock subject with a unique timestamp to your Firestore `subjects` collection:

```bash
node scripts/addTestSubject.cjs
```

### List Active Database Collections

Verifies database connectivity and lists all root-level collections inside Firestore:

```bash
node scripts/listCollections.cjs
```

---

## 🛡️ Security and Rules Model

The project applies strict database access constraints. Public visitors are granted read access to view subjects and materials, but only authenticated admins can write or modify data.

These guidelines are defined in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allows public read access, restricts write access to logged-in admins
    match /admins/{email} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /subjects/{subjectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /resources/{resourceId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Strict block on all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🤝 Contributing

We welcome contributions to enhance this platform! To contribute:

1. Fork this repository.
2. Create a new branch: `git checkout -b feature/AmazingFeature`.
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`.
4. Push to the branch: `git push origin feature/AmazingFeature`.
5. Open a Pull Request for review.

---

## 📄 License

This project is licensed under the **Apache License 2.0**. For more details, see the [LICENSE](LICENSE) file.

---

<div align="center">
  <sub>Developed with ❤️ to empower learners and educators.</sub>
</div>
