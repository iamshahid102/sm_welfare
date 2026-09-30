import type { SiteImage } from "@/data/site-images";

/**
 * Site certificates & registrations.
 *
 * PROVENANCE
 * Every certificate is BYTE-IDENTICAL to the one the live /about-us/ page
 * publishes in its "Certificates" block (smwelfare.charity), downloaded into
 * `public/images/certificates` and re-uploaded to Cloudinary by
 * `server/src/scripts/seedCertificates.ts`. The live block order is preserved:
 * FBR, the trust certificate, NTN, then the further recognition certificate.
 *
 * WHY THIS FILE EXISTS
 * The public API now exposes these as Media records in the certificates folder
 * (see `listPublicMedia({ folder: CERTIFICATES_FOLDER })`). This curated copy
 * keeps the section populated — and number-labelled — with the same real
 * certificates when the API is unreachable (e.g. a build without the server),
 * exactly like the curated project imagery in `site-images.ts`. API data always
 * wins where it exists.
 */

/** Cloudinary folder the certificate assets are stored in (seeded by the server). */
export const CERTIFICATES_FOLDER = "sm-welfare/certificates";

export interface Certificate {
  slug: string;
  /**
   * Local file in `public/images/certificates`. Also the `originalFilename`
   * stored on the matching Media record by the server seed, so the API result
   * can be re-ordered to the live-page order (the media list is newest-first).
   */
  file: string;
  title: string;
  description: string;
  image: SiteImage;
}

/**
 * The four certificates from the live page, in live-page order. Titles are the
 * live media titles expanded into readable form; descriptions state only what
 * the certificate itself shows.
 */
export const CERTIFICATES: readonly Certificate[] = [
  {
    slug: "fbr-registration",
    file: "fbr-registration.png",
    title: "FBR Registration",
    description:
      "Sirat-e-Mustaqeem Welfare Trust is registered with the Federal Board of Revenue (FBR), Government of Pakistan.",
    image: {
      src: "/images/certificates/fbr-registration.png",
      alt: "FBR registration certificate of Sirat-e-Mustaqeem Welfare Trust",
      width: 625,
      height: 938,
    },
  },
  {
    slug: "sm-trust-certificate",
    file: "sm-trust-certificate.png",
    title: "Trust Registration Certificate",
    description:
      "Official registration certificate of Sirat-e-Mustaqeem Welfare Trust.",
    image: {
      src: "/images/certificates/sm-trust-certificate.png",
      alt: "Registration certificate of Sirat-e-Mustaqeem Welfare Trust",
      width: 625,
      height: 938,
    },
  },
  {
    slug: "ntn-certificate",
    file: "ntn-certificate.png",
    title: "National Tax Number (NTN)",
    description:
      "National Tax Number certificate issued to the trust by the Federal Board of Revenue.",
    image: {
      src: "/images/certificates/ntn-certificate.png",
      alt: "National Tax Number (NTN) certificate of Sirat-e-Mustaqeem Welfare Trust",
      width: 625,
      height: 938,
    },
  },
  {
    slug: "recognition-certificate-2026",
    file: "recognition-certificate-2026.jpg",
    title: "Recognition Certificate",
    description:
      "A further recognition certificate published on the trust's About Us page.",
    image: {
      src: "/images/certificates/recognition-certificate-2026.jpg",
      alt: "Recognition certificate of Sirat-e-Mustaqeem Welfare Trust",
      width: 936,
      height: 1240,
    },
  },
];
