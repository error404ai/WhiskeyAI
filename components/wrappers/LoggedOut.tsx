import { auth } from "@/auth";

type Props = {
  children: React.ReactNode;
};
const LoggedOut: React.FC<Props> = async ({ children }) => {
  const session = await auth();
  if (session) {
    return null;
  }

  return children;
};

export default LoggedOut;
