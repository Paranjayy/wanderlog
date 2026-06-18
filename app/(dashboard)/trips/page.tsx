"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/use-auth";
import { TripWizard } from "@/components/trips/TripWizard";

export default function TripsPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const trips = useQuery(
    api.trips.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <button
          onClick={() => setShowWizard(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          + New Trip
        </button>
      </div>

      {!trips || trips.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500">No trips yet. Create your first trip!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="rounded-lg border p-4 transition hover:shadow-md"
            >
              <h3 className="font-semibold">{trip.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(trip.startDate).toLocaleDateString()} —{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </p>
              {trip.description && (
                <p className="mt-2 text-sm text-gray-600">{trip.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span>{trip.placeIds.length} places</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWizard && currentUser && (
        <TripWizard
          userId={currentUser._id}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
