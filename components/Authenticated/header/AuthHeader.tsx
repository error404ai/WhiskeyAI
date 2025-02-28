/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const AuthHeader = () => {
  const { data: session, update } = useSession();
  const path = usePathname();
  // const { isMobile } = useSidebar();
  // const [status, setStatus] = useState<StatusType>("initial");
  // const handleLogout: MouseEventHandler<HTMLDivElement> = async (e) => {
  //   e.preventDefault();
  //   setStatus("loading");
  //   await AuthController.logout();
  //   setStatus("success");
  // };

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
      {/* <div className="flex items-center gap-4">
        {!isMobile && <span className="text-sm font-medium">{session?.user.name}</span>}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <>
              {!session?.user.avatar && <Skeleton circle width={40} height={40} />}
              {session?.user.avatar && (
                <Avatar className="cursor-pointer">
                  <AvatarImage className="object-cover" src={session.user.avatar} alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              )}
            </>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
       
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              {status === "loading" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="mx-auto animate-spin">
                  <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 140 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z" />
                </svg>
              )}
              {status !== "loading" && (
                <>
      
                  <div className="hidden items-center gap-4 md:flex bg-[#ef4444] p-2 rounded-lg w-full">
                    <DisconnectButton />
                  </div>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}
    </header>
  );
};

export default AuthHeader;
