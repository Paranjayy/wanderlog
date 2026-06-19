"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AchievementsProps {
  userId: Id<"users">;
}

const ACHIEVEMENTS = [
  { id: "first_pin", name: "First Steps", description: "Add your first pin", icon: "📍", check: (p: number) => p >= 1 },
  { id: "five_places", name: "Explorer", description: "Visit 5 places", icon: "🌍", check: (p: number) => p >= 5 },
  { id: "ten_places", name: "Globetrotter", description: "Visit 10 places", icon: "✈️", check: (p: number) => p >= 10 },
  { id: "twenty_places", name: "World Traveler", description: "Visit 20 places", icon: "🗺️", check: (p: number) => p >= 20 },
  { id: "fifty_places", name: "Legend", description: "Visit 50 places", icon: "👑", check: (p: number) => p >= 50 },
  { id: "three_countries", name: "Multi-Country", description: "Visit 3 countries", icon: "🏳️", check: (_: number, c: number) => c >= 3 },
  { id: "five_countries", name: "Citizen of World", description: "Visit 5 countries", icon: "🌏", check: (_: number, c: number) => c >= 5 },
  { id: "ten_countries", name: "Polyglot", description: "Visit 10 countries", icon: "🌐", check: (_: number, c: number) => c >= 10 },
];

export function Achievements({ userId }: AchievementsProps) {
  const places = useQuery(api.places.getByUser, { userId });

  if (!places) return null;

  const countries = [...new Set(places.map((p) => p.country))];
  const earned = ACHIEVEMENTS.filter((a) => a.check(places.length, countries.length));

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Achievements</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isEarned = earned.some((e) => e.id === achievement.id);
          return (
            <div
              key={achievement.id}
              className={`rounded-lg border p-3 text-center transition ${
                isEarned
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-gray-200 bg-gray-50 opacity-50"
              }`}
            >
              <div className="text-3xl">{achievement.icon}</div>
              <p className="mt-1 text-sm font-medium">{achievement.name}</p>
              <p className="text-xs text-gray-500">{achievement.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
