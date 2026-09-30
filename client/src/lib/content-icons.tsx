import type { ElementType } from "react";
import {
  HiAcademicCap,
  HiBanknotes,
  HiBeaker,
  HiBookOpen,
  HiBriefcase,
  HiBuildingLibrary,
  HiBuildingOffice2,
  HiClock,
  HiFire,
  HiGift,
  HiGlobeAlt,
  HiHandRaised,
  HiHeart,
  HiHome,
  HiMapPin,
  HiPaintBrush,
  HiPhone,
  HiPlusCircle,
  HiScissors,
  HiShieldCheck,
  HiSparkles,
  HiStar,
  HiSun,
  HiTruck,
  HiUserGroup,
} from "react-icons/hi2";
import { CONTENT_ICON_KEYS, type ContentIconKey } from "@/types/content";

/**
 * The one place that maps a stored icon key to a concrete icon component.
 * Shared by the admin editor (so the picker shows the real glyph) and the
 * public renderer (so a card renders exactly what the editor chose).
 */
export const CONTENT_ICONS: Record<ContentIconKey, ElementType> = {
  heart: HiHeart,
  "hand-heart": HiHandRaised,
  "map-pin": HiMapPin,
  clock: HiClock,
  phone: HiPhone,
  "academic-cap": HiAcademicCap,
  "book-open": HiBookOpen,
  briefcase: HiBriefcase,
  sparkles: HiSparkles,
  scissors: HiScissors,
  "paint-brush": HiPaintBrush,
  home: HiHome,
  sun: HiSun,
  snowflake: HiSparkles,
  truck: HiTruck,
  shield: HiShieldCheck,
  users: HiUserGroup,
  star: HiStar,
  gift: HiGift,
  tree: HiGlobeAlt,
  stethoscope: HiHeart,
  ambulance: HiTruck,
  mosque: HiBuildingLibrary,
  utensils: HiFire,
  graduation: HiAcademicCap,
  water: HiBeaker,
  leaf: HiGlobeAlt,
  building: HiBuildingOffice2,
  currency: HiBanknotes,
  medical: HiPlusCircle,
};

export { CONTENT_ICON_KEYS };
export type { ContentIconKey };
