import { ChevronDownIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Link from "next/link";
import { LogoutButton } from "../auth/logout-button";

// User Menu Component
export const UserButton = ({ userName, userEmail, userAvatar, userRole, onItemClick }: {
  userName: string; userEmail: string; userAvatar: string; userRole: string; onItemClick: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground">
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="text-xs">
            {userName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon className="h-3 w-3 ml-1" />
        <span className="sr-only">Kullanıcı menüsü</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {userEmail}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {userRole === 'ADMIN' && (
        <DropdownMenuItem onClick={() => onItemClick?.('admin')}>
          <Link href="/admin">
            Admin Paneli
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => onItemClick?.('profile')}>
        <Link href="/profile">
          Profil
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('settings')}>
        <Link href="/settings">
          Ayarlar
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('billing')}>
        <Link href="/billing">
          Faturalandırma
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.('logout')}>
        <LogoutButton>
          Çıkış Yap
        </LogoutButton>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
