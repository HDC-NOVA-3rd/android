import React from "react";
import { Text, View } from "react-native";
import type { RoomListData } from "../../../.expo/types/chat";
// 등록된 방 목록 카드 컴포넌트
export default function RoomListCard({ data }: { data: RoomListData }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>등록된 방</Text>
      {data.rooms.map((r) => (
        <Text key={r.roomId} style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
          • {r.name}
        </Text>
      ))}
    </View>
  );
}
