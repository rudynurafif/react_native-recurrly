import images from "@/constants/images";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { styled } from "nativewind";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-accent">
      {/* Light status bar content on the orange background */}
      <StatusBar style="light" />

      {/* Hero pattern */}
      <Image
        source={images.splashPattern}
        resizeMode="cover"
        className="w-full"
        style={{ flex: 1 }}
      />

      {/* Copy + CTA */}
      <SafeAreaView edges={["bottom"]} className="px-6 pb-2 pt-6">
        <Text className="text-4xl font-sans-extrabold text-white">
          Gain Financial Clarity
        </Text>
        <Text className="mt-3 text-lg font-sans-medium text-white/90">
          Track, analyze and cancel with ease
        </Text>

        <Pressable
          onPress={() => router.replace("/(auth)/sign-in")}
          className="mt-7 items-center rounded-full bg-white py-4"
        >
          <Text className="text-base font-sans-bold text-primary">
            Get Started
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
};

export default Onboarding;
