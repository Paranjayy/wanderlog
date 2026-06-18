"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useAuth } from "@/lib/use-auth";
import { UserAvatar } from "./UserAvatar";
import { PhotoGallery } from "./PhotoGallery";
import { LikeButton } from "../social/LikeButton";
import { Comments } from "../social/Comments";

interface PlaceCardProps {
  placeId: Id<"places">;
  onClose: () => void;
}

export function PlaceCard({ placeId, onClose }: PlaceCardProps) {
  const place = useQuery(api.places.getById, { placeId });
  const stories = useQuery(api.stories.getByPlace, { placeId });
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );
  const createStory = useMutation(api.stories.create);
  const deletePlace = useMutation(api.places.deletePlace);

  const [showStoryForm, setShowStoryForm] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);

  const handleCreateStory = async () => {
    if (!currentUser || !storyTitle.trim() || !storyContent.trim()) return;
    setIsSubmittingStory(true);
    try {
      await createStory({
        userId: currentUser._id,
        placeId,
        title: storyTitle.trim(),
        content: storyContent.trim(),
      });
      setStoryTitle("");
      setStoryContent("");
      setShowStoryForm(false);
    } catch (error) {
      console.error("Failed to create story:", error);
    } finally {
      setIsSubmittingStory(false);
    }
  };

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
        <div className="flex items-center gap-1">
          {currentUser && place.userId === currentUser._id && (
            <button
              onClick={async () => {
                if (confirm("Delete this place?")) {
                  await deletePlace({ placeId: place._id });
                  onClose();
                }
              }}
              className="rounded-full p-1 text-red-500 hover:bg-red-50"
            >
              🗑
            </button>
          )}
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">✕</button>
        </div>
      </div>

      {/* Photo Gallery */}
      {currentUser && (
        <div className="border-b p-4">
          <PhotoGallery placeId={placeId} userId={currentUser._id} />
        </div>
      )}

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

        {currentUser && (
          <div className="mt-4">
            <LikeButton userId={currentUser._id} targetType="place" targetId={place._id} />
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
        </p>
      </div>

      {/* Stories Section */}
      <div className="border-t p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Stories</h3>
          {currentUser && (
            <button
              onClick={() => setShowStoryForm(!showStoryForm)}
              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
            >
              {showStoryForm ? "Cancel" : "Write Story"}
            </button>
          )}
        </div>

        {showStoryForm && (
          <div className="mb-4 space-y-3 rounded-lg border bg-gray-50 p-3">
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="Story title"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <textarea
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleCreateStory}
              disabled={isSubmittingStory || !storyTitle.trim() || !storyContent.trim()}
              className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmittingStory ? "Posting..." : "Post Story"}
            </button>
          </div>
        )}

        {!stories || stories.length === 0 ? (
          <p className="text-xs text-gray-500">No stories yet.</p>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => (
              <div key={story._id} className="rounded-lg border bg-gray-50 p-3">
                <h4 className="text-sm font-medium">{story.title}</h4>
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                  {story.content.slice(0, 100)}
                  {story.content.length > 100 ? "..." : ""}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  {story.user && <span>{story.user.displayName}</span>}
                  <span>·</span>
                  <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="border-t p-4">
        <Comments targetType="place" targetId={place._id} />
      </div>
    </div>
  );
}
