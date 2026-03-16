import { firebaseMessaging } from "@/lib/firebase/FirebaseAdmin";

export async function sendTestNotification(token: string) {
  try {
    const response = await firebaseMessaging.send({
      token,
      webpush: {
        notification: {
          title: "MindExtension",
          body: "Your notification system works 🎉",
        },
      },
    });

    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Notification error:", error);
  }
}
