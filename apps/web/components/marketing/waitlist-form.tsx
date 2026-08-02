"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kori/ui/components/button";
import { Input } from "@kori/ui/components/input";
import { Label } from "@kori/ui/components/label";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type WaitlistFormProps = {
  demoNotice: string;
  emailLabel: string;
  invalid: string;
  placeholder: string;
  required: string;
  submit: string;
  success: string;
};

type WaitlistFormValues = {
  email: string;
};

export function WaitlistForm({
  demoNotice,
  emailLabel,
  invalid,
  placeholder,
  required,
  submit,
  success,
}: WaitlistFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().min(1, required).email(invalid),
      }),
    [invalid, required],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<WaitlistFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(schema),
  });

  function submitLocally() {
    setSubmitted(true);
    reset();
  }

  return (
    <form
      className="mx-auto w-full max-w-[30rem]"
      noValidate
      onSubmit={handleSubmit(submitLocally)}
    >
      <Label htmlFor="waitlist-email" className="sr-only">
        {emailLabel}
      </Label>
      <div className="flex flex-col sm:flex-row">
        <Input
          id="waitlist-email"
          type="email"
          autoComplete="email"
          placeholder={placeholder}
          aria-invalid={Boolean(errors.email)}
          aria-describedby="waitlist-feedback"
          className="min-h-14 flex-1 rounded-b-none border-border bg-secondary px-5 font-body text-sm sm:rounded-r-none sm:rounded-bl-[3px]"
          {...register("email", {
            onChange: () => setSubmitted(false),
          })}
        />
        <Button
          type="submit"
          variant="gold"
          className="min-h-14 rounded-t-none px-7 tracking-[0.2em] sm:rounded-r-[2px] sm:rounded-l-none"
        >
          {submit}
        </Button>
      </div>
      <div
        id="waitlist-feedback"
        aria-live="polite"
        className="mt-3 min-h-10 text-left text-xs leading-relaxed"
      >
        {errors.email ? (
          <p className="text-destructive">{errors.email.message}</p>
        ) : submitted ? (
          <p className="text-success dark:text-success-foreground">{success}</p>
        ) : null}
        <p className="text-muted-foreground">{demoNotice}</p>
      </div>
    </form>
  );
}
