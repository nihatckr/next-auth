"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { RegisterForm } from "./register-form"




interface RegisternButtonProps {
  children: React.ReactNode
  mode?: "modal" | "redirect"
  asChild?: boolean
}

export const RegisterButton = ({ children, mode = "redirect", asChild }: RegisternButtonProps) => {

  const router = useRouter();

  const onClick = () => {
    router.push('/auth/register');

  }

  if (mode === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>
          {children}
        </DialogTrigger>
        <DialogContent className="p-0 w-auto bg-transparent border-none">
          <DialogTitle className="sr-only">Register</DialogTitle>
          <RegisterForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <span onClick={onClick} className='cursor-pointer'>
      {children}
    </span>
  );
}
