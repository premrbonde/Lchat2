import { MessageCircle, Search, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-lg sticky top-0 z-40">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            VoxTranslate
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations or users..."
              className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          
          {/* User Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/user.png" />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}