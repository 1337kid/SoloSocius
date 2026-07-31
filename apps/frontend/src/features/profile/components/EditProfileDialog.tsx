"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProfileData } from "../hooks/useProfileData";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ProfileSchema, type ProfileSchemaType } from "../schemas";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { uploadProfileAvatar, uploadProfileBanner } from "../api";
import { cn } from "@/lib/utils";

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";

export function EditProfileDialog() {
  const { data: profile, isLoading } = useProfileData();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  // Avatar picker state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null);

  // Banner picker state
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerObjectUrl, setBannerObjectUrl] = useState<string | null>(null);

  const avatarPreview = avatarObjectUrl ?? profile?.avatarUrl ?? null;
  const bannerPreview = bannerObjectUrl ?? profile?.bannerUrl ?? null;

  const pickAvatar = useCallback(() => avatarInputRef.current?.click(), []);
  const pickBanner = useCallback(() => bannerInputRef.current?.click(), []);

  const onAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setAvatarFile(f);
      setAvatarObjectUrl(URL.createObjectURL(f));
      e.target.value = "";
    },
    [],
  );

  const onBannerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setBannerFile(f);
      setBannerObjectUrl(URL.createObjectURL(f));
      e.target.value = "";
    },
    [],
  );

  const clearAvatar = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setAvatarFile(null);
      setAvatarObjectUrl(null);
    },
    [],
  );

  const clearBanner = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setBannerFile(null);
      setBannerObjectUrl(null);
    },
    [],
  );

  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      displayName: profile?.displayName ?? "",
      summary: profile?.summary ?? "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName ?? "",
        summary: profile.summary ?? "",
      });
    }
  }, [profile, form]);

  if (isLoading)
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loading…</DialogTitle>
        </DialogHeader>
      </DialogContent>
    );

  const onSubmit = async (values: ProfileSchemaType) => {
    try {
      await Promise.all([
        avatarFile ? uploadProfileAvatar(avatarFile) : Promise.resolve(),
        bannerFile ? uploadProfileBanner(bannerFile) : Promise.resolve(),
      ]);
      await updateProfile(values);
      setAvatarFile(null);
      setBannerFile(null);
      setAvatarObjectUrl(null);
      setBannerObjectUrl(null);
      toast.success("Profile updated!");
      form.reset(values);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const isSaving = form.formState.isSubmitting;
  const displayInitial = (profile?.displayName || profile?.username)
    ?.charAt(0)
    .toUpperCase();

  return (
    <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
      <DialogHeader className="sr-only">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>Edit your profile information.</DialogDescription>
      </DialogHeader>

      <div className="relative">
        {/* Banner */}
        <div
          className={cn(
            "relative w-full h-36 bg-muted overflow-hidden group cursor-pointer select-none",
          )}
          onClick={pickBanner}
          title="Change banner"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && pickBanner()}
          aria-label="Change banner image"
        >
          {bannerPreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={bannerPreview}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10">
              <ImagePlus className="size-7 text-muted-foreground/40" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <Camera className="size-6 text-white" />
          </div>

          {bannerFile && (
            <button
              type="button"
              onClick={clearBanner}
              className="absolute top-2 right-2 size-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
              aria-label="Remove banner"
            >
              <X className="size-3.5" />
            </button>
          )}

          <input
            ref={bannerInputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={onBannerChange}
          />
        </div>

        {/* Avatar overlaid on banner bottom-left */}
        <div className="absolute -bottom-10 left-5">
          <div
            className="relative group cursor-pointer"
            onClick={pickAvatar}
            title="Change avatar"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && pickAvatar()}
            aria-label="Change avatar image"
          >
            <Avatar className="size-20 ring-4 ring-background shadow-lg">
              {avatarPreview && (
                <AvatarImage src={avatarPreview} alt="Avatar" />
              )}
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                {displayInitial}
              </AvatarFallback>
            </Avatar>

            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Camera className="size-5 text-white" />
            </div>

            {avatarFile && (
              <button
                type="button"
                onClick={clearAvatar}
                className="absolute -top-1 -right-1 size-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
                aria-label="Remove avatar"
              >
                <X className="size-3" />
              </button>
            )}

            <input
              ref={avatarInputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
        </div>
      </div>

      {/* Padding to clear avatar overhang */}
      <div className="px-5 pt-14 pb-2">
        <p className="text-xs text-muted-foreground">
          Click the banner or avatar to change them. Changes upload when you save.
        </p>
      </div>

      <Separator />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="px-5 pb-5 pt-4 space-y-4"
      >
        <Controller
          control={form.control}
          name="displayName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="off"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="summary"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                rows={3}
                autoComplete="off"
                aria-invalid={fieldState.invalid}
                className="resize-none"
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />

        <DialogFooter className="pt-2 border-t-0 bg-transparent p-0">
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
