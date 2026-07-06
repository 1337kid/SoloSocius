import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

const PostStat = ({
  count,
  active,
  icon,
  label,
  onClick,
}: {
  count?: number;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-1 text-muted-foreground text-xs ${active ? "text-primary bg-accent" : ""}`}
          onClick={onClick}
        >
          {icon}
          {count && count > 0 ? <span>{count}</span> : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export default PostStat;
