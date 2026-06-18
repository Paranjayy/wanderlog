import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    targetType: v.union(v.literal("place"), v.literal("story"), v.literal("photo")),
    targetId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getByTarget = query({
  args: {
    targetType: v.union(v.literal("place"), v.literal("story"), v.literal("photo")),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .order("asc")
      .collect();

    const result = [];
    for (const comment of comments) {
      const user = await ctx.db.get(comment.userId);
      result.push({ ...comment, user });
    }
    return result;
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.commentId);
  },
});
