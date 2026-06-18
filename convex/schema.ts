import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatar: v.string(),
    bio: v.optional(v.string()),
    isPublic: v.boolean(),
    homeLocation: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    travelCount: v.number(),
    followersCount: v.number(),
    followingCount: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"]),

  places: defineTable({
    userId: v.id("users"),
    name: v.string(),
    country: v.string(),
    continent: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    type: v.union(
      v.literal("visited"),
      v.literal("want-to-visit"),
      v.literal("lived"),
      v.literal("current")
    ),
    visitedFrom: v.optional(v.number()),
    visitedTo: v.optional(v.number()),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    tags: v.array(v.string()),
    priority: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_coordinates", ["coordinates"]),

  trips: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    placeIds: v.array(v.id("places")),
    isCollaborative: v.boolean(),
    collaborators: v.array(v.id("users")),
    isPublic: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  stories: defineTable({
    userId: v.id("users"),
    placeId: v.id("places"),
    tripId: v.optional(v.id("trips")),
    title: v.string(),
    content: v.string(),
    photos: v.array(v.string()),
    date: v.number(),
    isPublic: v.boolean(),
    likesCount: v.number(),
    commentsCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_placeId", ["placeId"])
    .index("by_tripId", ["tripId"]),

  photos: defineTable({
    userId: v.id("users"),
    placeId: v.optional(v.id("places")),
    tripId: v.optional(v.id("trips")),
    url: v.string(),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    uploadedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_placeId", ["placeId"])
    .index("by_tripId", ["tripId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_followerId", ["followerId"])
    .index("by_followingId", ["followingId"])
    .index("by_pair", ["followerId", "followingId"]),

  likes: defineTable({
    userId: v.id("users"),
    targetType: v.union(v.literal("place"), v.literal("story"), v.literal("photo")),
    targetId: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_pair", ["userId", "targetType", "targetId"]),

  comments: defineTable({
    userId: v.id("users"),
    targetType: v.union(v.literal("place"), v.literal("story"), v.literal("photo")),
    targetId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_target", ["targetType", "targetId"])
    .index("by_userId", ["userId"]),
});
