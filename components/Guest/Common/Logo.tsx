"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { Link } from "next-view-transitions";

type LogoProps = {
  iconOnly?: boolean;
};
const Logo: React.FC<LogoProps> = () => {
  const { open } = useSidebar();
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Bot className="h-6 w-6" />
      <span className={cn("inline-block font-bold italic", { hidden: !open })}>WhiskeyAI</span>
    </Link>
  );
};

export default Logo;
