"use client";


import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { HelpCircleIcon } from "lucide-react";




// Info Menu Component
export const InfoMenu = ({ onItemClick }: { onItemClick?: (item: string) => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <HelpCircleIcon className="h-4 w-4" />
        <span className="sr-only">Help and Information</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.('help')}>
        Help Center
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('documentation')}>
        Documentation
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('contact')}>
        Contact Support
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('feedback')}>
        Send Feedback
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
