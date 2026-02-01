import { translations } from "../i18n/translations";

export type Language = "en" | "id";
export type Breadcrumb = { label: string; href?: string };

export function createUIStore() {
  let language = $state<Language>(
    (typeof window !== "undefined"
      ? (localStorage.getItem("language") as Language)
      : "en") || "en",
  );

  let breadcrumbs = $state<Breadcrumb[]>([]);

  // Simple dots notation resolver: t('sidebar.dashboard')
  function t(path: string): string {
    const keys = path.split(".");
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return path; // Fallback to key if not found
      }
    }

    return typeof current === "string" ? current : path;
  }

  return {
    get language() {
      return language;
    },

    get breadcrumbs() {
      return breadcrumbs;
    },

    get t() {
      return t;
    },

    setLanguage(newLang: Language) {
      language = newLang;
      if (typeof window !== "undefined") {
        localStorage.setItem("language", newLang);
      }
    },

    setBreadcrumbs(newBreadcrumbs: Breadcrumb[]) {
      breadcrumbs = newBreadcrumbs;
    },
  };
}

export const uiStore = createUIStore();
