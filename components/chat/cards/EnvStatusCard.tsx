import React from "react";
import { Text, View } from "react-native";
import type { EnvStatusData } from "../../../.expo/types/chat";
// 환경 상태 카드 컴포넌트
export default function EnvStatusCard({ data }: { data: EnvStatusData }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>{data.room}</Text>
      <Text style={{ fontSize: 13, color: "#333", marginTop: 2 }}>
        온도: {data.value}°{data.unit}
      </Text>
      <Text style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{data.recordedAt}</Text>
    </View>
  );
}
