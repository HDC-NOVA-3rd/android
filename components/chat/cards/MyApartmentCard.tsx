import React from "react";
import { Text, View } from "react-native";
import type { MyApartmentData } from "../../../.expo/types/chat";
import CardContainer from "./CardContainer";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingVertical: 10 }}>
      <Text style={{ fontSize: 13, color: "#7B8494" }}>{label}</Text>
      <Text
        style={{ fontSize: 14, color: "#111", fontWeight: "700", marginTop: 4 }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export default function MyApartmentCard({ data }: { data: MyApartmentData }) {
  const a = data?.apartment;

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>내 아파트</Text>
      <View style={{ height: 10 }} />

      <Row label="아파트명" value={String(a?.name ?? "-")} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="주소" value={String(a?.address ?? "-")} />

      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
      <View style={{ paddingTop: 10 }}>
        <Text style={{ fontSize: 12, color: "#8C94A1" }}>
          위치 좌표: ({String(a?.latitude ?? "-")}, {String(a?.longitude ?? "-")})
        </Text>
      </View>
    </CardContainer>
  );
}
