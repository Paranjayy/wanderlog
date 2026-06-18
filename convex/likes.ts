import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggle = mutation({
  args: {
    userId: v.id("users"),
    targetType: v.union(v.literal("place"), v.literal("story"), v.literal("photo")),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_pair", (q) =>
        q.eq("userId", args.userId).eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("likes", {
        userId: args.userId,
        targetType: args.targetType,
        targetId: args.targetId,
        createdAt: Date.now(),
      });
      return true;
    }
  },
});

export const hasLiked = query({
  args: {
    userId: v.id("users"),
    targetType: v.union(v.literal("place"), v.literal("story"), v.literal("photo")),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("likes")
      .withIndex("by_pair", (q) =>
        q.eq("userId", args.userId).eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .unique();
    return result !== null;
  },
});

export const countForTarget = query({
  args: {
    targetType: v.union(v.literal("place"), v.literal("story"), v.literal("photo")),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .collect();
    return likes.length;
  },
});
