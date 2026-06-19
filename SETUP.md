# Wanderlog Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

## Quick Start

```bash
git clone https://github.com/Paranjayy/wanderlog.git
cd wanderlog
npm install
```

---

## 1. Set Up Clerk (Authentication)

Clerk handles sign-up, sign-in, and user management.

1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. Choose your auth methods (Google, GitHub, Email, etc.)
4. Copy your API keys from the Clerk dashboard

Add to `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Set Up Clerk Webhook (for user sync)

1. In Clerk dashboard → Webhooks → Add Endpoint
2. Set URL to: `https://your-domain.vercel.app/api/webhook/clerk`
3. Select events: `user.created`, `user.updated`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET` in `.env.local`

---

## 2. Set Up Convex (Database)

Convex provides the real-time database and backend functions.

1. Go to [convex.dev](https://convex.dev) and create a free account
2. In your project directory, run:

```bash
npx convex dev
```

3. Follow the prompts to create a new Convex project
4. This will create a cloud deployment and update `.env.local` with the URL

For production, deploy your Convex functions:

```bash
npx convex deploy
```

This gives you a production URL like `https://xxx-xxx.convex.cloud` — update `NEXT_PUBLIC_CONVEX_URL` in `.env.local` with this URL.

---

## 3. Environment Variables

Your complete `.env.local` should look like:

```bash
# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Convex (Database)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site
CONVEX_DEPLOYMENT=your-deployment-id
```

---

## 4. Run the App

```bash
# Terminal 1: Start Convex (in background)
npx convex dev

# Terminal 2: Start Next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Set the same environment variables in Vercel dashboard under Settings → Environment Variables.

---

## Troubleshooting

### "useAuth can only be used within ClerkProvider"
→ Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`

### "Could not find Convex client"
→ Make sure `NEXT_PUBLIC_CONVEX_URL` is set and points to a valid Convex deployment

### Map shows demo tiles without labels
→ The app uses CartoDB Voyager tiles by default. Click the style selector (bottom-left) to switch between Colorful, Light, Dark, and Satellite views.

### Webhook not working
→ Make sure `CLERK_WEBHOOK_SECRET` is set and the webhook URL is correct in Clerk dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 18, TypeScript |
| Auth | Clerk |
| Database | Convex (real-time) |
| Maps | MapLibre GL JS |
| Styling | Tailwind CSS |
| Deployment | Vercel |
