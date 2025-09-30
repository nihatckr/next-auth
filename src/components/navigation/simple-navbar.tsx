'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LoginButton } from '../auth';
import { RegisterButton } from '../auth/register-button';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { NotificationMenu } from './notification';
import { UserButton } from './user-button';


// Hamburger icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

// Types
export interface NavLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface SimpleNavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: NavLink[];
  brandName?: string;
  showAuthButtons?: boolean;
  showUserMenu?: boolean;
  userInfo?: {
    name: string;
    email: string;
    avatar: string;
  };
}

// Default navigation links
const defaultNavigationLinks: NavLink[] = [
  { href: '/', label: 'Ana Sayfa', active: true },
  { href: '#features', label: 'Özellikler' },
  { href: '#pricing', label: 'Fiyatlandırma' },
  { href: '#about', label: 'Hakkımızda' },
];

export const SimpleNavbar = React.forwardRef<HTMLElement, SimpleNavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = '/',
      navigationLinks = defaultNavigationLinks,
      brandName = "My App",
      showAuthButtons = true,
      showUserMenu = false,
      userInfo,
      ...props
    },
    ref
  ) => {
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
    const combinedRef = React.useCallback((node: HTMLElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const handleNavClick = (href: string) => {
      if (href.startsWith('#')) {
        // Smooth scroll to section
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate to page
        window.location.href = href;
      }
    };



    return (
      <>
        <header
          ref={combinedRef}
          className={cn(
            'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6',
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
                  <PopoverContent align="start" className="w-48 p-2">
                    <NavigationMenu className="max-w-none">
                      <NavigationMenuList className="flex-col items-start gap-1">
                        {navigationLinks.map((link, index) => (
                          <NavigationMenuItem key={index} className="w-full">
                            <button
                              onClick={() => handleNavClick(link.href)}
                              className={cn(
                                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                link.active
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground/80"
                              )}
                            >
                              {link.label}
                            </button>
                          </NavigationMenuItem>
                        ))}
                      </NavigationMenuList>
                    </NavigationMenu>
                  </PopoverContent>
                </Popover>
              )}

              {/* Main nav */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleNavClick(logoHref)}
                  className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
                >
                  <div className="text-2xl">
                    {logo}
                  </div>
                  <span className="hidden font-bold text-xl sm:inline-block">{brandName}</span>
                </button>

                {/* Navigation menu */}
                {!isMobile && (
                  <NavigationMenu className="flex">
                    <NavigationMenuList className="gap-1">
                      {navigationLinks.map((link, index) => (
                        <NavigationMenuItem key={index}>
                          <button
                            onClick={() => handleNavClick(link.href)}
                            className={cn(
                              "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                              link.active
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground/80 hover:text-foreground"
                            )}
                          >
                            {link.label}
                          </button>
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {showAuthButtons && (
                <>
                  <LoginButton mode='modal' asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      Giriş Yap
                    </Button>
                  </LoginButton>
                  <RegisterButton mode='modal' asChild>
                    <Button
                      size="sm"
                      className="text-sm font-medium px-4 h-9 rounded-md shadow-sm"
                    >
                      Kayıt Ol
                    </Button>
                  </RegisterButton>
                </>
              )}

              {showUserMenu && userInfo && (
                <>
                  <NotificationMenu />
                  <UserButton
                    userName={userInfo.name}
                    userEmail={userInfo.email}
                    userAvatar={userInfo.avatar}
                    onItemClick={(item) => {
                      if (item === "profile") {
                        window.location.href = "/profile";
                      } else if (item === "settings") {
                        window.location.href = "/profile";
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </header>

      </>
    );
  }
);

SimpleNavbar.displayName = 'SimpleNavbar';

export { Logo, HamburgerIcon };
