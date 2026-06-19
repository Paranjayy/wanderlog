"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function WorldPage() {
  const allPlaces = useQuery(api.places.getAllPublic);

  if (!allPlaces) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading world stats...</p>
      </div>
    );
  }

  const countries = [...new Set(allPlaces.map(p => p.country))];
  const continents = [...new Set(allPlaces.map(p => p.continent))];
  const totalPlaces = allPlaces.length;
  const avgRating = allPlaces.filter(p => p.rating).reduce((sum, p) => sum + (p.rating || 0), 0) / allPlaces.filter(p => p.rating).length || 0;

  // Most popular countries
  const countryCounts = countries.map(c => ({
    name: c,
    count: allPlaces.filter(p => p.country === c).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-bold">World Explorer</h1>

      {/* Global Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-emerald-600 p-4 text-white">
          <p className="text-3xl font-bold">{totalPlaces}</p>
          <p className="text-emerald-100">Total Places</p>
        </div>
        <div className="rounded-xl bg-blue-600 p-4 text-white">
          <p className="text-3xl font-bold">{countries.length}</p>
          <p className="text-blue-100">Countries</p>
        </div>
        <div className="rounded-xl bg-purple-600 p-4 text-white">
          <p className="text-3xl font-bold">{continents.length}</p>
          <p className="text-purple-100">Continents</p>
        </div>
        <div className="rounded-xl bg-pink-600 p-4 text-white">
          <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
          <p className="text-pink-100">Avg Rating</p>
        </div>
      </div>

      {/* Popular Countries */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Most Visited Countries</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {countryCounts.slice(0, 12).map((country, i) => (
            <div key={country.name} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium">{country.name}</p>
                <p className="text-sm text-gray-500">{country.count} place{country.count > 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Continent Breakdown */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">By Continent</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {continents.sort().map(continent => {
            const count = allPlaces.filter(p => p.continent === continent).length;
            return (
              <div key={continent} className="rounded-lg border bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{count}</p>
                <p className="text-sm text-gray-600">{continent}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
