"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/use-auth";

export default function JournalPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const places = useQuery(
    api.places.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  if (!currentUser || !places) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading journal...</p>
      </div>
    );
  }

  // Group places by year
  const placesByYear = places.reduce((acc, place) => {
    const year = new Date(place.createdAt).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(place);
    return acc;
  }, {} as Record<number, typeof places>);

  const years = Object.keys(placesByYear).map(Number).sort((b, a) => b - a);
  const yearPlaces = placesByYear[selectedYear] || [];
  const countries = [...new Set(yearPlaces.map(p => p.country))];
  const continents = [...new Set(yearPlaces.map(p => p.continent))];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Travel Journal</h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Year Summary Card */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
        <h2 className="text-2xl font-bold">{selectedYear} in Review</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-3xl font-bold">{yearPlaces.length}</p>
            <p className="text-emerald-100">Places Visited</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{countries.length}</p>
            <p className="text-emerald-100">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{continents.length}</p>
            <p className="text-emerald-100">Continents</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {yearPlaces.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500">No places visited in {selectedYear}. Start exploring!</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-emerald-200 pl-8">
          {yearPlaces.map((place, i) => (
            <div key={place._id} className="relative mb-8 last:mb-0">
              {/* Timeline dot */}
              <div className="absolute -left-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                {i + 1}
              </div>
              <div className="rounded-lg border p-4 transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{place.name}</h3>
                    <p className="text-sm text-gray-500">{place.country}, {place.continent}</p>
                  </div>
                  {place.rating && (
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-sm ${s <= place.rating! ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                      ))}
                    </div>
                  )}
                </div>
                {place.notes && (
                  <p className="mt-2 text-sm text-gray-600">{place.notes}</p>
                )}
                {place.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {place.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">#{tag}</span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(place.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
