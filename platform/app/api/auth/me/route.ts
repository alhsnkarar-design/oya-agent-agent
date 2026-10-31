import { currentUser, publicUser } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return Response.json({
    user: user ? publicUser(user) : null,
    signupOpen: process.env.ALLOW_SIGNUP !== "false",
    requireLogin: process.env.REQUIRE_LOGIN === "true",
  });
}
