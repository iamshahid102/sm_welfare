import type { PublicFormType } from "@/types/forms";

/**
 * Single source of truth for the five public forms (Forms section of the
 * implementation plan).
 *
 * The backend accepts exactly `{ formType, name, email, phone, message }`.
 * Every form therefore starts from the shared contact core (name, email,
 * phone) and its extra questions are composed into the `message` body by
 * `composeSubmissionMessage` in `lib/forms.ts`.
 */

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "textarea";

export interface FormFieldDefinition {
  /** Field key used in the local form state. */
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  /** Options for `select` fields. */
  options?: readonly string[];
  maxLength?: number;
  minLength?: number;
  /** Numeric bounds for `number` fields. */
  min?: number;
  max?: number;
}

export interface PublicFormDefinition {
  id: PublicFormType;
  /** Full heading shown above the form. */
  title: string;
  /** Compact label used by the form selector chips. */
  shortLabel: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  /** Short note rendered under the form (documents, timelines, ...). */
  note?: string;
  fields: readonly FormFieldDefinition[];
}

/** Fields that map directly to the API payload instead of the message body. */
export const CORE_FIELD_NAMES: ReadonlySet<string> = new Set([
  "name",
  "email",
  "phone",
]);

const CORE_FIELDS = [
  {
    name: "name",
    label: "Full name",
    type: "text",
    required: true,
    placeholder: "Enter your full name",
    maxLength: 100,
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    required: true,
    placeholder: "you@example.com",
    maxLength: 254,
  },
  {
    name: "phone",
    label: "Phone number",
    type: "tel",
    required: true,
    placeholder: "+92 3XX XXX XXXX",
    maxLength: 32,
  },
] as const satisfies readonly FormFieldDefinition[];

export const PUBLIC_FORMS: readonly PublicFormDefinition[] = [
  {
    id: "hunarmand-beti-vocational",
    title: "Hunarmand Beti Vocational Admission",
    shortLabel: "Hunarmand Beti",
    description:
      "Admission for young women joining the Hunarmand Beti vocational centre — stitching, beautician training, mehndi and basic computing.",
    submitLabel: "Submit application",
    successMessage:
      "Application submitted successfully! We will review it within 3–5 working days.",
    note: "Please share a copy of your ID document with our team on WhatsApp or by email after submitting.",
    fields: [
      ...CORE_FIELDS,
      {
        name: "course",
        label: "Select course",
        type: "select",
        required: true,
        options: [
          "Stitching",
          "Beautician training",
          "Mehndi",
          "Basic computer",
        ],
      },
      {
        name: "age",
        label: "Age",
        type: "number",
        required: true,
        min: 14,
        max: 35,
        placeholder: "e.g. 18",
        maxLength: 3,
      },
      {
        name: "notes",
        label: "Anything else we should know? (optional)",
        type: "textarea",
        required: false,
        maxLength: 300,
        placeholder: "Tell us about your interests or availability",
      },
    ],
  },
  {
    id: "it-courses-vocational",
    title: "IT Courses & Vocational Training Registration",
    shortLabel: "IT & Vocational",
    description:
      "Registration for IT courses and vocational training at the SM Welfare Trust centre.",
    submitLabel: "Register now",
    successMessage:
      "Registration successful! You will receive the course details at your email.",
    fields: [
      ...CORE_FIELDS,
      {
        name: "courseType",
        label: "Course type",
        type: "select",
        required: true,
        options: ["IT Courses", "Vocational Training", "Computer Basics"],
      },
      {
        name: "experience",
        label: "Experience level (optional)",
        type: "select",
        required: false,
        options: ["Beginner", "Intermediate", "Advanced"],
      },
      {
        name: "notes",
        label: "Anything else we should know? (optional)",
        type: "textarea",
        required: false,
        maxLength: 300,
        placeholder: "Previous courses, certifications or questions",
      },
    ],
  },
  {
    id: "employee",
    title: "Employee Form",
    shortLabel: "Employee",
    description:
      "Registration for people who want to work with the SM Welfare Trust team in Karachi.",
    submitLabel: "Submit application",
    successMessage:
      "Employee application submitted! Our HR team will contact you soon.",
    fields: [
      ...CORE_FIELDS,
      {
        name: "department",
        label: "Department",
        type: "select",
        required: true,
        options: ["Administration", "Healthcare", "Education", "Finance"],
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        required: true,
        maxLength: 300,
        placeholder: "Enter your complete address",
      },
      {
        name: "fieldWork",
        label: "Available for field work",
        type: "select",
        required: false,
        options: ["Yes", "No"],
      },
    ],
  },
  {
    id: "free-education",
    title: "Sirat e Mustaqeem Free Education System",
    shortLabel: "Free Education",
    description:
      "Admission to the free schooling system — fees, books, uniforms and stationery are covered.",
    submitLabel: "Apply for free education",
    successMessage:
      "Application for free education submitted! We will contact you regarding eligibility.",
    note: "School records and report cards can be shared with our team after your application is reviewed.",
    fields: [
      ...CORE_FIELDS,
      {
        name: "educationLevel",
        label: "Educational level",
        type: "select",
        required: true,
        options: ["Primary", "Secondary", "Higher Secondary", "University"],
      },
      {
        name: "lastSchool",
        label: "Last school attended (optional)",
        type: "text",
        required: false,
        maxLength: 120,
        placeholder: "Name of previous school",
      },
      {
        name: "notes",
        label: "Anything else we should know? (optional)",
        type: "textarea",
        required: false,
        maxLength: 300,
        placeholder: "Tell us about the child's current situation",
      },
    ],
  },
  {
    id: "quran-academy",
    title: "Sirat ul Quran Academy Admission",
    shortLabel: "Quran Academy",
    description:
      "Admission to the Sirat ul Quran Academy — Quran memorisation, Islamic studies and Arabic language.",
    submitLabel: "Submit application",
    successMessage:
      "Academy application submitted! We will contact you to schedule an interview.",
    fields: [
      ...CORE_FIELDS,
      {
        name: "course",
        label: "Course",
        type: "select",
        required: true,
        options: ["Quran Memorization", "Islamic Studies", "Arabic Language"],
      },
      {
        name: "age",
        label: "Age",
        type: "number",
        required: true,
        min: 5,
        max: 70,
        placeholder: "e.g. 15",
        maxLength: 3,
      },
      {
        name: "motivation",
        label: "Motivation statement",
        type: "textarea",
        required: true,
        minLength: 50,
        maxLength: 1000,
        placeholder: "Why do you want to join Sirat ul Quran Academy?",
      },
    ],
  },
];

/** Looks up a form definition by id. */
export function getPublicForm(id: PublicFormType): PublicFormDefinition {
  const definition = PUBLIC_FORMS.find((form) => form.id === id);
  if (!definition) {
    throw new Error(`Unknown form type: ${id}`);
  }
  return definition;
}
