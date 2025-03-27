import { parseRequest } from "@/lib/api/parseRequest";
import AuthService from "@/server/services/auth/authService";

export const POST = async (request: Request) => {
  // return Response.json({ message: "Invalid token" }, { status: 401 });
  const { token } = await parseRequest(request);

  if (!token || !(await AuthService.decodeToken((token as string) ?? ""))) {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }

  return Response.json({ message: "Token Valid" }, { status: 200 });
};
