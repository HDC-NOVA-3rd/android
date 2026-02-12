import { Button } from "@/components/ui/button";
import React from "react";
import { Text, View } from "react-native";

export default function ReservationListCard({
  data,
  onPickIndex,
}: {
  data: any;
  onPickIndex?: (text: string) => void;
}) {
  const items = data?.reservations ?? data?.items ?? data?.list ?? [];

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: "800" }}>예약</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>조회 결과가 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      <Text style={{ fontWeight: "800" }}>예약 목록</Text>

      {items.map((r: any, idx: number) => {
        const index = r?.index ?? idx + 1;
        const spaceName = r?.spaceName ?? r?.space ?? r?.roomName ?? "(공간)";
        const time = r?.time ?? r?.reservedAt ?? r?.dateTime ?? "";
        const status = r?.status ?? r?.state ?? "";

        return (
          <View
            key={String(r?.reservationId ?? r?.id ?? index)}
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              padding: 10,
              backgroundColor: "white",
            }}
          >
            <Text style={{ fontWeight: "700" }}>
              {index}번 · {spaceName}
            </Text>

            <View style={{ marginTop: 4, flexDirection: "row", gap: 10 }}>
              {!!time && <Text style={{ color: "#666" }}>{String(time)}</Text>}
              {!!status && <Text style={{ color: "#666" }}>상태: {String(status)}</Text>}
            </View>

            {!!onPickIndex && (
              <View style={{ marginTop: 8 }}>
                <Button variant="outline" onPress={() => onPickIndex(String(index))}>
                  <Text>상세 보기</Text>
                </Button>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
