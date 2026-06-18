import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const svix_id = req.headers.get("svix-id")!;
  const svix_timestamp = req.headers.get("svix-timestamp")!;
  const svix_signature = req.headers.get("svix-signature")!;

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error verifying webhook", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, username, image_url, first_name, last_name } = evt.data;

    const displayName =
      [first_name, last_name].filter(Boolean).join(" ") ||
      username ||
      "Traveler";
    const userUsername = username || `user_${id.slice(0, 8)}`;

    await convex.mutation(api.users.upsertFromClerk, {
      clerkId: id,
      username: userUsername,
      displayName,
      avatar: image_url || "",
    });
  }

  return new Response("Webhook processed", { status: 200 });
}
