import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface OptionalFieldProps {
  defaultEnabled?: boolean;
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export const OptionalField = ({
  defaultEnabled = false,
  label,
  tooltip,
  children,
  onToggle,
  className = "",
}: OptionalFieldProps) => {
  const [enabled, setEnabled] = useState(defaultEnabled);

  useEffect(() => {
    // Synchroniser l'état local avec la prop defaultEnabled si elle change
    setEnabled(defaultEnabled);
  }, [defaultEnabled]);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (onToggle) {
      onToggle(checked);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm cursor-pointer" onClick={() => handleToggle(!enabled)}>
            {label} <span className="text-xs text-muted-foreground italic">(optionnel)</span>
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>
      
      <div className={`transition-opacity duration-200 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        {children}
      </div>
    </div>
  );
}; 