import { useSession } from "next-auth/react";

export function useIsAdmin() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin || false;
  
  return { 
    isAdmin,
    session,
    isLoading: !session,
  };
} 