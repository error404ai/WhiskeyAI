"use client";

import { AnimatePresence, motion } from "@/components/ClientWrappers/motion";
import PageLoading from "@/components/Loading/PageLoading";
import { useRouteLoading } from "@/hooks/useRouteLoading";

type ClientLayoutProps = {
  children: React.ReactNode;
};

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { isLoading } = useRouteLoading();

  return (
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
  );
};

export default ClientLayout;
