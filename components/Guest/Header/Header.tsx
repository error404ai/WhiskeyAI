import { Button } from "@/components/ui/button";
import LoggedIn from "@/components/wrappers/LoggedIn";
import LoggedOut from "@/components/wrappers/LoggedOut";
import { Home } from "lucide-react";
import { Link } from "next-view-transitions";
import Logo from "../Common/Logo";
import LogoutButton from "./_partials/LogoutButton";

const Header = () => {
  return (
    <div className="container flex items-center justify-between py-10">
      <div className="flex items-center gap-12">
        <Logo />
        <div className="flex gap-10">
          <Link href="#">Home</Link>
        </div>
      </div>
      <LoggedOut>
        <div className="flex gap-3">
          <Button variant="outline" link="/login">
            Login
          </Button>
        </div>
      </LoggedOut>
      <LoggedIn>
        <div className="flex gap-3">
          <Button variant="outline" link="/dashboard">
            <Home /> Dashboard
          </Button>
          <LogoutButton />
        </div>
      </LoggedIn>
    </div>
  );
};

export default Header;
