import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <Text style={{ fontSize: 13, color: "#7B8494" }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          color: "#111",
          fontWeight: "800",
          maxWidth: "70%",
          textAlign: "right",
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ReservationDetailCard({ data }: { data: any }) {
  const spaceName = data?.spaceName ?? data?.space ?? data?.roomName ?? "예약 상세";
  const time = data?.time ?? data?.reservedAt ?? data?.dateTime ?? "";
  const status = data?.status ?? data?.state ?? "";
  const price = data?.price ?? data?.fee ?? "";
  const memo = data?.memo ?? data?.note ?? "";

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>{String(spaceName)}</Text>
      <View style={{ height: 10 }} />

      <Row label="예약 시간" value={time ? String(time) : "-"} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="상태" value={status ? String(status) : "-"} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="요금" value={price ? String(price) : "-"} />

      {!!memo && (
        <>
          <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
          <View style={{ paddingTop: 12 }}>
            <Text style={{ fontSize: 13, color: "#7B8494" }}>메모</Text>
            <Text style={{ fontSize: 14, color: "#111", lineHeight: 20, marginTop: 6 }}>
              {String(memo)}
            </Text>
          </View>
        </>
      )}
    </CardContainer>
  );
}
