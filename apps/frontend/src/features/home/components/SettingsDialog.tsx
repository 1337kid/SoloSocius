"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, ChevronLeft, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useDeleteAccount } from "@/features/profile/hooks/useDeleteAccount";
import { useSession } from "@/features/auth/hooks/useSession";
import { Switch } from "@/components/ui/switch";
import { useProfileData } from "@/features/profile/hooks/useProfileData";
import { useFollowRequests } from "@/features/profile/hooks/useFollowRequests";

type View = "settings" | "confirm-delete";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [view, setView] = useState<View>("settings");
  const [password, setPassword] = useState("");
  const deleteAccount = useDeleteAccount();
  const { endSession } = useSession();
  const { data: profileData } = useProfileData();

  const { isTogglingManualApproval, toggleManualApproval } =
    useFollowRequests();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setView("settings");
      setPassword("");
    }
    onOpenChange(next);
  }

  function openConfirmDelete() {
    setPassword("");
    setView("confirm-delete");
  }

  async function handleDeleteAccount() {
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      await deleteAccount.mutateAsync(password);
    } catch {
      toast.error(
        "Failed to delete account. Check your password and try again.",
      );
      return;
    }
    handleOpenChange(false);
    endSession();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {view === "settings" && (
          <>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your account preferences.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-sm font-medium">Account</p>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Manually approve followers
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Manually approve followers to your account.
                  </p>
                </div>
                <Switch
                  checked={profileData?.manuallyApprovesFollowers ?? false}
                  onCheckedChange={toggleManualApproval}
                  disabled={isTogglingManualApproval}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-destructive">
                    Delete Account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and notify all followers.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={openConfirmDelete}
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}

        {view === "confirm-delete" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <TriangleAlert className="size-4 text-destructive shrink-0" />
                <DialogTitle className="text-destructive">
                  Delete Account
                </DialogTitle>
              </div>
              <DialogDescription className="pt-1">
                This is permanent and cannot be undone. All your posts, data,
                and follow relationships will be removed. Your followers will be
                notified via ActivityPub.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <Label htmlFor="confirm-password">
                Enter your password to confirm
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !deleteAccount.isPending &&
                  handleDeleteAccount()
                }
                autoFocus
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => setView("settings")}
                disabled={deleteAccount.isPending}
                className="mr-auto"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={deleteAccount.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending || !password}
              >
                {deleteAccount.isPending ? "Verifying…" : "Delete Account"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
