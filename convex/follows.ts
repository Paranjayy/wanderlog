import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const follow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.followerId === args.followingId) return;
    
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .unique();

    if (existing) return;

    await ctx.db.insert("follows", {
      followerId: args.followerId,
      followingId: args.followingId,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.followerId, {
      followingCount: (await ctx.db.get(args.followerId))!.followingCount + 1,
    });
    await ctx.db.patch(args.followingId, {
      followersCount: (await ctx.db.get(args.followingId))!.followersCount + 1,
    });
  },
});

export const unfollow = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .unique();

    if (!existing) return;

    await ctx.db.delete(existing._id);

    await ctx.db.patch(args.followerId, {
      followingCount: Math.max(0, (await ctx.db.get(args.followerId))!.followingCount - 1),
    });
    await ctx.db.patch(args.followingId, {
      followersCount: Math.max(0, (await ctx.db.get(args.followingId))!.followersCount - 1),
    });
  },
});

export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .unique();
    return result !== null;
  },
});

export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followingId", (q) => q.eq("followingId", args.userId))
      .collect();
    
    const users = [];
    for (const follow of follows) {
      const user = await ctx.db.get(follow.followerId);
      if (user) users.push(user);
    }
    return users;
  },
});

export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followerId", (q) => q.eq("followerId", args.userId))
      .collect();
    
    const users = [];
    for (const follow of follows) {
      const user = await ctx.db.get(follow.followingId);
      if (user) users.push(user);
    }
    return users;
  },
});
