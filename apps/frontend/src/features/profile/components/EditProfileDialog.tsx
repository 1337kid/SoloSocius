import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProfileData, useUpdateProfile } from "../hooks/useProfile";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ProfileSchema, type ProfileSchemaType } from "../schemas";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

export function EditProfileDialog() {
  const { data: profile, isLoading: isProfileLoading } = useProfileData();

  const { mutateAsync: updateProfile } = useUpdateProfile();

  const form = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      summary: profile?.summary || "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || "",
        summary: profile.summary || "",
      });
    }
  }, [profile, form]);

  if (isProfileLoading)
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loading...</DialogTitle>
        </DialogHeader>
      </DialogContent>
    );

  const onSubmit = async (values: ProfileSchemaType) => {
    try {
      await updateProfile(values);
      toast.success("Profile updated successfully");
      form.reset();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>Edit your profile information.</DialogDescription>
      </DialogHeader>
      <Separator />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <Controller
          control={form.control}
          name="displayName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="displayname"
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
              <FieldLabel htmlFor={field.name}>Summary</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                autoComplete="summary"
                aria-invalid={fieldState.invalid}
              />

              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
