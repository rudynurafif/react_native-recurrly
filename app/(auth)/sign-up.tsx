import AuthBrand from "@/components/AuthBrand";
import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const submitting = fetchStatus === "fetching";

  const handleSubmit = async () => {
    const { error } = await signUp.password({ emailAddress, password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) return;

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session }) => {
          // Pending session tasks (e.g. org selection) — let the flow handle them.
          if (session?.currentTask) return;
          router.replace("/");
        },
      });
    }
  };

  // Once complete (or already signed in), the (auth) layout redirects home.
  if (signUp.status === "complete" || isSignedIn) return null;

  // Email verification step.
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView className="auth-safe-area">
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          <AuthBrand
            title="Verify your email"
            subtitle={`Enter the code we sent to ${emailAddress}`}
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
                onPress={() => signUp.verifications.sendEmailCode()}
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
          title="Create your account"
          subtitle="Start tracking and managing your subscriptions, never miss a payment"
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
              {errors.fields.emailAddress ? (
                <Text className="auth-error">
                  {errors.fields.emailAddress.message}
                </Text>
              ) : null}
            </View>

            <View className="auth-field">
              <Text className="auth-label">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a strong password"
                placeholderTextColor="rgba(0,0,0,0.4)"
                secureTextEntry
                className="auth-input"
              />
              {errors.fields.password ? (
                <Text className="auth-error">
                  {errors.fields.password.message}
                </Text>
              ) : (
                <Text className="auth-helper">
                  Use at least 8 characters. Avoid common passwords.
                </Text>
              )}
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
                <Text className="auth-button-text">Sign up</Text>
              )}
            </Pressable>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account? </Text>
              <Link href="/(auth)/sign-in" className="auth-link">
                Sign in
              </Link>
            </View>
          </View>
        </View>

        {/* Required for sign-up: Clerk's bot protection is enabled by default. */}
        <View nativeID="clerk-captcha" />
      </ScrollView>
    </SafeAreaView>
  );
}
