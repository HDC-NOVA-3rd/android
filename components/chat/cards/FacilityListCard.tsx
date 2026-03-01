import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function FacilityListCard({ data }: { data: any }) {
  const router = useRouter();
  const facilities = data?.facilities ?? data?.items ?? data?.list ?? [];

  const goDetail = (id: string) => {
    router.push({
      pathname: "/facility/[facilityId]",
      params: { facilityId: id },
    });
  };

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
                <TossCell title={name} subtitle="탭해서 상세 보기" onPress={() => goDetail(id)} />
                {idx !== facilities.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
                )}
              </View>
            );
          })}
        </View>
      )}
    </CardContainer>
  );
}
