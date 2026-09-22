"use client";

import { useState } from "react";
import { HiCheckCircle, HiPaperAirplane } from "react-icons/hi2";
import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterChips } from "@/components/shared/filter-chips";
import { Container } from "@/components/shared/container";
import {
  PUBLIC_FORMS,
  getPublicForm,
  type FormFieldDefinition,
  type PublicFormDefinition,
} from "@/constants/forms";
import {
  composeSubmissionMessage,
  emptyFormValues,
  validateFormValues,
  type FormErrors,
  type FormValues,
} from "@/lib/forms";
import { submitPublicForm } from "@/services/public-forms";
import type { PublicFormType } from "@/types/forms";
import { cn } from "@/lib/utils";
import {
  BTN_PRIMARY_BLUE,
  BTN_OUTLINE_DEFAULT,
} from "@/components/shared/home-styles";

/** Renders one form control based on the field definition. */
function FormField({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: FormFieldDefinition;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const describedBy = error ? `${field.name}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required ? <span aria-hidden="true"> *</span> : null}
      </Label>

      {field.type === "textarea" ? (
        <Textarea
          id={field.name}
          name={field.name}
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          disabled={disabled}
          aria-required={field.required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      ) : field.type === "select" ? (
        <Select
          value={value === "" ? null : value}
          onValueChange={(selected) =>
            onChange(selected === null ? "" : String(selected))
          }
          disabled={disabled}
        >
          <SelectTrigger
            id={field.name}
            className={cn("h-9 w-full", error && "border-destructive")}
            aria-required={field.required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          >
            <SelectValue placeholder={field.placeholder ?? "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={field.type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          min={field.min}
          max={field.max}
          disabled={disabled}
          aria-required={field.required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      )}

      {error ? (
        <p id={`${field.name}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A single form card — owns its values, validation and submission state. */
function PublicFormCard({ definition }: { definition: PublicFormDefinition }) {
  const [values, setValues] = useState<FormValues>(() =>
    emptyFormValues(definition),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function updateField(name: string, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }

  function reset() {
    setValues(emptyFormValues(definition));
    setErrors({});
    setServerError(null);
    setSubmitted(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const validationErrors = validateFormValues(definition, values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await submitPublicForm({
        formType: definition.id,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: composeSubmissionMessage(definition, values),
      });
      setSubmitted(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <HiCheckCircle className="size-7" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {definition.title}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {definition.successMessage}
        </p>
        <Button
          type="button"
          variant="outline"
          className={cn(BTN_OUTLINE_DEFAULT, "mt-2")}
          onClick={reset}
        >
          Submit another response
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {definition.title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {definition.description}
        </p>
      </div>

      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      ) : null}

      <div className="grid gap-5">
        {definition.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            error={errors[field.name]}
            disabled={submitting}
            onChange={(value) => updateField(field.name, value)}
          />
        ))}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className={cn(BTN_PRIMARY_BLUE, "w-full sm:w-auto")}
      >
        {submitting ? (
          <LuLoaderCircle className="mr-1.5 size-4 animate-spin" aria-hidden="true" />
        ) : (
          <HiPaperAirplane className="mr-1.5 size-4" aria-hidden="true" />
        )}
        {submitting ? "Submitting…" : definition.submitLabel}
      </Button>

      {definition.note ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {definition.note}
        </p>
      ) : null}
    </form>
  );
}

/**
 * Forms page body — the five public forms (plan: Forms section).
 * A chip selector switches between form definitions; each renders from the
 * shared definition and submits to POST /api/v1/forms/submit.
 */
export function FormsExplorer() {
  const [activeId, setActiveId] = useState<PublicFormType>(PUBLIC_FORMS[0].id);
  const definition = getPublicForm(activeId);

  const chipOptions = PUBLIC_FORMS.map((form) => form.id);

  return (
    <section className="bg-white">
      <Container className="flex flex-col gap-10 py-14 sm:py-16">
        <FilterChips
          options={chipOptions}
          initial={activeId}
          getLabel={(id) => getPublicForm(id).shortLabel}
          onSelect={setActiveId}
          className="justify-center"
        />

        {/* key remounts the card so switching forms clears all state. */}
        <div className="mx-auto w-full max-w-2xl">
          <PublicFormCard key={definition.id} definition={definition} />
        </div>
      </Container>
    </section>
  );
}
