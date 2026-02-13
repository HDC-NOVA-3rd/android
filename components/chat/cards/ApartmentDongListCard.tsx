import React from "react";
import { Text, View } from "react-native";
import type { ApartmentDongListData } from "../../../.expo/types/chat";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function ApartmentDongListCard({ data }: { data: ApartmentDongListData }) {
  const dongs = Array.isArray(data?.dongs) ? data.dongs : [];

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>동 목록</Text>
      <View style={{ height: 10 }} />

      {dongs.length === 0 ? (
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>조회된 동이 없습니다.</Text>
      ) : (
        <View>
          {dongs.map((d, idx) => (
            <View key={String(d?.dongId ?? idx)}>
              <TossCell title={`${d.dongNo}`} subtitle="동 정보" />
              {idx !== dongs.length - 1 && (
                <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
              )}
            </View>
          ))}
        </View>
      )}
    </CardContainer>
  );
}
