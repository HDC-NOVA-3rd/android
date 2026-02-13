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

export default function SpaceInfoCard({ data }: { data: any }) {
  const facilityName = data?.facilityName ?? data?.facility ?? "";
  const name = data?.spaceName ?? data?.name ?? "공간 상세";
  const price = data?.price ?? data?.fee ?? "";
  const capacity = data?.capacity ?? data?.maxPeople ?? "";
  const desc = data?.description ?? data?.detail ?? "";

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }} numberOfLines={2}>
        {facilityName ? `${facilityName} · ` : ""}
        {String(name)}
      </Text>

      <View style={{ height: 10 }} />

      <Row label="요금" value={price ? String(price) : "-"} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
      <Row label="정원" value={capacity ? String(capacity) : "-"} />

      {!!desc && (
        <>
          <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
          <View style={{ paddingTop: 12 }}>
            <Text style={{ fontSize: 13, color: "#7B8494" }}>설명</Text>
            <Text style={{ fontSize: 14, color: "#111", lineHeight: 20, marginTop: 6 }}>
              {String(desc)}
            </Text>
          </View>
        </>
      )}
    </CardContainer>
  );
}
