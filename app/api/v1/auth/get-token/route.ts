import { auth } from "@/auth";
import { getIntendedRoute } from "@/lib/utils";
import AuthService from "@/server/services/auth/authService";
import { redirect } from "next/navigation";

export const GET = async (request: Request): Promise<Response> => {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?intended=" + encodeURIComponent(getIntendedRoute(request)));
  }

  const token = await AuthService.issueAccessToken(session.user);

  if (!token) {
    return new Response("Failed to issue access token", { status: 500 });
  }

  const redirectUrl = new URLSearchParams(request.url.split("?")[1]).get("redirectUrl");

  if (redirectUrl) {
    const url = new URL(redirectUrl);
    url.searchParams.set("token", token);
    url.searchParams.set("statusCode", "200");
    url.searchParams.set("message", "Success");
    return redirect(url.toString());
  }

  return Response.json({
    user: session.user,
    token,
    redirectUrl,
  });
};
