"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FullscreenToggleButton from "../button/FullscreenToggleButton";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";
import BrandLogo from "../other/BrandLogo";

const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const opacity = Math.min((y / 1000) * 5, 1);
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);
  const tv = pathName.includes("/tv/");
  const player = pathName.includes("/player");
  if (player) return null;

  return (
    <Navbar
      disableScrollHandler
      isBlurred={false}
      position="sticky"
      maxWidth="full"
      classNames={{ wrapper: "px-2 md:px-4" }}
      className="inset-x-2 top-2 h-16 border-none bg-transparent md:inset-x-4"
    >
      {!show && (
        <div
          className="border-background bg-background absolute inset-0 h-full w-full border-b"
          style={{ opacity: opacity }}
        />
      )}
      <NavbarBrand>
        {show ? (
          <div className="liquid-glass flex h-11 items-center rounded-full border-white/10 px-4">
            <BrandLogo />
          </div>
        ) : (
          <BackButton href={tv ? "/?content=tv" : "/"} />
        )}
      </NavbarBrand>
      <NavbarContent className="hidden md:flex" justify="center">
        <nav className="liquid-glass flex items-center gap-1 rounded-full border-white/10 px-1.5 py-1">
          {siteConfig.navItems.map((item) => {
            const isActive = pathName === item.href;
            return (
              <Link
                href={item.href}
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full px-3 text-sm text-foreground-500 transition-all",
                  "hover:bg-black/5 hover:text-foreground dark:hover:bg-white/6",
                  {
                    "bg-black/5 text-foreground shadow-[inset_0_1px_0_rgba(23,23,27,0.05)] dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]":
                      isActive,
                  },
                )}
              >
                <span className="size-4 [&>*]:size-full">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="flex gap-1">
          <ThemeSwitchDropdown />
          <FullscreenToggleButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
