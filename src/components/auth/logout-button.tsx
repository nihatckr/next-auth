"use client";

import { logoutAction } from "../../actions/auth/logout";


interface LogoutButtonProps {
  children?: React.ReactNode;

}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = () => {
    logoutAction();
  };
  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
}
