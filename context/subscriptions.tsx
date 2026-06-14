import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  resetSubscriptions: () => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

export const SubscriptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = useCallback((subscription: Subscription) => {
    setSubscriptions((prev) => [subscription, ...prev]);
  }, []);

  // Pull-to-refresh re-loads the source data, discarding locally added items.
  const resetSubscriptions = useCallback(() => {
    setSubscriptions(HOME_SUBSCRIPTIONS);
  }, []);

  return (
    <SubscriptionsContext.Provider
      value={{ subscriptions, addSubscription, resetSubscriptions }}
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
