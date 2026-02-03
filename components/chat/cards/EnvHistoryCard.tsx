import React from "react";
import { Text, View } from "react-native";
import type { EnvHistoryData } from "../../../.expo/types/chat";
// 환경 이력 카드 컴포넌트
export default function EnvHistoryCard({ data }: { data: EnvHistoryData }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>{data.room} 최근 기록</Text>

      {data.logs.slice(0, 10).map((l, idx) => (
        <Text key={idx} style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
          • {l.recordedAt} : {l.value}°{l.unit}
        </Text>
      ))}
    </View>
  );
}
