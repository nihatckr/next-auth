import { ChevronDownIcon, User, Settings, Shield, CreditCard, LogOut } from "lucide-react";

import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { OptimizedAvatar } from "../ui/optimized-avatar";
import Link from "next/link";
import { LogoutButton } from "../auth/logout-button";

// Enhanced User Menu Component with icons and improved UX
export const UserButton = ({ userName, userEmail, userAvatar, userRole, onItemClick }: {
  userName: string; userEmail: string; userAvatar: string; userRole: string; onItemClick: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-10 px-2 py-0 hover:bg-accent hover:text-accent-foreground transition-colors">
        <div className="flex items-center space-x-2">
          <OptimizedAvatar
            src={userAvatar}
            alt={userName}
            size="sm"
            fallback={userName.split(' ').map(n => n[0]).join('')}
            className="ring-2 ring-offset-2 ring-offset-background ring-primary/10"
          />
          <ChevronDownIcon className="h-3 w-3" />
        </div>
        <span className="sr-only">Kullanıcı menüsü</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64 p-2">
      <DropdownMenuLabel>
        <div className="flex items-center space-x-3">
          <OptimizedAvatar
            src={userAvatar}
            alt={userName}
            size="md"
            fallback={userName.split(' ').map(n => n[0]).join('')}
          />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
            <Badge variant={userRole === 'ADMIN' ? "default" : "secondary"} className="text-xs w-fit">
              {userRole === 'ADMIN' ? "🛡️ Admin" : "👤 Kullanıcı"}
            </Badge>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {userRole === 'ADMIN' && (
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/admin" onClick={() => onItemClick?.('admin')} className="flex items-center">
            <Shield className="mr-3 h-4 w-4" />
            Admin Paneli
          </Link>
        </DropdownMenuItem>
      )}

      <DropdownMenuItem asChild className="cursor-pointer">
        <Link href="/profile" onClick={() => onItemClick?.('profile')} className="flex items-center">
          <User className="mr-3 h-4 w-4" />
          Profil
        </Link>
      </DropdownMenuItem>



      <DropdownMenuItem asChild className="cursor-pointer">
        <Link href="/billing" onClick={() => onItemClick?.('billing')} className="flex items-center">
          <CreditCard className="mr-3 h-4 w-4" />
          Faturalandırma
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={() => onItemClick?.('logout')} className="cursor-pointer text-red-600 focus:text-red-600">
        <LogOut className="mr-3 h-4 w-4" />
        <LogoutButton>
          Çıkış Yap
        </LogoutButton>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
