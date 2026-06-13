import AuthBrand from "@/components/AuthBrand";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const submitting = fetchStatus === "fetching";

  const finalize = async () => {
    await signIn.finalize({
      navigate: ({ session }) => {
        // Pending session tasks (e.g. org selection) — let the flow handle them.
        if (session?.currentTask) return;
        router.replace("/");
      },
    });
  };

  const handleSubmit = async () => {
    const { error } = await signIn.password({
      identifier: emailAddress,
      password,
    });
    if (error) return;

    if (signIn.status === "complete") {
      await finalize();
    } else if (signIn.status === "needs_client_trust") {
      // New device — send an email code to establish client trust.
      const emailFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailFactor) await signIn.mfa.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) return;
    if (signIn.status === "complete") await finalize();
  };

  // New-device verification step.
  if (signIn.status === "needs_client_trust") {
    return (
      <SafeAreaView className="auth-safe-area">
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          <AuthBrand
            title="Verify it's you"
            subtitle="Enter the code we sent to your email"
          />

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Verification code</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter your code"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  keyboardType="number-pad"
                  className="auth-input"
                />
                {errors.fields.code ? (
                  <Text className="auth-error">
                    {errors.fields.code.message}
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={handleVerify}
                disabled={submitting}
                className="auth-button"
              >
                {submitting ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">Verify</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => signIn.mfa.sendEmailCode()}
                className="auth-secondary-button"
              >
                <Text className="auth-secondary-button-text">
                  I need a new code
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <ScrollView
        className="auth-scroll"
        contentContainerClassName="auth-content"
        keyboardShouldPersistTaps="handled"
      >
        <AuthBrand
          title="Welcome back"
          subtitle="Sign in to continue managing your subscriptions"
        />

        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">Email</Text>
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="Enter your email"
                placeholderTextColor="rgba(0,0,0,0.4)"
                autoCapitalize="none"
                keyboardType="email-address"
                className="auth-input"
              />
              {errors.fields.identifier ? (
                <Text className="auth-error">
                  {errors.fields.identifier.message}
                </Text>
              ) : null}
            </View>

            <View className="auth-field">
              <Text className="auth-label">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="rgba(0,0,0,0.4)"
                secureTextEntry
                className="auth-input"
              />
              {errors.fields.password ? (
                <Text className="auth-error">
                  {errors.fields.password.message}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={!emailAddress || !password || submitting}
              className={
                !emailAddress || !password || submitting
                  ? "auth-button auth-button-disabled"
                  : "auth-button"
              }
            >
              {submitting ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Text className="auth-button-text">Sign in</Text>
              )}
            </Pressable>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly? </Text>
              <Link href="/(auth)/sign-up" className="auth-link">
                Create an account
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
