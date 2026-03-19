export const requestPermission = async () => {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("Notification permission granted");
    // Get FCM token here
  }
};
