/**
 * Slug helpers shared by the content services (programs and projects).
 *
 * The admin never types a slug: it is always derived from the title, so URLs
 * stay URL-safe without the editor having to think about them. Slugs are
 * generated once, at creation time, and never change afterwards - a stable
 * slug keeps public filter links (`?program=<slug>`) and page anchors working
 * when a title is later reworded.
 *
 * Everything here is pure/parameterised so the program and project services
 * keep their own length limits from constants/{program,project}.ts.
 */

/** Fallback used when a title has no ASCII alphanumerics (e.g. Urdu script). */
export const FALLBACK_SLUG = 'item';

/**
 * Generates a URL-safe slug from a title:
 *   "Education Program"           -> "education-program"
 *   "Food & Community Support"    -> "food-community-support"
 *   "Tree for Tomorrow (2019!)"   -> "tree-for-tomorrow-2019"
 *
 * Non-alphanumeric runs collapse into single hyphens and surrounding hyphens
 * are trimmed, so the result always matches the model's slug pattern. The
 * result can be an empty string (a title with no ASCII letters at all) - the
 * callers handle that via FALLBACK_SLUG.
 */
export function slugifyTitle(title: string, maxLength: number): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
}

/**
 * Derives a slug from a title and appends `-2`, `-3`, ... until `isTaken`
 * reports the slug is free. Two items with the same title therefore both save
 * successfully instead of the second one failing on a duplicate-key error the
 * admin would have no way to fix (the slug field is not part of the UI).
 *
 * The search is bounded: after 100 collisions the caller surfaces an error
 * rather than looping forever.
 */
export async function generateUniqueSlug(
  title: string,
  isTaken: (slug: string) => Promise<boolean>,
  maxLength: number,
): Promise<string> {
  const base = slugifyTitle(title, maxLength) || FALLBACK_SLUG;
  let candidate = base;
  let suffix = 2;

  while (await isTaken(candidate)) {
    const suffixText = `-${suffix}`;
    candidate = `${base.slice(0, maxLength - suffixText.length)}${suffixText}`;
    suffix += 1;
    if (suffix > 100) {
      throw new Error('Could not generate a unique slug.');
    }
  }

  return candidate;
}
