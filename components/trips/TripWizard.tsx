"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TripWizardProps {
  userId: Id<"users">;
  onClose: () => void;
}

export function TripWizard({ userId, onClose }: TripWizardProps) {
  const createTrip = useMutation(api.trips.create);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) return;

    setIsSubmitting(true);
    try {
      await createTrip({
        userId,
        name,
        description: description || undefined,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
      });
      onClose();
    } catch (error) {
      console.error("Failed to create trip:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Trip</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full ${s === step ? "bg-emerald-600" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Trip Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Japan 2024"
                className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this trip about?"
                rows={3}
                className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => name && setStep(2)}
              disabled={!name}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-lg border px-4 py-2 hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={() => startDate && endDate && setStep(3)}
                disabled={!startDate || !endDate}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-medium">{name}</h3>
              <p className="text-sm text-gray-600">
                {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
              </p>
              {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
            </div>
            <p className="text-sm text-gray-500">
              You can add places to this trip from the map after creating it.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-lg border px-4 py-2 hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
