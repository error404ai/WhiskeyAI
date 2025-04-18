import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};
const GuestRoute: React.FC<Props> = async ({ children }) => {
  const session = await auth();
  if (session && session.user.isAdmin === false) {
    return redirect("/my-agents");
  }
  if (session && session.user.isAdmin === true) {
    return redirect("/admin/dashboard");
  }

  return children;
};

export default GuestRoute;
