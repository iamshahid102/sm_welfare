"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContentImageField } from "@/components/admin/content-image-field";
import { CONTENT_ICONS } from "@/lib/content-icons";
import { CONTENT_ICON_KEYS, type ContentIconKey } from "@/types/content";
import {
  HiArrowDown,
  HiArrowUp,
  HiPlus,
  HiTrash,
} from "react-icons/hi2";
import type {
  ContentCta,
  ContentFieldsInput,
  ContentHighlight,
  ContentFact,
  ContentImage,
  ContentSection,
} from "@/types/content";

/**
 * The rich content editor shared by the Program and Project modals.
 *
 * It mirrors the public detail page exactly: the hero tagline, the cover photo,
 * the gallery, the narrative sections (with an optional photo), the highlight
 * cards, the quick facts and the closing call to action. Every field the public
 * page renders is editable here and nowhere else.
 */

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

function SectionCard({
  title,
  description,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: {
  title: string;
  description?: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onMoveUp ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Move up"
              onClick={onMoveUp}
            >
              <HiArrowUp className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
          {onMoveDown ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Move down"
              onClick={onMoveDown}
            >
              <HiArrowDown className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove"
            onClick={onRemove}
          >
            <HiTrash className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

function IconSelect({
  value,
  onChange,
  label,
}: {
  value: string | undefined;
  onChange: (value: ContentIconKey) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      <select
        className={SELECT_CLASS}
        value={value ?? "sparkles"}
        onChange={(event) => onChange(event.target.value as ContentIconKey)}
      >
        {CONTENT_ICON_KEYS.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function ContentEditor({
  value,
  onChange,
  disabled,
}: {
  value: ContentFieldsInput;
  onChange: (next: ContentFieldsInput) => void;
  disabled?: boolean;
}) {
  const sections = value.sections ?? [];
  const highlights = value.highlights ?? [];
  const facts = value.facts ?? [];
  const gallery = value.gallery ?? [];
  const cta: ContentCta = value.cta ?? {};

  const patch = (next: Partial<ContentFieldsInput>) =>
    onChange({ ...value, ...next });

  // ── Sections ──
  const updateSection = (index: number, next: ContentSection) =>
    patch({ sections: sections.map((s, i) => (i === index ? next : s)) });

  // ── Highlights ──
  const updateHighlight = (index: number, next: ContentHighlight) =>
    patch({ highlights: highlights.map((h, i) => (i === index ? next : h)) });

  // ── Facts ──
  const updateFact = (index: number, next: ContentFact) =>
    patch({ facts: facts.map((f, i) => (i === index ? next : f)) });

  return (
    <div className="flex flex-col gap-8">
      {/* ── Hero ── */}
      <fieldset disabled={disabled} className="flex flex-col gap-4">
        <legend className="mb-1 text-sm font-semibold text-foreground">
          Hero
        </legend>
        <div className="grid gap-2">
          <Label htmlFor="contentTagline">Tagline (hero subtitle)</Label>
          <Input
            id="contentTagline"
            value={value.tagline ?? ""}
            placeholder="A Step Towards Self-Reliance!"
            onChange={(event) => patch({ tagline: event.target.value })}
          />
        </div>
        <ContentImageField
          label="Cover image"
          hint="The photo shown at the top of the public page."
          value={value.coverImage ?? null}
          disabled={disabled}
          onChange={(image) => patch({ coverImage: image })}
        />
      </fieldset>

      {/* ── Sections ── */}
      <fieldset disabled={disabled} className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Content sections</p>
            <p className="text-xs text-muted-foreground">
              The story blocks on the public page — heading, text and an
              optional photo.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={sections.length >= 12}
            onClick={() =>
              patch({ sections: [...sections, { kicker: "", title: "", body: "" }] })
            }
          >
            <HiPlus className="mr-1.5 size-4" aria-hidden="true" />
            Add section
          </Button>
        </div>

        {sections.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            No sections yet. Add one to describe this page.
          </p>
        ) : (
          sections.map((section, index) => (
            <SectionCard
              key={index}
              title={`Section ${index + 1}`}
              onRemove={() =>
                patch({ sections: sections.filter((_, i) => i !== index) })
              }
              onMoveUp={
                index > 0
                  ? () => patch({ sections: move(sections, index, index - 1) })
                  : undefined
              }
              onMoveDown={
                index < sections.length - 1
                  ? () => patch({ sections: move(sections, index, index + 1) })
                  : undefined
              }
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Kicker (small label)</Label>
                  <Input
                    value={section.kicker ?? ""}
                    placeholder="The challenge"
                    onChange={(event) =>
                      updateSection(index, { ...section, kicker: event.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Heading</Label>
                  <Input
                    value={section.title ?? ""}
                    placeholder="Section heading"
                    onChange={(event) =>
                      updateSection(index, { ...section, title: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Body text</Label>
                <Textarea
                  rows={4}
                  value={section.body ?? ""}
                  onChange={(event) =>
                    updateSection(index, { ...section, body: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5 sm:max-w-xs">
                <Label className="text-xs">Photo position</Label>
                <select
                  className={SELECT_CLASS}
                  value={section.imageSide ?? "right"}
                  onChange={(event) =>
                    updateSection(index, {
                      ...section,
                      imageSide: event.target.value as "left" | "right",
                    })
                  }
                >
                  <option value="right">Right of the text</option>
                  <option value="left">Left of the text</option>
                </select>
              </div>
              <ContentImageField
                compact
                label="Section photo (optional)"
                value={section.image ?? null}
                onChange={(image) => {
                  const next: ContentSection = { ...section };
                  if (image) next.image = image as ContentImage;
                  else delete next.image;
                  updateSection(index, next);
                }}
              />
            </SectionCard>
          ))
        )}
      </fieldset>

      {/* ── Highlights ── */}
      <fieldset disabled={disabled} className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Highlight cards</p>
            <p className="text-xs text-muted-foreground">
              The feature cards (courses, services, benefits) with an icon.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={highlights.length >= 12}
            onClick={() =>
              patch({
                highlights: [
                  ...highlights,
                  { icon: "sparkles", title: "", description: "" },
                ],
              })
            }
          >
            <HiPlus className="mr-1.5 size-4" aria-hidden="true" />
            Add card
          </Button>
        </div>

        {highlights.map((highlight, index) => {
          const Icon = CONTENT_ICONS[(highlight.icon as ContentIconKey) ?? "sparkles"];
          return (
            <SectionCard
              key={index}
              title={`Card ${index + 1}`}
              onRemove={() =>
                patch({ highlights: highlights.filter((_, i) => i !== index) })
              }
              onMoveUp={
                index > 0
                  ? () => patch({ highlights: move(highlights, index, index - 1) })
                  : undefined
              }
              onMoveDown={
                index < highlights.length - 1
                  ? () => patch({ highlights: move(highlights, index, index + 1) })
                  : undefined
              }
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="grid flex-1 gap-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={highlight.title}
                    onChange={(event) =>
                      updateHighlight(index, { ...highlight, title: event.target.value })
                    }
                  />
                </div>
                <IconSelect
                  label="Icon"
                  value={highlight.icon}
                  onChange={(icon) => updateHighlight(index, { ...highlight, icon })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={2}
                  value={highlight.description}
                  onChange={(event) =>
                    updateHighlight(index, {
                      ...highlight,
                      description: event.target.value,
                    })
                  }
                />
              </div>
            </SectionCard>
          );
        })}
      </fieldset>

      {/* ── Facts ── */}
      <fieldset disabled={disabled} className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Quick facts</p>
            <p className="text-xs text-muted-foreground">
              Detail rows such as Location, Timing or Address.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={facts.length >= 8}
            onClick={() =>
              patch({ facts: [...facts, { icon: "map-pin", label: "", value: "" }] })
            }
          >
            <HiPlus className="mr-1.5 size-4" aria-hidden="true" />
            Add fact
          </Button>
        </div>

        {facts.map((fact, index) => (
          <SectionCard
            key={index}
            title={`Fact ${index + 1}`}
            onRemove={() => patch({ facts: facts.filter((_, i) => i !== index) })}
            onMoveUp={
              index > 0 ? () => patch({ facts: move(facts, index, index - 1) }) : undefined
            }
            onMoveDown={
              index < facts.length - 1
                ? () => patch({ facts: move(facts, index, index + 1) })
                : undefined
            }
          >
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <div className="grid gap-1.5">
                <Label className="text-xs">Label</Label>
                <Input
                  value={fact.label}
                  placeholder="Location"
                  onChange={(event) =>
                    updateFact(index, { ...fact, label: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Value</Label>
                <Input
                  value={fact.value}
                  placeholder="Orangi Town, Karachi"
                  onChange={(event) =>
                    updateFact(index, { ...fact, value: event.target.value })
                  }
                />
              </div>
              <IconSelect
                label="Icon"
                value={fact.icon}
                onChange={(icon) => updateFact(index, { ...fact, icon })}
              />
            </div>
          </SectionCard>
        ))}
      </fieldset>

      {/* ── Gallery ── */}
      <fieldset disabled={disabled} className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Gallery</p>
            <p className="text-xs text-muted-foreground">
              Extra photos shown beneath the sections.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={gallery.length >= 12}
            onClick={() => patch({ gallery: [...gallery, { url: "", alt: "" }] })}
          >
            <HiPlus className="mr-1.5 size-4" aria-hidden="true" />
            Add photo
          </Button>
        </div>
        {gallery.map((image, index) => (
          <SectionCard
            key={index}
            title={`Photo ${index + 1}`}
            onRemove={() => patch({ gallery: gallery.filter((_, i) => i !== index) })}
            onMoveUp={
              index > 0
                ? () => patch({ gallery: move(gallery, index, index - 1) })
                : undefined
            }
            onMoveDown={
              index < gallery.length - 1
                ? () => patch({ gallery: move(gallery, index, index + 1) })
                : undefined
            }
          >
            <ContentImageField
              compact
              label="Photo"
              value={image.url ? image : null}
              onChange={(next) => {
                const list = [...gallery];
                if (next) list[index] = next;
                else list.splice(index, 1);
                patch({ gallery: list });
              }}
            />
          </SectionCard>
        ))}
      </fieldset>

      {/* ── Call to action ── */}
      <fieldset disabled={disabled} className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold">Closing call to action</p>
          <p className="text-xs text-muted-foreground">
            The final band with a button at the bottom of the page.
          </p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Heading</Label>
          <Input
            value={cta.title ?? ""}
            onChange={(event) => patch({ cta: { ...cta, title: event.target.value } })}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Body</Label>
          <Textarea
            rows={2}
            value={cta.body ?? ""}
            onChange={(event) => patch({ cta: { ...cta, body: event.target.value } })}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">Button label</Label>
            <Input
              value={cta.buttonLabel ?? ""}
              placeholder="Donate now"
              onChange={(event) =>
                patch({ cta: { ...cta, buttonLabel: event.target.value } })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Button link</Label>
            <Input
              value={cta.buttonHref ?? ""}
              placeholder="/donate"
              onChange={(event) =>
                patch({ cta: { ...cta, buttonHref: event.target.value } })
              }
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
