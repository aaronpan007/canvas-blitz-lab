import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PORTRAIT_STYLES } from "../data/styles";

const styles = PORTRAIT_STYLES;

type Props = {
  disabled?: boolean;
  styleId: string;
  referenceFile?: File | null;
  onGenerate: (payload: {
    styleId: string;
    userAddon?: string;
    hasReference: boolean;
    referenceFile?: File | null;
  }) => void;
};

export const PromptDockAvatar: React.FC<Props> = ({
  disabled = false,
  styleId,
  referenceFile,
  onGenerate
}) => {
  const [userAddon, setUserAddon] = useState("");


  const handleGenerate = () => {
    if (!styleId) return;
    
    onGenerate({
      styleId,
      userAddon: userAddon.trim() || undefined,
      hasReference: !!referenceFile,
      referenceFile
    });
  };

  const canGenerate = !disabled && styleId;

  return (
    <div className="space-y-4">
      {/* Text Input */}
      <div className="relative">
        <Textarea
          value={userAddon}
          onChange={(e) => setUserAddon(e.target.value)}
          placeholder="Describe more vibe details…"
          disabled={disabled}
          className={cn(
            "min-h-[80px] resize-none",
            "glass-morph border-border/30 focus:border-accent/50",
            "placeholder:text-muted-foreground/60",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={cn(
          "w-full h-12 font-medium text-base",
          "glass-morph border border-accent/50",
          "bg-gradient-to-r from-accent/20 to-accent/10",
          "hover:from-accent/30 hover:to-accent/20",
          "text-accent-foreground",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "disabled:hover:from-accent/20 disabled:hover:to-accent/10"
        )}
      >
        {disabled ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            GENERATING...
          </>
        ) : (
          "GENERATE"
        )}
      </Button>
    </div>
  );
};

export default PromptDockAvatar;