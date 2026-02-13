import React from "react";
import { Text, View } from "react-native";
import type { FacilityInfoData } from "../../../.expo/types/chat";
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
      <Text style={{ fontSize: 14, color: "#111", fontWeight: "800" }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function FacilityInfoCard({ data }: { data: FacilityInfoData }) {
  const hours = data?.startHour && data?.endHour ? `${data.startHour} ~ ${data.endHour}` : "-";

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>
        {data?.facility ?? "시설 정보"}
      </Text>
      <View style={{ height: 10 }} />

      <Row label="운영시간" value={hours} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="현재 운영" value={data?.isOpenNow ? "운영중" : "운영 종료"} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="예약" value={data?.reservableNow ? "가능" : "불가"} />
    </CardContainer>
  );
}
