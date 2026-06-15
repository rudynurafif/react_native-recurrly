import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { fetchSubscriptions, postSubscription } from "@/lib/api/subscriptions";
import { USE_API } from "@/lib/config";
import { useAuth } from "@clerk/expo";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Source = "api" | "dummy";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  source: Source;
  loading: boolean;
  addSubscription: (subscription: Subscription) => Promise<void>;
  refresh: () => Promise<void>;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

export const SubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [source, setSource] = useState<Source>("dummy");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    // API disabled or signed out → use bundled dummy data.
    if (!USE_API || !isSignedIn) {
      setSubscriptions(HOME_SUBSCRIPTIONS);
      setSource("dummy");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const data = await fetchSubscriptions(token);
      setSubscriptions(data);
      setSource("api");
    } catch (err) {
      // API unreachable / down → gracefully fall back to dummy data.
      console.warn("Subscriptions API unavailable, using dummy data:", err);
      setSubscriptions(HOME_SUBSCRIPTIONS);
      setSource("dummy");
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isLoaded) load();
  }, [isLoaded, load]);

  const addSubscription = useCallback(
    async (subscription: Subscription) => {
      // When live, persist to the API and use the server's record.
      if (source === "api") {
        try {
          const token = await getToken();
          if (token) {
            const created = await postSubscription(token, subscription);
            setSubscriptions((prev) => [created, ...prev]);
            return;
          }
        } catch (err) {
          console.warn("Create via API failed, adding locally:", err);
        }
      }
      // Dummy mode (or API create failed) → keep it in local state only.
      setSubscriptions((prev) => [subscription, ...prev]);
    },
    [source, getToken],
  );

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return (
    <SubscriptionsContext.Provider
      value={{ subscriptions, source, loading, addSubscription, refresh }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }
  return context;
};
