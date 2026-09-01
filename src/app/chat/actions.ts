"use server";

export async function logChatAccess(
  username: string,
  isMe: boolean,
  isMaram: boolean,
) {
  if (isMe) {
    console.log(`[Chat Access] User with isMe=true opened chat: ${username}`);
  }

  if (isMaram) {
    console.log(
      `[Chat Access] User with isMaram=true opened chat: ${username}`,
    );
  }
}
