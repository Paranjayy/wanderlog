"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function PlacePage() {
  const params = useParams();
  const placeId = params.id as Id<"places">;
  const place = useQuery(api.places.getById, { placeId });

  if (!place) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading place...</p>
      </div>
    );
  }

  if (!place._id) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Place not found.</p>
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
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-3xl font-bold">{place.name}</h1>

      <div className="mb-4 flex items-center gap-3">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${typeColors[place.type]}`}>
          {place.type.replace("-", " ")}
        </span>
        <span className="text-sm text-gray-500">
          {place.country}, {place.continent}
        </span>
      </div>

      {place.rating && (
        <div className="mb-4 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-xl ${star <= place.rating! ? "text-yellow-400" : "text-gray-300"}`}>★</span>
          ))}
        </div>
      )}

      {place.notes && <p className="mb-4 text-gray-700">{place.notes}</p>}

      {place.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {place.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">#{tag}</span>
          ))}
        </div>
      )}

      {place.visitedFrom && (
        <p className="mb-4 text-sm text-gray-500">
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
  );
}
