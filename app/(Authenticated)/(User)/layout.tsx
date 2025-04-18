import UserRoute from "@/components/wrappers/UserRoute";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <UserRoute>{children}</UserRoute>;
};

export default layout;
