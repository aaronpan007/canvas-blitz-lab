import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, CreditCard } from "lucide-react";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass background */}
      <div className="absolute inset-0 glass-morph" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">N</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            NotesImageGen
          </h1>
        </div>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-4">
          {/* Credits Display */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-morph">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">125 Credits</span>
          </div>

          {/* Auth Section */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.png" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      U
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-morph border-glass-border" align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-glass-border" />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive"
                  onClick={() => setIsLoggedIn(false)}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsLoggedIn(true)}
              >
                Login
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                onClick={() => setIsLoggedIn(true)}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}