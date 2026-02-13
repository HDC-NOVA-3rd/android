import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function FacilityListCard({
  data,
  onQuickSend,
}: {
  data: any;
  onQuickSend?: (text: string) => void;
}) {
  const facilities = data?.facilities ?? data?.items ?? data?.list ?? [];

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>시설 목록</Text>

      <View style={{ height: 10 }} />

      {!Array.isArray(facilities) || facilities.length === 0 ? (
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>조회된 시설이 없습니다.</Text>
      ) : (
        <View>
          {facilities.map((f: any, idx: number) => {
            const id = String(f?.facilityId ?? f?.id ?? idx);
            const name = f?.name ?? f?.facilityName ?? `(시설 ${idx + 1})`;

            return (
              <View key={id}>
                <TossCell
                  title={name}
                  subtitle="탭해서 공간 보기"
                  onPress={onQuickSend ? () => onQuickSend(name) : undefined}
                />
                {idx !== facilities.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
                )}
              </View>
            );
          })}
        </View>
      )}

      {!!onQuickSend && (
        <Text style={{ marginTop: 10, fontSize: 12, color: "#8C94A1" }}>
          항목을 누르면 해당 시설 공간으로 이동해요.
        </Text>
      )}
    </CardContainer>
  );
}
