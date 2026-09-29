import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "@/lib/auth-utils";

export async function getSessionUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
