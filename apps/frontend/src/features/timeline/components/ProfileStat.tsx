import { cn } from "@/lib/utils";
import Link from "next/link";

export const ProfileStat = ({
  text,
  value,
  left,
  right,
  href,
  }: {
  text: string;
  value: number;
  href?: string;
  left?: boolean;
  right?: boolean;
}) => {
  return (
    <Link href={href ?? "#"}>
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
    </Link>
  );
};

export default ProfileStat;
