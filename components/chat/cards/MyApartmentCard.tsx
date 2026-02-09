import React from "react";
import { Text, View } from "react-native";
import type { MyApartmentData } from "../../../.expo/types/chat";
// 내 아파트 카드 컴포넌트
export default function MyApartmentCard({ data }: { data: MyApartmentData }) {
  const a = data.apartment;
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>내 아파트</Text>
      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>{a.name}</Text>
      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>{a.address}</Text>
      <Text style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
        ({a.latitude}, {a.longitude})
      </Text>
    </View>
  );
}
