export type DietGoal = "weight-loss" | "high-protein" | "balanced";

export interface LocalCartItem {
  cartItemId: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  category?: string | null;
  aisle?: number | null;
  tags?: string[];
  comboPairs?: string[];
  swapSaved?: number;
}

export interface SessionPrefs {
  name: string;
  budget: number;
  diet: DietGoal;
  session: string;
}

const CART_KEY = "sc_cart";
const BUDGET_KEY = "sc_budget";
const DIET_KEY = "sc_diet";
const NAME_KEY = "sc_name";
const SESSION_KEY = "sc_session";
const INSIGHTS_SAVED_KEY = "sc_total_saved";
const INSIGHTS_CATEGORY_KEY = "sc_category_spend";
const INSIGHTS_HEALTH_KEY = "sc_health_compliance";
const INSIGHTS_NEXT_TRIP_KEY = "sc_next_trip_estimate";

export function loadCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: LocalCartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export function loadSessionPrefs(): Partial<SessionPrefs> {
  if (typeof window === "undefined") return {};
  try {
    const budget = localStorage.getItem(BUDGET_KEY);
    const diet = localStorage.getItem(DIET_KEY) as DietGoal | null;
    const name = localStorage.getItem(NAME_KEY);
    const session = localStorage.getItem(SESSION_KEY);
    return {
      budget: budget ? Number(budget) : undefined,
      diet: diet || undefined,
      name: name || undefined,
      session: session || undefined,
    };
  } catch {
    return {};
  }
}

export function saveSessionPrefs(prefs: SessionPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUDGET_KEY, String(prefs.budget));
  localStorage.setItem(DIET_KEY, prefs.diet);
  localStorage.setItem(NAME_KEY, prefs.name);
  localStorage.setItem(SESSION_KEY, prefs.session);
}

export function clearAppStorage(): void {
  if (typeof window === "undefined") return;
  const keys = [
    CART_KEY,
    BUDGET_KEY,
    DIET_KEY,
    NAME_KEY,
    SESSION_KEY,
    INSIGHTS_SAVED_KEY,
    INSIGHTS_CATEGORY_KEY,
    INSIGHTS_HEALTH_KEY,
    INSIGHTS_NEXT_TRIP_KEY,
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

export function saveInsightsSnapshot(payload: {
  totalSaved: number;
  categorySpend: Record<string, number>;
  healthCompliance: number;
  nextTripEstimate: number;
}): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INSIGHTS_SAVED_KEY, String(payload.totalSaved));
  localStorage.setItem(
    INSIGHTS_CATEGORY_KEY,
    JSON.stringify(payload.categorySpend)
  );
  localStorage.setItem(INSIGHTS_HEALTH_KEY, String(payload.healthCompliance));
  localStorage.setItem(
    INSIGHTS_NEXT_TRIP_KEY,
    String(payload.nextTripEstimate)
  );
}

export function loadInsightsSnapshot(): {
  totalSaved: number;
  categorySpend: Record<string, number>;
  healthCompliance: number;
  nextTripEstimate: number;
} {
  if (typeof window === "undefined") {
    return {
      totalSaved: 0,
      categorySpend: {},
      healthCompliance: 0,
      nextTripEstimate: 0,
    };
  }
  try {
    const totalSaved = Number(localStorage.getItem(INSIGHTS_SAVED_KEY) || 0);
    const catRaw = localStorage.getItem(INSIGHTS_CATEGORY_KEY);
    const categorySpend = catRaw
      ? (JSON.parse(catRaw) as Record<string, number>)
      : {};
    const healthCompliance = Number(
      localStorage.getItem(INSIGHTS_HEALTH_KEY) || 0
    );
    const nextTripEstimate = Number(
      localStorage.getItem(INSIGHTS_NEXT_TRIP_KEY) || 0
    );
    return {
      totalSaved,
      categorySpend,
      healthCompliance,
      nextTripEstimate,
    };
  } catch {
    return {
      totalSaved: 0,
      categorySpend: {},
      healthCompliance: 0,
      nextTripEstimate: 0,
    };
  }
}

export function cartSubtotal(items: LocalCartItem[]): number {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

export interface ProductLike {
  barcode: string;
  name: string;
  price: number;
  category?: string | null;
  aisle?: number | null;
  tags?: string[] | null;
  comboPairs?: string[] | null;
}

export function mergeCartLine(
  prev: LocalCartItem[],
  cartItemId: string,
  product: ProductLike
): LocalCartItem[] {
  const idToUse = cartItemId || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const idx = prev.findIndex((p) => p.barcode === product.barcode);
  if (idx === -1) {
    return [
      ...prev,
      {
        cartItemId: idToUse,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
        aisle: product.aisle ?? undefined,
        tags: product.tags ?? undefined,
        comboPairs: product.comboPairs ?? undefined,
      },
    ];
  }
  const copy = [...prev];
  const cur = copy[idx];
  if (!cur) return prev;
  copy[idx] = {
    ...cur,
    quantity: cur.quantity + 1,
    cartItemId: idToUse,
    price: product.price,
    category: product.category ?? cur.category,
    aisle: product.aisle ?? cur.aisle,
    tags: product.tags ?? cur.tags,
    comboPairs: product.comboPairs ?? cur.comboPairs,
  };
  return copy;
}

export function categorySpendMap(
  items: LocalCartItem[]
): Record<string, number> {
  const m: Record<string, number> = {};
  for (const it of items) {
    const c = it.category || "Other";
    m[c] = (m[c] ?? 0) + it.price * it.quantity;
  }
  return m;
}

export function computeHealthCompliance(
  items: LocalCartItem[],
  diet: DietGoal | string
): number {
  if (items.length === 0) return 0;
  let ok = 0;
  for (const it of items) {
    const t = it.tags ?? [];
    const junk = t.includes("junk") || t.includes("high-sugar");
    if (diet === "weight-loss") {
      if (!junk) ok++;
    } else if (diet === "high-protein") {
      if (t.includes("protein") || t.includes("healthy")) ok++;
    } else {
      if (!junk || t.includes("healthy") || it.category === "Produce") ok++;
    }
  }
  return Math.round((ok / items.length) * 100);
}
