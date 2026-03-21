import { getDB } from "@/lib/db";
import { firebaseMessaging } from "@/lib/firebase/FirebaseAdmin";

export async function POST() {
  const now = new Date();

  const db = await getDB();

  const user = await db.collection("users").findOne({ isMe: true });
  if (!user) return Response.json({ ok: false, error: "User not found" });

  const utcOffset = user?.utcOffset ?? 2;

  // Get current time and date in user's local timezone
  const userLocalTime = new Date(now.getTime() + utcOffset * 3600000);
  const userLocalDateString = userLocalTime.toISOString().split("T")[0]; // e.g., "2026-03-19"
  const userLocalTimeString = userLocalTime.toTimeString().slice(0, 5); // e.g., "15:01"
  const userLocalPrevMinute = new Date(
    now.getTime() - 60000 + utcOffset * 3600000,
  )
    .toTimeString()
    .slice(0, 5); // Previous minute in user's local time

  const specificTasks = await db
    .collection("todos")
    .find({
      notificationSent: { $ne: true },
    })
    .toArray();

  const tasksToNotify = specificTasks.filter((task) => {
    // Convert task's stored UTC date to user's local date
    const taskLocalDate = new Date(task.date.getTime() + utcOffset * 3600000)
      .toISOString()
      .split("T")[0]; // e.g., "2026-03-19"

    // Check if task's local date matches today's local date
    if (taskLocalDate !== userLocalDateString) {
      return false;
    }

    // Check if current UTC time matches the scheduled time
    const currentUtcTime = now.toTimeString().slice(0, 5); // Compare UTC to UTC
    return task.utcFromTime && currentUtcTime === task.utcFromTime;
  });

  if (tasksToNotify.length > 0) {
    console.log(
      `Found ${tasksToNotify.length} tasks to send notifications for`,
    );
  } else {
    console.log("No tasks found for notification");
  }

  for (const task of tasksToNotify) {
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
