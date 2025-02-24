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
      <div className="container flex items-center justify-between py-4 px-5 lg:px-20 shadow-md z-50 bg-white fixed">
        <div className="flex items-center gap-12">
          <Logo />
          <div className="flex gap-10">
            <Link href="#" className="text-lg font-medium text-gray-800 hover:text-blue-500 transition-colors">
              Home
            </Link>
          </div>
        </div>
        <LoggedOut>
          <div className="flex gap-3">
            <Button variant="outline" link="/login" className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
              Login
            </Button>
          </div>
        </LoggedOut>
        <LoggedIn>
          <div className="flex gap-3">
            <Button variant="outline" link="/dashboard" className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
              <Home className="mr-2" /> Dashboard
            </Button>
            <LogoutButton className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all" />
          </div>
        </LoggedIn>
      </div>
    // </div>
  );
};

export default Header;
