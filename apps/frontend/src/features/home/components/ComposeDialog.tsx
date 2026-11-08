"use client"

import { useState } from "react"
import { SquarePen } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { PostComposer } from "./PostComposer"

export function ComposeDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <SquarePen data-icon="inline-start" />
          New post
        </Button>
      </DialogTrigger>
      <DialogContent size="compose">
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>
            Share something with your followers.
          </DialogDescription>
        </DialogHeader>
        <PostComposer variant="inline" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
