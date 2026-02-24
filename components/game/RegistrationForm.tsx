"use client";

export type RegistrationFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  acceptTerms: boolean;
};

type RegistrationFormProps = {
  form: RegistrationFormValues;
  error: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (values: RegistrationFormValues) => void;
};

export function RegistrationForm({
  form,
  error,
  onSubmit,
  onChange,
}: RegistrationFormProps) {
  return (
    <section className="rounded border p-4 text-sm">
      <h2 className="mb-3 text-lg font-medium">Step 1: Registration</h2>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1">
          First name
          <input
            className="rounded border px-3 py-2"
            name="firstName"
            value={form.firstName}
            onChange={(event) => onChange({ ...form, firstName: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1">
          Last name
          <input
            className="rounded border px-3 py-2"
            name="lastName"
            value={form.lastName}
            onChange={(event) => onChange({ ...form, lastName: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1">
          Email
          <input
            className="rounded border px-3 py-2"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => onChange({ ...form, email: event.target.value })}
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            checked={form.acceptTerms}
            name="acceptTerms"
            type="checkbox"
            onChange={(event) => onChange({ ...form, acceptTerms: event.target.checked })}
          />
          Accept terms
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button className="w-fit rounded border px-4 py-2" type="submit">
          Start Quiz
        </button>
      </form>
    </section>
  );
}
