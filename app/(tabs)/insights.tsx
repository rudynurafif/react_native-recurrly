import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/context/subscriptions";
import { formatCurrency } from "@/lib/utils";
import clsx from "clsx";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const CHART_HEIGHT = 180;
const DAYS = ["Mon", "Tue", "Wed", "Thr", "Fri", "Sat", "Sun"];

// Normalise any billing cadence to a comparable monthly amount.
const toMonthly = (sub: Subscription) => {
  const cadence = (sub.frequency ?? sub.billing ?? "").toLowerCase();
  if (cadence.includes("year")) return sub.price / 12;
  if (cadence.includes("week")) return sub.price * 4.345;
  return sub.price;
};

const Insights = () => {
  const router = useRouter();
  const { subscriptions } = useSubscriptions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { bars, axisMax, yAxis, total, activeCount, maxDay } = useMemo(() => {
    const buckets: Record<string, number> = Object.fromEntries(
      DAYS.map((day) => [day, 0]),
    );

    for (const sub of subscriptions) {
      const date = sub.renewalDate ?? sub.startDate;
      // dayjs().day(): 0=Sun..6=Sat → shift so Monday is index 0.
      const index = date ? (dayjs(date).day() + 6) % 7 : 0;
      buckets[DAYS[index]] += toMonthly(sub);
    }

    const bars = DAYS.map((day) => ({ day, amount: Math.round(buckets[day]) }));
    const maxValue = Math.max(...bars.map((b) => b.amount), 1);
    const axisMax = Math.max(10, Math.ceil(maxValue / 10) * 10);
    const yAxis = [
      axisMax,
      Math.round(axisMax * 0.75),
      Math.round(axisMax * 0.5),
      Math.round(axisMax * 0.25),
      0,
    ];
    const total = subscriptions.reduce((sum, sub) => sum + toMonthly(sub), 0);
    const activeCount = subscriptions.filter(
      (s) => s.status === "active",
    ).length;
    const maxDay = bars.reduce((a, b) => (b.amount > a.amount ? b : a), bars[0])
      .day;

    return { bars, axisMax, yAxis, total, activeCount, maxDay };
  }, [subscriptions]);

  const activeDay = selectedDay ?? maxDay;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-5 pb-32 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="size-11 items-center justify-center rounded-full border-2 border-border"
          >
            <Image source={icons.back} className="size-5" />
          </Pressable>

          <Text className="text-xl font-sans-bold text-primary">
            Monthly Insights
          </Text>

          <View className="size-11 items-center justify-center rounded-full border-2 border-border">
            <Image source={icons.menu} className="size-5" />
          </View>
        </View>

        <ListHeading title="Upcoming" />

        {/* Bar chart */}
        <View className="rounded-3xl bg-muted p-5">
          <View className="flex-row">
            {/* Y axis */}
            <View
              className="mr-2 items-end justify-between"
              style={{ height: CHART_HEIGHT }}
            >
              {yAxis.map((value, i) => (
                <Text
                  key={`${value}-${i}`}
                  className="text-xs font-sans-medium text-muted-foreground"
                >
                  {value}
                </Text>
              ))}
            </View>

            {/* Bars + day labels */}
            <View className="flex-1">
              <View
                className="flex-row items-end"
                style={{ height: CHART_HEIGHT }}
              >
                {bars.map((entry) => {
                  const isActive = entry.day === activeDay;
                  return (
                    <Pressable
                      key={entry.day}
                      onPress={() => setSelectedDay(entry.day)}
                      className="flex-1 items-center justify-end"
                      style={{ height: CHART_HEIGHT }}
                    >
                      {isActive ? (
                        <View className="mb-1 rounded-lg bg-white px-2 py-1 shadow-sm">
                          <Text className="text-xs font-sans-bold text-accent">
                            ${entry.amount}
                          </Text>
                        </View>
                      ) : null}
                      <View
                        style={{
                          height: Math.max(
                            4,
                            (entry.amount / axisMax) * CHART_HEIGHT,
                          ),
                        }}
                        className={clsx(
                          "w-2.5 rounded-full",
                          isActive ? "bg-accent" : "bg-primary",
                        )}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <View className="mt-2 flex-row">
                {bars.map((entry) => (
                  <View key={entry.day} className="flex-1 items-center">
                    <Text
                      className={clsx(
                        "text-xs font-sans-medium",
                        entry.day === activeDay
                          ? "text-accent"
                          : "text-muted-foreground",
                      )}
                    >
                      {entry.day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Expenses summary */}
        <View className="mt-5 rounded-3xl border border-border bg-card p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-sans-bold text-primary">
              Expenses
            </Text>
            <Text className="text-2xl font-sans-bold text-primary">
              -{formatCurrency(total)}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {dayjs().format("MMMM YYYY")}
            </Text>
            <Text className="text-sm font-sans-semibold text-muted-foreground">
              {activeCount} active
            </Text>
          </View>
        </View>

        <ListHeading title="History" />

        {/* History list */}
        <View className="gap-4">
          {subscriptions.map((item) => (
            <SubscriptionCard
              key={item.id}
              {...item}
              expanded={expandedId === item.id}
              onPress={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
