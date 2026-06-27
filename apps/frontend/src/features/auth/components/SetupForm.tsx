"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

import { useSetup } from "../hooks/useSetup";
import { SetupSchema, type SetupSchemaType } from "../schemas";

const SetupForm = () => {
  const setup = useSetup();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SetupSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SetupSchemaType) {
    try {
      await setup.mutateAsync({
        username: values.username,
        password: values.password,
      });

      toast.success("Admin account created. Welcome aboard.");

      router.replace(routes.dash);
    } catch {
      toast.error("Unable to create admin account. This instance may already be configured.");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <Controller
        control={form.control}
        name="username"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Admin username</FieldLabel>
            <Input
              {...field}
              id={field.name}
              autoComplete="username"
              placeholder="admin"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              autoComplete="new-password"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              autoComplete="new-password"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </Field>
        )}
      />

      <Button className="w-full" disabled={setup.isPending}>
        {setup.isPending ? "Creating account..." : "Create admin account"}
      </Button>
    </form>
  );
};

export default SetupForm;
