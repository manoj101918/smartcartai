import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        realtime: {
          params: { eventsPerSecond: 10 },
        },
      })
    : null;

export interface ProductRow {
  barcode: string;
  name: string;
  brand: string | null;
  price: number;
  price_benchmark: number | null;
  category: string | null;
  aisle: number | null;
  calories: number | null;
  protein_g: number | null;
  fat_g: number | null;
  sugar_g: number | null;
  tags: string[] | null;
  combo_pairs: string[] | null;
}

export async function getProduct(barcode: string): Promise<ProductRow> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .single();
  if (error) throw error;
  return data as ProductRow;
}

export async function findProductByNameLike(
  fragment: string
): Promise<ProductRow | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  const full = fragment.trim();
  if (!full) return null;
  const { data: exact, error: exErr } = await supabase
    .from("products")
    .select("*")
    .ilike("name", full)
    .limit(1)
    .maybeSingle();
  if (exErr) throw exErr;
  if (exact) return exact as ProductRow;
  const q = full.split(/\s+/)[0] ?? full;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${q}%`)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as ProductRow | null) ?? null;
}

export async function insertCartItem(
  sessionId: string,
  barcode: string
): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  const { data, error } = await supabase
    .from("cart_items")
    .insert({ session_id: sessionId, barcode, quantity: 1 })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export interface AISuggestionRow {
  id: string;
  cart_item_id: string;
  warning: string | null;
  swap_name: string | null;
  swap_price: number | null;
  swap_reason: string | null;
  swap_aisle: number | null;
  combo_offer: string | null;
  deal_alert: string | null;
  reminder: string | null;
  created_at?: string;
}

export function subscribeToSuggestions(
  sessionId: string,
  onSuggestion: (row: AISuggestionRow) => void
): () => void {
  if (!supabase) {
    return () => undefined;
  }

  const channel: RealtimeChannel = supabase
    .channel(`ai-suggestions:${sessionId}`, {
      config: { broadcast: { self: true } },
    })
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "ai_suggestions" },
      async (payload) => {
        const row = payload.new as AISuggestionRow;
        const cid = row.cart_item_id;
        if (!cid) return;
        const { data } = await supabase
          .from("cart_items")
          .select("session_id")
          .eq("id", cid)
          .maybeSingle();
        if (data?.session_id !== sessionId) return;
        onSuggestion(row);
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        setTimeout(() => {
          try {
            channel.subscribe();
          } catch {
            /* channel may already be torn down */
          }
        }, 2000);
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
