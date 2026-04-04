"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AICard } from "@/components/AICard";
import { BudgetBar } from "@/components/BudgetBar";
import { CartItem } from "@/components/CartItem";
import { DemoChips } from "@/components/DemoChips";
import { RemindersPanel, type ReminderItem } from "@/components/RemindersPanel";
import { StoreNav, type NavLine } from "@/components/StoreNav";
import { ScannerView } from "@/components/ScannerView";
import { QRDisplay } from "@/components/QRDisplay";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  cartSubtotal,
  loadCart,
  loadSessionPrefs,
  mergeCartLine,
  saveCart,
  type LocalCartItem,
} from "@/lib/cart";
import {
  type AISuggestionRow,
  findProductByNameLike,
  getProduct,
  insertCartItem,
  subscribeToSuggestions,
  supabase,
} from "@/lib/supabase";

interface ScanApiResponse {
  id: string | null;
  cart_item_id: string;
  warning: string | null;
  swap: {
    name: string;
    price: number;
    reason: string;
    aisle: number;
  } | null;
  combo_offer: string | null;
  deal_alert: string | null;
  reminder: string | null;
  product: {
    barcode: string;
    name: string;
    brand: string | null;
    price: number;
    category: string | null;
    aisle: number | null;
  };
}

function toSuggestionRow(res: ScanApiResponse): AISuggestionRow {
  const sw = res.swap;
  return {
    id: res.id ?? crypto.randomUUID(),
    cart_item_id: res.cart_item_id,
    warning: res.warning,
    swap_name: sw?.name ?? null,
    swap_price: sw?.price ?? null,
    swap_reason: sw?.reason ?? null,
    swap_aisle: sw?.aisle ?? null,
    combo_offer: res.combo_offer,
    deal_alert: res.deal_alert,
    reminder: res.reminder,
  };
}

interface SuggestionEntry {
  row: AISuggestionRow;
  productName: string;
}

export default function ScannerPage() {
  const router = useRouter();
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [manual, setManual] = useState("");
  const [quaggaReady, setQuaggaReady] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const lastScanned = useRef<{ code: string; time: number }>({
    code: "",
    time: 0,
  });
  const seenSuggestionIds = useRef<Set<string>>(new Set());

  const processScan = useRef<(barcode: string) => Promise<void>>(
    async () => undefined
  );

  processScan.current = async (rawCode: string) => {
    const barcode = rawCode.trim();
    if (!barcode) {
      toast.error("Enter or scan a barcode.");
      return;
    }
    const prefs = loadSessionPrefs();
    if (!prefs.session) {
      toast.error("Session missing — complete onboarding first.");
      router.push("/setup");
      return;
    }
    const budget = prefs.budget ?? 500;
    const diet = prefs.diet ?? "balanced";

    try {
      if (!supabase) {
        toast.error("Supabase is not configured.");
        return;
      }

      const productRow = await getProduct(barcode);
      const cartItemId = await insertCartItem(prefs.session, barcode);

      const prev = loadCart();
      const nextCart = mergeCartLine(prev, cartItemId, {
        barcode: productRow.barcode,
        name: productRow.name,
        price: Number(productRow.price),
        category: productRow.category,
        aisle: productRow.aisle,
        tags: productRow.tags ?? undefined,
        comboPairs: productRow.combo_pairs ?? undefined,
      });
      saveCart(nextCart);
      setCart(nextCart);
      const spent = cartSubtotal(nextCart);

      const res = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          barcode,
          session_id: prefs.session,
          budget,
          diet_goal: diet,
          cart_total: spent,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || res.statusText);
      }

      const data = (await res.json()) as ScanApiResponse;
      const row = toSuggestionRow(data);
      if (row.id && !seenSuggestionIds.current.has(row.id)) {
        seenSuggestionIds.current.add(row.id);
        setSuggestions((s) => [
          { row, productName: productRow.name },
          ...s.filter((x) => x.row.id !== row.id),
        ]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Scan failed";
      toast.error(msg);
    }
  };

  const onBarcode = useCallback((code: string) => {
    const now = Date.now();
    if (code === lastScanned.current.code && now - lastScanned.current.time < 2500) {
      return;
    }
    lastScanned.current = { code, time: now };
    void processScan.current(code);
  }, []);

  useEffect(() => {
    setCart(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    const prefs = loadSessionPrefs();
    if (!prefs.session) {
      router.replace("/setup");
    }
  }, [router]);

  useEffect(() => {
    const prefs = loadSessionPrefs();
    if (!prefs.session || !supabase) return () => undefined;

    const unsub = subscribeToSuggestions(prefs.session, (row) => {
      if (!row.id || seenSuggestionIds.current.has(row.id)) return;
      seenSuggestionIds.current.add(row.id);
      const name =
        loadCart().find((c) => c.cartItemId === row.cart_item_id)?.name ??
        "This item";
      setSuggestions((prev) => {
        if (prev.some((p) => p.row.id === row.id)) return prev;
        return [{ row, productName: name }, ...prev];
      });
    });

    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function updateReminders() {
      if (cart.length === 0) {
        setReminders([]);
        return;
      }
      try {
        const inCartNames = new Set(cart.map((i) => i.name));
        const inCartBarcodes = new Set(cart.map((i) => i.barcode));
        const out: ReminderItem[] = [];
        const seenReminders = new Set<string>();
        for (const line of cart) {
          for (const pairName of line.comboPairs ?? []) {
            if (inCartNames.has(pairName)) continue;
            if (seenReminders.has(pairName)) continue;
            seenReminders.add(pairName);
            const p = await findProductByNameLike(pairName);
            if (!p || inCartBarcodes.has(p.barcode)) continue;
            out.push({
              id: `${line.cartItemId}-${p.barcode}`,
              title: `Don’t forget ${p.name} — pairs with ${line.name}`,
              barcode: p.barcode,
              price: Number(p.price),
            });
          }
        }
        if (!cancelled) setReminders(out);
      } catch (e) {
        // Silent fail for reminders
      }
    }
    void updateReminders();
    return () => {
      cancelled = true;
    };
  }, [cart]);

  const navItems: NavLine[] = useMemo(
    () =>
      cart.map((c) => ({
        name: c.name,
        aisle: c.aisle ?? 0,
      })),
    [cart]
  );

  const budget = mounted ? loadSessionPrefs().budget ?? 500 : 500;
  const subtotal = cartSubtotal(cart);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;
  const aiSavings = cart.reduce((s, i) => s + (i.swapSaved ?? 0), 0);

  const removeLine = (cartItemId: string) => {
    setCart((prev) => {
      const next = prev.filter((p) => p.cartItemId !== cartItemId);
      saveCart(next);
      return next;
    });
    setSuggestions((prev) =>
      prev.filter((p) => p.row.cart_item_id !== cartItemId)
    );
  };

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => prev.filter((p) => p.row.id !== id));
  }, []);

  const keepSuggestion = useCallback(
    (id: string) => {
      dismissSuggestion(id);
    },
    [dismissSuggestion]
  );

  const applySwap = async (row: AISuggestionRow) => {
    const name = row.swap_name;
    const price = Number(row.swap_price ?? 0);
    if (!name) return;
    try {
      let barcode = `swap-${row.id}`;
      let category: string | null = null;
      let aisle: number | null = row.swap_aisle;
      let tags: string[] | undefined;
      const match = await findProductByNameLike(name);
      if (match) {
        barcode = match.barcode;
        category = match.category;
        aisle = match.aisle;
        tags = match.tags ?? undefined;
      }
      setCart((prev) => {
        const next = prev.map((it) => {
          if (it.cartItemId !== row.cart_item_id) return it;
          const saved = Math.max(0, it.price - price);
          return {
            ...it,
            barcode,
            name,
            price,
            category: category ?? it.category,
            aisle: aisle ?? it.aisle,
            tags: tags ?? it.tags,
            comboPairs: match?.combo_pairs ?? it.comboPairs,
            swapSaved: (it.swapSaved ?? 0) + saved,
          };
        });
        saveCart(next);
        return next;
      });
      dismissSuggestion(row.id);
      toast.success("Swap applied to your cart.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not apply swap";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-dvh bg-[#030303] pb-28 text-[#E3F2FD]">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js"
        strategy="afterInteractive"
        onLoad={() => setQuaggaReady(true)}
        onError={() => toast.error("Failed to load barcode scanner script.")}
      />

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#030303]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold">Scanner</h1>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[#78909C] hover:text-[#00BFA5]"
              onClick={() => setCameraOn((v) => !v)}
            >
              {cameraOn ? "Pause camera" : "Resume camera"}
            </Button>
          </div>
          <BudgetBar spent={subtotal} budget={budget} />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <ScannerView
            quaggaReady={quaggaReady}
            onBarcode={onBarcode}
            active={cameraOn}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Manual barcode or product code"
              className="border-white/10 bg-[#0D1B2A]/80 text-[#E3F2FD]"
            />
            <Button
              type="button"
              className="shrink-0 bg-[#00BFA5] text-[#030303] hover:bg-[#26C9B0]"
              onClick={() => {
                void processScan.current(manual);
                setManual("");
              }}
            >
              Add
            </Button>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#78909C]">
              Quick demo
            </p>
            <DemoChips onPick={(b) => void processScan.current(b)} />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-[#E3F2FD]">
              Your cart
            </h2>
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {cart.map((item, index) => (
                  <CartItem
                    key={item.cartItemId || `cart-item-${index}-${item.barcode}`}
                    item={item}
                    onRemove={removeLine}
                  />
                ))}
              </AnimatePresence>
              {cart.length === 0 && (
                <p className="text-sm text-[#78909C]">
                  Scan or tap a demo chip to begin.
                </p>
              )}
            </ul>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-[#E3F2FD]">
            Live AI cards
          </h2>
          <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {suggestions.map((s) => (
                <AICard
                  key={s.row.id}
                  row={s.row}
                  productName={s.productName}
                  onSwap={applySwap}
                  onKeep={keepSuggestion}
                  onDismiss={dismissSuggestion}
                />
              ))}
            </AnimatePresence>
            {suggestions.length === 0 && (
              <p className="text-sm text-[#78909C]">
                Suggestions appear within seconds after each scan.
              </p>
            )}
          </div>

          <StoreNav items={navItems} />
          <RemindersPanel
            reminders={reminders}
            onAdd={(b) => void processScan.current(b)}
          />
        </motion.aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.08] bg-[#030303]/95 p-4 backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/checkout"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "flex h-12 w-full items-center justify-center rounded-full border-transparent bg-[#00BFA5] text-base font-semibold text-[#030303] shadow-[0_0_24px_rgba(0,191,165,0.35)] hover:bg-[#26C9B0]"
            )}
          >
            Proceed to Checkout →
          </Link>
        </div>
      </div>
    </div>
  );
}
