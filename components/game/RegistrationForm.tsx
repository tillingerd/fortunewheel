"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type RegistrationFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  acceptTerms: boolean;
};

type RegistrationFormProps = {
  form: RegistrationFormValues;
  isSubmitting?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (values: RegistrationFormValues) => void;
};

export function RegistrationForm({
  form,
  isSubmitting = false,
  onSubmit,
  onChange,
}: RegistrationFormProps) {
  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">Step 1: Registration</h2>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={(event) => onChange({ ...form, firstName: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={(event) => onChange({ ...form, lastName: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => onChange({ ...form, email: event.target.value })}
          />
        </div>

        <Label htmlFor="acceptTerms" className="mt-1 flex items-center gap-2 font-normal">
          <Checkbox
            id="acceptTerms"
            checked={form.acceptTerms}
            name="acceptTerms"
            onChange={(event) => onChange({ ...form, acceptTerms: event.target.checked })}
          />
          Accept terms
        </Label>

        <Button className="mt-1 w-fit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Start Quiz"}
        </Button>
      </form>
    </Card>
  );
}

