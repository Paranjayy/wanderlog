"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/use-auth";
import Link from "next/link";

export default function FeedPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const allPlaces = useQuery(api.places.getAllPublic);

  // Show recent public places as a feed
  const feed = allPlaces
    ? [...allPlaces]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 50)
    : [];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Activity Feed</h1>

      {feed.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500">No activity yet. Follow some travelers to see their updates!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((place) => (
            <div key={place._id} className="rounded-lg border p-4 transition hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {place.user?.displayName?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <Link href={`/profile/${place.user?.username}`} className="font-medium hover:text-emerald-600">
                      {place.user?.displayName}
                    </Link>
                    <span className="text-sm text-gray-500">
                      added a place
                    </span>
                  </div>
                  <Link href={`/place/${place._id}`} className="block mt-1">
                    <h3 className="font-semibold">{place.name}</h3>
                    <p className="text-sm text-gray-500">{place.country}, {place.continent}</p>
                    {place.notes && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{place.notes}</p>
                    )}
                  </Link>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(place.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
