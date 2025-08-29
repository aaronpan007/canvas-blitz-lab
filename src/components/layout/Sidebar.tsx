import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  User, 
  Shirt, 
  Shapes, 
  MoreHorizontal,
  ChevronRight 
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { id: "general", label: "General", icon: Sparkles, isActive: true },
  { id: "avatar", label: "Avatar Generation", icon: User },
  { id: "try-on", label: "Clothing Try-on", icon: Shirt },
  { id: "vector", label: "Vector Graphics", icon: Shapes },
  { id: "more", label: "More Features", icon: MoreHorizontal },
];

interface SidebarProps {
  activeItem: string;
  onItemChange: (itemId: string) => void;
}

export function Sidebar({ activeItem, onItemChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "relative flex flex-col h-full transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Glass background */}
      <div className="absolute inset-0 glass-morph rounded-lg" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-foreground">
              Features
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg glass-morph glow-blue hover:bg-glass-hover transition-all"
          >
            <ChevronRight 
              className={cn(
                "w-4 h-4 transition-transform",
                isCollapsed ? "rotate-0" : "rotate-180"
              )} 
            />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onItemChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all group",
                  "glass-morph hover:bg-glass-hover",
                  isActive && "bg-glass-hover border-primary glow-yellow",
                  !isActive && "glow-blue"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                
                {!isCollapsed && (
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="mt-auto pt-4 border-t border-glass-border">
            <p className="text-xs text-muted-foreground text-center">
              NotesImageGen v1.0
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}