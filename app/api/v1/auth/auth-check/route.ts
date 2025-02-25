import AuthService from "@/http/services/authService";
import { parseRequest } from "@/lib/api/parseRequest";

export const POST = async (request: Request) => {
  // return Response.json({ message: "Invalid token" }, { status: 401 });
  const { token } = await parseRequest(request);

  if (!token || !(await AuthService.decodeToken((token as string) ?? ""))) {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }

  return Response.json({ message: "Token Valid" }, { status: 200 });
};
