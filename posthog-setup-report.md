<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurrly React Native (Expo) app. The setup includes: installing `posthog-react-native` and required peer dependencies, creating `app.config.js` to expose PostHog credentials via `expo-constants`, wiring `PostHogProvider` with autocapture into the root layout, adding manual screen tracking with `posthog.screen()` on every route change, capturing key business events across auth and subscription flows, and identifying users on sign-in and sign-up.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User completed sign-up and email verification | `app/(auth)/sign-up.tsx` |
| `user_signed_in` | User signed in with password (and optional 2FA) | `app/(auth)/sign-in.tsx` |
| `user_signed_out` | User signed out from settings | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expanded a subscription card on the home screen | `app/(tabs)/index.tsx` |
| `subscription_card_collapsed` | User collapsed a subscription card | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User viewed the subscription detail screen | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/470279/dashboard/1711740)
- [New sign-ups over time](https://us.posthog.com/project/470279/insights/tw2ZgRoO)
- [Sign-ins over time](https://us.posthog.com/project/470279/insights/SUn8sioa)
- [Sign-up to sign-in conversion (funnel)](https://us.posthog.com/project/470279/insights/CDychYEN)
- [Subscription engagement](https://us.posthog.com/project/470279/insights/CVSDAPto)
- [Churn signal: sign-outs](https://us.posthog.com/project/470279/insights/xOQORkAE)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
