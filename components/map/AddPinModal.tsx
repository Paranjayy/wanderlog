"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AddPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: { lng: number; lat: number };
  userId: Id<"users">;
  initialName?: string;
  initialCountry?: string;
  initialContinent?: string;
  isLoadingLocation?: boolean;
}

const PLACE_TYPES = [
  { value: "visited", label: "Visited", color: "#22c55e" },
  { value: "want-to-visit", label: "Want to Visit", color: "#eab308" },
  { value: "lived", label: "Lived Here", color: "#3b82f6" },
  { value: "current", label: "Currently Here", color: "#ef4444" },
] as const;

export function AddPinModal({
  isOpen,
  onClose,
  coordinates,
  userId,
  initialName = "",
  initialCountry = "",
  initialContinent = "",
  isLoadingLocation = false,
}: AddPinModalProps) {
  const createPlace = useMutation(api.places.create);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [continent, setContinent] = useState("");
  const [type, setType] = useState<"visited" | "want-to-visit" | "lived" | "current">("visited");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when reverse geocoding results arrive
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setCountry(initialCountry);
      setContinent(initialContinent);
    }
  }, [isOpen, initialName, initialCountry, initialContinent]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !country || !continent) return;

    setIsSubmitting(true);
    try {
      await createPlace({
        userId,
        name,
        country,
        continent,
        coordinates,
        type,
        notes: notes || undefined,
        rating: rating || undefined,
      });
      onClose();
      setName("");
      setCountry("");
      setContinent("");
      setNotes("");
      setRating(0);
    } catch (error) {
      console.error("Failed to create place:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Place</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {isLoadingLocation && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Fetching location details...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Place Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Kyoto, Japan" className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Country *</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Japan" className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Continent *</label>
              <input type="text" value={continent} onChange={(e) => setContinent(e.target.value)} placeholder="Asia" className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none" required />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
            <div className="flex flex-wrap gap-2">
              {PLACE_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${type === t.value ? "text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  style={type === t.value ? { backgroundColor: t.color } : undefined}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star === rating ? 0 : star)}
                  className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>★</button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell us about this place..." rows={3} className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting || !name || !country || !continent} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50">
              {isSubmitting ? "Adding..." : "Add Place"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
