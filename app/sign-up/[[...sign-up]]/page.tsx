"use client";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function SignUpPage() {
  if (!clerkKey) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Unavailable</h1>
          <p className="text-gray-500">Clerk is not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable sign-up.</p>
        </div>
      </div>
    );
  }

  const { SignUp } = require("@clerk/nextjs");
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
