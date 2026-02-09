import React from "react";
import { Text, View } from "react-native";
import type { MyMemberData } from "../../../.expo/types/chat";
// 내 정보 카드 컴포넌트
export default function MyMemberCard({ data }: { data: MyMemberData }) {
  const m = data.member;
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>내 정보</Text>
      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>이름: {m.name}</Text>
      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>전화: {m.phone}</Text>
      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>생일: {m.birthday}</Text>
    </View>
  );
}
