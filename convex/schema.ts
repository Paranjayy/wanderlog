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
});
