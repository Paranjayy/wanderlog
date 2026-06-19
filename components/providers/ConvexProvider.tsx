"use client";

import { ReactNode, Suspense } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";

const rawConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Skip Convex if URL is localhost (won't work on Vercel)
const convexUrl = rawConvexUrl && !rawConvexUrl.includes("localhost") ? rawConvexUrl : null;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function InnerProviders({ children }: { children: ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }

  // If Clerk is available, use full auth stack
  if (clerkKey) {
    const { ClerkProvider, useAuth } = require("@clerk/nextjs");
    const { ConvexProviderWithClerk } = require("convex/react-clerk");

    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }

  // No Clerk — just Convex (no auth)
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <InnerProviders>{children}</InnerProviders>
    </Suspense>
  );
}
