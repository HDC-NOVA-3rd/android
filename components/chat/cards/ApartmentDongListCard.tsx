import React from "react";
import { Text, View } from "react-native";
import type { ApartmentDongListData } from "../../../.expo/types/chat";
// 아파트 동 목록 카드 컴포넌트
export default function ApartmentDongListCard({ data }: { data: ApartmentDongListData }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>동 목록</Text>
      {data.dongs.map((d) => (
        <Text key={d.dongId} style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
          • {d.dongNo}
        </Text>
      ))}
    </View>
  );
}
