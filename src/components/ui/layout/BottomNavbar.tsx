"use client";

import { siteConfig } from "@/config/site";
import clsx from "clsx";
import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";
import { Chip } from "@heroui/chip";

const BottomNavbar = () => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);

  return (
    show && (
      <>
        <div className="h-20 md:hidden" />
        <div className="liquid-glass fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 z-50 block h-fit w-[calc(100%-1rem)] rounded-[1.35rem] border-white/10 px-1 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.38)] md:hidden">
          <div className="mx-auto grid h-full max-w-lg grid-cols-4">
            {siteConfig.navItems.map((item) => {
              const isActive = pathName === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="flex min-h-12 items-center justify-center text-foreground"
                >
                  <div className="flex max-h-[50px] flex-col items-center justify-center">
                    <Chip
                      size="lg"
                      variant={isActive ? "solid" : "light"}
                      classNames={{
                        base: "py-[2px] transition-all",
                        content: "size-full",
                      }}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </Chip>
                    <p className={clsx("text-[10px]", { "font-bold": isActive })}>{item.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </>
    )
  );
};

export default BottomNavbar;
