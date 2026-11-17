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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComposerEditor } from "@/features/home/components/ComposerEditor";
import { useInteraction } from "../hooks/useInteraction";
import {
  Ellipsis,
  ExternalLinkIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";

function htmlHasText(html: string) {
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0
  );
}

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
  const [hasText, setHasText] = useState(() => htmlHasText(postContent));

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
          <Button variant="action" size="icon" aria-label="More">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" size="wide">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(postUri);
                toast.success("Link copied to clipboard");
              }}
            >
              <LinkIcon />
              Copy link to post
            </DropdownMenuItem>

            {!isLocal && (
              <DropdownMenuItem
                onClick={() => {
                  window.open(postUri, "_blank");
                }}
              >
                <ExternalLinkIcon />
                View post on remote instance
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          {isLocal && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setEditedContent(postContent);
                    setHasText(htmlHasText(postContent));
                    setEditOpen(true);
                  }}
                >
                  <PencilIcon />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <TrashIcon />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuGroup>
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
          {editOpen ? (
            <ComposerEditor
              initialHtml={postContent}
              placeholder="Edit your post…"
              onChange={({ html, text }) => {
                setEditedContent(html);
                setHasText(text.trim().length > 0);
              }}
            />
          ) : null}
          <DialogFooter showCloseButton>
            <Button
              onClick={handleEdit}
              disabled={updatePost.isPending || !hasText}
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
              variant="destructive"
            >
              {deletePost.isPending ? "Deleting…" : "Delete post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
