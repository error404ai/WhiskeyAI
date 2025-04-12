import ClientLayout from "@/components/Authenticated/ClientLayout";
import AuthHeader from "@/components/Authenticated/header/AuthHeader";
import AppSidebar from "@/components/Guest/AppSidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthenticatedRoute from "@/components/wrappers/AuthenticatedRoute";

type Props = {
  children: React.ReactNode;
};

// Server component
const Layout: React.FC<Props> = ({ children }) => {
  return (
    <AuthenticatedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AuthHeader />
          <ClientLayout>{children}</ClientLayout>
        </SidebarInset>
      </SidebarProvider>
    </AuthenticatedRoute>
  );
};

export default Layout;
