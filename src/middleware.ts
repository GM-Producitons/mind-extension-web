import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth-utils";

// Routes that don't need auth
const PUBLIC_ROUTES = ["/login"];
const forbiddenRoutes = ["/"];
const maramRoute = "/chat";

// Users that should be forcefully logged out
const BANNED_USERS = [
  "Username1",
  "Username2",
  "Boda",
  // Add more usernames here
];

function logout(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("auth-token");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const isForbidden = forbiddenRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // If the user is already logged in and tries to access a public route
  if (isPublic && token) {
    const payload = await verifyToken(token);

    if (payload) {
      // Force logout banned users
      if (BANNED_USERS.includes(payload.username as string)) {
        return logout(request);
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isForbidden) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected routes
  if (!isPublic) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return logout(request);
    }

    // Force logout banned users
    if (BANNED_USERS.includes(payload.username as string)) {
      return logout(request);
    }

    if (payload.username === "Maram" && pathname !== maramRoute) {
      return NextResponse.redirect(new URL(maramRoute, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw\\.js|icon-.*\\.png|apple-touch-icon\\.png).*)",
  ],
};
