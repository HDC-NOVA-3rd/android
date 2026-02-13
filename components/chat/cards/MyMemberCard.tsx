import React from "react";
import { Text, View } from "react-native";
import type { MyMemberData } from "../../../.expo/types/chat";
import CardContainer from "./CardContainer";

function InfoRow({ label, value }: { label: string; value?: any }) {
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

      <Text
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{
          fontSize: 14,
          color: "#111",
          fontWeight: "700",
          maxWidth: "70%",
          textAlign: "right",
        }}
      >
        {String(value ?? "-")}
      </Text>
    </View>
  );
}

export default function MyMemberCard({ data }: { data: MyMemberData }) {
  const m = data.member;

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>내 정보</Text>
      <View style={{ height: 14 }} />

      <InfoRow label="이름" value={m.name} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <InfoRow label="전화" value={m.phone} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <InfoRow label="생일" value={m.birthday} />
    </CardContainer>
  );
}
