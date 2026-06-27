import "server-only";

import { cookies } from "next/headers";

export const NOESIS_VISITOR_COOKIE = "noesis_visitor_id";

const maxAge = 60 * 60 * 24 * 365;

export async function getExistingVisitorId() {
  const cookieStore = await cookies();
  return cookieStore.get(NOESIS_VISITOR_COOKIE)?.value ?? null;
}

export async function getOrCreateVisitorId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(NOESIS_VISITOR_COOKIE)?.value;

  if (existing) return existing;

  const visitorId = crypto.randomUUID();
  cookieStore.set({
    name: NOESIS_VISITOR_COOKIE,
    value: visitorId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return visitorId;
}
