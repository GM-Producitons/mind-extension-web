import { getDB } from "@/lib/db";
import { firebaseMessaging } from "@/lib/firebase/FirebaseAdmin";

function getCurrentTimeString(date: Date) {
  return date.toTimeString().slice(0, 5); // "HH:mm"
}

export async function POST() {
  const now = new Date();

  const db = await getDB();

  const currentTime = getCurrentTimeString(now);
  const prevMinute = getCurrentTimeString(new Date(now.getTime() - 60000));

  const specificTasks = await db
    .collection("todos")
    .find({
      fromTime: {
        $lte: currentTime,
        $gt: prevMinute,
      },
      notificationSent: { $ne: true },
    })
    .toArray();
  specificTasks.length > 0
    ? console.log(
        `Found ${specificTasks.length} specificTasks to send notifications for`,
      )
    : console.log("No specificTasks found for notification");
  const user = await db.collection("users").findOne({ isMe: true });
  if (!user) return Response.json({ ok: false, error: "User not found" });

  for (const task of specificTasks) {
    // Send to desktop/browser tokens
    console.log(`Sending notification for task: ${task.title}`);
    if (user.client_tokens?.length) {
      console.log(`Sending to client tokens: ${user.client_tokens}`);
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
    }

    // Send to phone/mobile tokens
    if (user.phone_tokens?.length) {
      console.log(`Sending to phone tokens: ${user.phone_tokens}`);
      await firebaseMessaging.sendEachForMulticast({
        tokens: user.phone_tokens,
        notification: {
          title: "MindExtension",
          body: task.title,
        },
      });
    }

    // mark notification as sent
    await db
      .collection("todos")
      .updateOne({ _id: task._id }, { $set: { notificationSent: true } });
  }

  return Response.json({ ok: true });
}
