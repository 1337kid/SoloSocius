"use client"

import { useRef, useState } from "react"
import { ImagePlus, PencilIcon, Send, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useInteraction } from "@/features/timeline/hooks/useInteraction"

import {
  deleteAttachment,
  uploadAttachment,
  type UploadedAttachment,
} from "../api"
import { useCreatePost } from "../hooks/useCreatePost"

const MAX_IMAGES = 4
const ACCEPTED_TYPES = "image/jpeg,image/png,image/gif,image/webp"

interface PostComposerProps {
  inReplyTo?: string
  variant?: "card" | "inline"
  placeholder?: string
  onSuccess?: () => void
}

export function PostComposer({
  inReplyTo,
  variant = "card",
  placeholder,
  onSuccess,
}: PostComposerProps) {
  const isReply = !!inReplyTo
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutate: createPost, isPending: isCreating } = useCreatePost()
  const { replyToPost } = useInteraction()
  const isPending = isCreating || replyToPost.isPending

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = MAX_IMAGES - attachments.length
    const toUpload = files.slice(0, remaining)

    if (files.length > remaining) {
      toast.warning(`Only ${MAX_IMAGES} images allowed per post.`)
    }

    setUploading(true)
    try {
      const uploaded = await Promise.all(toUpload.map(uploadAttachment))
      setAttachments((prev) => [...prev, ...uploaded])
    } catch {
      toast.error("Failed to upload one or more images.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeAttachment = async (key: string) => {
    setAttachments((prev) => prev.filter((a) => a.key !== key))
    try {
      await deleteAttachment(key)
    } catch {
      /* preview is already gone */
    }
  }

  const handleSubmit = () => {
    if (!content.trim() && attachments.length === 0) {
      toast.error("Write something or attach an image.")
      return
    }

    const mediaItems = attachments.map((a) => ({
      url: a.url,
      mimeType: a.mimeType,
    }))

    if (isReply) {
      replyToPost.mutate(
        { inReplyTo: inReplyTo!, reply: content, mediaItems: attachments },
        {
          onSuccess: () => {
            setContent("")
            setAttachments([])
            onSuccess?.()
          },
          onError: (err) => toast.error(err.message),
        },
      )
    } else {
      createPost(
        { content, mediaItems },
        {
          onSuccess: () => {
            toast.success("Post created!")
            setContent("")
            setAttachments([])
            onSuccess?.()
          },
          onError: (err) => toast.error(err.message),
        },
      )
    }
  }

  return (
    <div data-slot="composer" data-variant={variant === "inline" ? "inline" : undefined}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          placeholder ?? (isReply ? "Write your reply…" : "What's happening?")
        }
        rows={isReply ? 3 : 4}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit()
        }}
      />
      {attachments.length > 0 ? (
        <div data-slot="composer-attachments">
          {attachments.map((att) => (
            <div key={att.key} data-slot="composer-thumb">
              <img src={att.url} alt="" />
              <Button
                type="button"
                variant="destructive"
                size="icon-xs"
                onClick={() => removeAttachment(att.key)}
                aria-label="Remove image"
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      <div data-slot="composer-bar">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={uploading || attachments.length >= MAX_IMAGES}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach image"
        >
          {uploading ? <Spinner /> : <ImagePlus />}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          hidden
          onChange={handleFileChange}
        />
        <Button onClick={handleSubmit} disabled={isPending || uploading}>
          {isPending ? (
            <Spinner data-icon="inline-start" />
          ) : isReply ? (
            <Send data-icon="inline-start" />
          ) : (
            <PencilIcon data-icon="inline-start" />
          )}
          {isReply ? "Reply" : "Post"}
        </Button>
      </div>
    </div>
  )
}
