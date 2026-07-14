import AuthBrand from "@/components/AuthBrand";
import { getClerkFieldError, getClerkGeneralError } from "@/lib/clerkErrors";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { usePostHog } from "posthog-react-native";
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
  const { signUp, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  // Local error state — always fresh on mount, unlike Clerk's signal state
  // which persists across navigation and isn't cleared by signUp.reset().
  const [fieldErrors, setFieldErrors] = React.useState<{
    emailAddress?: string;
    password?: string;
    code?: string;
    general?: string;
  }>({});

  const submitting = fetchStatus === "fetching";

  // Clear any stale attempt state (e.g. a lingering "needs verification" status)
  // left over from a previous visit to this screen.
  React.useEffect(() => {
    return () => {
      signUp.reset();
    };
  }, [signUp]);

  const handleSubmit = async () => {
    setFieldErrors({});
    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      const emailMsg = getClerkFieldError(error, "email_address");
      const passwordMsg = getClerkFieldError(error, "password");
      setFieldErrors({
        emailAddress: emailMsg,
        password: passwordMsg,
        general:
          emailMsg || passwordMsg ? undefined : getClerkGeneralError(error),
      });
      return;
    }
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    setFieldErrors({});
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFieldErrors({
        code: getClerkFieldError(error, "code") ?? getClerkGeneralError(error),
      });
      return;
    }

    if (signUp.status === "complete") {
      const email = (signUp.emailAddress ?? emailAddress).trim().toLowerCase();
      posthog.identify(email, {
        $set: { email },
        $set_once: { sign_up_date: new Date().toISOString() },
      });
      posthog.capture("user_signed_up", { email });
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
                {fieldErrors.code ? (
                  <Text className="auth-error">{fieldErrors.code}</Text>
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
              {fieldErrors.emailAddress ? (
                <Text className="auth-error">{fieldErrors.emailAddress}</Text>
              ) : null}
            </View>

            <View className="auth-field">
              <Text className="auth-label">Password</Text>
              <View className="justify-center">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  secureTextEntry={!showPassword}
                  className="auth-input"
                  style={{ paddingRight: 64 }}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  className="absolute bottom-0 right-4 top-0 justify-center"
                >
                  <Text className="text-sm font-sans-semibold text-accent">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
              {fieldErrors.password ? (
                <Text className="auth-error">{fieldErrors.password}</Text>
              ) : (
                <Text className="auth-helper">
                  Use at least 8 characters. Avoid common passwords.
                </Text>
              )}
            </View>

            {fieldErrors.general ? (
              <Text className="auth-error">{fieldErrors.general}</Text>
            ) : null}

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
