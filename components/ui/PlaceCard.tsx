"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { UserAvatar } from "./UserAvatar";

interface PlaceCardProps {
  placeId: Id<"places">;
  onClose: () => void;
}

export function PlaceCard({ placeId, onClose }: PlaceCardProps) {
  const place = useQuery(api.places.getById, { placeId });

  if (!place) {
    return (
      <div className="h-full w-96 animate-pulse bg-gray-100 p-6">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="mt-4 h-3 w-48 rounded bg-gray-200" />
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    visited: "bg-green-100 text-green-800",
    "want-to-visit": "bg-yellow-100 text-yellow-800",
    lived: "bg-blue-100 text-blue-800",
    current: "bg-red-100 text-red-800",
  };

  return (
    <div className="h-full w-96 overflow-y-auto border-l bg-white shadow-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
        <h2 className="text-lg font-bold">{place.name}</h2>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">✕</button>
      </div>

      <div className="p-4">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${typeColors[place.type]}`}>
          {place.type.replace("-", " ")}
        </span>

        <p className="mt-3 text-sm text-gray-600">
          {place.country}, {place.continent}
        </p>

        {place.rating && (
          <div className="mt-2 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`text-lg ${star <= place.rating! ? "text-yellow-400" : "text-gray-300"}`}>★</span>
            ))}
          </div>
        )}

        {place.notes && <p className="mt-4 text-gray-700">{place.notes}</p>}

        {place.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">#{tag}</span>
            ))}
          </div>
        )}

        {place.visitedFrom && (
          <p className="mt-4 text-sm text-gray-500">
            Visited: {new Date(place.visitedFrom).toLocaleDateString()}
            {place.visitedTo && ` — ${new Date(place.visitedTo).toLocaleDateString()}`}
          </p>
        )}

        {place.user && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-xs text-gray-500">Added by</p>
            <div className="flex items-center gap-2">
              <UserAvatar user={place.user} size="sm" />
              <span className="text-sm font-medium">{place.user.displayName}</span>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
