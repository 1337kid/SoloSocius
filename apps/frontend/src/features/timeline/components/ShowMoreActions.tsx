import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useInteraction } from "../hooks/useInteraction";
import {
  Ellipsis,
  ExternalLinkIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function ShowMoreActions({
  id,
  postUri,
  isLocal,
  postContent = "",
}: {
  id: string;
  postUri: string;
  isLocal: boolean;
  postContent?: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(postContent);

  const { updatePost, deletePost } = useInteraction();

  function handleEdit() {
    updatePost.mutate(
      { id, content: editedContent },
      {
        onSuccess: () => {
          toast.success("Post updated");
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Failed to update post");
        },
      },
    );
  }

  function handleDelete() {
    deletePost.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Post deleted");
          setDeleteOpen(false);
        },
        onError: () => {
          toast.error("Failed to delete post");
        },
      },
    );
  }

  return (
    <>
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
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                window.open(postUri, "_blank");
              }}
            >
              <ExternalLinkIcon className="size-4" />
              View post on remote instance
            </DropdownMenuItem>
          )}
          {isLocal && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setEditedContent(postContent);
                  setEditOpen(true);
                }}
              >
                <PencilIcon className="size-4" />
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 cursor-pointer"
                onClick={() => setDeleteOpen(true)}
              >
                <TrashIcon className="size-4" />
                Delete Post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>
              Make changes to your post below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={5}
            className="resize-none"
          />
          <DialogFooter showCloseButton>
            <Button
              onClick={handleEdit}
              disabled={updatePost.isPending || !editedContent.trim()}
            >
              {updatePost.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              onClick={handleDelete}
              disabled={deletePost.isPending}
              variant="outline"
              className="text-red-500 border-red-500 hover:text-red-600 hover:bg-red-500"
            >
              {deletePost.isPending ? "Deleting…" : "Delete post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
