import AuthService from "@/http/services/authService";

const withApiMiddleware = (handler: (request: Request) => Promise<Response>) => {
  return async (request: Request): Promise<Response> => {
    const bearerToken = request.headers.get("Authorization");

    if (!bearerToken) {
      return new Response(
        JSON.stringify({
          message: "Unauthorized",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const user = await AuthService.validateBearerToken(bearerToken);

    if (!user) {
      return new Response(
        JSON.stringify({
          message: "Unauthorized",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    request.headers.set("X-User", JSON.stringify(user));

    return handler(request);
  };
};

export default withApiMiddleware;
