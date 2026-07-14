import { icons } from "@/constants/icons";
import { getSubscriptionIcon } from "@/lib/subscriptionIcon";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Frequency = "Monthly" | "Yearly";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#fcd9b8",
  Cloud: "#cde7f0",
  Music: "#f8c8d8",
  Other: "#f6eecf",
};

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<string>("Entertainment");

  const priceValue = parseFloat(price);
  const isValid =
    name.trim().length > 0 && !isNaN(priceValue) && priceValue > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const now = dayjs();
    const subscription: Subscription = {
      id: `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${now.valueOf()}`,
      name: name.trim(),
      price: priceValue,
      currency: "USD",
      frequency,
      billing: frequency,
      category,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: now
        .add(1, frequency === "Monthly" ? "month" : "year")
        .toISOString(),
      icon: icons.wallet,
      iconName: getSubscriptionIcon(name.trim(), category),
      color: CATEGORY_COLORS[category],
    };

    onCreate(subscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="modal-overlay"
      >
        <Pressable className="flex-1" onPress={handleClose} />

        <View className="modal-container border-t border-border">
          {/* Grab handle — visually separates the sheet from the screen below */}
          <View className="items-center pt-3">
            <View className="h-1.5 w-12 rounded-full bg-border" />
          </View>

          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              className="modal-close"
            >
              <Text className="modal-close-text">✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Netflix"
                placeholderTextColor="rgba(0,0,0,0.4)"
                className="auth-input"
              />
            </View>

            {/* Price */}
            <View className="auth-field">
              <Text className="auth-label">Price</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="rgba(0,0,0,0.4)"
                keyboardType="decimal-pad"
                className="auth-input"
              />
            </View>

            {/* Frequency */}
            <View className="auth-field">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                {(["Monthly", "Yearly"] as const).map((option) => {
                  const active = frequency === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setFrequency(option)}
                      className={clsx(
                        "picker-option",
                        active && "picker-option-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          active && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Category */}
            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {CATEGORIES.map((option) => {
                  const active = category === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setCategory(option)}
                      className={clsx(
                        "category-chip",
                        active && "category-chip-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          active && "category-chip-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={!isValid}
              className={clsx(
                "auth-button", Platform.OS === "ios" && "mb-3",
                !isValid && "auth-button-disabled",
              )}
            >
              <Text className="auth-button-text">Add subscription</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
