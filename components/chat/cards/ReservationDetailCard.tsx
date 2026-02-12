import React from "react";
import { Text, View } from "react-native";

export default function ReservationDetailCard({ data }: { data: any }) {
  const spaceName = data?.spaceName ?? data?.space ?? data?.roomName ?? "예약 상세";
  const time = data?.time ?? data?.reservedAt ?? data?.dateTime ?? "";
  const status = data?.status ?? data?.state ?? "";
  const price = data?.price ?? data?.fee ?? "";
  const memo = data?.memo ?? data?.note ?? "";

  return (
    <View style={{ marginTop: 10, gap: 6 }}>
      <Text style={{ fontWeight: "900" }}>{spaceName}</Text>

      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {!!time && <Text style={{ color: "#666" }}>{String(time)}</Text>}
        {!!status && <Text style={{ color: "#666" }}>상태: {String(status)}</Text>}
        {!!price && <Text style={{ color: "#666" }}>요금: {String(price)}</Text>}
      </View>

      {!!memo && <Text style={{ color: "#222", lineHeight: 20 }}>{String(memo)}</Text>}
    </View>
  );
}
