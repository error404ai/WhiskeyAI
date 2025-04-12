"use client";
import AuthHeader from "@/components/Authenticated/header/AuthHeader";
import AppSidebar from "@/components/Guest/AppSidebar/AppSidebar";
import PageLoading from "@/components/Loading/PageLoading";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useRouteLoading } from "@/hooks/useRouteLoading";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  const { isLoading } = useRouteLoading();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AuthHeader />
        <div className="relative flex flex-1 flex-col gap-4 p-4 pt-0">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="w-full">
                <PageLoading />
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="w-full">
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
