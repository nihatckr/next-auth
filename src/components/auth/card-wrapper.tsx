"use client"

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { BackButton } from "./back-button"
import { Header } from "./header"
import { Social } from "./social"
import { cn } from "../../lib/utils"

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel?: string
  backButtonLabel?: string
  backButtonHref: string
  showSocial?: boolean
  descLabel?: string
  className?: React.ComponentProps<"div">
}
export const CardWrapper = ({ children, headerLabel, backButtonLabel, backButtonHref, showSocial, className, descLabel }: CardWrapperProps) => {
  return (
    <div className={cn("flex flex-col gap-6 items-center ", className)}>
      <Card>
        <CardHeader>
          <Header label={headerLabel} />
        </CardHeader>
        <CardContent>
          {children}
          <div className="flex flex-col gap-6 my-2">
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-6 my-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {showSocial && (
                <Social />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6 my-2">
            <div className="text-center text-sm">
              <BackButton label={backButtonLabel} href={backButtonHref} desc={descLabel} />
            </div>
          </div>
          <div className="flex flex-col gap-6 my-2">
            <CardFooter>
              <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
              </div>
            </CardFooter>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
