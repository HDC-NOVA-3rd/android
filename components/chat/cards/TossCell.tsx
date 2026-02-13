import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function TossCell({
  title,
  subtitle,
  onPress,
  rightText,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightText?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 12,
        paddingHorizontal: 2,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#111" }} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={{ marginTop: 4, fontSize: 12, color: "#8C94A1" }} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {!!rightText && (
          <Text style={{ fontSize: 12, color: "#8C94A1", marginRight: 6 }} numberOfLines={1}>
            {rightText}
          </Text>
        )}
        <Feather name="chevron-right" size={18} color="#B0B8C1" />
      </View>
    </Pressable>
  );
}
