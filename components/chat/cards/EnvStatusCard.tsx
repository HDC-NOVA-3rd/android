import React from "react";
import { Text, View } from "react-native";
import type { EnvStatusData } from "../../../.expo/types/chat";
import CardContainer from "./CardContainer";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <Text style={{ fontSize: 13, color: "#7B8494" }}>{label}</Text>
      <Text style={{ fontSize: 14, color: "#111", fontWeight: "800" }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function EnvStatusCard({ data }: { data: EnvStatusData }) {
  const tempText =
    data?.value != null && data?.unit != null
      ? `${data.value}°${data.unit}`
      : data?.value != null
        ? String(data.value)
        : "-";

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>
        {data.room ?? "환경 상태"}
      </Text>

      <View style={{ height: 10 }} />

      <Row label="온도" value={tempText} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="기록 시간" value={String(data.recordedAt ?? "-")} />
    </CardContainer>
  );
}
