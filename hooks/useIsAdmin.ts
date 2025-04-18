import { useSession } from "next-auth/react";

export default function useIsAdmin() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin || false;
  
  return { 
    isAdmin,
    session,
    isLoading: !session,
  };
} 