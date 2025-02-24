import Footer from "@/components/Guest/Footer/Footer";
import Header from "@/components/Guest/Header/Header";

type Props = {
  children: React.ReactNode;
};
const layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div>
        {/* <Header /> */}
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default layout;
