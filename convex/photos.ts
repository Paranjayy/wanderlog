import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    placeId: v.optional(v.id("places")),
    tripId: v.optional(v.id("trips")),
    url: v.string(),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("photos", {
      ...args,
      uploadedAt: Date.now(),
    });
  },
});

export const getByPlace = query({
  args: { placeId: v.id("places") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("photos")
      .withIndex("by_placeId", (q) => q.eq("placeId", args.placeId))
      .order("desc")
      .collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("photos")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const remove = mutation({
  args: { photoId: v.id("photos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.photoId);
  },
});
