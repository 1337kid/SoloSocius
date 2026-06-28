import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import React from "react";

const PostStat = ({
  count,
  icon,
}: {
  count?: number;
  icon: React.ReactNode;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="flex items-center gap-1 text-muted-foreground text-xs px-6"
    >
      {icon}
      {count && <span>{count}</span>}
    </Button>
  );
};

export default PostStat;
