import UserService from "@/http/services/userService";
import withApiMiddleware from "@/middleware/apiMiddleware";

export const GET = withApiMiddleware(async (request: Request): Promise<Response> => {
  const users = await UserService.getUsers();
  const data = JSON.parse(request.headers.get("data") as string);

  return Response.json({
    message: "Users fetched successfully",
    users,
    data,
  });
});
