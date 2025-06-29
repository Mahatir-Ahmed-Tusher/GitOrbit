# GitOrbit 🚀

**Your AI Co-Pilot for GitHub Repositories**

GitOrbit provides a suite of AI-powered tools to help you understand, navigate, and document any GitHub repository—all securely within your browser. It's designed for developers, team leads, and anyone who needs to quickly get up to speed with a new codebase.

The live application is deployed, check this out: https://gitorbit-ai.vercel.app/

![image](https://github.com/user-attachments/assets/5f787b7f-caa2-454a-95da-841af3f887db)





You can also run it locally by following the instructions below.

---

## About the Developer

This project was developed by **Mahatir Ahmed Tusher**, a passionate software developer and student at Vellore Institute of Technology (VIT).

- **GitHub**: [@Mahatir-Ahmed-Tusher](https://github.com/Mahatir-Ahmed-Tusher)
- **LinkedIn**: [Mahatir Ahmed Tusher](https://in.linkedin.com/in/mahatir-ahmed-tusher-5a5524257)

---

## Features

GitOrbit is packed with features to make code exploration and understanding effortless:

- 🔍 **AI-Powered Repo Search**: Discover new projects by searching for topics or technologies in natural language. Powered by SerpAPI and Mistral.

![image](https://github.com/user-attachments/assets/ae9fc757-ba0f-4a3a-a685-8f48827bcd12)

  
- 💬 **AI Code Chat**: Ask questions about the entire codebase in natural language. Get instant, context-aware answers powered by Google's Gemini.

![image](https://github.com/user-attachments/assets/3e41891a-b134-4f91-8761-df0a1e48ed9a)


- 📜 **Commit Explorer**: Understand the story behind every change. Get AI-powered explanations for any commit diff.

![image](https://github.com/user-attachments/assets/65886907-1dbb-4e35-bec1-37cdd15e0c58)

- 📝 **AI-Generated Notes**: Automatically generate high-level technical documentation for any repository. Perfect for onboarding new team members.

![image](https://github.com/user-attachments/assets/39651136-685f-4b4f-ab8b-6fb9a57fda90)

  
- 📊 **Repository Health Dashboard**: Get a visual overview of your repository’s health, including commit frequency, contributor activity, and open issues/PRs, complete with AI-driven insights.

- 
- 🗺️ **Codebase Visualization**: Visualize the entire file structure of a repository as an interactive diagram.

![image](https://github.com/user-attachments/assets/aaefc070-7b94-47fb-9ecf-779c3f8f9cbd)

  
- 💻 **In-Browser Code Editor with AI**: Explore, read, and even commit changes with a familiar Monaco-based editor, right in your browser using AI. you can also commit the changes after editing.

  ![image](https://github.com/user-attachments/assets/38548aa9-67b4-4338-84da-8d476ce46019)
  
  
- 🔐 **Privacy First**: All data, including your code and optional GitHub token, is stored exclusively in your browser's local storage. Nothing is stored on a server.

![image](https://github.com/user-attachments/assets/4cbb84a3-8bd5-41a7-875f-7088a13b4ac0)

  
- 🎤 **Transcript Summarizer**: Paste meeting transcripts and get instant summaries and action items.

### 🤖 GitOrbot: Your Landing Page Assistant
GitOrbit now includes a friendly AI assistant, "GitOrbot," available directly on the landing page. This bot is specifically trained on GitOrbit's features and functionality to help answer your questions and guide you through the application.
- **Instant Answers:** Get quick answers to common questions like how to use a PAT or what features are available.
- **Powered by OpenRouter:** This assistant uses a different model than the core application (DeepSeek, via OpenRouter) to provide specialized, focused help.
- **How it Works:** The chatbot is a client-side component that securely calls a Next.js Server Action. This action contains the bot's system prompt and communicates with the OpenRouter API, ensuring API keys are never exposed on the client side.

  ![image](https://github.com/user-attachments/assets/6d0a67ad-e350-470f-a7c4-ba6ca5e1290a)


---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **AI**: [Google Gemini](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit), [Mistral](https://mistral.ai/), & [OpenRouter](https://openrouter.ai/)
- **Search**: [SerpAPI](https://serpapi.com/)
- **UI**: [Shadcn UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Hooks & Context API
- **Client-Side Storage**: Browser Local Storage

---

## Getting Started Locally

To run GitOrbit on your local machine, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the repository

```bash
git clone https://github.com/Mahatir-Ahmed-Tusher/GitOrbit.git
cd GitOrbit
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Authentication & API Keys

This is a multi-step process involving Firebase, GitHub, and other AI services.

**Step 3.1: Create Environment File**

Create a new file named `.env` in the root of the project. You will fill this out in the next steps.

```
# --- AI & Search API Keys ---
GOOGLE_API_KEY=""
OPENROUTER_API_KEY=""
SERPAPI_API_KEY=""
MISTRAL_API_KEY=""

# --- Firebase Configuration (for GitHub Authentication) ---
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""

# --- Optional: GitHub PAT ---
NEXT_PUBLIC_GITHUB_PAT=""
```

**Step 3.2: Configure Firebase**

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Add a new **Web App (`</>`)** to your project.
3.  After registering the app, Firebase will give you a `firebaseConfig` object. Copy these values into the `NEXT_PUBLIC_FIREBASE_*` variables in your `.env` file.
4.  In the Firebase console, go to **Build > Authentication** from the side menu.
5.  Click the **Sign-in method** tab and select **GitHub** from the provider list.
6.  You will see an **Authorization callback URL**. Copy this URL for the next step.
7.  **Do not close this page yet.**

**Step 3.3: Configure GitHub OAuth App**

1.  Go to your [GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers).
2.  Click **"New OAuth App"**.
3.  Fill out the form. The **Homepage URL** will change depending on where you are running the app. The **Authorization callback URL** will always be the one you copied from Firebase.
4.  Click **"Register application"**.
5.  On the next page, copy the **Client ID**. Then, click **"Generate a new client secret"** and copy the secret.

**Step 3.4: Finalize Firebase and Domain Setup**

1.  Go back to your GitHub provider settings in Firebase. Paste in the **Client ID** and **Client Secret** you just got from GitHub and **Enable** the provider.
2.  Now, go to the **Settings** tab in Firebase Authentication. Under **Authorized domains**, you must add the domain where your app is running.

**Environment-Specific Configuration**

You will need to adjust your GitHub App settings and Firebase Authorized Domains depending on where you are running the app.

-   **For Local Development:**
    -   **GitHub Homepage URL:** `http://localhost:3000`
    -   **Firebase Authorized Domain:** `localhost`

-   **For Firebase Studio / Cloud Workstation:**
    -   Find your unique URL (e.g., `https://6000-....cloudworkstations.dev`) in the browser's address bar or console logs.
    -   **GitHub Homepage URL:** Your unique cloud workstation URL.
    -   **Firebase Authorized Domain:** The domain part of your URL (e.g., `6000-...cloudworkstations.dev`).

-   **For Production (Vercel):**
    -   **GitHub Homepage URL:** `https://gitorbit-ai.vercel.app`
    -   **Firebase Authorized Domain:** `gitorbit-ai.vercel.app`

You can have multiple authorized domains in Firebase and you can update the GitHub Homepage URL at any time.

**Step 3.5: Add other API Keys**

Get the API keys for the AI and search services and add them to your `.env` file:
*   **Google Gemini (`GOOGLE_API_KEY`):** [Google AI Studio](https://aistudio.google.com/app/apikey)
*   **OpenRouter (`OPENROUTER_API_KEY`):** [OpenRouter Keys](https://openrouter.ai/keys)
*   **SerpApi (`SERPAPI_API_KEY`):** [SerpApi Dashboard](https://serpapi.com/dashboard)
*   **Mistral (`MISTRAL_API_KEY`):** [Mistral Platform](https://console.mistral.ai/)
*   **Optional GitHub PAT (`NEXT_PUBLIC_GITHUB_PAT`):** [GitHub Tokens](https://github.com/settings/tokens). This is a fallback to increase API limits for non-authenticated actions.


### 4. Run the development server

```bash
npm run dev
```

The application should now be running.

---

## Project Structure

The project follows a standard Next.js App Router structure. Below is an extensive overview of the directories and their purposes.

```
.
├── public/                 # Static assets (images, logos, fonts)
│   ├── codecraft_logo.png  # Logo for the CodeCraft AI promotion
│   ├── git_logo.png        # Main logo for GitOrbit
│   ├── github.png          # GitHub icon used in headers
│   └── landing_omg.png     # Hero image for the landing page
├── src/
│   ├── app/                # Application routes (Next.js App Router)
│   │   ├── (legal)/        # Route group for legal pages (e.g., privacy, terms)
│   │   │   ├── contact/
│   │   │   │   └── page.tsx # Contact page component
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx # Privacy Policy page component
│   │   │   ├── terms/
│   │   │   │   └── page.tsx # Terms of Service page component
│   │   │   ├── layout.tsx  # Shared layout for all legal pages
│   │   │   └── user-guide/
│   │   │       └── page.tsx # User Guide page component
│   │   ├── (main)/         # Route group for the main authenticated app experience
│   │   │   ├── chat/
│   │   │   │   └── page.tsx # AI Code Chat page component
│   │   │   ├── commits/
│   │   │   │   └── page.tsx # Commit Explorer page component
│   │   │   ├── editor/
│   │   │   │   └── page.tsx # In-browser Code Editor page component
│   │   │   ├── health/
│   │   │   │   └── page.tsx # Repository Health Dashboard page
│   │   │   ├── home/
│   │   │   │   └── page.tsx # Home page for loading repositories
│   │   │   ├── notes/
│   │   │   │   └── page.tsx # AI Notes and Manual Notes page
│   │   │   ├── settings/
│   │   │   │   └── page.tsx # Settings page for PAT and data management
│   │   │   ├── transcripts/
│   │   │   │   └── page.tsx # Transcript Summarizer page
│   │   │   └── visualize/
│   │   │       └── page.tsx # Codebase Visualization page
│   │   ├── about/
│   │   │   └── page.tsx    # About page component
│   │   ├── globals.css     # Global styles and Tailwind CSS directives
│   │   ├── layout.tsx      # Root layout for the entire application
│   │   └── page.tsx        # Main landing page component
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── actions/        # Server Actions that interact with AI models
│   │   │   ├── gitorbot-chat.ts # Logic for the landing page assistant (GitOrbot)
│   │   │   └── search-repos.ts  # Logic for searching GitHub repos using SerpAPI and Mistral
│   │   ├── flows/          # Individual AI tasks defined as Genkit flows
│   │   │   ├── analyze-repo-health.ts # Flow to analyze and generate insights on repo health
│   │   │   ├── chat-with-repo.ts    # Flow for the main repository chat feature
│   │   │   ├── edit-code.ts         # Flow to edit code based on prompts
│   │   │   ├── explain-code.ts      # Flow to explain code snippets
│   │   │   ├── generate-repo-note.ts # Flow to generate technical documentation for a repo
│   │   │   ├── summarize-commit.ts  # Flow to explain a commit diff
│   │   │   └── summarize-transcript.ts # Flow to summarize meeting transcripts
│   │   ├── dev.ts          # Entry point for Genkit development server, imports all flows
│   │   └── genkit.ts       # Genkit initialization and configuration (Google AI provider)
│   ├── components/         # Reusable React components
│   │   ├── providers/      # React context providers
│   │   │   ├── auth-provider.tsx    # Manages Firebase authentication state
│   │   │   └── theme-provider.tsx # Manages light/dark theme state
│   │   ├── ui/             # Shadcn UI components (e.g., Button, Card, etc.)
│   │   ├── app-sidebar.tsx   # The main navigation sidebar for the app
│   │   ├── client-sandpack.tsx # Client-side wrapper for the Sandpack code editor
│   │   ├── gitorbot-widget.tsx # The chat widget for the landing page assistant
│   │   └── theme-toggle.tsx  # The light/dark mode theme toggle button
│   ├── hooks/              # Custom React hooks
│   │   ├── use-local-storage.ts # Hook for persisting state to browser local storage
│   │   ├── use-mobile.tsx    # Hook to detect if the user is on a mobile device
│   │   └── use-toast.ts      # Hook for displaying toast notifications
│   ├── lib/                # Utility functions and type definitions
│   │   ├── firebase.ts     # Firebase app initialization and configuration
│   │   ├── types.ts        # TypeScript type definitions used throughout the app
│   │   └── utils.ts        # General utility functions (e.g., `cn` for Tailwind classes)
├── .env                    # Local environment variables (API keys). This file is not committed.
├── next.config.ts          # Next.js configuration file
├── package.json            # Project dependencies and scripts
└── README.md               # This file, providing an overview of the project
```

---

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.



