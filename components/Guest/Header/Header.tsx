import { Button } from "@/components/ui/button";
import LoggedIn from "@/components/wrappers/LoggedIn";
import LoggedOut from "@/components/wrappers/LoggedOut";
import { Home } from "lucide-react";
import { Link } from "next-view-transitions";
import Logo from "../Common/Logo";
import LoginButton from "./_partials/ConnectButton";
import DisconnectButton from "./_partials/DisconnectButton";

const Header = () => {
  return (
    // <div className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
    <div className="fixed z-50 flex w-full items-center justify-between bg-gray-900 px-5 py-4 shadow-md lg:px-20">
      <div className="flex items-center gap-12">
        <Logo />
        <div className="flex gap-10">
          <Link href="/agent" className="text-lg font-medium text-white transition-colors hover:text-blue-500">
            Agent
          </Link>
          <Link href="/faq" className="text-lg font-medium text-white transition-colors hover:text-blue-500">
            FAQ
          </Link>
        </div>
      </div>
      <LoggedOut>
        <div className="flex gap-3">
          <LoginButton />
        </div>
      </LoggedOut>
      <LoggedIn>
        <div className="flex gap-3">
          <Button variant="outline" link="/dashboard" className="border-2 border-blue-500 text-blue-500 transition-all hover:bg-blue-500 hover:text-white">
            <Home className="mr-2" /> Dashboard
          </Button>
          <DisconnectButton />
        </div>
      </LoggedIn>
    </div>
    // </div>
  );
};

export default Header;
