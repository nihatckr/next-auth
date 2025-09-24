import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"


const font = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})


interface HeaderProps {
  label?: string
}
export const Header = ({ label }: HeaderProps) => {
  return (
    <div className={"flex flex-col gap-6"}>
      <div className="flex flex-col items-center gap-2">
        <h1 className={cn("text-3xl font-semibold", font.className)}>Auth</h1>
      </div>
      <div className="text-center text-sm">
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </div>

  )
}
