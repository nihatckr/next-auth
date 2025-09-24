"use client";
import React, { use } from 'react'
import { Navbar } from './_components/Navbar'
import { useCurrentUser } from '@/hooks/use-current-user';
import { Logo } from '@/components/navigation/logo';


interface NavbarNavItem {
  href: string;
  label: string;
}

interface ProtectedLayoutProps {
  children: React.ReactNode
}



const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {

  const user = useCurrentUser();


  // Default navigation links
  const defaultNavigationLinks: NavbarNavItem[] = [

  ];

  return (
    <div>
      <Navbar
        navigationLinks={defaultNavigationLinks}
        userName={user?.name || ''}
        userEmail={user?.email || ''}
        userAvatar={user?.image || ''}
        userRole={user?.role || ''}
        logo={<Logo />}
        onNavItemClick={() => { }}
        onInfoItemClick={() => { }}
        onUserItemClick={() => { }}
      />
      {children}
    </div>
  )
}

export default ProtectedLayout
