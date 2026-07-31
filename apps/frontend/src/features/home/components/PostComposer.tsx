"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, PencilIcon, ImagePlus, X, Send } from "lucide-react";
import { toast } from "sonner";
import { useCreatePost } from "@/features/home/hooks/useCreatePost";
import { useInteraction } from "@/features/timeline/hooks/useInteraction";
import {
  uploadAttachment,
  deleteAttachment,
  type UploadedAttachment,
} from "@/features/home/api";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 4;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/gif,image/webp";

interface PostComposerProps {
  inReplyTo?: string;
  variant?: "card" | "inline";
  placeholder?: string;
  onSuccess?: () => void;
}

export function PostComposer({
  inReplyTo,
  variant = "card",
  placeholder,
  onSuccess,
}: PostComposerProps) {
  const isReply = !!inReplyTo;

  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createPost, isPending: isCreating } = useCreatePost();
  const { replyToPost } = useInteraction();
  const isPending = isCreating || replyToPost.isPending;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - attachments.length;
    const toUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.warning(`Only ${MAX_IMAGES} images allowed per post.`);
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(toUpload.map(uploadAttachment));
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error("Failed to upload one or more images.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = async (key: string) => {
    setAttachments((prev) => prev.filter((a) => a.key !== key));
    try {
      await deleteAttachment(key);
    } catch {
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && attachments.length === 0) {
      toast.error("Write something or attach an image.");
      return;
    }

    const mediaItems = attachments.map((a) => ({
      url: a.url,
      mimeType: a.mimeType,
    }));

    if (isReply) {
      replyToPost.mutate(
        { inReplyTo: inReplyTo!, reply: content, mediaItems: attachments },
        {
          onSuccess: () => {
            setContent("");
            setAttachments([]);
            onSuccess?.();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createPost(
        { content, mediaItems },
        {
          onSuccess: () => {
            toast.success("Post created!");
            setContent("");
            setAttachments([]);
            onSuccess?.();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  const inner = (
    <div className="flex flex-col gap-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          placeholder ?? (isReply ? "Write your reply…" : "What's on your mind?")
        }
        rows={isReply ? 4 : 5}
        className="resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
        }}
      />

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div key={att.key} className="relative group size-20 shrink-0">
              <img
                src={att.url}
                alt="attachment"
                className="size-20 rounded-md object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => removeAttachment(att.key)}
                className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={cn("flex items-center gap-2", isReply ? "" : "")}>
        {/* Image upload trigger */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading || attachments.length >= MAX_IMAGES}
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Submit */}
        <Button
          className={cn("gap-2", !isReply && "flex-1")}
          onClick={handleSubmit}
          disabled={isPending || uploading}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isReply ? (
            <Send className="size-4" />
          ) : (
            <PencilIcon className="size-4" />
          )}
          {isReply ? "Reply" : "Post"}
        </Button>
      </div>
    </div>
  );

  if (variant === "inline") {
    return inner;
  }

  return (
    <Card className="mb-auto min-w-3/12 bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
      <CardContent>{inner}</CardContent>
    </Card>
  );
}
