"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  HiArrowTopRightOnSquare,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiShieldCheck,
} from "react-icons/hi2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Certificate gallery.
 *
 * A portrait card grid of the trust's registrations; clicking a card opens the
 * certificate full-size in a lightbox with previous/next navigation (arrow keys
 * included) and a link to the original file. Client-side only because it owns
 * the lightbox state — the certificate data is fetched by the server page.
 */

export interface CertificateItem {
  id: string;
  title: string;
  description: string;
  src: string;
  width: number;
  height: number;
}

export function CertificateGallery({
  certificates,
}: {
  certificates: readonly CertificateItem[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : certificates[activeIndex];
  const count = certificates.length;

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrevious = useCallback(() => {
    setActiveIndex((index) => (index === null ? index : (index - 1 + count) % count));
  }, [count]);
  const showNext = useCallback(() => {
    setActiveIndex((index) => (index === null ? index : (index + 1) % count));
  }, [count]);

  // Arrow-key navigation while the lightbox is open.
  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") showPrevious();
      else if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, showPrevious, showNext]);

  if (count === 0) return null;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {certificates.map((certificate, index) => (
          <button
            key={certificate.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`View ${certificate.title}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white text-left shadow-sm transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-section">
              <Image
                src={certificate.src}
                alt={certificate.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              {/* Readability scrim + call to action, revealed on hover/focus. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center gap-1.5 pb-4 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <HiEye className="size-4" aria-hidden="true" />
                View certificate
              </span>
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm">
                <HiShieldCheck className="size-3.5" aria-hidden="true" />
                Verified
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 border-t border-border p-4">
              <h3 className="font-heading text-sm font-bold tracking-tight">
                {certificate.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {certificate.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent
          className="overflow-hidden p-0 sm:max-w-3xl"
          showCloseButton
        >
          {active ? (
            <>
              <div className="relative flex items-center justify-center bg-section px-4 py-8 sm:px-14">
                <Image
                  key={active.id}
                  src={active.src}
                  alt={active.title}
                  width={active.width}
                  height={active.height}
                  sizes="(max-width: 640px) 100vw, 768px"
                  className="h-auto max-h-[62vh] w-auto max-w-full rounded-lg object-contain shadow-lg ring-1 ring-foreground/10"
                />

                {count > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={showPrevious}
                      aria-label="Previous certificate"
                      className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-4"
                    >
                      <HiChevronLeft className="size-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="Next certificate"
                      className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-4"
                    >
                      <HiChevronRight className="size-5" aria-hidden="true" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-col gap-1.5 pr-8">
                  <DialogTitle className="font-heading text-lg font-bold tracking-tight">
                    {active.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    {active.description}
                  </DialogDescription>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {certificates.indexOf(active) + 1} / {count}
                  </span>
                  <a
                    href={active.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Open full size
                    <HiArrowTopRightOnSquare className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
