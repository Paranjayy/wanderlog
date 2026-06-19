"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface EditPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: {
    _id: Id<"places">;
    name: string;
    country: string;
    continent: string;
    type: string;
    rating?: number;
    notes?: string;
    tags: string[];
  };
}

export function EditPinModal({ isOpen, onClose, place }: EditPinModalProps) {
  const updatePlace = useMutation(api.places.update);
  const [name, setName] = useState(place.name);
  const [country, setCountry] = useState(place.country);
  const [continent, setContinent] = useState(place.continent);
  const [type, setType] = useState<"visited" | "want-to-visit" | "lived" | "current">(place.type as "visited" | "want-to-visit" | "lived" | "current");
  const [notes, setNotes] = useState(place.notes || "");
  const [rating, setRating] = useState(place.rating || 0);
  const [tags, setTags] = useState(place.tags.join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePlace({
        placeId: place._id,
        name,
        notes: notes || undefined,
        rating: rating || undefined,
        type,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      onClose();
    } catch (error) {
      console.error("Failed to update place:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Place</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Place Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Continent</label>
              <input type="text" value={continent} onChange={(e) => setContinent(e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="visited">Visited</option>
              <option value="want-to-visit">Want to Visit</option>
              <option value="lived">Lived</option>
              <option value="current">Currently Here</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star === rating ? 0 : star)}
                  className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>★</button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="food, adventure, beach" className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
