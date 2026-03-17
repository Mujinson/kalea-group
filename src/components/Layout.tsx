import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";
import AudioPlayer from "./AudioPlayer";
import ChatbotWidget from "./ChatbotWidget";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CookieConsent />
      <AudioPlayer />
    </div>
  );
};

export default Layout;
