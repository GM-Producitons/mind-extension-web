import { getDB } from "@/lib/db";
import { firebaseMessaging } from "@/lib/firebase/FirebaseAdmin";

async function sendNotificationForTask(task: any, user: any, db: any) {
  const claimedTask = await db.collection("todos").findOneAndUpdate(
    {
      _id: task._id,
      notificationSent: { $ne: true },
    },
    {
      $set: { notificationSent: true },
    },
    { returnDocument: "after" },
  );

  if (!claimedTask || !claimedTask.value) {
    console.log(
      `Failed to claim task ${task._id} for notification, skipping...`,
    );
    return;
  }

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
}

async function filterTasksForNotification(specificTasks: any[], user: any) {
  const now = new Date();
  const utcOffset = user?.utcOffset ?? 2;
  const filteredTasks = specificTasks.filter((task) => {
    const userLocalTime = new Date(now.getTime() + utcOffset * 3600000);
    const userLocalDateString = userLocalTime.toISOString().split("T")[0]; // e.g., "2026-03-19"

    const taskLocalDate = new Date(task.date.getTime() + utcOffset * 3600000)
      .toISOString()
      .split("T")[0]; // e.g., "2026-03-19"
    const currentUtcTime = now.toTimeString().slice(0, 5); // Compare UTC to UTC

    // Check if task's local date matches today's local date
    if (taskLocalDate !== userLocalDateString) {
      return false;
    }
    // Check if current UTC time matches the scheduled time
    return task.utcFromTime && currentUtcTime === task.utcFromTime;
  });

  return filteredTasks;
}

export async function POST() {
  const db = await getDB();
  const user = await db.collection("users").findOne({ isMe: true });
  if (!user) return Response.json({ ok: false, error: "User not found" });
  const specificTasks = await db
    .collection("todos")
    .find({ notificationSent: { $ne: true } })
    .toArray();

  const tasksToNotify = await filterTasksForNotification(specificTasks, user);

  // debbuging logs
  if (tasksToNotify.length > 0) {
    console.log(
      `Found ${tasksToNotify.length} tasks to send notifications for`,
    );
  } else {
    console.log("No tasks found for notification");
  }

  for (const task of tasksToNotify) {
    await sendNotificationForTask(task, user, db);
  }

  return Response.json({ ok: true });
}
