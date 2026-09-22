import { api } from "@/lib/api/client";
import type { SiteSettings, SiteSettingsContact, SiteSettingsSocialLinks, SiteSettingsFooter } from "@/types/api";

export type { SiteSettings, SiteSettingsContact, SiteSettingsSocialLinks, SiteSettingsFooter } from "@/types/api";

export interface CreateSiteSettingsInput {
  organizationName: string;
  tagline?: string;
  description?: string;
  contact?: SiteSettingsContact;
  socialLinks?: SiteSettingsSocialLinks;
  footer?: SiteSettingsFooter;
}

export interface UpdateSiteSettingsInput {
  organizationName?: string;
  tagline?: string;
  description?: string;
  contact?: SiteSettingsContact;
  socialLinks?: SiteSettingsSocialLinks;
  footer?: SiteSettingsFooter;
}

// ─── Get current settings ────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await api.get<{ settings: SiteSettings }>("/site-settings");
  return data.settings;
}

// ─── Initialize settings (SUPER_ADMIN only) ─────────────────────────────

export async function initializeSiteSettings(input: CreateSiteSettingsInput): Promise<SiteSettings> {
  const data = await api.post<{ settings: SiteSettings }>("/site-settings", input);
  return data.settings;
}

// ─── Update settings (SUPER_ADMIN only) ─────────────────────────────────

export async function updateSiteSettings(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
  const data = await api.patch<{ settings: SiteSettings }>("/site-settings", input);
  return data.settings;
}
