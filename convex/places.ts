import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
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
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const placeId = await ctx.db.insert("places", {
      ...args,
      tags: args.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });

    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        travelCount: user.travelCount + 1,
      });
    }

    return placeId;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("places")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getAllPublic = query({
  handler: async (ctx) => {
    const places = await ctx.db.query("places").collect();
    const result = [];
    for (const place of places) {
      const user = await ctx.db.get(place.userId);
      if (user?.isPublic) {
        result.push({ ...place, user });
      }
    }
    return result;
  },
});

export const getById = query({
  args: { placeId: v.id("places") },
  handler: async (ctx, args) => {
    const place = await ctx.db.get(args.placeId);
    if (!place) return null;
    const user = await ctx.db.get(place.userId);
    return { ...place, user };
  },
});

export const update = mutation({
  args: {
    placeId: v.id("places"),
    name: v.optional(v.string()),
    notes: v.optional(v.string()),
    rating: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("visited"),
        v.literal("want-to-visit"),
        v.literal("lived"),
        v.literal("current")
      )
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { placeId, ...updates } = args;
    await ctx.db.patch(placeId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { placeId: v.id("places") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.placeId);
  },
});

export const deletePlace = mutation({
  args: { placeId: v.id("places") },
  handler: async (ctx, args) => {
    const place = await ctx.db.get(args.placeId);
    if (!place) return;
    
    await ctx.db.delete(args.placeId);
    
    const user = await ctx.db.get(place.userId);
    if (user && user.travelCount > 0) {
      await ctx.db.patch(place.userId, {
        travelCount: user.travelCount - 1,
      });
    }
  },
});
