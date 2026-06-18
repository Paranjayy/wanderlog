"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { MapContainer } from "@/components/map/MapContainer";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FollowButton } from "@/components/social/FollowButton";

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { clerkId: userId } : "skip"
  );

  const user = useQuery(api.users.getByUsername, {
    username,
  });
  const places = useQuery(
    api.places.getByUser,
    user ? { userId: user._id } : "skip"
  );

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const pins =
    places?.map((place) => ({
      id: place._id,
      lng: place.coordinates.lng,
      lat: place.coordinates.lat,
      type: place.type,
      name: place.name,
    })) ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Profile header */}
      <div className="border-b bg-white p-6">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-gray-500">@{user.username}</p>
            {user.bio && <p className="mt-1 text-gray-700">{user.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-4 flex max-w-4xl gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {user.travelCount}
            </p>
            <p className="text-sm text-gray-500">Places</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {user.followersCount}
            </p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {user.followingCount}
            </p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>

        {currentUser && currentUser._id !== user._id && (
          <div className="mt-4">
            <FollowButton currentUserId={currentUser._id} targetUserId={user._id} />
          </div>
        )}
      </div>

      {/* User's map */}
      <div className="flex-1">
        <MapContainer pins={pins} />
      </div>
    </div>
  );
}
