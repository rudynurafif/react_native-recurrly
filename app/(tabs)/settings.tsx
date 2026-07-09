import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between border-b border-border py-3">
    <Text className="text-sm font-sans-medium text-muted-foreground">
      {label}
    </Text>
    <Text
      numberOfLines={1}
      className="ml-3 flex-1 text-right text-sm font-sans-semibold text-primary"
    >
      {value}
    </Text>
  </View>
);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const posthog = usePostHog();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await user?.reload();
      posthog.capture("profile_refreshed");
    } catch (err) {
      // Keep showing the last-known profile data; just log the failure.
      console.warn("Failed to refresh user info:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const onSignOut = async () => {
    try {
      posthog.capture("user_signed_out");
      await posthog.flush();
      posthog.reset();
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error("Sign out failed:", err);
      Alert.alert("Sign out failed", "Please try again.");
    }
  };

  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  const email = user?.primaryEmailAddress?.emailAddress;
  const emailVerified =
    user?.primaryEmailAddress?.verification?.status === "verified";
  const displayName =
    user?.fullName ?? user?.username ?? email ?? user?.id ?? "Account";

  const formatDate = (date?: Date | null) =>
    date ? dayjs(date).format("MMM D, YYYY") : "—";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 p-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ea7a53"
            colors={["#ea7a53"]}
          />
        }
      >
        <Text className="mb-6 text-2xl font-sans-bold text-primary">
          Settings
        </Text>

        {/* Profile header */}
        <View className="items-center rounded-3xl border border-border bg-card p-6">
          <Image
            source={avatarSource}
            className="size-24 rounded-full border-2 border-accent"
          />
          <Text className="mt-4 text-xl font-sans-bold text-primary">
            {displayName}
          </Text>
          {email ? (
            <View className="mt-1 flex-row items-center gap-2">
              <Text className="text-sm font-sans-medium text-muted-foreground">
                {email}
              </Text>
              <View
                className={
                  emailVerified
                    ? "rounded-full bg-success/15 px-2 py-0.5"
                    : "rounded-full bg-destructive/15 px-2 py-0.5"
                }
              >
                <Text
                  className={
                    emailVerified
                      ? "text-[11px] font-sans-semibold text-success"
                      : "text-[11px] font-sans-semibold text-destructive"
                  }
                >
                  {emailVerified ? "Verified" : "Unverified"}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Account details */}
        <Text className="mb-2 mt-6 text-base font-sans-bold text-primary">
          Account information
        </Text>
        <View className="rounded-3xl border border-border bg-card px-4">
          <InfoRow label="Full name" value={user?.fullName ?? "—"} />
          <InfoRow label="Username" value={user?.username ?? "—"} />
          <InfoRow label="Email" value={email ?? "—"} />
          <InfoRow
            label="Phone"
            value={user?.primaryPhoneNumber?.phoneNumber ?? "—"}
          />
          <InfoRow label="Member since" value={formatDate(user?.createdAt)} />
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Last sign in
            </Text>
            <Text className="ml-3 flex-1 text-right text-sm font-sans-semibold text-primary">
              {formatDate(user?.lastSignInAt)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onSignOut}
          className="mt-6 items-center rounded-2xl bg-destructive py-4"
        >
          <Text className="text-base font-sans-bold text-white">Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
