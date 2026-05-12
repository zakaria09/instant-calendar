const ORG_KEY = 'ic_organization';

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: string | null;
  createdAt: string;
};

export const orgStorage = {
  get(): Organization | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(ORG_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(org: Organization): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(ORG_KEY, JSON.stringify(org));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(ORG_KEY);
  },
};