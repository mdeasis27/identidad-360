const COPY: Record<string, { en: string; es: string }> = {
  "batch.1": { en: "profiles 1 to 5 assembled", es: "perfiles 1 a 5 armados" },
  "batch.2": { en: "profiles 6 to 10 assembled", es: "perfiles 6 a 10 armados" },
  "batch.3": { en: "profiles 11 to 15 assembled", es: "perfiles 11 a 15 armados" },
  "batch.4": { en: "profiles 16 to 20 assembled", es: "perfiles 16 a 20 armados" },
};
export function traceCopy(locale: "en" | "es", key: string) { return COPY[key]?.[locale] ?? key; }
