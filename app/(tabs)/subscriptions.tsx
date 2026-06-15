import SubscriptionCard from "@/components/SubscriptionCard";
import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/context/subscriptions";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const router = useRouter();
  const { subscriptions } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter((sub) =>
      [sub.name, sub.category, sub.plan]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [query, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="size-11 items-center justify-center rounded-full border-2 border-border"
        >
          <Image source={icons.back} className="size-5" />
        </Pressable>

        <Text className="text-xl font-sans-bold text-primary">
          My Subscriptions
        </Text>

        <View className="size-11 items-center justify-center rounded-full border-2 border-border">
          <Image source={icons.menu} className="size-5" />
        </View>
      </View>

      {/* Search */}
      <View className="px-5 pt-5">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search subscriptions"
          placeholderTextColor="rgba(0,0,0,0.4)"
          autoCapitalize="none"
          className="rounded-2xl border border-border bg-card pl-4 pr-4 py-3 text-[16px] font-sans-medium text-primary"
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
          />
        )}
        extraData={expandedId}
        contentContainerClassName="px-5 pb-32 pt-5"
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        ListEmptyComponent={() => (
          <Text className="home-empty-state text-center">
            No subscriptions match &quot;{query}&quot;.
          </Text>
        )}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
