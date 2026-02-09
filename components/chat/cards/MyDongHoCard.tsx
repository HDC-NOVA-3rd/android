import React from "react";
import { Text, View } from "react-native";
import type { MyDongHoData } from "../../../.expo/types/chat";
// 내 동/호 카드 컴포넌트
export default function MyDongHoCard({ data }: { data: MyDongHoData }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>내 동/호</Text>
      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
        {data.dong.dongNo} {data.ho.hoNo}
      </Text>
    </View>
  );
}
