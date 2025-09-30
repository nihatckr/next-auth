"use client";

import { UserButton } from "@/components/navigation/user-button";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { forwardRef, useCallback, useEffect, useRef, useState, ComponentProps } from "react";
import { NotificationMenu } from "@/components/navigation/notification";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { HamburgerIcon } from "@/components/navigation/hamburger-icon";

// Types
export interface NavItem {
  href: string;
  label: string;
}

export interface NavbarProps extends ComponentProps<'header'> {
  logo: React.ReactNode;
  navigationLinks: NavItem[];
  userName: string;
  userEmail: string;
  userAvatar: string;
  userRole: string;
  onNavItemClick: (href: string) => void;
  onInfoItemClick: (item: string) => void;
  onUserItemClick: (item: string) => void;
}




const NavbarComponent = forwardRef<HTMLElement, NavbarProps>(({
  logo,
  navigationLinks,
  userName,
  userEmail,
  userAvatar,
  userRole,
  onNavItemClick,
  onUserItemClick,
  className,
  ...props
}, ref) => {

  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setIsMobile(width < 768); // 768px is md breakpoint
      }
    };
    checkWidth();
    const resizeObserver = new ResizeObserver(checkWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  // Combine refs
  const combinedRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);
  return (
    <header
      ref={combinedRef}
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline',
        className
      )}
      {...props}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          {isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                  variant="ghost"
                  size="icon"
                >
                  <HamburgerIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-1">
                <NavigationMenu className="max-w-none">
                  <NavigationMenuList className="flex-col items-start gap-0">
                    {(navigationLinks ?? []).map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <Link
                          href={link.href}
                          onClick={() => {
                            if (onNavItemClick && link.href) onNavItemClick(link.href);
                          }}
                          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          )}
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
            >
              <div className="text-2xl">
                {logo}
              </div>
              <span className="hidden font-bold text-xl sm:inline-block">
                shadcn.io
              </span>
            </Link>
            {/* Navigation menu */}
            {!isMobile && (
              <NavigationMenu className="flex">
                <NavigationMenuList className="gap-1">
                  {(navigationLinks ?? []).map((link, index) => (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.href}
                          onClick={() => {
                            if (onNavItemClick && link.href) onNavItemClick(link.href);
                          }}
                          className="text-muted-foreground hover:text-primary font-medium transition-colors cursor-pointer group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Info menu */}

            {/* Notification */}
            <NotificationMenu />
            {/* Theme toggle */}
            <ThemeToggle />
          </div>
          {/* User menu */}
          <UserButton
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            onItemClick={onUserItemClick}
            userRole={userRole}
          />
        </div>
      </div>
    </header>
  );
}
);

NavbarComponent.displayName = "Navbar";
export const Navbar = NavbarComponent;
