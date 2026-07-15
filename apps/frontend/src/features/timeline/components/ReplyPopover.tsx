import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useInteraction } from "../hooks/useInteraction";
import { Loader2 } from "lucide-react";

export default function ReplyPopover({ inReplyTo }: { inReplyTo: string }) {
  const [reply, setReply] = useState("");
  const { replyToPost } = useInteraction();

  return (
    <div className="grid gap-4">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Reply to the post"
        rows={5}
      />
      <Button
        onClick={() => replyToPost.mutate({ inReplyTo, reply })}
        disabled={replyToPost.isPending}
      >
        {replyToPost.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Reply"
        )}
      </Button>
    </div>
  );
}
