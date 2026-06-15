import { icons } from "@/constants/icons";
import { API_BASE_URL } from "@/lib/config";
import { getSubscriptionIcon } from "@/lib/subscriptionIcon";

// Shape returned by the recurrly-api (Mongoose document).
type ApiSubscription = {
  _id: string;
  name: string;
  price: number;
  currency?: string;
  frequency?: string;
  category?: string;
  color?: string;
  startDate?: string;
  renewalDate?: string;
  paymentMethod?: string;
  status?: string;
};

const FREQUENCY_LABEL: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

// The API only accepts these category enum values.
const API_CATEGORIES = ["Entertainment", "Food", "Health", "Other"];

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

// API document → app Subscription (adds icon/iconName the API doesn't store).
export const fromApi = (sub: ApiSubscription): Subscription => {
  const frequency = sub.frequency
    ? (FREQUENCY_LABEL[sub.frequency] ?? capitalize(sub.frequency))
    : "Monthly";

  return {
    id: sub._id,
    name: sub.name,
    price: sub.price,
    currency: sub.currency ?? "USD",
    category: sub.category,
    paymentMethod: sub.paymentMethod,
    status: sub.status,
    startDate: sub.startDate,
    renewalDate: sub.renewalDate,
    frequency,
    billing: frequency,
    color: sub.color,
    icon: icons.wallet,
    iconName: getSubscriptionIcon(sub.name, sub.category),
  };
};

// app Subscription (from the create form) → API request body.
const toApiBody = (sub: Subscription) => ({
  name: sub.name,
  price: sub.price,
  currency: sub.currency ?? "USD",
  frequency: (sub.frequency ?? "Monthly").toLowerCase(),
  category: API_CATEGORIES.includes(sub.category ?? "")
    ? sub.category
    : "Other",
  paymentMethod: sub.paymentMethod?.trim() || "Card",
  startDate: sub.startDate ?? new Date().toISOString(),
  ...(sub.color ? { color: sub.color } : {}),
});

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export async function fetchSubscriptions(token: string): Promise<Subscription[]> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Failed to load subscriptions (${res.status})`);

  const json = await res.json();
  const list: ApiSubscription[] = Array.isArray(json?.data) ? json.data : [];
  return list.map(fromApi);
}

export async function postSubscription(
  token: string,
  sub: Subscription,
): Promise<Subscription> {
  const res = await fetch(`${API_BASE_URL}/subscriptions`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(toApiBody(sub)),
  });
  if (!res.ok) throw new Error(`Failed to create subscription (${res.status})`);

  const json = await res.json();
  // The API may wrap the created doc as { data } or { data: { subscription } }.
  const created: ApiSubscription = json?.data?.subscription ?? json?.data;
  return fromApi(created);
}
