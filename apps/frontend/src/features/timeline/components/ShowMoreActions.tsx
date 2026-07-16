import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CopyIcon,
  Ellipsis,
  ExternalLinkIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function ShowMoreActions({
  postUri,
  isLocal,
}: {
  postUri: string;
  isLocal: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis className="size-4 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(postUri);
            toast.success("Link copied to clipboard");
          }}
        >
          <LinkIcon className="size-4" />
          Copy link to post
        </DropdownMenuItem>

        {!isLocal && (
          <DropdownMenuItem className="cursor-pointer">
            <ExternalLinkIcon className="size-4" />
            View post on remote instance
          </DropdownMenuItem>
        )}
        {isLocal && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <PencilIcon className="size-4" />
              Edit Post
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500 cursor-pointer">
              <TrashIcon className="size-4" />
              Delete Post
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
