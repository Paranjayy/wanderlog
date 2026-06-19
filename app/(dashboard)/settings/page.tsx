"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/use-auth";

export default function SettingsPage() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const updateUser = useMutation(api.users.updateUser);

  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (currentUser && !initialized) {
    setBio(currentUser.bio || "");
    setIsPublic(currentUser.isPublic);
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      await updateUser({
        userId: currentUser._id,
        bio: bio || undefined,
        isPublic,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-8 text-2xl font-bold">Settings</h1>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            value={currentUser.displayName}
            disabled
            className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-400">Name is managed by your auth provider</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={currentUser.username}
            disabled
            className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the world about your travels..."
            rows={4}
            className="w-full rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded text-emerald-600"
          />
          <label htmlFor="public" className="text-sm text-gray-700">
            Make my profile public
          </label>
        </div>

        <button
          onClick={handleSave}
          className="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
        >
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
