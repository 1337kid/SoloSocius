"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PostComposer } from "../PostComposer"

interface MobileComposeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileComposeDialog({
  open,
  onOpenChange,
}: MobileComposeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="compose">
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>Share something with your followers.</DialogDescription>
        </DialogHeader>
        <PostComposer variant="inline" onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
