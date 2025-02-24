import { Button } from "@/components/ui/button";
import LoggedIn from "@/components/wrappers/LoggedIn";
import LoggedOut from "@/components/wrappers/LoggedOut";
import { Home } from "lucide-react";
import { Link } from "next-view-transitions";
import Logo from "../Common/Logo";
import LogoutButton from "./_partials/LogoutButton";

const Header = () => {
  return (
    // <div className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
    <div className="fixed z-50 container flex items-center justify-between bg-gray-900 px-5 py-4 shadow-md lg:px-20">
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
          <Button className="bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-300 transition">
            Login
          </Button>

          {/* <Button variant="outline" link="/login" className="border-2 border-blue-500 text-blue-500 transition-all hover:bg-blue-500 hover:text-white">
            Login
          </Button> */}

          {/* <button className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-md hover:bg-gray-300 transition">
            Connect
          </button> */}
        </div>
      </LoggedOut>
      <LoggedIn>
        <div className="flex gap-3">
          <Button variant="outline" link="/dashboard" className="border-2 border-blue-500 text-blue-500 transition-all hover:bg-blue-500 hover:text-white">
            <Home className="mr-2" /> Dashboard
          </Button>
          <LogoutButton />
        </div>
      </LoggedIn>
    </div>
    // </div>
  );
};

export default Header;
