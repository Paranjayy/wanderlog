"use client";

import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="border-b bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/map" className="text-xl font-bold text-emerald-600">
            Wanderlog
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/map" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Map
            </Link>
            <Link href="/trips" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Trips
            </Link>
            <Link href="/journal" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Journal
            </Link>
            <Link href="/stats" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Stats
            </Link>
            <Link href="/world" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              World
            </Link>
            <Link href="/discover" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Discover
            </Link>
            <Link href="/feed" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Feed
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <nav className="mt-12 flex flex-col gap-4">
              <Link href="/map" onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                Map
              </Link>
              <Link href="/trips" onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                Trips
              </Link>
              <Link href="/journal" onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                Journal
              </Link>
              <Link href="/stats" onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                Stats
              </Link>
              <Link href="/world" onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                World
              </Link>
              <Link href="/discover" onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                Discover
              </Link>
              <Link href="/feed" onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                Feed
              </Link>
              {currentUser && (
                <Link href={`/profile/${currentUser.username}`} onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                  Profile
                </Link>
              )}
              {currentUser && (
                <Link href="/settings" onClick={() => setMobileOpen(false)} className="text-lg text-gray-700 hover:text-emerald-600">
                  Settings
                </Link>
              )}
              <div className="mt-4 border-t pt-4">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
