"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/lib/use-auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ClerkUserButton() {
  if (!clerkKey) return null;
  const { UserButton } = require("@clerk/nextjs");
  return <UserButton />;
}

export function Navbar() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );

  return (
    <nav className="border-b bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/map" className="text-xl font-bold text-emerald-600">
          Wanderlog
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/map" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Map
          </Link>
          <Link href="/trips" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Trips
          </Link>
          <Link href="/stats" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Stats
          </Link>
          <Link href="/discover" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Discover
          </Link>
          {currentUser && (
            <Link
              href={`/profile/${currentUser.username}`}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Profile
            </Link>
          )}
          {currentUser && (
            <Link
              href="/settings"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Settings
            </Link>
          )}
          <ThemeToggle />
          <ClerkUserButton />
        </div>
      </div>
    </nav>
  );
}
