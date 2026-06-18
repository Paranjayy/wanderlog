import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    placeId: v.id("places"),
    tripId: v.optional(v.id("trips")),
    title: v.string(),
    content: v.string(),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stories", {
      userId: args.userId,
      placeId: args.placeId,
      tripId: args.tripId,
      title: args.title,
      content: args.content,
      photos: args.photos ?? [],
      date: Date.now(),
      isPublic: true,
      likesCount: 0,
      commentsCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const getByPlace = query({
  args: { placeId: v.id("places") },
  handler: async (ctx, args) => {
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_placeId", (q) => q.eq("placeId", args.placeId))
      .collect();
    
    const result = [];
    for (const story of stories) {
      const user = await ctx.db.get(story.userId);
      result.push({ ...story, user });
    }
    return result;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stories")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const remove = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.storyId);
  },
});
