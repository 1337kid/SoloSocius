"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";

import { useLogin } from "../hooks/useLogin";
import { LoginSchema, type LoginSchemaType } from "../schemas";

const LoginForm = () => {
  const login = useLogin();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginSchemaType) {
    try {
      await login.mutateAsync(values);

      toast.success("Logged in.");

      router.replace(routes.dash);
    } catch {
      toast.error("Invalid username or password.");
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
            <FieldLabel htmlFor={field.name}>Username</FieldLabel>
            <Input
              {...field}
              id={field.name}
              autoComplete="username"
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
              autoComplete="current-password"
              aria-invalid={fieldState.invalid}
            />

            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </Field>
        )}
      />

      <Button className="w-full" disabled={login.isPending}>
        {login.isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};

export default LoginForm;
