import { sendTestNotification } from "@/features/notifications/sendTestNotification";

export async function GET() {
  const token =
    "dYc9NGwAPobsGE12N5utO-:APA91bH0uOL27vGnZnwzXEurzHXF-ms7dKy2UW1pti05GXH0f6dzWxTOIwpYmJwuBwh1ovUFfzHCZ5CdNi2-1xllFTG4l4NnITwJUbjX3egQTPSOexKBvWI";

  await sendTestNotification(token);

  return Response.json({ ok: true });
}
