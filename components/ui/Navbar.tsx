"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function Navbar() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );

  return (
    <nav className="border-b bg-white px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/map" className="text-xl font-bold text-emerald-600">
          Wanderlog
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/map" className="text-gray-600 hover:text-gray-900">
            Map
          </Link>
          <Link href="/trips" className="text-gray-600 hover:text-gray-900">
            Trips
          </Link>
          <Link href="/stats" className="text-gray-600 hover:text-gray-900">
            Stats
          </Link>
          <Link href="/discover" className="text-gray-600 hover:text-gray-900">
            Discover
          </Link>
          {currentUser && (
            <Link
              href={`/profile/${currentUser.username}`}
              className="text-gray-600 hover:text-gray-900"
            >
              Profile
            </Link>
          )}
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
