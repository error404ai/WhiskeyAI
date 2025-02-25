import Footer from "@/components/Guest/Footer/Footer";
import { GuestHeader } from "@/components/Guest/Header/GuestHeader";

type Props = {
  children: React.ReactNode;
};
const layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div>
        <GuestHeader />
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default layout;
