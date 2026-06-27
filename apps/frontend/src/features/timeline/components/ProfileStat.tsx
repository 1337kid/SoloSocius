import { cn } from "@/lib/utils";

export const ProfileStat = ({
  text,
  value,
  left,
  right,
}: {
  text: string;
  value: number;
  left?: boolean;
  right?: boolean;
}) => {
  return (
    <div
      className={cn(
        "space-y-0.5 py-2 hover:bg-muted/60 transition-colors cursor-default hover:cursor-pointer",
        left && "rounded-l-lg",
        right && "rounded-r-lg",
      )}
    >
      <p className="font-bold text-base text-primary">{value}</p>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
        {text}
      </p>
    </div>
  );
};

export default ProfileStat;
