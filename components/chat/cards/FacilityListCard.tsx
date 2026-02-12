import React from "react";
import { Text, View } from "react-native";

export default function FacilityListCard({ data }: { data: any }) {
  const items = data?.facilities ?? data?.items ?? data?.list ?? [];

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: "800" }}>시설 목록</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>조회 결과가 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      <Text style={{ fontWeight: "800" }}>시설 목록</Text>
      {items.map((f: any, idx: number) => {
        const name = f?.name ?? f?.facilityName ?? `(시설 ${idx + 1})`;
        const location = f?.location ?? f?.address ?? "";
        return (
          <View
            key={String(f?.facilityId ?? f?.id ?? name)}
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              padding: 10,
              backgroundColor: "white",
            }}
          >
            <Text style={{ fontWeight: "700" }}>{name}</Text>
            {!!location && <Text style={{ color: "#666", marginTop: 4 }}>{String(location)}</Text>}
          </View>
        );
      })}
    </View>
  );
}
