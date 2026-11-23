"use client";

import BottomNavbar from "@/components/ui/layout/BottomNavbar";
import Sidebar from "@/components/ui/layout/Sidebar";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import { SpacingClasses } from "@/utils/constants";
import { cn } from "@/utils/helpers";
import { usePathname } from "next/navigation";

/** The app chrome (navbars, sidebar). The setup screen is shown without it. */
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathName = usePathname();

  if (pathName === "/setup") return <>{children}</>;

  return (
    <>
      <TopNavbar />
      <Sidebar>
        <main className={cn("container mx-auto max-w-full", SpacingClasses.main)}>{children}</main>
      </Sidebar>
      <BottomNavbar />
    </>
  );
};

export default AppShell;
