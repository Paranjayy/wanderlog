"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/use-auth";

export default function DiscoverPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const allPlaces = useQuery(api.places.getAllPublic);

  const countries = allPlaces
    ? [...new Set(allPlaces.map((p) => p.country))].sort()
    : [];

  const popularPlaces = allPlaces
    ? [...allPlaces]
        .filter((p) => p.rating && p.rating >= 4)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10)
    : [];

  const recentPlaces = allPlaces
    ? [...allPlaces].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10)
    : [];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Discover</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Countries</h2>
        <div className="flex flex-wrap gap-2">
          {countries.map((country) => (
            <span
              key={country}
              className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
            >
              {country}
            </span>
          ))}
          {countries.length === 0 && (
            <p className="text-gray-500">No places added yet.</p>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Top Rated Places</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularPlaces.map((place) => (
            <div
              key={place._id}
              className="rounded-lg border p-4 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{place.name}</h3>
                  <p className="text-sm text-gray-500">{place.country}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${
                        star <= (place.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              {place.notes && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {place.notes}
                </p>
              )}
            </div>
          ))}
          {popularPlaces.length === 0 && (
            <p className="text-gray-500">No rated places yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Recently Added</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentPlaces.map((place) => (
            <div
              key={place._id}
              className="rounded-lg border p-4 transition hover:shadow-md"
            >
              <h3 className="font-medium">{place.name}</h3>
              <p className="text-sm text-gray-500">{place.country}</p>
              <p className="mt-1 text-xs text-gray-400">
                Added {new Date(place.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {recentPlaces.length === 0 && (
            <p className="text-gray-500">No places added yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
