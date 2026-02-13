import React from "react";
import { Text, View } from "react-native";
import type { EnvHistoryData } from "../../../.expo/types/chat";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function EnvHistoryCard({ data }: { data: EnvHistoryData }) {
  const logs = Array.isArray(data?.logs) ? data.logs.slice(0, 10) : [];

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>
        {data.room ? `${data.room} 최근 기록` : "최근 기록"}
      </Text>

      <View style={{ height: 10 }} />

      {logs.length === 0 ? (
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>기록이 없습니다.</Text>
      ) : (
        <View>
          {logs.map((l, idx) => {
            const title = `${l.value}°${l.unit}`;
            const subtitle = String(l.recordedAt ?? "");
            return (
              <View key={idx}>
                {/* 기록은 클릭할 필요 없으니 onPress 생략 */}
                <TossCell title={title} subtitle={subtitle} />
                {idx !== logs.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
                )}
              </View>
            );
          })}
        </View>
      )}
    </CardContainer>
  );
}
