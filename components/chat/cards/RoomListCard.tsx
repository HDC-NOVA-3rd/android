import React from "react";
import { Text, View } from "react-native";
import type { RoomListData } from "../../../.expo/types/chat";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function RoomListCard({ data }: { data: RoomListData }) {
  const rooms = Array.isArray(data?.rooms) ? data.rooms : [];

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>등록된 방</Text>

      <View style={{ height: 10 }} />

      {rooms.length === 0 ? (
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>등록된 방이 없습니다.</Text>
      ) : (
        <View>
          {rooms.map((r, idx) => (
            <View key={String(r?.roomId ?? idx)}>
              <TossCell title={r.name} subtitle="환경 상태 확인" />
              {idx !== rooms.length - 1 && (
                <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
              )}
            </View>
          ))}
        </View>
      )}
    </CardContainer>
  );
}
