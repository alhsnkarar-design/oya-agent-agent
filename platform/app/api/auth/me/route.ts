import { currentUser, publicUser } from "@/lib/server/auth";
import { googleEnabled } from "@/lib/server/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return Response.json({
    user: user ? publicUser(user) : null,
    signupOpen: process.env.ALLOW_SIGNUP !== "false",
    requireLogin: process.env.REQUIRE_LOGIN === "true",
    google: googleEnabled(),
  });
}
