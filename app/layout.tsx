import ReduxProvider from "@/components/Providers/ReduxProvider";
import TanstackQueryProvider from "@/components/Providers/TanstackQueryProvider";
import { cn } from "@/lib/utils";
import "@/resources/css/globals.css";
import { AnimatePresence } from "motion/react";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { ViewTransitions } from "next-view-transitions";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import "react-loading-skeleton/dist/skeleton.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Whiskey AI Bot",
  description: "An AI Agent Bot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanstackQueryProvider>
      <ReduxProvider>
        <SessionProvider>
          <ViewTransitions>
            <html lang="en" className="light">
              <body className={cn(`${geistSans.variable} ${geistMono.variable} antialiased`, "flex min-h-screen flex-col justify-between bg-white dark:bg-[#080808] dark:text-white")}>
                <NextTopLoader color="#2299DD" initialPosition={0.08} crawlSpeed={200} height={6} crawl={true} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px #2299DD,0 0 5px #2299DD" zIndex={1600} showAtBottom={false} />
                <AnimatePresence>{children}</AnimatePresence>
              </body>
            </html>
          </ViewTransitions>
        </SessionProvider>
      </ReduxProvider>
    </TanstackQueryProvider>
  );
}
