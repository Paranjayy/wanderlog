"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function useAuth() {
  if (!clerkKey) {
    return { userId: null, isLoaded: true, isSignedIn: false };
  }
  return useClerkAuth();
}
