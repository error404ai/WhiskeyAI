"use client";
import AuthHeader from "@/components/Authenticated/header/AuthHeader";
import AppSidebar from "@/components/Guest/AppSidebar/AppSidebar";
import PageLoading from "@/components/Loading/PageLoading";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useRouteLoading } from "@/hooks/useRouteLoading";

type Props = {
  children: React.ReactNode;
};
const Layout: React.FC<Props> = ({ children }) => {
  const { isLoading } = useRouteLoading();
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AuthHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {!isLoading && children} {isLoading && <PageLoading />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
