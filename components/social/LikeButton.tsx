"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface LikeButtonProps {
  userId: Id<"users">;
  targetType: "place" | "story" | "photo";
  targetId: string;
}

export function LikeButton({ userId, targetType, targetId }: LikeButtonProps) {
  const hasLiked = useQuery(api.likes.hasLiked, { userId, targetType, targetId });
  const count = useQuery(api.likes.countForTarget, { targetType, targetId });
  const toggle = useMutation(api.likes.toggle);

  const handleClick = async () => {
    await toggle({ userId, targetType, targetId });
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
        hasLiked
          ? "bg-red-50 text-red-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <span>{hasLiked ? "❤️" : "🤍"}</span>
      <span>{count ?? 0}</span>
    </button>
  );
}
