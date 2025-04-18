import AdminRoute from "@/components/wrappers/AdminRoute";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <AdminRoute>{children}</AdminRoute>;
};

export default layout;
