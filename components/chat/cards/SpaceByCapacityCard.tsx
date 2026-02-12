// SpaceByCapacityCard.tsx
import React from "react";
import { Text, View } from "react-native";

export default function SpaceByCapacityCard({ data }: { data: any }) {
  const facilityName = data?.facilityName ?? data?.facility ?? "";
  const capacity = data?.capacity ?? data?.people ?? "";
  const spaces = data?.spaces ?? data?.items ?? data?.list ?? [];

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      <Text style={{ fontWeight: "800" }}>
        {facilityName ? `${facilityName} · ` : ""}{" "}
        {capacity ? `${capacity}명 가능 공간` : "가능 공간"}
      </Text>

      {Array.isArray(spaces) && spaces.length > 0 ? (
        spaces.map((s: any, idx: number) => {
          const name = s?.spaceName ?? s?.name ?? `(공간 ${idx + 1})`;
          const max = s?.capacity ?? s?.maxPeople ?? "";
          return (
            <View
              key={String(s?.spaceId ?? s?.id ?? name)}
              style={{
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 12,
                padding: 10,
                backgroundColor: "white",
              }}
            >
              <Text style={{ fontWeight: "700" }}>{name}</Text>
              {!!max && <Text style={{ color: "#666", marginTop: 4 }}>정원: {String(max)}</Text>}
            </View>
          );
        })
      ) : (
        <Text style={{ color: "#666" }}>조건에 맞는 공간이 없어요.</Text>
      )}
    </View>
  );
}
