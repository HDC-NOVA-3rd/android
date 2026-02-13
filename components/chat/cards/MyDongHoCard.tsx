import React from "react";
import { Text, View } from "react-native";
import type { MyDongHoData } from "../../../.expo/types/chat";
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

export default function MyDongHoCard({ data }: { data: MyDongHoData }) {
  const dong = data?.dong?.dongNo ?? "-";
  const ho = data?.ho?.hoNo ?? "-";

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>내 동/호</Text>
      <View style={{ height: 10 }} />

      <Row label="동" value={String(dong)} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
      <Row label="호" value={String(ho)} />
    </CardContainer>
  );
}
