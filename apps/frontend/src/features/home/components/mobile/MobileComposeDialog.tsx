"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PostComposer } from "@/features/home/components/PostComposer";

interface MobileComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileComposeDialog({
  open,
  onOpenChange,
}: MobileComposeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-h-none m-0 p-0 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <DialogTitle className="text-lg font-semibold">New Post</DialogTitle>
          <div className="w-10" />
        </div>

        <DialogHeader className="hidden lg:block">
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-4 lg:p-0 overflow-y-auto">
          <PostComposer
            variant="inline"
            onSuccess={() => onOpenChange(false)}
            placeholder="What's on your mind?"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
