"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export default function StatsPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const places = useQuery(
    api.places.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  if (!currentUser || !places) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading stats...</p>
      </div>
    );
  }

  const countries = [...new Set(places.map((p) => p.country))];
  const continents = [...new Set(places.map((p) => p.continent))];
  const visited = places.filter((p) => p.type === "visited");
  const bucketList = places.filter((p) => p.type === "want-to-visit");
  const avgRating =
    visited.length > 0
      ? visited.reduce((sum, p) => sum + (p.rating || 0), 0) /
        visited.filter((p) => p.rating).length
      : 0;

  const tags = places.flatMap((p) => p.tags);
  const tagCounts = tags.reduce(
    (acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const stats = [
    { label: "Places Visited", value: visited.length, color: "bg-green-500" },
    { label: "Countries", value: countries.length, color: "bg-blue-500" },
    { label: "Continents", value: continents.length, color: "bg-purple-500" },
    { label: "Bucket List", value: bucketList.length, color: "bg-yellow-500" },
    { label: "Avg Rating", value: avgRating.toFixed(1), color: "bg-pink-500" },
    { label: "Total Places", value: places.length, color: "bg-gray-500" },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Travel Stats</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border p-4">
            <div className={`mb-2 h-2 w-full rounded-full ${stat.color}`} />
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {topTags.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Top Tags</h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                #{tag} ({count})
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">Countries Visited</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {countries.sort().map((country) => {
            const count = places.filter((p) => p.country === country).length;
            return (
              <div
                key={country}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                <span className="text-sm font-medium">{country}</span>
                <span className="text-xs text-gray-500">
                  {count} place{count > 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
