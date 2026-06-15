import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export type SubscriptionIconName = ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

// Keyword → icon, matched against the subscription name (first hit wins).
const NAME_ICONS: { match: string[]; icon: SubscriptionIconName }[] = [
  { match: ["netflix"], icon: "netflix" },
  { match: ["spotify"], icon: "spotify" },
  { match: ["youtube"], icon: "youtube" },
  { match: ["github"], icon: "github" },
  { match: ["gitlab"], icon: "gitlab" },
  { match: ["slack"], icon: "slack" },
  { match: ["twitch"], icon: "twitch" },
  { match: ["steam"], icon: "steam" },
  { match: ["xbox"], icon: "microsoft-xbox" },
  { match: ["playstation", "psn"], icon: "sony-playstation" },
  { match: ["dropbox"], icon: "dropbox" },
  { match: ["onedrive"], icon: "microsoft-office" },
  { match: ["google drive", "gdrive"], icon: "google-drive" },
  { match: ["microsoft", "office", "365"], icon: "microsoft-office" },
  { match: ["google", "gmail"], icon: "google" },
  { match: ["apple", "icloud", "itunes"], icon: "apple" },
  {
    match: ["claude", "openai", "chatgpt", "gpt", "gemini", "copilot", "midjourney"],
    icon: "robot",
  },
  { match: ["canva", "adobe", "figma", "dribbble"], icon: "palette" },
  { match: ["python"], icon: "language-python" },
  { match: ["javascript", "node"], icon: "language-javascript" },
];

// Category → icon, used when the name doesn't match a known brand.
const CATEGORY_ICONS: Record<string, SubscriptionIconName> = {
  Entertainment: "movie-open-outline",
  "AI Tools": "robot",
  "Developer Tools": "code-tags",
  Design: "palette",
  Productivity: "briefcase-outline",
  Cloud: "cloud-outline",
  Music: "music",
  Other: "credit-card-outline",
};

export const getSubscriptionIcon = (
  name: string,
  category?: string,
): SubscriptionIconName => {
  const normalized = name.toLowerCase();
  for (const entry of NAME_ICONS) {
    if (entry.match.some((keyword) => normalized.includes(keyword))) {
      return entry.icon;
    }
  }
  if (category && CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
  return "credit-card-outline";
};
