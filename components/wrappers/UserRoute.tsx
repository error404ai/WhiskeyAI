import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};
const UserRoute: React.FC<Props> = async ({ children }) => {
  const session = await auth();
  const intended = (await headers()).get("request_url");
  if (!session) {
    const url = new URL(process.env.AUTH_URL + "/");
    if (intended) {
      url.searchParams.set("intended", intended);
    }
    return redirect(url.toString());
  }

  if (session.user.isAdmin === true) {
    return redirect("/admin/dashboard");
  }

  return children;
};

export default UserRoute;
