"use client";
import { Link } from "next-view-transitions";

type LogoProps = {
  iconOnly?: boolean;
};
const Logo: React.FC<LogoProps> = () => {
  return (
    <div>
      <Link href="/" className="flex items-center gap-2 font-bold [view-transition-name:logo]">
        WhiskeyAI
      </Link>
    </div>
  );
};

export default Logo;
