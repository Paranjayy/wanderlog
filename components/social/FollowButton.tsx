"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface FollowButtonProps {
  currentUserId: Id<"users">;
  targetUserId: Id<"users">;
}

export function FollowButton({ currentUserId, targetUserId }: FollowButtonProps) {
  const isFollowing = useQuery(api.follows.isFollowing, {
    followerId: currentUserId,
    followingId: targetUserId,
  });
  const follow = useMutation(api.follows.follow);
  const unfollow = useMutation(api.follows.unfollow);

  if (currentUserId === targetUserId) return null;

  const handleClick = async () => {
    if (isFollowing) {
      await unfollow({ followerId: currentUserId, followingId: targetUserId });
    } else {
      await follow({ followerId: currentUserId, followingId: targetUserId });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        isFollowing
          ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
