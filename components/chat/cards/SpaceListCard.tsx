import { Button } from "@/components/ui/button";
import React from "react";
import { Text, View } from "react-native";

export default function SpaceListCard({
  data,
  onQuickSend,
}: {
  data: any;
  onQuickSend?: (text: string) => void;
}) {
  const facilityName = data?.facilityName ?? data?.facility ?? "";
  const infoType = data?.info_type ?? data?.infoType ?? ""; // PRICE / CAPACITY 등
  const spaces = data?.spaces ?? data?.items ?? data?.list ?? [];
  const facilities = data?.facilities ?? [];

  // 1) 시설 선택이 필요한 경우 (facilities 내려오는 케이스)
  if (Array.isArray(facilities) && facilities.length > 0) {
    return (
      <View style={{ marginTop: 10, gap: 8 }}>
        <Text style={{ fontWeight: "800" }}>어느 시설을 말씀하시는 건가요?</Text>
        {facilities.map((f: any, idx: number) => {
          const name = f?.name ?? f?.facilityName ?? `(시설 ${idx + 1})`;
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
              {!!onQuickSend && (
                <View style={{ marginTop: 8 }}>
                  <Button variant="outline" onPress={() => onQuickSend(name)}>
                    <Text>이 시설로 보기</Text>
                  </Button>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  // 2) 공간 목록
  if (!Array.isArray(spaces) || spaces.length === 0) {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: "800" }}>공간 목록</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>조회 결과가 없어요.</Text>
      </View>
    );
  }

  const title =
    infoType === "PRICE" ? "공간 가격" : infoType === "CAPACITY" ? "공간 정원" : "공간 목록";

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      <Text style={{ fontWeight: "800" }}>
        {facilityName ? `${facilityName} · ` : ""}
        {title}
      </Text>

      {spaces.map((s: any, idx: number) => {
        const name = s?.spaceName ?? s?.name ?? s?.title ?? `(공간 ${idx + 1})`;
        const price = s?.price ?? s?.fee ?? s?.amount;
        const capacity = s?.capacity ?? s?.maxPeople ?? s?.max_capacity;

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

            <View style={{ marginTop: 4, flexDirection: "row", gap: 10 }}>
              {price != null && <Text style={{ color: "#666" }}>요금: {String(price)}</Text>}
              {capacity != null && <Text style={{ color: "#666" }}>정원: {String(capacity)}</Text>}
            </View>

            {!!onQuickSend && (
              <View style={{ marginTop: 8 }}>
                <Button variant="outline" onPress={() => onQuickSend(name)}>
                  <Text>이 공간 상세</Text>
                </Button>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
