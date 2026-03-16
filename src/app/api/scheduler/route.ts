import { getDB } from "@/lib/db";
import { firebaseMessaging } from "@/lib/firebase/FirebaseAdmin";

export async function POST() {
  const now = new Date();

  const db = await getDB();
  const tasks = await db
    .collection("todos")
    .find({
      formTime: {
        $lte: now,
        $gt: new Date(now.getTime() - 60000),
      },
      notificationSent: { $ne: true },
    })
    .toArray();

  const user = await db.collection("users").findOne({ isMe: true });
  for (const task of tasks) {
    if (!user?.client_tokens?.length) continue;

    await firebaseMessaging.sendEachForMulticast({
      tokens: user.client_tokens,
      webpush: {
        notification: {
          title: "MindExtension",
          body: task.title,
          icon: "/icon.png",
        },
      },
    });

    // mark notification as sent
    await db
      .collection("todos")
      .updateOne({ _id: task._id }, { $set: { notificationSent: true } });
  }

  return Response.json({ ok: true });
}
