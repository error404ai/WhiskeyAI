/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import DisconnectButton from "@/components/Guest/Header/_partials/DisconnectButton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const AuthHeader = () => {
  const { data: session, update } = useSession();
  const path = usePathname();

  useEffect(() => {
    if (!session) {
      update();
    }
  }, []);
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 pr-3 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">{process.env.NEXT_PUBLIC_APP_NAME}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{path.replace("/", "").replace(/-/g, " ").charAt(0).toUpperCase() + path.replace("/", "").replace(/-/g, " ").slice(1)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <DisconnectButton />
    </header>
  );
};

export default AuthHeader;
