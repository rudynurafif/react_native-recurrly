import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { fetchSubscriptions, postSubscription } from "@/lib/api/subscriptions";
import { USE_API } from "@/lib/config";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";
import { create } from "zustand";

type Source = "api" | "dummy";
type TokenGetter = () => Promise<string | null>;

type SubscriptionsState = {
  subscriptions: Subscription[];
  source: Source;
  loading: boolean;
  // Clerk auth is wired into the store from React via `useSubscriptionsAuthSync`,
  // since the store lives outside the component tree and can't call hooks itself.
  getToken: TokenGetter | null;
  isSignedIn: boolean;
  setAuth: (getToken: TokenGetter, isSignedIn: boolean) => void;
  load: () => Promise<void>;
  addSubscription: (subscription: Subscription) => Promise<void>;
  refresh: () => Promise<void>;
};

export const useSubscriptions = create<SubscriptionsState>((set, get) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  source: "dummy",
  loading: false,
  getToken: null,
  isSignedIn: false,

  setAuth: (getToken, isSignedIn) => set({ getToken, isSignedIn }),

  load: async () => {
    const { isSignedIn, getToken } = get();

    // API disabled or signed out → use bundled dummy data.
    if (!USE_API || !isSignedIn || !getToken) {
      set({ subscriptions: HOME_SUBSCRIPTIONS, source: "dummy" });
      return;
    }

    set({ loading: true });
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const data = await fetchSubscriptions(token);
      set({ subscriptions: data, source: "api" });
    } catch (err) {
      // API unreachable / down → gracefully fall back to dummy data.
      console.warn("Subscriptions API unavailable, using dummy data:", err);
      set({ subscriptions: HOME_SUBSCRIPTIONS, source: "dummy" });
    } finally {
      set({ loading: false });
    }
  },

  addSubscription: async (subscription) => {
    const { source, getToken } = get();

    // When live, persist to the API and use the server's record.
    if (source === "api" && getToken) {
      try {
        const token = await getToken();
        if (token) {
          const created = await postSubscription(token, subscription);
          set((state) => ({
            subscriptions: [created, ...state.subscriptions],
          }));
          return;
        }
      } catch (err) {
        console.warn("Create via API failed, adding locally:", err);
      }
    }

    // Dummy mode (or API create failed) → keep it in local state only.
    set((state) => ({
      subscriptions: [subscription, ...state.subscriptions],
    }));
  },

  refresh: async () => {
    await get().load();
  },
}));

/**
 * Wires Clerk auth into the subscriptions store and triggers the initial load.
 * Call once from a component mounted under `ClerkProvider` (e.g. the tabs layout).
 */
export const useSubscriptionsAuthSync = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const setAuth = useSubscriptions((s) => s.setAuth);
  const load = useSubscriptions((s) => s.load);

  // Keep the store's auth snapshot fresh. Runs before the load effect below
  // (effects fire in declaration order), so `load` reads the latest values.
  useEffect(() => {
    setAuth(getToken, !!isSignedIn);
  }, [getToken, isSignedIn, setAuth]);

  useEffect(() => {
    if (isLoaded) load();
  }, [isLoaded, isSignedIn, load]);
};
