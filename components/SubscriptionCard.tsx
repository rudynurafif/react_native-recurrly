import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import React, { type ComponentProps } from "react";
import { Image, Pressable, Text, View } from "react-native";

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  iconName,
  billing,
  color,
  category,
  plan,
  renewalDate,
  onPress,
  expanded,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          {iconName ? (
            <View className="sub-icon">
              <MaterialCommunityIcons
                name={
                  iconName as ComponentProps<
                    typeof MaterialCommunityIcons
                  >["name"]
                }
                size={64}
                color="#081126"
              />
            </View>
          ) : (
            <Image source={icon} className="sub-icon" />
          )}
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-currency">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <Text className="sub-label">Payment: </Text>
              <Text
                className="sub-value"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {paymentMethod?.trim() || "-"}
              </Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Category: </Text>
              <Text
                className="sub-value"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {category?.trim() || plan?.trim() || "-"}
              </Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Started: </Text>
              <Text
                className="sub-value"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {startDate ? formatSubscriptionDateTime(startDate) : "-"}
              </Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Renewal date: </Text>
              <Text
                className="sub-value"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {renewalDate ? formatSubscriptionDateTime(renewalDate) : "-"}
              </Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Status: </Text>
              <Text
                className="sub-value"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {status ? formatStatusLabel(status) : "-"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
