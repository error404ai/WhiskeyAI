import AuthHeader from "@/components/Authenticated/header/AuthHeader";
import AppSidebar from "@/components/Guest/AppSidebar/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import AuthenticatedRoute from "@/components/wrappers/AuthenticatedRoute";

type Props = {
  children: React.ReactNode;
};
const layout: React.FC<Props> = ({ children }) => {
  return (
    <div>
      <AppSidebar />
      <SidebarInset>
        <AuthHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AuthenticatedRoute>{children}</AuthenticatedRoute>
        </div>
      </SidebarInset>
    </div>
  );
};

export default layout;
