// SpaceInfoCard.tsx
import React from "react";
import { Text, View } from "react-native";

export default function SpaceInfoCard({ data }: { data: any }) {
  const facilityName = data?.facilityName ?? data?.facility ?? "";
  const name = data?.spaceName ?? data?.name ?? "공간 상세";
  const price = data?.price ?? data?.fee ?? "";
  const capacity = data?.capacity ?? data?.maxPeople ?? "";
  const desc = data?.description ?? data?.detail ?? "";

  return (
    <View style={{ marginTop: 10, gap: 6 }}>
      <Text style={{ fontWeight: "900" }}>
        {facilityName ? `${facilityName} · ` : ""}
        {name}
      </Text>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {!!price && <Text style={{ color: "#666" }}>요금: {String(price)}</Text>}
        {!!capacity && <Text style={{ color: "#666" }}>정원: {String(capacity)}</Text>}
      </View>
      {!!desc && <Text style={{ color: "#222", lineHeight: 20 }}>{String(desc)}</Text>}
    </View>
  );
}
