import { getDB } from "@/lib/db";
import { firebaseMessaging } from "@/lib/firebase/FirebaseAdmin";
import type { ObjectId } from "mongodb";

type SchedulerTask = {
  _id: ObjectId;
  title: string;
  date: Date;
  utcFromTime?: string;
};

type SchedulerUser = {
  utcOffset?: number;
  client_tokens?: string[];
  phone_tokens?: string[];
};

async function sendNotificationForTask(
  task: SchedulerTask,
  user: SchedulerUser,
  db: Awaited<ReturnType<typeof getDB>>,
) {
  const claimedTask = await db.collection("todos").findOneAndUpdate(
    {
      _id: task._id,
      notificationSent: { $ne: true },
      notificationSending: { $ne: true },
    },
    {
      $set: {
        notificationSending: true,
        notificationSendingAt: new Date(),
      },
    },
    { returnDocument: "after", includeResultMetadata: false },
  );

  if (!claimedTask) {
    console.log(
      `Failed to claim task ${task.title} for notification, skipping...`,
    );
    return;
  }

  try {
    const clientTokens = Array.from(new Set(user.client_tokens ?? []));
    const phoneTokens = Array.from(new Set(user.phone_tokens ?? [])).filter(
      (token) => !clientTokens.includes(token),
    );

    // Send to desktop/browser tokens
    console.log(`Sending notification for task: ${task.title}`);
    if (clientTokens.length) {
      console.log(`Sending to client tokens: ${clientTokens}`);
      await firebaseMessaging.sendEachForMulticast({
        tokens: clientTokens,
        webpush: {
          notification: {
            title: "MindExtension",
            body: task.title,
            icon: "/icon.png",
            tag: `task-${String(task._id)}`,
          },
        },
      });
    }

    // Send to phone/mobile tokens
    if (phoneTokens.length) {
      console.log(`Sending to phone tokens: ${phoneTokens}`);
      await firebaseMessaging.sendEachForMulticast({
        tokens: phoneTokens,
        notification: {
          title: "MindExtension",
          body: task.title,
        },
        webpush: {
          notification: {
            tag: `task-${String(task._id)}`,
          },
        },
      });
    }

    // Mark as sent only after successful delivery attempts.
    await db.collection("todos").updateOne(
      { _id: task._id },
      {
        $set: { notificationSent: true },
        $unset: { notificationSending: "", notificationSendingAt: "" },
      },
    );
  } catch (error) {
    // Release claim so this task can retry in the next scheduler run.
    await db.collection("todos").updateOne(
      { _id: task._id },
      {
        $unset: { notificationSending: "", notificationSendingAt: "" },
      },
    );
    console.error(`Failed to send notification for task: ${task.title}`, error);
    throw error;
  }
}

async function filterTasksForNotification(
  specificTasks: SchedulerTask[],
  user: SchedulerUser,
) {
  const now = new Date();
  const utcOffset = user?.utcOffset ?? 2;
  const userLocalTime = new Date(now.getTime() + utcOffset * 3600000);
  const userLocalDateString = userLocalTime.toISOString().split("T")[0]; // e.g., "2026-03-19"
  const currentUtcTime = now.toTimeString().slice(0, 5); // Compare UTC to UTC

  const filteredTasks = specificTasks.filter((task) => {
    const taskLocalDate = new Date(task.date.getTime() + utcOffset * 3600000)
      .toISOString()
      .split("T")[0]; // e.g., "2026-03-19"

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
  const user = (await db
    .collection("users")
    .findOne({ isMe: true })) as SchedulerUser | null;
  if (!user) return Response.json({ ok: false, error: "User not found" });
  const specificTasks = (await db
    .collection<SchedulerTask>("todos")
    .find({
      notificationSent: { $ne: true },
      notificationSending: { $ne: true },
    })
    .toArray()) as SchedulerTask[];

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

// export async function GET() {
//   const db = await getDB();
//   const user = (await db
//     .collection("users")
//     .findOne({ isMe: true })) as SchedulerUser | null;
//   if (!user) return Response.json({ ok: false, error: "User not found" });
//   const specificTasks = (await db
//     .collection<SchedulerTask>("todos")
//     .find({
//       notificationSent: { $ne: true },
//       notificationSending: { $ne: true },
//     })
//     .toArray()) as SchedulerTask[];

//   const tasksToNotify = await filterTasksForNotification(specificTasks, user);

//   // debbuging logs
//   if (tasksToNotify.length > 0) {
//     console.log(
//       `Found ${tasksToNotify.length} tasks to send notifications for`,
//     );
//   } else {
//     console.log("No tasks found for notification");
//   }

//   for (const task of tasksToNotify) {
//     await sendNotificationForTask(task, user, db);
//   }

//   return Response.json({ ok: true });
// }
