import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};
const GuestRoute: React.FC<Props> = async ({ children }) => {
  const session = await auth();
  if (session) {
    return redirect("/my-agents");
  }

  return children;
};

export default GuestRoute;
