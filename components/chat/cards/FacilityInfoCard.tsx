import type { FacilityInfoData } from "../../../.expo/types/chat";

import React from "react";
import { Text, View } from "react-native";

export default function FacilityInfoCard({ data }: { data: FacilityInfoData }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>{data.facility}</Text>

      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
        운영시간: {data.startHour} ~ {data.endHour}
      </Text>

      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
        현재 운영중: {data.isOpenNow ? "예" : "아니오"}
      </Text>

      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
        예약 : {data.reservableNow ? "가능" : "불가"}
      </Text>
    </View>
  );
}
