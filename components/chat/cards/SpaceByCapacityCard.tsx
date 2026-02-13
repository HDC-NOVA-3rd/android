import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function SpaceByCapacityCard({ data }: { data: any }) {
  const facilityName = data?.facilityName ?? data?.facility ?? "";
  const capacity = data?.capacity ?? data?.people ?? "";
  const spaces = data?.spaces ?? data?.items ?? data?.list ?? [];

  const title = `${facilityName ? `${facilityName} · ` : ""}${capacity ? `${capacity}명 가능 공간` : "가능 공간"}`;

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }} numberOfLines={2}>
        {title}
      </Text>
      <View style={{ height: 10 }} />

      {Array.isArray(spaces) && spaces.length > 0 ? (
        <View>
          {spaces.map((s: any, idx: number) => {
            const name = s?.spaceName ?? s?.name ?? `(공간 ${idx + 1})`;
            const max = s?.capacity ?? s?.maxPeople ?? "";
            const subtitle = max ? `정원 ${String(max)}명` : undefined;

            return (
              <View key={String(s?.spaceId ?? s?.id ?? idx)}>
                <TossCell title={String(name)} subtitle={subtitle} />
                {idx !== spaces.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>조건에 맞는 공간이 없습니다.</Text>
      )}
    </CardContainer>
  );
}
